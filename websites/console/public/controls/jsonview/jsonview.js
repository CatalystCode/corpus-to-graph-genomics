/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 1/15/12
 * Time: 1:36 PM
 * To change this template use File | Settings | File Templates.
 */

(function( $ ){

    var nextInstanceId = 1;

    /*
    options = {
      type: pullState
    }
    */
    var methods = {
        init: function(options){

            try
            {
                if(!options || !options.socket) { throw new Error("please provide a socket");}
                if(!options.type) { throw new Error("please provide a jsonview type");}
                var options = $.extend({}, $.fn.jsonview.defaults, options);

                return this.each(function(){

                    var $this = $(this),
                        data = $this.data('jsonview');

                    // the plugin hasn't been initialized yet
                    if (!data){

                        var jsonview = $('<div />').addClass("jsonview-control").appendTo($this);

                        var instanceId = nextInstanceId++;
                        $(this).data('jsonview', {
                            instanceId: instanceId,
                            target : $this,
                            jsonview: jsonview,
                            socket: options.socket
                        });

                        options.socket.on('disconnect', function(){
                            console.log("disconnected!");
                        });

                        options.socket.on('connected', function(){
                            console.log("connected to server");
                        });

                        var eventName = options.type + 'Changed';
                        if(!options.stream) eventName += 'instance' + instanceId;

                        _joinjsonview();

                        function _joinjsonview(){

                            options.socket.emit('join', {room: options.type, stream: options.stream, eventName: eventName}, function(error){
                                if(error) {
                                    console.error("couldn't subscribed to", options.type, "events:", error);
                                    return;
                                }
                                options.socket.on(eventName , function (state) {
                                    jsonview.html("")
                                        .append(jsonToHtml(state))
                                        .append($("<div class='timestamp'>").html(
                                        (options.stream ? "[streaming...] " : "") +
                                        "last changed:" + new Date().toLocaleTimeString()));
                                });

                                console.log("listening to", options.type, "updates");
                            });
                        }

                        console.log("jsonview control initialized: ", instanceId, options.type);
                    }
                });
            }
            catch(err){
                throw new Error("Couldn't initialize jsonview plugin: " + err.message);
            }
        }
    };

    function jsonToHtml(obj)
    {
       var tbl = $("<table cellpadding='0' cellspacing='0' border='0'>");
       for (var key in obj)
       {
           var val = obj[key] ? (typeof obj[key] == 'object' ? jsonToHtml(obj[key]) : obj[key]) : "";

           $("<tr>")
              .append($("<td class='metadataField'>").html(key))
              .append($("<td class='metadataValue'>").append(val))
              .appendTo(tbl);
       }

       return tbl;
    }

    $.fn.jsonview = function(method){

        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || ! method){
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.jsonview' );
        }
    };

    $.fn.jsonview.defaults = { };

})( jQuery );

