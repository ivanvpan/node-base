var express = require('express'),
    bodyParser = require('body-parser'),
    compression = require('compression'),
    serveStatic = require('serve-static'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    responseTime = require('response-time'),
    errorHandler = require('errorhandler'),
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

app.use(bodyParser.json());
app.use(compression());
app.use(serveStatic(basePath + '/public'));
app.use(cookieParser());
app.use(cookieSession({secret: nconf.get('sessionSecret')}));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('connect-flash')());
app.set('views', basePath +  '/views');
app.set('view options', { layout: false });
app.set('port', process.env.PORT || nconf.get('port'));

// dev and test environments
if (!nconf.get('NODE_ENV') || nconf.get('NODE_ENV') == 'development') {
    console.log('starting in development mode');
    app.use(responseTime());
    //app.use(express.logger('dev'));
    //app.use(app.router);
    app.use(errorHandler({
        dumpExceptions:true,
        showStack:true
    }));
}

// production environment
if (nconf.get('NODE_ENV') == 'production') {
    //app.use(app.router);
    //app.use(errorHandler());
}

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
