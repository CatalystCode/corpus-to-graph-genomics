
var api = { console: { autoLoad: true} };

var express = require('express'),
  router = api.router = express.Router(),
  docRouter = require('docrouter').docRouter,
  configSql = require('../config').sql,
  async = require('async'),
  tedious = require('tedious'),
  Connection = tedious.Connection,
  ConnectionPool = require('tedious-connection-pool'),
  Request = tedious.Request,
  TYPES = tedious.TYPES;

var poolConfig = {
    min: 2,
    max: 5,
    idleTimeout: 10000,
    log: false
};

var tables = [
  'Documents',
  'Sentences',
  'Relations',
  'Entities'
];

var pool = new ConnectionPool(poolConfig, configSql);
pool.on('error', function (err) {
  console.error('error connecting to sql', err);
});

function logError(err, connection, cb) {
  console.error('error:', err);
  console.log('releasing connection');
  if (connection) connection.release();
  return cb(err);
}

function connect(cb) {
  return pool.acquire(cb);
}

function getCloseConnectionCb(connection, cb) {
  return function () {
    if (connection) connection.release();
    return cb.apply(null, arguments);
  }
}
 
module.exports = api;

docRouter(router, "/api/db", function (router) {
  
  router.get('/counts', function (req, res) {
   
    return getCounters(function (err, counters) { 
      if (err) return res.json({ err: err.message }); 
      return res.json(counters);
    });
  },
  {
      id: 'db_counts',
      name: 'counts',
      usage: 'db counts',
      example: 'db counts',
      doc: 'get total counts for db tables',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  
  router.post('/exec', function (req, res) {
    var query = req.body.query;
    return execQuery(query, function (err, rows) { 
      if (err) return res.json({ err: err.message }); 
      res.json(rows);
    });
  },
  {
      id: 'db_exec',
      name: 'exec',
      usage: 'db exec',
      example: 'db exec "select top 10 (*) from Documents"',
      doc: 'executes a SELECT statement on the database',
      params: {
        "query": {
          "short": "q",
          "type": "string",
          "doc": "the SELECT query to execute",
          "style": "body",
          "required": "true"
        }
      },
      response: { representations: ['application/json'] }
    }
  );

  router.post('/clear', function (req, res) {
    var query = req.body.query;
    return clearTables(function (err) { 
      if (err) return res.json({ err: err.message }); 
      res.json({status: 'success'});
    });
  },
  {
      id: 'db_clear',
      name: 'clear',
      usage: 'db clear',
      example: 'db clear"',
      doc: 'clears all table in db',
      params: {},
      response: { representations: ['application/json'] }
    }
  );

});


function getCounters(cb) {
    var qry = 'select ';
    tables.forEach(function (table, index) { 
      qry += 't' + index + '.' + table;
      if (index !== tables.length - 1) qry += ', ';
    });        
    qry += ' from ';
    tables.forEach(function (table, index) { 
      qry += '(select count(*) as ' + table +' from ' + table + ') t' + index
      if (index !== tables.length - 1) qry += ', ';
    });
    
    return execQuery(qry, function (err, result) { 
      if (err) return cb(err); 
      return cb(null, result[0]);
    });
}


function clearTables(cb) {
  console.log('clearing tables');
  return connect(function (err, connection) {
      cb = getCloseConnectionCb(connection, cb);
      if (err) return cb(err);
      
      var request = new tedious.Request('ClearTables', getCloseConnectionCb(connection, cb));
      return connection.callProcedure(request);

    });
}


function execQuery(query, cb) {
  if (!query.toLowerCase().startsWith('select'))
    return cb(new Error('Can not execute queries that do not start with SELECT'));
  
  console.log('executing db query:', query);
    
  return connect(function (err, connection) {
    cb = getCloseConnectionCb(connection, cb);
    if (err) return cb(err);

    var rows = [];
    
    var request = new tedious.Request(query, function (err) {
      if (err) return cb(err);
      return cb(null, rows)
    });

    request.on('row', function (columns) {
      var row = {};
      columns.forEach(function (column) {
        row[column.metadata.colName] = column.value;
      });
      rows.push(row);
    });

    request.on('error', cb);
  
    return connection.execSql(request);
  });
}


api.execQuery = execQuery;
api.getCounters = getCounters;