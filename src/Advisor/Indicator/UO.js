/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const SMA = require('./SMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);
    this.lastClose = 0;
    this.uo = 0;
    this.firstWeight = options.first.weight;
    this.secondWeight = options.second.weight;
    this.thirdWeight = options.third.weight;
    this.firstLow = new SMA({weight: options.first.period});
    this.firstHigh = new SMA({weight: options.first.period});
    this.secondLow = new SMA({weight: options.second.period});
    this.secondHigh = new SMA({weight: options.second.period});
    this.thirdLow = new SMA({weight: options.third.period});
    this.thirdHigh = new SMA({weight: options.third.period});
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('UO', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.handleCandlestick = function (candle) {
    let close = candle.close;
    let prevClose = this.lastClose;
    let low = candle.low;
    let high = candle.high;

    let bp = close - Math.min(low, prevClose);
    let tr = Math.max(high, prevClose) - Math.min(low, prevClose);

    this.firstLow.update(tr);
    this.secondLow.update(tr);
    this.thirdLow.update(tr);

    this.firstHigh.update(bp);
    this.secondHigh.update(bp);
    this.thirdHigh.update(bp);

    let first = this.firstHigh.value / this.firstLow.value;
    let second = this.secondHigh.value / this.secondLow.value;
    let third = this.thirdHigh.value / this.secondLow.value;

    this.value = 100 * (this.firstWeight * first + this.secondWeight * second + this.thirdWeight * third) / (this.firstWeight + this.secondWeight + this.thirdWeight);

    this.lastClose = close;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;