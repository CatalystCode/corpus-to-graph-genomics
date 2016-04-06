(function( anode, $ ) {

    var cli;

    // help method for accessing cli env
    function cli_env(setting, val, appOriginated, setEmpty) {
        return cli.cli('env', setting, val, appOriginated, setEmpty);
    }

     // help method for accessing cli prompt
     function cli_prompt(val) {
         return cli.cli('prompt', val);
    }

    // initializing commands array
    anode.commands = [];

    // initializing remote commands array
    var plugins = [];

    anode.initialize = function() {


        anode.baseUrl = getBaseUrl();

        anode.consts = {
                version: "1.1"
        }

        anode.env = {
            app: { type: 'string', value: 'console', description: 'The current app name', userReadOnly: false }
        }

        /*
        {
            app: { type: 'string', value: '', description: 'The current app full name', userReadOnly: false },
            farm: {type: 'string', value: '', description: 'The current farm', userReadOnly: false },
            inst: {type: 'string', value: '', description: 'The current instance', useAtQuery: true, userReadOnly: false }
        }
        */

        var env, ebEnv;

        // adding internal anode commands
        anode.commands = anode.commands.concat(getCommands());

        initConsole(function(){
            cli =  $("#cliInput").cli(
                   {
                       resultsContainer: $("#cliOutput"),
                       promptControl: $("#cliPrompt"),
                       pinPanel: $("#cliPinPanel"),
                       environment: anode.env,
                       commands: anode.commands,
                       plugins: plugins,
                       broadcastUrlGenerator: broadcastUrlGenerator,
                       descriptionHandler: commandDescriptionHandler,
                       welcomeMessage: "Welcome to anode dashboard version <b>"+anode.consts.version+"</b>!<br/>" +
                           "Type <b>help</b> to start exploring the commands currently supported!"
                   }
               );

            // get environment events broker
            ebEnv = cli.cli('envEventsBroker');

            // bind to environment change events
            $(ebEnv).bind({
                    state: function(e, state) {
                        updatePrompt();
                    }
            });

            updatePrompt();
        });

        function getBaseUrl() {
            var url = window.location.href;
            var index = url.indexOf('/index.html');
            url = url.substring(0, index);
            console.log('baseUrl: ', url);
            return url;
        }

        // cli will call this method for each command when constructing its description.
        // we use it here to add a comment for broadcasting commands
        function commandDescriptionHandler(command, currDescription) {
            if(command.broadcast) {
                return currDescription + '<br/><i>This command is automatically broadcasted to all instances on the farm</i>';
            }

            return currDescription;
        }

        // returns an array of ajaxOptions used by cli when broadcasting a request
        function broadcastUrlGenerator(ajaxRequestOptions) {

            var currInst = cli_env('inst');

            // the url already contains the instance value as it is defined as useAtQuery
            if(currInst) {
                ajaxRequestOptions.server = currInst;
                return [ ajaxRequestOptions ];
            }

            var urlWithQuestionMark = ajaxRequestOptions.url.indexOf('?') > -1;
            var ajaxRequestsOptions = _.map(anode.instances, function(inst) {
                var serverRequest = $.extend(true, {}, ajaxRequestOptions,
                        {server: inst, url: ajaxRequestOptions.url + (urlWithQuestionMark ? '&' : '?') + '$inst='+inst });
                return serverRequest;
            });

            return ajaxRequestsOptions;
        }

        function initConsole(callback) {

            // first get list of apis to load automatically
            getJson('anode', function(err, response) {

                if(err){
                    console.error('error loading api list');
                    return;
                }

                // get list of apis
                for(var i=0; i<response.apis.length; i++) {
                    var api = response.apis[i];
                    if(api.console && api.console.autoLoad) {
                        plugins.push({url: api.route + '/!!'});
                    }
                }

                // get list of instances
              //  anode.instances = response.instances;
              //  anode.env.farm.value = response.farm;
                anode.user = response.user;

                callback();
            })
        }

        function updatePrompt() {
            var prompt = constructPrompt(cli_env('farm'), cli_env('app'), cli_env('inst'));
            cli_prompt(prompt);

            function constructPrompt(farm, app, inst, user) {
                var image = "<img src='" + anode.user.image + "' class='promptImage' width='18px'/>";

                var prompt = image + ' [';
                if (anode.user) prompt += anode.user.name +'\\';
                if (app) prompt+= '' + app + '';
                prompt += ']>';
                return prompt;
            }
        }
    }

    function getJson(url, callback) {

        console.log('getting json from url:', url);
        $.getJSON(url, function(data, success, xhr) {
            if(xhr.status!=200){
                callback('got status code:' + xhr.status + '; response:' + xhr.responseText);
                return;
            }

            if(!data) {
                callback('response without data: status:' + xhr.statusText);
                return;
            }

            callback(null, data);
        })
        .error(function(xhr) {
            var msg = 'error: status code:' + xhr.status +' status text:' + xhr.statusText+' response text:' + xhr.responseText;
            console.error(msg);
            callback(msg);
        });
    }

    anode.getJson = getJson;

    // create default anode commands
    function getCommands() {
        var commands = [];
        return commands;
    }

    // proxy to the cli's addPluginHandler method
    anode.addPluginHandler = function(name, handler) {
        cli.cli('addPluginHandler', name, handler);
    }

    // proxy to the cli's loadCss method
    anode.loadCss = function(url){
        cli.cli('loadCss', url);
     }

    // proxy to the cli's addCss method
    anode.addCss = function(css) {
        cli.cli('addCss', css);
    }

}( window.anode = window.anode || {}, jQuery ));

$(function () {

    // disable global ajax caching
    $.ajaxSetup({cache: false});

    // initialize anode components
    anode.initialize();

});
