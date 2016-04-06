
var fs = require('fs');
var path = require('path');
var format = require("string_format");
var extend = require('extend');
var pipelineConfig = require('../config');

var config = {
    queuesByOrder: {
      query: { index: 0, name: process.env.QUEUE_TRIGGER_QUERY, worker: 'query' }, 
      parser: { index: 1, name: process.env.QUEUE_NEW_IDS, worker: 'parser' },
      scoring: { index: 2, name: process.env.QUEUE_SCORING, worker: 'scoring' }
    },
    apps: [
      { name: 'trigger', desc: 'daily scheduled worker to trigger check for new documents' },
      { name: 'query', desc: 'the documents query worker' },
      { name: 'parser', desc: 'the paper parser worker' },
      { name: 'scoring', desc: 'the scorer worker' }
    ]
};

extend(config, pipelineConfig);

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

module.exports = config;
