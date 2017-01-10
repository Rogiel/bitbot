/**
 * Created by Rogiel on 11/15/16.
 */

const StrategyBase = require('../Strategy');

let Strategy = function (advisor, handler, options) {
    StrategyBase.call(this, advisor, handler, options);

    this.addTradeIndicator('myIndicator', 'Random');
};
Strategy.prototype = new StrategyBase();
StrategyBase.Factory.register('Random', Strategy);

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.updateTrade = function (trade, indicators) {
    if (indicators.myIndicator < 0.5) {
        this.handler.adviceBuying(trade.price);
    } else {
        this.handler.adviceSelling(trade.price);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;