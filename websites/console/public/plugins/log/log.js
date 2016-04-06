/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 1/15/12
 * Time: 1:50 PM
 * To change this template use File | Settings | File Templates.
 */
    console.info('log handler loaded');

    this.log = function(err, response){

        if ($.query.get('debug')) debugger;

        if(err) {
            response.promise.resolve('error trying to get logs: ' + err);
            return;
        }
        if(!response.data.length) {
            response.promise.resolve('no logs found...');
            return;
        }

        var res = $("<div class='anode-logs' />");
        if(response.args.since) {
            response.data.reverse();
        }
        for(var i=response.data.length-1; i>=0; i--) {

            var line = response.data[i],
                verbosity = line.substr(0,6).trim();

            $("<div/>").addClass(verbosity).append(
                $("<pre/>").addClass(verbosity).html(line)).appendTo(res);
        }

        response.promise.resolve(res);
    }
