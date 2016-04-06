
var api = { console: { autoLoad: true} };

var express = require('express'),
    router = api.router = express.Router(),
    docRouter = require('docrouter').docRouter,
    config = require('../config');

module.exports = api;

docRouter(router, "/api/app", function (router) {
  
  router.get('/list', function (req, res) { 
    return res.json(config.apps);
    },
    {
      id: 'app_list',
      name: 'list',
      usage: 'app list',
      example: 'app list',
      doc: 'Returns the list of applications',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  
   router.get('/show', function (req, res) { 
    return res.json(config.apps);
    },
    {
      id: 'app_show',
      name: 'show',
      usage: 'app show',
      example: 'app show',
      doc: 'Returns the list of applications',
      params: {},
      response: { representations: ['application/json'] }
    }
  );
  
  
});
