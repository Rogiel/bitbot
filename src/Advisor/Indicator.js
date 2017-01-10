/**
 * Created by Rogiel on 11/15/16.
 */

let Indicator = function () {
    this.statistics = {
        diff: undefined,
        up: undefined,
        down: undefined
    };
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * The indicator value
 *
 * @type {int|boolean}
 */
Indicator.prototype.value = false;

/**
 * The indicator statistics
 *
 * @type {object}
 */
Indicator.prototype.statistics = undefined;

/**
 * The indicator filter. The filters are run automatically
 * on update.
 *
 * @type {Filter}
 */
Indicator.prototype.filter = undefined;

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.handleTrade = function (trade) {
    this._lastValue = this.value;
    this.update(trade.price);
    if(this.filter) {
        let after = this.value;
        this.value = this.filter.apply(parseFloat(this.value));
    }
    this.updateStats();
};

Indicator.prototype.handleCandlestick = function (candlestick, metric) {
    this._lastValue = this.value;
    this.update(candlestick[metric]);
    if(this.filter) {
        this.value = this.filter.apply(this.value);
    }
    this.updateStats();
};

Indicator.prototype.update = function (value) {

};

Indicator.prototype.updateStats = function () {
    this.statistics.diff = this.value - this._lastValue;
    if(this.statistics.diff > 0) {
        this.statistics.up = true;
        this.statistics.down = false;
    } else {
        this.statistics.up = false;
        this.statistics.down = true;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.valueOf = function () {
    return this.value;
};

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Indicator.Factory = function () {
};
Indicator.Factory.FACTORIES = {};

Indicator.Factory.register = function (name, cls) {
    Indicator.Factory.FACTORIES[name] = function (options) {
        return new cls(options);
    };
};

Indicator.Factory.create = function (name, opts) {
    if (!Indicator.Factory.FACTORIES[name]) {
        return undefined;
    }
    return Indicator.Factory.FACTORIES[name](opts);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;

// ---------------------------------------------------------------------------------------------------------------------

let ClassLoader = require('../Utility/ClassLoader'),
    path = require('path');
new ClassLoader(__dirname + path.sep + 'Indicator').load();
