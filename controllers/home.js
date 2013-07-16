var mongoose = require('mongoose'),
    async = require('async');

var User = mongoose.model('User');

exports.init = function (app) {

    app.get('/', function(req, res, next) {
    });

};
