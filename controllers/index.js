var fs = require('fs');

// Start up the routes
exports.init = function (app) {
    loadRoutes(app);
    initRootRoutes(app);
}

// Get a list of all route and init each one
function loadRoutes(app) {
    // load up all the routes
    fs.readdir(__dirname, function (err, files) {
        if (err) throw err;
        files.forEach(function (file) {
            loadRoute(app, file);
        });
    });
}

// Load and initialize an individual route file
function loadRoute(app, file) {
    var name, route, match = /^([a-z_0-9]*)\.js$/.exec(file);
    if (match) {
        name = match[1];
        if (name == 'index') return; // Don't include this file

        // Load the route and call the init function if there is one
        var route = require('./' + name);
        Object.keys(route).map(function (action) {
            switch (action) {
                case 'init':
                    route.init(app);
                    break;
            }
        });
    }
}

// Init the base routes of the application
function initRootRoutes(app) {
    app.get('/logout', function (req, res) {
        res.redirect('/auth/logout');
    });

    app.get('/auth/logout', function (req, res) {
        if (req.user || req.loggedIn) {
            req.logout();
        }
        res.clearCookie('omLoggedIn');
        res.redirect('/');
    });
}
