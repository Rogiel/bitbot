/**
 * Created by Rogiel on 11/15/16.
 */

let Filter = function () {
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * The filter value
 *
 * @type {int|boolean}
 */
Filter.prototype.value = false;

// ---------------------------------------------------------------------------------------------------------------------

Filter.prototype.apply = function (value) {

};

// ---------------------------------------------------------------------------------------------------------------------

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Filter.Factory = function () {
};
Filter.Factory.FACTORIES = {};

Filter.Factory.register = function (name, cls) {
    Filter.Factory.FACTORIES[name] = function (options) {
        return new cls(options);
    };
};

/**
 *
 * @param name
 * @param opts
 * @returns {Filter}
 */
Filter.Factory.create = function (name, opts = {}) {
    if (!Filter.Factory.FACTORIES[name]) {
        return undefined;
    }
    return Filter.Factory.FACTORIES[name](opts);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Filter;

// ---------------------------------------------------------------------------------------------------------------------

let ClassLoader = require('../Utility/ClassLoader'),
    path = require('path');
new ClassLoader(__dirname + path.sep + 'Filter').load();
