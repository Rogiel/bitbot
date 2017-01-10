/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.macd = false;
    this.ppo = false;
    this.short = new EMA({weight: options.short});
    this.long = new EMA({weight: options.long});
    this.MACDsignal = new EMA({weight: options.signal});
    this.PPOsignal = new EMA({weight: options.signal});
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('PPO', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.short.update(value);
    this.long.update(value);

    let shortEMA = this.short.value;
    let longEMA = this.long.value;
    this.macd = shortEMA - longEMA;
    this.value = 100 * (this.macd / longEMA);

    this.MACDsignal.update(this.macd);
    this.MACDhist = this.macd - this.MACDsignal.value;
    this.PPOsignal.update(this.value);
    this.PPOhist = this.value - this.PPOsignal.value;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;