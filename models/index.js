var fs = require('fs'),
    files = fs.readdirSync(__dirname);

files.forEach(function (file) {
    if (file === 'index.js') {
        return;
    }
    var name, match = /^([a-z_0-9]*)\.js$/.exec(file);
    if (match) {
        name = match[1];
        module.exports[name] = require('./' + file);
    }
});
