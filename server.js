var express = require('express'),
    http = require('http'),
    nconf = require('nconf'),
    mongoose = require('mongoose'),
    passport = require('passport');

var basePath = __dirname;

// configuration
nconf.argv().env();
nconf.file('global', { type:'file', file:'config/global.json' });
nconf.file('enviroment', { type:'file', file:'config/' + (nconf.get('NODE_ENV') || 'development') + '.json'});
nconf.load();

nconf.defaults({
    'port':'80'
});

// db
var dbConfig = nconf.get('mongodb');
mongoose.connect(dbConfig.host,
    dbConfig.database,
    dbConfig.port);

// models
var model = require('./models');

// setup app
var app = express();

app.configure(function() {
    app.use(express.bodyParser());
    app.use(express.compress());
    app.use(express.static(basePath + '/public'));
    app.use(express.cookieParser());
    app.use(express.cookieSession({secret: nconf.get('sessionSecret')}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(require('connect-flash')());
    app.set('views', basePath +  '/views');
    app.set('view options', { layout: false });
    app.set('port', process.env.PORT || nconf.get('port'));
});

// dev and test environments
app.configure('development', 'test', function () {
    console.log('starting in development mode');
    app.use(express.responseTime());
    app.use(express.logger('dev'));
    app.use(app.router);
    app.use(express.errorHandler({
        dumpExceptions:true,
        showStack:true
    }));
});

// production environment
app.configure('production', function () {
    app.use(app.router);
    app.use(express.errorHandler());
});

// serialize user on login
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

// setup controllers
require('./controllers').init(app);

// listen
http.createServer(app).listen(app.get('port'), function() {
    console.log('listening on port ' + app.get('port'));
});
