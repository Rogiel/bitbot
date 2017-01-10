/**
 * Created by Rogiel on 11/25/16.
 */

let path = require('path'),
    fs = require('fs');

let ClassLoader = function (path) {
    this.path = path;
    this.classes = {};
};

// ---------------------------------------------------------------------------------------------------------------------

ClassLoader.prototype.load = function () {
    let self = this;
    function loadDirectory(thePath) {
        fs.readdirSync(self.path + path.sep + thePath).forEach(function (filename) {
            let name = path.basename(filename, '.js');
            if (path.extname(filename) === '.js' && filename !== 'index.js') {
                self.classes[name] = require(self.path + path.sep + thePath + path.sep + filename);
            } else if(fs.lstatSync(self.path + path.sep + thePath + path.sep + filename).isDirectory()) {
                loadDirectory(thePath + path.sep + filename)
            }
        });
    }
    loadDirectory('');
    return this.classes;
};

// ---------------------------------------------------------------------------------------------------------------------

ClassLoader.prototype.resolve = function (name) {
    return this.classes[name];
};

ClassLoader.prototype.create = function (name) {
    let resolved = this.classes[name];
    let object = Object.create(resolved.prototype);

    let args = arguments;
    args.shift();
    return this.classes[name].apply(object, args);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = ClassLoader;