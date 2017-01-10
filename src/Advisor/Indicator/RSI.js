/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.lastValue = 0;
    let weight = options.interval || 14;
    let weightEma = 2 * weight - 1;
    this.avgU = new EMA({weight: weightEma});
    this.avgD = new EMA({weight: weightEma});
    this.u = 0;
    this.d = 0;
    this.age = 0;
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('RSI', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    if(value > this.lastValue) {
        this.u = value - this.lastValue;
        this.d = 0;
    } else {
        this.u = 0;
        this.d = this.lastValue - value;
    }

    this.avgU.update(this.u);
    this.avgD.update(this.d);
    let rs = this.avgU.value / this.avgD.value;

    this.value = 100 - (100 / (1 + rs));

    this.age++;
    this.lastValue = value;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;