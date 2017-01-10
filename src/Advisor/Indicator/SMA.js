/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');

let Indicator = function (options = {}) {
    IndicatorBase.call(this, options);
    this.weight = options.weight || 100;
    this.prices = [];
    this.value = 0;
    this.age = 0;
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('SMA', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.prices[this.age % this.weight] = value;
    sum = this.prices.reduce(function(a, b) { return a + b; }, 0);
    this.value = sum / this.prices.length;
    this.age++;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;