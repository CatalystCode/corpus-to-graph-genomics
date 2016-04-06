/**
 * Created by JetBrains WebStorm.
 * User: amitu
 * Date: 1/15/12
 * Time: 1:50 PM
 * To change this template use File | Settings | File Templates.
 */

    //debugger;
    console.info('tests handler loaded');

    this.list = function(error, response) {

        if ($.query.get('debug')) debugger;
        var args = response.args;
        var context = response.context;
        var url = context.url;
        var env = context.env;
        var command = context.command;
        var data = response.data;

        if(error) {
            response.promise.resolve('error getting tests:' + error);
            return;
        }

        var testApps = {};

        _.each(Object.keys(data), function(testApp) {
          testApps[testApp] = data[testApp].map(function(item) { return item.name; });
        });

        response.promise.resolve(testApps);
    }


    this.run = function(error, response) {

        if ($.query.get('debug')) debugger;
        var args = response.args;
        var context = response.context;
        var url = context.url;
        var env = context.env;
        var command = context.command;
        var data = response.data;

        if(error) {
            response.promise.resolve('error running test:' + error);
            return;
        }

        var container = $("<div class='anode-tests-result'/>");
        var testResult = $("<div class='testResult'/>").appendTo(container);
        response.promise.resolve(container);

        drawResult(args.testapp, data, testResult, context);
    }


    this.all = function(args, context) {

        if ($.query.get('debug')) debugger;
        var promise = context.createPromise();

        setTimeout(function(){
            var query = "";
            if (args.suite){
                query = "?suite=" + args.suite;
            }
            anode.getJson('api/test/list/' + args.app + query, function(err, testApps){

                if(err) {
                    promise.resolve("error getting tests: " + err);
                    return;
                }

                var container = $("<div class='anode-tests-result'/>");

                if(!args.parallel) {
                    console.log('runing tests serially');

                    var funcs = [];
                    _.each(Object.keys(testApps), function(appName){
                        var tests = testApps[appName];
                        _.each(tests, function(test) {
                            var testResult = $("<div class='testResult'/>").html("pending " + appName + ":" + test.name).appendTo(container);
                            var testId = test.url.replace('/tests/', '');
                            funcs.push(getRunTest(args.suite ? appName : null, test.name, testId, testResult));
                        });
                    });

                    promise.resolve(container);

                    var i=0;
                    funcs[i](_cb);

                    function _cb() {
                        i++;
                        if (i < funcs.length)
                            funcs[i](_cb);
                        else
                            console.log('done');
                    }
                }
                else {
                    console.log('runing tests in parallel');

                    _.each(Object.keys(testApps), function(appName) {
                        var tests = testApps[appName];
                        _.each(tests, function(test) {
                            var testResult = $("<div class='testResult'/>").appendTo(container);
                            var testId = test.url.replace('/tests/', '');
                            runtest(args.suite ? appName : null, test.name, testId, testResult);
                        });
                    });
                    promise.resolve(container);
                }

                function getRunTest(testAppName, testName, testId, resultControl) {

                    var _testAppName = testAppName;
                    var _testName = testName;
                    var _testId = testId;
                    var  _resultControl = resultControl;

                    return function(cb) {
                        runtest(_testAppName, _testName, _testId, _resultControl, cb);
                    }
                }

                function runtest(testAppName, testName, testId, resultControl, cb) {

                    var appNamePrefix = '';
                    var testAppQuery = '';
                    if (testAppName){
                        appNamePrefix = testAppName + ':';
                        testAppQuery = '&testapp=' + testAppName
                    }
                    resultControl.html('');
                    $("<span class='testRunning'/>").html('running '+ appNamePrefix + testName + '... please wait...').appendTo(resultControl);
                    anode.getJson('api/test/run/' + args.app + '/' + testName + '?id=' + testId + testAppQuery, function(err, testResult){
                        if(err) {
                            $("<span class='testError'/>").html('error executing test: ' + appNamePrefix + testName + '. Error: ' + err).appendTo(resultControl);
                            if(cb) cb();
                            return;
                        }

                        drawResult(testAppName, testResult, resultControl, context);
                        if(cb) cb();
                    });
                }
            });
        }, 1);

        return promise;
    }

    function drawResult(testAppName, testResult, resultControl, context) {

        var cssClass = testResult.success ? "testSuccess" : "testFailed";
        var appNamePrefix = '';
        if (testAppName){
            appNamePrefix = testAppName + ':';
        }
        var title =  '<span class='+cssClass+'>'+
            (testResult.success ? 'success' : '<b>FAILED</b>') +
            ': <b>' + appNamePrefix + testResult.name + '</b> | '+
            ' <b>' + testResult.duration + '</b> msec</span>';

        resultControl.html("");
        var assertionsCtrl = $("<div class='assetions'/>"),
            titleCtrl = $("<div class='testTitle'/>").html(title).appendTo(resultControl)
                .click(function(){assertionsCtrl.toggle()});

        var assHtml = '';
        if(testResult.assertions && testResult.assertions.length) {
            _.each(testResult.assertions, function(assert) {
                cssClass = assert.success ? "testSuccess" : "testFailed";

                assHtml+= '<span class='+cssClass+'>'+
                    (assert.success ? 'success' : '<b>FAILED</b>')+
                    ': <b>' + assert.method +'</b></span>';

                if(assert.message) assHtml+= '<br/>message: <b>' + assert.message + '</b>';
                if(assert.stack) assHtml+= '<br/>stack: <pre>' + assert.stack + '</pre>';
                assHtml += '</br>';
            });
        }
        assertionsCtrl.html(assHtml).appendTo(resultControl).hide();
        context.scrollDown();
    }