/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.short = new EMA({weight: options.short});
    this.long = new EMA({weight: options.long});
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('DEMA', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.short.update(value);
    this.long.update(value);

    let shortEMA = this.short.value;
    let longEMA = this.long.value;

    this.value = 100 * (shortEMA - longEMA) / ((shortEMA + longEMA) / 2);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;