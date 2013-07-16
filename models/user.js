var mongoose = require('mongoose'),
    passport = require('passport'),
    bcrypt = require('bcrypt'),
    nconf = require('nconf'),
    Schema = mongoose.Schema,
    ObjectId = mongoose.SchemaTypes.ObjectId;

var fb = nconf.get('facebook');

var UserSchema = new Schema({
    name : {
        first: { type: String, required: true },
        last: { type: String, required: true }
    },
    fb: {
        id: String,
        accessToken: String,
        expires: Date,
        name: {
            full: String,
            first: String,
            last: String
          },
        fbAlias: String,
        gender: String,
        email: String,
        timezone: String,
        locale: String,
        verified: Boolean,
        updatedTime: String,
        phone: String,
        birthday: String
    },
    email: { type: String, unique: true },
    salt: { type: String, required: true },
    hash: { type: String, required: true },
    zipcode: { type: String, 'default': '' },
    provider: { type: String, 'default': '' }
});

UserSchema
    .virtual('password')
    .get(function () {
        return this._password;
    })
    .set(function (password) {
        this._password = password;
        var salt = this.salt = bcrypt.genSaltSync(10);
        this.hash = bcrypt.hashSync(password, salt);
    });

UserSchema.method('verifyPassword', function(password, cb) {
    bcrypt.compare(password, this.hash, cb);
});

UserSchema.static('authenticate', function(email, password, cb) {
    this.findOne({ email: email }, function(err, user) {
        if (err) return cb(err);
        if (!user) return cb(null, false);
        user.verifyPassword(password, function(err, passwordCorrect) {
            if (err) return cb(err);
            if (!passwordCorrect) return cb(null, false);
            return cb(null, user);
        });
    });
});

UserSchema.static('addFBUser', function(accessToken, profile, cb) {
    var fbProfile = {
        id: profile.id,
        accessToken: accessToken,
        name: {
            full: profile._json.name,
            first: profile._json.first_name,
            last: profile._json.last_name
        },
        alias: profile._json.link.match(/^http:\/\/www.facebook\.com\/(.+)/)[1],
        gender: profile._json.gender,
        email: profile._json.email,
        timezone: profile._json.timezone,
        locale: profile._json.locale,
        verified: profile._json.verified,
        birthday: profile._json.birthday,
        updatedTime: profile._json.updated_time
    };
    var user = new User({
        name: {
            first: profile._json.first_name,
            last: profile._json.last_name
        },
        email: 'fb:'+profile.id,
        fb: fbProfile,
        salt: ' ',
        hash: ' '
    });
    user.save(function(err) {
        cb(err, user);
    });

});

module.exports = User = mongoose.model('User', UserSchema);
