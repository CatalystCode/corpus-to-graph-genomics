
var api = { console: { autoLoad: true} };

var express = require('express'),
  router = api.router = express.Router(),
  docRouter = require('docrouter').docRouter,
  pipelineConfig = require('../../../domain-logic/config'),
  azure = require('azure-storage'),
  async = require('async');

// TODO: use queue class with count instead of using config
var queueService = azure.createQueueService(pipelineConfig.storage.account, pipelineConfig.storage.key)
      .withFilter(new azure.ExponentialRetryPolicyFilter());

module.exports = api;

docRouter(router, "/api/queue", function (router) {
  
  router.get('/count/:name', function (req, res) { 
    var name = req.params.name;
    return queueService.getQueueMetadata(name, function (err, result) {
      if (err) return res.json({ err: err.message }); 
      var obj = {};
      obj[result.name] = result.approximatemessagecount;
      return res.json(obj);  
    });
    },
    {
      id: 'queue_count',
      name: 'count',
      usage: 'queue count',
      example: 'queue count someQueueName',
      doc: 'Returns metadata for a queue',
      params: {
        "name": {
          "short": "n",
          "type": "string",
          "doc": "queue name (use '*' for all queues)",
          "style": "template",
          "required": "true"
        }
      },
      response: { representations: ['application/json'] }
    }
  );
  
   router.get('/list', function (req, res) { 
     return queueService.listQueuesSegmented(null, function (err, result) { 
       if (err) return res.json({ err: err.message });
       return res.json(result.entries);  
     });
    },
    {
      id: 'queue_list',
      name: 'list',
      usage: 'queue list',
      example: 'queue list',
      doc: 'Returns the list of queues',
      params: {},
      response: { representations: ['application/json'] }
    }
    );
    
    router.get('/clear/:name', function (req, res) { 
      var name = req.params.name;

      var returned;
      var timeout = setTimeout(function () { 
        if (!returned) {
          return res.json({status: 'OK', desc: 'this may be a long process, depending on the queue size...'});      
          }
      }, 10000);
        
      queueService.clearMessages(name, function (err, result) {
        clearTimeout(timeout);
        if (err) return console.error('error clearing queue', name, err); 
        return res.json(result);
      });
    },
    {
      id: 'queue_clear',
      name: 'clear',
      usage: 'queue clear',
      example: 'queue clear someQueueName',
      doc: 'Clears all messages from a queue',
      params: {
        "name": {
          "short": "n",
          "type": "string",
          "doc": "queue name",
          "style": "template",
          "required": "true"
        }
      },
      response: { representations: ['application/json'] }
    }
  );
  
  router.get('/info', function (req, res) { 
    return queueService.listQueuesSegmented(null, function (err, result) { 
      if (err) return res.json({ err: err.message });
      var obj = {};
      return async.each(result.entries,
        function (queue, cb) {
          console.log('querying queue info', queue.name);
          return queueService.getQueueMetadata(queue.name,
            function (err, result) {
              if (err) return cb(err); 
              obj[result.name] = result.approximatemessagecount;
              return cb();
          }); 
        },
        function (err) {
          if (err) return res.json({ err: err.message }); 
          return res.json(obj);
        }
      );
     });
    },
    {
      id: 'queue_info',
      name: 'info',
      usage: 'queue info',
      example: 'queue info',
      doc: 'Returns info for the queues',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  
});
