
    console.info('proxy handler loaded');

    this.request = function(args, context) {
        if ($.query.get('debug')) debugger;

        var promise = context.createPromise();

        var options = {
                    url: 'api/proxy/' + args.url,
                    type: args.method,
                    headers: {
                        "Accept": "*/*",
                        "Content-Type": args.type
                    },
                    success: function(data, textStatus, xhr) {
                        var res = '';
                        if (xhr.responseXML || (typeof data == 'string' && data))
                            res = $("<pre>").text(xhr.responseText);
                        else
                            res = data;

                        if(!res) res = xhr.status + ' ' + xhr.statusText;
                        promise.resolve(res);
                    },
                    error: function(err) {
                        promise.resolve('error: ' + JSON.stringify(err));
                    }
                };

        if(args.body) options.data = args.body;

        $.ajax(options);

        return promise;
    }
