/**
 * Created by Rogiel on 11/15/16.
 */

const EventEmitter = require('events');
const Advice = require('./Advice');

const Strategy = require('./Strategy'); // automatically load all strategies

let Advisor = function (market, marketHistory, options) {
    this.eventEmitter = new EventEmitter();

    this.market = market;
    this.marketHistory = marketHistory;

    if (!options.strategies || options.strategies.length == 0) {
        throw new Error('"strategies" option is required.');
    }

    this.strategies = {};
    for (const key in options.strategies) {
        if (!options.strategies.hasOwnProperty(key)) {
            continue;
        }

        const strategyOptions = options.strategies[key];

        let handler = new Advisor.AdviceHandler(this);
        let strategy = Strategy.Factory.create(
            strategyOptions.name, this, handler, strategyOptions
        );
        handler.strategy = strategy;

        strategy.name = key;
        this.strategies[key] = strategy;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

Advisor.EVENT_ADVICE = 'advice';
Advisor.EVENT_MARKET_POSITION = 'market-position';

Advisor.MARKET_STATE_SOFT = 'soft';
Advisor.MARKET_STATE_LONG = 'long';
Advisor.MARKET_STATE_SHORT = 'short';
Advisor.MARKET_STATE_UNKNWON = 'unknown';

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Market} */
Advisor.prototype.market = undefined;

/** @type {MarketHistory} */
Advisor.prototype.marketHistory = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/** @type {string} */
Advisor.prototype._marketPosition = Advisor.MARKET_STATE_UNKNWON;
Object.defineProperty(Advisor.prototype, "marketPosition", {
    get: function () {
        return this._marketPosition;
    },

    set: function (marketPosition) {
        if (this._marketPosition === marketPosition) {
            return;
        }
        const oldMarketPosition = this._marketPosition;
        this._marketPosition = marketPosition;
        this.eventEmitter.emit(Advisor.EVENT_MARKET_POSITION, marketPosition, oldMarketPosition);
    }
});

/** @type {Advice} */
Advisor.prototype.lastAdvice = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Adds a new advice listener.
 *
 * Setting significance allows to filter advices based on their significance
 * relative to the last advice sent to the listener.
 *
 * @param listener the advice listener
 * @param significance the minimum significance to dispatch
 */
Advisor.prototype.addAdviceListener = function (listener, significance = Advice.SIGNIFICANCE_LOW) {
    let self = this;
    this.eventEmitter.addListener(Advisor.EVENT_ADVICE, function (advice) {
        if (significance) {
            if (advice.significance(listener.lastAdvice) < significance) return;
        }
        listener.lastAdvice = advice;
        listener(advice);
    });
};

Advisor.prototype.removeAdviceListener = function (listener) {
    this.eventEmitter.removeListener(Advisor.EVENT_ADVICE, listener);
};

Advisor.prototype.addMarketPositionListener = function (listener) {
    this.eventEmitter.addListener(Advisor.EVENT_MARKET_POSITION, function (advice) {
        listener(advice);
    });
};

Advisor.prototype.removeMarketPositionListener = function (listener) {
    this.eventEmitter.removeListener(Advisor.EVENT_MARKET_POSITION, listener);
};

// ---------------------------------------------------------------------------------------------------------------------

Advisor.prototype.handleTrade = function (trade) {
    if (this.lastTrade) {
        if (trade.date < this.lastTrade.date) {
            Logger.error('Weird... a trade date went backwards. This could influence the results. From ', this.lastTrade.date, 'to', trade.date);
            process.abort();
        }
    }

    for (const key in this.strategies) {
        if (!this.strategies.hasOwnProperty(key)) {
            continue;
        }

        const strategy = this.strategies[key];

        // sets the handler context to automatically link the trade
        // whenever the advice gets emitted
        strategy.handler.currentTrade = trade;
        this.strategies[key].handleTrade(trade);
        strategy.handler.currentTrade = undefined;
        this.lastTrade = trade;
    }
};

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Creates a new advisor handler
 *
 * @param advisor the parent advisor
 * @constructor
 */
Advisor.AdviceHandler = function (advisor) {
    this.advisor = advisor;
};

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Advisor} */
Advisor.AdviceHandler.prototype.advisor = undefined;

/** @type {Strategy} */
Advisor.AdviceHandler.prototype.strategy = undefined;

/** @type {Trade} */
Advisor.AdviceHandler.prototype.currentTrade = undefined;

// ---------------------------------------------------------------------------------------------------------------------

Advisor.AdviceHandler.prototype.expose = function (name, getter, setter = undefined) {
    // if (setter) {
    //     Object.defineProperty(this.strategy, name, {
    //         get: function () {
    //             return getter();
    //         },
    //         set: function (value) {
    //             setter(value);
    //         }
    //     });
    // } else {
    //     Object.defineProperty(this.strategy, name, {
    //         get: function () {
    //             return getter();
    //         }
    //     });
    // }
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Emit a advice notification.
 *
 * @param  {Advice} advice the advice to send
 */
Advisor.AdviceHandler.prototype.advice = function (advice) {
    // set some default fields to give context
    advice.strategy = this.strategy;
    advice.advisor = this.advisor;
    advice.trade = advice.trade || this.currentTrade;
    advice.date = advice.date || (this.currentTrade.date || new Date());

    // emit the advice
    this.advisor.eventEmitter.emit(Advisor.EVENT_ADVICE, advice);
    this.advisor.lastAdvice = advice;

    // first emit the advice, then set the last advice and then
    // automatically set market positions
    if (advice.isBuy) {
        this.marketPosition(Advisor.MARKET_STATE_LONG);
    } else if (advice.isSell) {
        this.marketPosition(Advisor.MARKET_STATE_SHORT);
    }
};

/**
 * This strategy is called by Strategy implementations to notify that a
 * sell trade should be made.
 *
 * If price is specified, a sell order should be made at the given
 * price. If price is not specified, the sell takes place at market
 * price.
 *
 * If amount is specified, a sell order for up to amount should be
 * made
 *
 * @param price the price to sell at
 * @param amount the amount to sell
 * @param extra extra information (strategy implementation specific)
 */
Advisor.AdviceHandler.prototype.adviceSelling = function (price, amount, extra) {
    return this.advice(
        Advice.createSellAdvice(price, amount, extra)
    );
};

/**
 * This strategy is called by Strategy implementations to notify that a
 * buy trade should be made.
 *
 * If price is specified, a buy order should be made at the given
 * price. If price is not specified, the buy takes place at market
 * price.
 *
 * If amount is specified, a buy order for up to amount should be
 * made
 *
 * @param price the price to buy at
 * @param amount the amount to buy
 * @param extra extra information (strategy implementation specific)
 */
Advisor.AdviceHandler.prototype.adviceBuying = function (price, amount, extra) {
    return this.advice(
        Advice.createBuyAdvice(price, amount, extra)
    );
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Advices the trader to cancel a selling order
 *
 * @param price the price of the sell to cancel
 * @param amount
 */
Advisor.AdviceHandler.prototype.adviceCancelSelling = function (price, amount) {

};

/**
 * Advices the trader to cancel a buying order
 *
 * @param price the price of the buy to cancel
 * @param amount
 */
Advisor.AdviceHandler.prototype.adviceCancelBuying = function (price, amount) {

};

// ---------------------------------------------------------------------------------------------------------------------

Advisor.AdviceHandler.prototype.marketPosition = function (marketPosition) {
    this.advisor.marketPosition = marketPosition;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Advisor;