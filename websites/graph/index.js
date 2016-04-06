var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var morgan       = require('morgan');
var bodyParser   = require('body-parser');
var routes = require('./routes');

var app = express();

app.use(morgan('dev')); // log every request to the console

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(routes);

app.set('port', process.env.PORT || 3001);

module.exports = app;
