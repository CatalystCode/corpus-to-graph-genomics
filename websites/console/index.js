
var config = require('./config');

    var express = require('express');
    var path = require('path');
    var passport = require('passport');
    var flash    = require('connect-flash');
    var morgan       = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser   = require('body-parser');
    var session      = require('express-session');

    require('./auth/passport')(passport);

    var subapp = require('./lib/subapp');
    var app = express();

    app.use(morgan('dev')); // log every request to the console

    app.use(cookieParser()); // read cookies (needed for auth)
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    // required for passport
    app.use(session({ secret: 'mysecretsesson123456789', resave: false, saveUninitialized: false })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session

    app.use(require('./routes/login')(passport));

    app.use(function (req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }
        if (!req.user || !req.user.authorized) {
            return res.status(404).json({ error: 'user ' + req.user.name + ' (' + req.user.email +') is not authorized' });
        }

        return next();
    });

    var subApps = subapp([path.join(__dirname, 'api'), path.join(__dirname, '..', '..', 'domain-logic/console/api')]);
    app.use('/api', subApps.router);

    app.get('/cli', function (req, res) {
        console.log('getting sub apps');
        var resp = {
            apis: subApps.list,
            user: req.user
        };
        console.log('subApps', resp);
        res.json(resp);
    });

    app.use(express.static(path.join(__dirname, 'public')));

    app.use(function (req, res) {
        return res.status(404).json({ error: 'not found' });
    });

    app.set('port', process.env.PORT || 3000);

    module.exports = app;
