/**
 * Created by Rogiel on 11/15/16.
 */

const StrategyBase = require('../Strategy');
const Advice = require('../Advice');

const Advisor = require('../Advisor');
const Filter = require('../Filter');

let Strategy = function (advisor, handler, options) {
    StrategyBase.call(this, advisor, handler, options);

    this.addCandlestickIndicator('stochRSI', 'StochRSI', 'close', options);
    this.addCandlestickIndicator('rsi', 'RSI', 'close', options);

    this.buySignalDate = undefined;
    this.candlestickLength = 1;
};
Strategy.prototype = new StrategyBase();
StrategyBase.Factory.register('StochRSI', Strategy);

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.updateCandlestick = function (trade, indicators) {
    // console.log(indicators.stochRSI.value);
    if (indicators.stochRSI > indicators.rsi) {
        this.handler.adviceSelling(trade.close);
    } else if (indicators.stochRSI < indicators.rsi) {
        // console.log(trade.date,indicators.macd.value);
        this.handler.adviceBuying(trade.close);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;