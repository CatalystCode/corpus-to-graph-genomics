var fse = require('fs-extra');
var path = require('path');
var constants = require('./constants');

console.info('Checking if should create web job folders');

// If this process\application is a web job, copy app.js to a folder 
// where the web job in Azure expects it to be under:
// site_root\app_data\jobs\continuous\worker\app.js
//
// This will ensure the web job will be created\updated automatically
// On each deployment.
if (process.env.DEPLOYMENT_ROLE === 'webjob') {
  
  // Creating folders for continuous web jobs
  if (process.env.PIPELINE_WEBJOB_TYPE === 'continuous') {
    
    var sourceFile = path.join('webjob', 'continuous', 'app.js');
    var targetFile = path.join('app_data', 'jobs', 'continuous', 'worker', 'app.js');
    
    // If the web job already exists, delete it (ensures the web job will restart in Azure)
    if (fse.existsSync(targetFile)) fse.removeSync(targetFile);

    fse.ensureLinkSync(sourceFile, targetFile);

    console.info('Remove irrelevant folders completed');
    
  // Creating folder for on demand web jobs
  } else {
    
    var sourceFile1 = path.join('webjob', 'triggered', 'app.js');
    var sourceFile2 = path.join('webjob', 'triggered', 'settings.job');
    var targetFile1 = path.join('app_data', 'jobs', 'triggered', 'worker', 'app.js');
    var targetFile2 = path.join('app_data', 'jobs', 'triggered', 'worker', 'settings.job');
    
    // If the web job already exists, delete it (ensures the web job will restart in Azure)
    if (fse.existsSync(targetFile1)) fse.removeSync(targetFile1);
    if (fse.existsSync(targetFile2)) fse.removeSync(targetFile2);

    console.info('Remove irrelevant folders completed');

    fse.ensureLinkSync(sourceFile1, targetFile1);
    fse.ensureLinkSync(sourceFile2, targetFile2);
  }
  
// all web jobs will reside in the same web app
} else if (process.env.DEPLOYMENT_ROLE === constants.all_in_one) {
  
    console.info('Performing all in one deployment...');

    var CONTINUOUS = 'continuous';
    var TRIGGERED = 'triggered';
    var namePlaceholder = '__ROLENAME__';
    var sources = {}
    sources[CONTINUOUS] = [
      {
        from: path.join('webjob', CONTINUOUS, 'app.js'),
        to: path.join('app_data', 'jobs', CONTINUOUS, namePlaceholder, 'app.js')
      }
    ];
    sources[TRIGGERED] = [
      {
        from: path.join('webjob', TRIGGERED, 'app.js'),
        to: path.join('app_data', 'jobs', TRIGGERED, namePlaceholder, 'app.js')
      },
      {
        from: path.join('webjob', TRIGGERED, 'settings.job'),
        to: path.join('app_data', 'jobs', TRIGGERED, namePlaceholder, 'settings.job')
      }
    ];
    
    var targets = [
      { 
        name: 'trigger',
        type: TRIGGERED
      }, 
      {
        name:'query',
        type: CONTINUOUS
      }, 
      {
        name: 'parser',
        type: CONTINUOUS
      }, 
      { 
        name: 'scoring',
        type: CONTINUOUS
      }
    ];
    
    var files = 0;
    for (var targetIdx in targets) {
      var target = targets[targetIdx];
      var sourceFiles = sources[target.type];
      
      for (var sourceFileIdx in sourceFiles) {
        var sourceFile = sourceFiles[sourceFileIdx];
        var targetFile = sourceFile.to.replace(namePlaceholder, target.name);

        if (fse.existsSync(targetFile)) fse.removeSync(targetFile);
        fse.ensureLinkSync(sourceFile.from, targetFile);
        files++;
      }
    }

    console.info('completed all in one deployment with %s files', files);
}