/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');

let Indicator = function (options) {
    IndicatorBase.call(this, options);
    this.max = options.max || 1.0;
    this.min = options.min || 0.0;
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('Random', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (trade) {
    this.value = Math.random() * (this.max - this.min) + this.min;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;