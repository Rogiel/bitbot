/**
 * Created by Rogiel on 11/15/16.
 */

const StrategyBase = require('../Strategy');
const Advice = require('../Advice');

const Advisor = require('../Advisor');
const Filter = require('../Filter');

let Strategy = function (advisor, handler, options) {
    StrategyBase.call(this, advisor, handler, options);

    let macd = this.addTradeIndicator('macd', 'MACD', options/*, 'LowPass', {
        order: 1,
        cutoffFrequency: 50
    }*/);
    this.handler.expose('MACD', function () {
        return macd.value;
    });

    this.buySignalDate = undefined;
};
Strategy.prototype = new StrategyBase();
StrategyBase.Factory.register('MACD', Strategy);

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.updateTrade = function (trade, indicators) {
    // trade.price = trade.close;

    // console.log(indicators.macd.value);

    if (indicators.macd < -0.05) {
        this.buySignalDate = undefined;
        if(!this.sellSignalDate) {
            this.sellSignalDate = trade.date;
            return;
        }

        // Logger.debug('Advice is to sell. MACD:', macd);
        if(trade.date - this.sellSignalDate > 0.5 * 60 * 1000) {
            this.handler.adviceSelling(trade.price);
        }
    } else if (indicators.macd > 0.3) {
        // console.log(trade.date,indicators.macd.value);

        this.sellSignalDate = undefined;
        if(!this.buySignalDate) {
            this.buySignalDate = trade.date;
            return;
        }

        // Logger.debug('Advice is to buy. MACD:', macd);
        // if(trade.date - this.buySignalDate > 1 * 60 * 1000) {
        //     process.abort();
            this.handler.adviceBuying(trade.price);
        // }
    } else {
        this.sellSignalDate = undefined;
        this.buySignalDate = undefined;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;