/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);
    this.short = new EMA({weight: options.short || 12});

    this.lastCandle = undefined;
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('ADX', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.updateCandlestick = function (candlestick) {
    if (!this.lastCandle) {
        this.lastCandle = candlestick;
        return;
    }

    let upMove = candlestick.high - this.lastCandle.high;
    let downMove = this.lastCandle.low - candlestick.low;

    if (upMove > downMove && upMove > 0) {
        pDM = upMove;
    } else {
        pDM = 0;
    }
    if (downMove > upMove && dsownMove > 0) {
        mDM = DownMove;
    } else {
        mDM = 0;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;