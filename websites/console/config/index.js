
var fs = require('fs');
var path = require('path');
var format = require("string_format");
var extend = require('extend');
var pipelineConfig = require('../../../domain-logic/console/config');

var config = {
    auth: {
        google: {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            adminAccount: process.env.GOOGLE_ADMIN_ACCOUNT
        }
    }
};

extend(config, pipelineConfig);

function checkParam(paramValue, paramInfo, paramKey) {
    "use strict";

    if (!paramValue) {
        var errorFormat = '{} was not provided, please add {} to environment variables';
        throw new Error(errorFormat.format(paramInfo, paramKey));
    }
}

config.apps = config.apps || [];
config.apps.push({ name: 'graph', desc: 'the graph API web app' });
config.apps.push({ name: 'console', desc: 'the command line console web app' });

// validate google authentication
checkParam(config.auth.google.clientID, 'google client Id', 'GOOGLE_CLIENT_ID');
checkParam(config.auth.google.clientSecret, 'google client secret', 'GOOGLE_CLIENT_SECRET');
checkParam(config.auth.google.callbackURL, 'google callback URL', 'GOOGLE_CALLBACK_URL');
checkParam(config.auth.google.adminAccount, 'google admin account', 'GOOGLE_ADMIN_ACCOUNT');

module.exports = config;
