var path = require('path');
var fs = require('fs');

process.on('uncaughtException', handleError);

// Load modules from one folder up (locally) or four folders up (on a service's web job)
var loadModulesPath = path.join(__dirname, '..', '..', '..', '..');
if (!fs.existsSync(path.join(loadModulesPath, 'load-modules.js')))
  loadModulesPath = path.join(__dirname, '..', '..');
var loadModules = require(path.join(loadModulesPath, 'load-modules.js'));
var rootPath = loadModules.getRootPath();

var scheduledRunner = require('corpus-to-graph-pipeline').runners.scheduled;

// Loading internal modules
var config = require(path.join(rootPath, 'domain-logic/config'));
var log = require(path.join(rootPath, 'domain-logic/log'));
var deployment = require(path.join(rootPath, 'deployment'));

var PipelineLogic = require(path.join(rootPath, 'domain-logic/pipeline-logic'));

var webJobName = process.env.PIPELINE_ROLE;

// In case this is an all in one deployment, the name of the module to use is the
// folder name and not process.env.PIPELINE_ROLE
if (webJobName == deployment.constants.all_in_one) {
  webJobName = path.basename(__dirname);
}

executeScheduledWebJob();

/*
 * Initialize logging if anode is specified and start the web job
 */
function executeScheduledWebJob() {
  
  if (process.env.USE_ANODE_LOGGING !== 'false') {
    log.init({
      domain: process.env.COMPUTERNAME || '',
      instanceId: log.getInstanceId(),
      app: webJobName,
      level: config.log.level,
      transporters: config.log.transporters
    },
      function(err) {
        if (err) return handleError(err);
        console.log('starting %s web job...', webJobName);

        return runWebJob();
      });
  }
  else {
    return runWebJob();
  }
}

/*
 * Initialize the web job and start running on the current process
 */
function runWebJob() {
  
  var pipelineLogic = new PipelineLogic(config);
  
  var runnerInstance = new scheduledRunner(webJobName, config, { pipelineLogic: pipelineLogic }); 
  return runnerInstance.start(function (err) {
    if (err) return console.error('error running %s, error:', webJobName, err);
    console.info(webJobName, 'worker exited');
    
    // scheduling shut down in 5 seconds to let last messages to be printed out
    setTimeout(process.exit, 5000);
  });
}  

function handleError(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
}