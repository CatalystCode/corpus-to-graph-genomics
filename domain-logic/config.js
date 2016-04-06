var path = require('path');
var format = require("string_format");

var config = {
  apiModulesPath: process.env.API_MODULES_PATH,
  log: {
    level: process.env.LOG_LEVEL,
    transporters: [
      {
        name: 'console', 
        write : true, 
        default: false,
        options: {
          level: process.env.CONSOLE_LOG_LEVEL || 'info'
        }
      },
      {
        name: 'azuretable', write : true, default: true,
        options: {
          storage: {
            account: process.env.LOG_STORAGE_ACCOUNT,
            key: process.env.LOG_STORAGE_KEY
          }
        }
      }]
  },
  queues: {
    scoring: process.env.QUEUE_SCORING,
    new_ids: process.env.QUEUE_NEW_IDS,
    trigger_query: process.env.QUEUE_TRIGGER_QUERY
  },
  services: {
    docServiceUrl: process.env.SERVICE_DOC_URL,
    scoringConfig: process.env.SCORING_SERVICES,
    supportedEntities: process.env.SUPPORTED_ENTITIES || ''
  },
  http: {
    timeoutMsec: process.env.HTTP_TIMEOUT_MSECS ? parseInt(process.env.HTTP_TIMEOUT_MSECS) : 60000
  },
  sql: {
    server: process.env.DB_SERVER,
    userName: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    options: {
      database: process.env.DB_NAME,
      encrypt: true,
      connectTimeout: 60000,
      requestTimeout: 60000
    },
    batchSize: process.env.DB_BATCH_SIZE ? parseInt(process.env.DB_BATCH_SIZE) : 500
  },
  storage: {
    account: process.env.STORAGE_ACCOUNT,
    key: process.env.STORAGE_KEY
  },
  queue: {
    visibilityTimeoutSecs: process.env.QUEUE_VISIBILITY_TIMEOUT_SECS ? parseInt(process.env.QUEUE_VISIBILITY_TIMEOUT_SECS) : 300,
    checkFrequencyMsecs: process.env.QUEUE_CHECK_FREQUENCY_MSECS ? parseInt(process.env.QUEUE_CHECK_FREQUENCY_MSECS) : 5000
  }
};

function checkParam(paramValue, paramInfo, paramKey) {
  "use strict";
  
  if (!paramValue) {
    var errorFormat = '{} was not provided, please add {} to environment variables';
    throw new Error(errorFormat.format(paramInfo, paramKey));
  }
}

// validate queues
checkParam(config.queues.scoring, 'scoring queue name', 'QUEUE_SCORING');
checkParam(config.queues.new_ids, 'new ids queue', 'QUEUE_NEW_IDS');
checkParam(config.queues.trigger_query, 'trigger query queue', 'QUEUE_TRIGGER_QUERY');

// validate log azure storage account
checkParam(config.log.level, 'log level', 'LOG_LEVEL');
checkParam(config.log.transporters[1].options.storage.account, 'log storage account name', 'LOG_STORAGE_ACCOUNT');
checkParam(config.log.transporters[1].options.storage.key, 'log storage account key', 'LOG_STORAGE_KEY');

// validate services
checkParam(config.services.docServiceUrl, 'doc service url', 'SERVICE_DOC_URL');
checkParam(config.services.scoringConfig, 'scoring configuration', 'SCORING_SERVICES');

// Validate SQL
checkParam(config.sql.server, 'Sql server', 'DB_SERVER');
checkParam(config.sql.userName, 'Sql user', 'DB_USER');
checkParam(config.sql.password, 'password for db', 'DB_PASSWORD');
checkParam(config.sql.options.database, 'db name', 'DB_NAME');

// validate log azure storage account
checkParam(config.storage.account, 'storage account', 'STORAGE_ACCOUNT');
checkParam(config.storage.key, 'storage key', 'STORAGE_KEY');

module.exports = config;
