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
                var options = $.extend({}, $.fn.farmview.defaults, options);

                return this.each(function(){

                    var $this = $(this),
                        data = $this.data('farmview');

                    // the plugin hasn't been initialized yet
                    if (!data){

                        var farmview = $('<div />').addClass("farmview-control")
                            .append($("<div>").html("currently working with a simulated stream").addClass("farmview-clear"))
                            .appendTo($this);

                        var instanceId = nextInstanceId++;
                        $(this).data('farmview', {
                            instanceId: instanceId,
                            target : $this,
                            farmview: farmview,
                            socket: options.socket
                        });

                        options.socket.on('disconnect', function(){
                            $(".farmview-instanceStatus").remove();
                            $("<div class='farmview-msg'>").html("disconnected from server, reconnecting...").insertBefore(farmview.find(".farmview-clear"));
                            console.log("disconnected!");
                        });

                        options.socket.on('connected', function(){
                            console.log("connected to server");
                            _joinFarmView();
                        });

                        _joinFarmView();

                        function _joinFarmView(){
                            options.socket.emit('join', { room: 'farmview', eventName: 'farmviewStateChanged' }, function(error){
                                if(error) {
                                    console.error("couldn't subscribed to farmview events:", error);
                                    return;
                                }

                                farmview.find(".farmview-msg").remove();
                                options.socket.on('farmviewStateChanged', function (instancesState) {
                                    for(var instanceState in instancesState){
                                        drawInstance(farmview, instancesState[instanceState], options);
                                    }
                                });
                                console.log('listening to "farmview" updates')
                            });
                        }

                        console.log("farmview control initialized: ", instanceId);
                    }
                });
            }
            catch(err){
                throw new Error("Couldn't initialize FarmView plugin: " + err.message);
            }
        }
    };

    // private methods
    // ----------------------

    function drawInstance(container, instanceStatus, options){

        var prevInstance = container.find("[instanceId = '" + instanceStatus.id + "']"),
            relativeElm = prevInstance.length ? prevInstance : container.find(".farmview-clear"),
            instanceContainer = $('<div>', {instanceId: instanceStatus.id}).addClass("farmview-instanceStatusContainer").insertBefore(relativeElm),
            instance = $("<div>").addClass("farmview-instanceStatus").appendTo(instanceContainer),
            tooltip = $("<div>").addClass("tooltip farmview-tooltip").appendTo(instanceContainer),
            arrow = $("<div class='farmview-tooltip-arrow'>").appendTo(tooltip),
            tooltipContent = generateTooltipContent(instanceStatus).appendTo(tooltip);

        if(prevInstance.length) {
            // remove previous instance + tooltip elements
            prevInstance.remove();
        }

        /*
        // sort by instance id string
        container.find(".farmview-instanceStatusContainer").remove().sort(function(a,b){
            var res = $(a).attr("instanceId") > $(b).attr("instanceId") ? 1 : -1;
            console.log($(a).attr("instanceId"), res == 1 ? ">" : "<=", $(b).attr("instanceId"));
            return res;
        }).insertBefore(container.find(".farmview-clear"));
        */

        if(instanceStatus.current)
            instance.addClass("farmview-instanceProcessing").removeClass("farmview-instanceReady");
        else
            instance.addClass("farmview-instanceReady").removeClass("farmview-instanceProcessing");

        instance.tooltip({
            effect: 'fade',
            position: 'bottom left',
            offset: options.tootipOffset
        });

      //  arrow.css("left", ((tooltip.width()-arrow.width())/2 + 9));

        function generateTooltipContent(instanceStatus) {

            var html =  "id: " + instanceStatus.id + "<br/>" +
                        "last commit: " + instanceStatus.lastCommit.id + " " + instanceStatus.lastCommit.author + " " + instanceStatus.lastCommit.message;

            var content = $("<div class='farmview-tooltip-content'>")
                .append($("<div>").html(html))
                .append($("<div class='farmview-tooltip-button'>").append($("<input type='button' value='some action'>")));

            return content;
        }
    }

    $.fn.farmview = function(method){

        if(methods[method]){
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if(typeof method === 'object' || ! method){
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.farmview' );
        }
    };

    $.fn.farmview.defaults = { tootipOffset: [12, 15] };

})( jQuery );

