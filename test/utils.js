var fs = require('fs');
var url = require('url');
var lr = require('readline');
var child_process = require('child_process');
var request = require('request');

var azure = require('azure-storage');
var tedious = require('tedious');
var Connection = tedious.Connection;
var ConnectionPool = require('tedious-connection-pool');

var logger = require('azure-logging');
var log = require('../domain-logic/log');

var pool;

// Ensure DB connection pool object is initialized (singleton)
function initDB() {
  
  if (pool) return;
  
  var configSql = require('../domain-logic/config').sql;
  
  // TODO: move to configuration
  var poolConfig = {
    min: 2,
    max: 5,
    idleTimeout: 10000,
    log: false
  };
  
  pool = new ConnectionPool(poolConfig, configSql);
  pool.on('error', function (err) {
    console.warn('error connecting to sql', err);
  });
}

// Request a new connection from the connection pool
function connect(cb) {
  return pool.acquire(cb);
}

// Release an SQL connectioin with callback
function getReleaseCallback(connection, cb) {
  return function () {
    connection.release();
    return cb.apply(null, arguments);
  }
}

// Log an error while releasing an SQL connection
function logErrorReleaseConnection(err, connection, cb) {
  console.error('error:', err);
  console.log('releasing connection');
  if (connection) connection.release();
  return cb(err);
}

function setEnvironmentVariables (setenvPath, cb) {
  var reader = lr.createInterface({
    input: fs.createReadStream(setenvPath)
  });
  
  reader.on('line', function (line) {
    if (line && line.toLowerCase().startsWith('set ')) {
      process.env[line.substring(4, line.indexOf('='))] = line.substring(line.indexOf('=') + 1);
    }
  });
  
  reader.on('close', function (line) {
    return cb();
  });
}

// Send a delete request for azure queue, and wait until creation is enabled and perform it
function deleteCreateQueue(queueService, queueName, cb) {
  return queueService.deleteQueueIfExists(queueName, function (error) {
    if (error) return cb(error);
    
    var retries = 20;
    
    return createQueuePendingDeletion(queueName, cb);
    
    // When deleting a queue, it takes a while for the queue to actually be deleted.
    // This method helps retry until the deletion is done
    function createQueuePendingDeletion(queueName, cb) {
      return queueService.createQueueIfNotExists(queueName, function (error) {
        
        if (error && error.code == 'QueueBeingDeleted' && retries > 0) {
          retries--;
          return setTimeout(function () {
            createQueuePendingDeletion(queueName, cb);
          }, 1000);
        }
        
        if (error) return cb(error);
        
        cb();
      });
    }
  });
}

function getTableRowCount(tableName, where, cb) {
  
  initDB();
  
  return connect(function (err, connection) {
    if (err) return logErrorReleaseConnection(err, connection, cb);
    
    var query = "SELECT COUNT(*) FROM " + tableName + (where ? " WHERE " + where : "") + ";";
    var request = new tedious.Request(query, getReleaseCallback(connection, function (error) {
      if (error) return cb(error);
    }));
    
    // Read "count(*)" from first returned row
    request.on('row', function (columns) {
      var result = 0;
      if (columns && columns.length && columns[0].value) {
        result = parseInt(columns[0].value);
        if (isNaN(result)) result = 0;
      }
      
      return cb(null, result);
    });
    request.on('error', cb);
    
    connection.execSql(request);
  });
}

/**
 * Wait for table row count to reach a minimum of an expected count.
 * @param {Object} options - options for querying the table.
 * @param {string} employee.tableName - table name to query.
 * @param {string} employee.where - [nullable] where clause for querying the table.
 * @param {number} employee.expectedCount - how many rows are expected to be reached.
 */
function waitForTableRowCount(options, cb) {
  
  setTimeout(function () {
    return getTableRowCount(options.tableName, options.where, function (error, count) {
      if (error) return cb(error);
      
      if (count < options.expectedCount) return waitForTableRowCount(options, cb);
      
      return cb();
    });
        
  }, 5000);
}

// Run a .sql file on current database
function runDBScript(dbScript, db) {
  var configSql = require('../domain-logic/config').sql;
  var cmd = 'sqlcmd -U ' + configSql.userName + 
              ' -S ' + configSql.server + 
              ' -P ' + configSql.password +
              ' -l 120' + 
              ' -d ' + configSql.options.database + 
              ' -i "' + dbScript + '"';

  child_process.exec(cmd, null, function (err, stdout, stderr) {
    if (err) console.error('Error running DB scripts', err);

    return db(stderr, stdout);
  });
}

/**
 * Count how many log messages have been logged.
 * @param {Object} options - options to be sent to azure-logging module.
 */
function countLogMessages(options, cb) {
  
  // output format (text | html | json)
  options.format = 'json';
  options.nocolors = true;
  
  // maximum level ('log' < 'info' < 'warn' < 'error')
  options.level = options.level || 'info';
  options.farm = options.farm || process.env.COMPUTERNAME || '';
  options.limit = options.limit || '100';
  options.top = options.top || '100';
  options.transporters = require('../domain-logic/config').log.transporters;
  
  return logger.reader(options, function (err, r) {
    if (err) return cb(err);
    
    var results = [];
    r.on('line', function (data) { results.push(data); });
    r.on('end', function () {
      return cb(null, results.length);
    });
    r.on('error', cb);
  });
}

function waitForLogMessage(options, cb) {
  
  return setTimeout(function () {
    return countLogMessages(options, function (error, count) {
      if (error) return cb(error);
      
      if (count == 0) return waitForLogMessage(options, cb);
      
      return cb();
    });
        
  }, 5000);
}

function checkForErrorsInLog(since, cb) {
  
  return setTimeout(function () {
    countLogMessages({
      app: 'ci-testing',
      level: 'error',
      since: since
    }, function (error, count) {
      if (error) return cb(error);
      
      if (count > 0) {
        var countError = new Error('Found errors through the log in the pipeline');
        console.error(countError);
        return cb(countError);
      }
      
      return checkForErrorsInLog(since, cb);
    });
  }, 5000);
}

var scoringServices = null;
function updateModel(modelUri, cb) {
  var path = modelUri;
  
  // Getting scoring services from configuration
  if (!scoringServices) {
    scoringServices = [];
    var scoringServicesVar = require('../domain-logic/config').services.scoringConfig;
    scoringServicesVar.split(';').forEach(function(scoringService){
      var elements = scoringService.split('::');
      scoringServices.push({
        id: elements[0],
        url: elements[1]
      });
    });
  }

  if (!scoringServices.length) return cb('no services exist');
  var urlParts = url.parse(scoringServices[0].url);
  var address = urlParts.protocol + "//" + urlParts.hostname + '/updatemodel'; 

  var opts = {
    url: address,
    method: 'POST',
    json: {
      "path": path
    }
  };
  
  console.info('Updating model to:');
  console.info(path);

  return request(opts, function(err, resp, body) {
    if (err) return cb(err);
    
    console.info('update model request sent successfully');
    return cb();
  });
}

module.exports = {
  setEnvironmentVariables: setEnvironmentVariables,
  deleteCreateQueue: deleteCreateQueue,
  getTableRowCount: getTableRowCount,
  waitForTableRowCount: waitForTableRowCount,
  runDBScript: runDBScript,
  waitForLogMessage: waitForLogMessage,
  countLogMessages: countLogMessages,
  checkForErrorsInLog: checkForErrorsInLog,
  updateModel: updateModel
};