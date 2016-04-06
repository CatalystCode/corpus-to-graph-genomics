/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 1/15/12
 * Time: 1:36 PM
 * To change this template use File | Settings | File Templates.
 */

(function( $ ){

    var nextInstanceId = 1;

    var methods = {
        init: function(options){

            try
            {
                if(!options || !options.socket) { throw new Error("please provide a socket");}
                var options = $.extend({}, $.fn.logview.defaults, options);

                return this.each(function(){

                    var $this = $(this),
                        data = $this.data('logview');

                    // the plugin hasn't been initialized yet
                    if (!data){

                        var logview = $('<div />').addClass("logview-control").appendTo($this),
                            logTable = $("<table>").addClass("logview-table").appendTo(logview);

                        var instanceId = nextInstanceId++;
                        $(this).data('logview', {
                            instanceId: instanceId,
                            target : $this,
                            logview: logview,
                            logTable: logTable,
                            socket: options.socket
                        });

                        options.socket.on('disconnect', function(){
                            $(".logview-instanceStatus").remove();
                            $("<div class='logview-msg'>").html("disconnected from server, reconnecting...").insertBefore(logview.find(".logview-clear"));
                            console.log("disconnected!");
                        });

                        options.socket.on('connected', function(){
                            console.log("connected to server");
                            _joinlogview();
                        });

                        var logEntries = [];

                        setInterval(function(){

                            var entry = logEntries.shift();
                            //console.log("setTimeout invoked with", entry);

                            if(entry) {
                                _drawLogEntry(entry);
                            }
                        }, 200);

                        function _drawLogEntry(logEntry) {

                                if(logTable.find("tr").length >= options.rows) {
                                    logTable.find("tr").first().remove();
                                }

                                $("<tr>")
                                    .append($("<td>").html(new Date(logEntry.meta.time).toLocaleTimeString()))
                                    .append($("<td>").html(logEntry.level))
                                    .append($("<td>").text(logEntry.message))
                                    .append($("<td>").html(logEntry.meta.instanceId))
                                    .appendTo(logTable);

                        }

                        var eventName = 'newLogEntryinstance' + instanceId;

                        _joinlogview();

                        function _joinlogview(){
                            options.socket.emit('join', {room: 'log', app: options.app, stream: options.stream, eventName: eventName, limit: options.limit, verbosity: options.verbosity}, function(error){
                                if(error) {
                                    console.error("couldn't subscribed to logview events:", error);
                                    return;
                                }

                                logview.find(".logview-msg").remove();
                                options.socket.on(eventName, function (logEntry) {

                                    logEntries.push(logEntry);

                                });



                                console.log('listening to "logview" updates')
                            });
                        }

                        console.log("logview control initialized: ", instanceId);
                    }
                });
            }
            catch(err){
                throw new Error("Couldn't initialize logview plugin: " + err.message);
            }
        }
    };

    $.fn.logview = function(method){

        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || ! method){
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.logview' );
        }
    };

    $.fn.logview.defaults = { };

})( jQuery );

