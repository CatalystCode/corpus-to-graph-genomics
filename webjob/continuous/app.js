var path = require('path');
var fs = require('fs');
var cluster = require('cluster');
var workers = process.env.WORKERS || require('os').cpus().length;

process.on('uncaughtException', handleError);

// Load modules from one folder up (locally) or four folders up (on a service's web job)
var loadModulesPath = path.join(__dirname, '..', '..', '..', '..');
if (!fs.existsSync(path.join(loadModulesPath, 'load-modules.js')))
  loadModulesPath = path.join(__dirname, '..', '..');
var loadModules = require(path.join(loadModulesPath, 'load-modules.js'));
var rootPath = loadModules.getRootPath();

var continuousRunner = require('corpus-to-graph-pipeline').runners.continuous;

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

cloneAndStartProcess();

/*
 * Make as many processes as there are cores on the current machine
 * Or as many as specified by the configuration.
 */
function cloneAndStartProcess() {
  
  // In case there is only 1 worker, no need to fork
  if (!cluster.isMaster || workers <= 1) {
    initLogStartWebJob();
    
  } else {
    console.log('start cluster with %s workers', workers);

    for (var i = 0; i < workers; ++i) {
      var workerProcess = cluster.fork().process;
      console.log('worker %s started.', workerProcess.pid);
    }

    cluster.on('exit', function(workerProcess) {
      console.log('worker %s died. restart...', workerProcess.process.pid);
      cluster.fork();
    });
  }
}

/*
 * Initialize logging if anode is specified and start the web job
 */
function initLogStartWebJob() {
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

        return startContinuousRunner();
      });
  }
  else {
    return startContinuousRunner();
  }
}

/*
 * Initialize the web job runner and start running on the current process
 */
function startContinuousRunner() {
  
  var pipelineLogic = new PipelineLogic(config);
  
  var runnerInstance = new continuousRunner(webJobName, config, { pipelineLogic: pipelineLogic }); 
  return runnerInstance.start(function (err) {
    if (err) return console.error('error running %s, error:', webJobName, err);
    console.info(webJobName, 'worker exited');
  });
}

function handleError(err) {
  console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
}