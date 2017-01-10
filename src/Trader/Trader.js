/**
 * Created by Rogiel on 11/15/16.
 */

const Advice = require('../Advisor/Advice');
const EventEmitter = require('events');

let Trader = function (market, advisor, options) {
    this.eventEmitter = new EventEmitter();

    this.market = market;
    this.advisor = advisor;

    let self = this;
    this.advisor.addAdviceListener(function (advice) {
        self.processAdvice(advice);
    });
};

// ---------------------------------------------------------------------------------------------------------------------

Trader.EVENT_BUY = 'trader-buy';
Trader.EVENT_SELL = 'trader-sell';

// ---------------------------------------------------------------------------------------------------------------------

Trader.prototype.processAdvice = function (advice) {
    if (advice instanceof Advice.SellAdvice) {
        this.processSell(advice);
    } else if (advice instanceof Advice.BuyAdvice) {
        this.processBuy(advice);
    } else {
        Logger.debug('Received a unknown advice. Trader does not know what to do with it: ', advice);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

Trader.prototype.processBuy = function (advice) {
    if(!this.market.loaded) {
        Logger.debug('Market not loaded');

        return;
    }

    if(advice.significance(this.lastAdvice) < Advice.SIGNIFICANCE_LOW) {
        return;
    }

    this.market.buy(advice.amount, advice.price);
    console.log('BUY', advice.trade.date, advice.price, advice.strategy.name);
    // TODO attach trade data
    this.eventEmitter.emit(Trader.EVENT_BUY, advice);

    this.lastAdvice = advice;
};

Trader.prototype.addBuyListener = function (listener) {
    this.eventEmitter.addListener(Trader.EVENT_BUY, listener);
};

Trader.prototype.removeBuyListener = function (listener) {
    this.eventEmitter.removeListener(Trader.EVENT_BUY, listener);
};

// ---------------------------------------------------------------------------------------------------------------------

Trader.prototype.processSell = function (advice) {
    if(!this.market.loaded) {
        Logger.debug('Market not loaded');
        return;
    }

    if(advice.significance(this.lastAdvice) < Advice.SIGNIFICANCE_LOW) {
        return;
    }

    this.market.sell(advice.amount, advice.price);
    console.log('SELL', advice.trade.date, advice.price, advice.strategy.name);
    // TODO attach trade data
    this.eventEmitter.emit(Trader.EVENT_SELL, advice);

    this.lastAdvice = advice;
};

Trader.prototype.addSellListener = function (listener) {
    this.eventEmitter.addListener(Trader.EVENT_SELL, listener);
};

Trader.prototype.removeSellListener = function (listener) {
    this.eventEmitter.removeListener(Trader.EVENT_SELL, listener);
};

// ---------------------------------------------------------------------------------------------------------------------

Trader.prototype.addTraderListener = function (listener) {
    this.eventEmitter.addListener(Trader.EVENT_BUY, listener);
    this.eventEmitter.addListener(Trader.EVENT_SELL, listener);
};

Trader.prototype.removeTraderListener = function (listener) {
    this.eventEmitter.removeListener(Trader.EVENT_BUY, listener);
    this.eventEmitter.removeListener(Trader.EVENT_SELL, listener);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Trader;