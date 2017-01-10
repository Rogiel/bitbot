/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const RSI = require('./RSI');
const _ = require('lodash');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.interval = options.interval || 14;
    this.rsi = new RSI({
        interval: this.interval
    });
    this.history = [];
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('StochRSI', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.rsi.update(value);

    this.history.push(this.rsi.value);

    if(_.size(this.history) > this.interval)
    // remove oldest RSI value
        this.history.shift();

    this.lowestRSI = _.min(this.history);
    this.highestRSI = _.max(this.history);

    this.value = ((this.rsi.value - this.lowestRSI) / (this.highestRSI - this.lowestRSI)) * 100.0;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;