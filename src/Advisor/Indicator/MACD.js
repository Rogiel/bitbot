/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.short = new EMA({weight: options.short || 12});
    this.long = new EMA({weight: options.long || 26});
    this.signal = new EMA({weight: options.signal || 9});
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('MACD', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.short.update(value);
    this.long.update(value);

    let shortEMA = this.short.value;
    let longEMA = this.long.value;

    let diff = shortEMA - longEMA;

    this.signal.update(diff);
    this.value = diff - this.signal.value;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;