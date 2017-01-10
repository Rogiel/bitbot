/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');

let Indicator = function (options) {
    IndicatorBase.call(this, options);
    this.weight = options.weight || 1;
    this.age = 0;
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('EMA', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    // The first time we can't calculate based on previous
    // value, because we haven't calculated any yet.
    if(this.value === false)
        this.value = value;

    this.age++;
    // weight factor
    let k = 2 / (this.weight + 1);

    // yesterday
    let y = this.value;

    // calculation
    this.value = value * k + y * (1 - k);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;