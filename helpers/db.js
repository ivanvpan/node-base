var mongoose = require('mongoose'),
    nconf = require('nconf');

exports.connect = function () {
    var config = nconf.get('mongodb');
    var connectset = nconf.get('connectset');
    if (connectset) {
        mongoose.connect(nconf.get('connectset').join(","), function (err) {
            if (err) {
                console.log("could not connect to DB: " + err);
                // workaround for replica set unable to find primary. let forever/cluster cycle process.
                process.exit();
            }
        });
    } else if (config) {
        mongoose.connect(config.host,
            config.database,
            config.port);
    }
};