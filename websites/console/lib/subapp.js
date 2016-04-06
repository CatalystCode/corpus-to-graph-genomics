var fs = require('fs');
var path = require('path');

module.exports = function(dirs) {


	var router = require('express').Router();

	//
	// load all .js modules from ./api and bind them to this server
	//

  var list = [];
  var subapps = { router: router, list: list};

  dirs.forEach(function(dir) {
    dir = path.resolve(dir);
    console.log('Loading subapp from', dir);

    var modules = fs.readdirSync(dir);
    modules.forEach(function (file) {
      var module = /(.+)\.js/.exec(file);
      if (module) {
        var p = path.join(dir, file);
        var subapp = require(p);
        var route = "/" + module[1];
        if (module[1] === "root") route = "/";
        console.log(route, '==>', p);

        router.use(route, subapp.router || subapp);
        list.push({'route': 'api'+route, console: subapp.console});
      }
    });
  });  

	return subapps;
};

