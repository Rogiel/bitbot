/**
 * Created by Rogiel on 11/16/16.
 */

let moment = require('moment');
let fmt = require('util').format;

let Logger = function () {
};

Logger.prototype._write = function (method, args, name) {
    if (!name)
        name = method.toUpperCase();

    let message = moment().format('YYYY-MM-DD HH:mm:ss');
    message += ' (' + name + '):\t';
    message += fmt.apply(null, args);

    console[method](message);
};

Logger.prototype.error = function () {
    this._write('error', arguments);
};

Logger.prototype.warn = function () {
    this._write('warn', arguments);
};

Logger.prototype.info = function () {
    this._write('info', arguments);
};

Logger.prototype.debug = function () {
    this._write('info', arguments, 'DEBUG');
};

module.exports = new Logger();
