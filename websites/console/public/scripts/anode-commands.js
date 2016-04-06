/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 1/15/12
 * Time: 1:50 PM
 * To change this template use File | Settings | File Templates.
 */
$(function () {

    /*
    anode.commands.push({name: "bcast",
         description: "Broadcasts a request to all instances",
         usage: 'bcast url',
         example: 'bcast api/pull/status',
         params: [
             {
                name: 'url',
                description: 'the url to call on each instance',
                type: 'string'
             }
         ],
         exec: function(args, context) {
             var promise = context.createPromise();

             //$(promise).bind('data', function(e, data){
             //    console.log('got data:', data);
             //});
             //$(promise).bind('error', function(e, error){
             //    console.log('got error:', error);
             //});

             anode.broadcastRequests(args.url, promise, function(responses) {
                 var res = $("<div>").addClass('cli-jsonview-control').append(anode.jsonToHtml(responses));
                 promise.resolve(res);
             });
             return promise;
         }


    }); */

/*
    anode.plugins.push({
            url: 'api/log/!!',
            options: { log:
                        {   excludeAndOverideParams : {
                                format: 'text',
                                'nocolors': 'false'
                        },
                        handler: function(err, response) {
                            if(err) {
                                response.promise.resolve('error trying to get logs: ' + err);
                                return;
                            }
                            if(!response.data.length) {
                                response.promise.resolve('no logs found...');
                                return;
                            }

                            var res = $("<div class='anode-logs'>");
                            if(response.args.since) {
                                response.data.reverse();
                            }
                            for(var i=response.data.length-1; i>=0; i--) {

                                var line = response.data[i],
                                    verbosity = line.substr(0,6).trim();

                                $("<div>").addClass(verbosity).append(
                                    $("<pre>").addClass(verbosity).html(line)).appendTo(res);
                            }

                            response.promise.resolve(res);
                        }
                    }
                }
    });
*/


    // example for a colect remote command with custom hander
    /*
    anode.plugins.push({
            url: 'api/pull/!!',
            options: { status:
                        {   excludeAndOverideParams : {
                        },
                        returnBeforeInvoke: true,
                        handler: function(collectCommand) {
                            var args = collectCommand.args;
                            var context = collectCommand.context;
                            var promise = context.createPromise();
                            var url = context.url;
                            var env = context.env;
                            var command = context.command;

                            var res = $("<div>").addClass('cli-jsonview-control');
                            return anode.collectCommandHandler(collectCommand, promise, function(err, response) {
                                if(err) {
                                    promise.resolve(err);
                                    return;
                                }
                                res.append(anode.jsonToHtml(response));
                                promise.resolve(res);

                            });

                        }
                    }
                }
    });
    */


    // do not delete the below commented out code...
    // i will do it on  code cleanup...
        /*,
        {
            url: 'api/commands',
            options: { 'commands test2':
                        {
                            handler: function(err, response) {
                                response.promise.resolve(JSON.stringify(response.data));
                            }
                        }
            }
        }
        /*,
        {
            url: 'http://houdini.msproto.net',
            groupCommandName: 'houdini',
            options: { 'houdini listfiles':
                        {
                            handler: function(err, response) {
                                response.promise.resolve(JSON.stringify(response.data));
                            }
                        }
            }
        }*/


});
