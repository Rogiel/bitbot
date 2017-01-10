/**
 * Created by Rogiel on 11/15/16.
 */

const Indicator = require('./Indicator');
const Filter = require('./Filter');

let Strategy = function (advisor, handler, options) {
    this.advisor = advisor;
    this.handler = handler;
    this.options = options;
    this.tradeIndicators = {};
    this.candlestickIndicators = {};
};

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Advisor} */
Strategy.prototype.advisor = undefined;

/** @type {Advisor.AdviceHandler} */
Strategy.prototype.handler = undefined;

/** @type {Object} */
Strategy.prototype.options = undefined;

/** @type {Array} */
Strategy.prototype.tradeIndicators = {};

/** @type {Array} */
Strategy.prototype.candlestickIndicators = {};

// ---------------------------------------------------------------------------------------------------------------------

/** @type {int} */
Strategy.prototype.candlestickLength = 15;

/** @type {Date} */
Strategy.prototype.candlestickOpenDate = undefined;

/** @type {Array} */
Strategy.prototype.tradesInCandlestick = [];

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.handleTrade = function (trade) {
    if (!this.candlestickOpenDate) {
        this.candlestickOpenDate = trade.date;
    }

    // only run trade logic if the strategy supports trade processing
    if (this.updateTrade) {
        // update trade indicators
        for (const name in this.tradeIndicators) {
            if (this.tradeIndicators.hasOwnProperty(name)) {
                const indicator = this.tradeIndicators[name];
                indicator.handleTrade(trade);
            }
        }
    }

    // only run candlestick logic if the strategy supports candlestick processing
    if (this.updateCandlestick) {
        // run candlestick advices if a candlestick is complete
        if (trade.date.getTime() - this.candlestickOpenDate.getTime() > this.candlestickLength * 60 * 1000) {
            let open = this.tradesInCandlestick[0].price;
            let close = this.tradesInCandlestick[this.tradesInCandlestick.length - 1].price;

            let high = this.tradesInCandlestick.reduce(function (current, trade, index, array) {
                if (current < trade.price) {
                    return trade.price;
                }
                return current;
            }, 0);
            let low = this.tradesInCandlestick.reduce(function (current, trade) {
                if (trade.price < current) {
                    return trade.price;
                }
                return current;
            }, high);

            let candlestick = {
                open: open,
                close: close,
                low: low,
                high: high,
                trades: this.tradesInCandlestick
            };

            // handle the candlestick
            for (const name in this.candlestickIndicators) {
                if (this.candlestickIndicators.hasOwnProperty(name)) {
                    const indicator = this.candlestickIndicators[name];
                    indicator.handleCandlestick(candlestick, indicator.metric);
                }
            }
            this.updateCandlestick(candlestick, this.candlestickIndicators);

            this.candlestickOpenDate = trade.date;
            this.tradesInCandlestick = [];
        }
        this.tradesInCandlestick.push(trade);
    }

    // only run trade logic if the strategy supports trade processing
    if (this.updateTrade) {
        // run the regular trade indicator advices
        this.updateTrade(trade, this.tradeIndicators);
    }
};

/**
 * A event that gets called whenever a new trade is made. Strategy implementations
 * should use this strategy to reevaluate their decisions and issue a update
 * to the advisor.
 *
 * If the strategy issues a advice, it is automatically and immediately broadcasted
 * to whoever is listening.
 *
 * @param trade the last trade made on the exchange
 * @param indicators a object that contains all trade indicators
 */
Strategy.prototype.updateTrade = undefined;

/**
 * A event that gets called whenever a new candlestick is done. Strategy implementations
 * should use this strategy to reevaluate their decisions and issue a update
 * to the advisor.
 *
 * If the strategy issues a advice, it is automatically and immediately broadcasted
 * to whoever is listening.
 *
 * @param trade the last trade made on the exchange
 * @param indicators a object that contains all trade indicators
 */
Strategy.prototype.updateCandlestick = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Adds a new trade indicator.
 *
 * @param name the name you want to use to access the indicator
 * @param indicatorName the indicator type name
 * @param options the indicator options
 * @param filterName the name of the filter to use on the indicator
 * @param filterOptions the filter options
 * @returns {Indicator}
 */
Strategy.prototype.addTradeIndicator = function (name, indicatorName, options = {}, filterName = undefined, filterOptions = {}) {
    if (!options) {
        options = {};
    }

    let indicator = Indicator.Factory.create(indicatorName, options);
    if (!indicator) {
        throw new Error('Unknown indicator ' + indicatorName);
    }

    if (filterName) {
        let filter = Filter.Factory.create(filterName, filterOptions);
        if (!filter) {
            throw new Error('Unknown filter ' + filterName);
        }
        indicator.filter = filter;
    }

    this.tradeIndicators[name] = indicator;
    return indicator;
};

/**
 * Adds a new candlestick indicator.
 *
 * @param name the name you want to use to access the indicator
 * @param indicatorName the indicator type name
 * @param metric the metric to use when updating the indicator (close, high, low, open, ...)
 * @param options the indicator options
 * @param filterName the name of the filter to use on the indicator
 * @param filterOptions the filter options
 * @returns {Indicator}
 */
Strategy.prototype.addCandlestickIndicator = function (name, indicatorName, metric, options = {}, filterName = undefined, filterOptions = {}) {
    if (!options) {
        options = {};
    }

    let indicator = Indicator.Factory.create(indicatorName, options);
    if (!indicator) {
        throw new Error('Unknown indicator ' + indicatorName);
    }
    indicator.metric = metric;

    if (filterName) {
        let filter = Filter.Factory.create(filterName, filterOptions);
        if (!filter) {
            throw new Error('Unknown filter ' + filterName);
        }
        indicator.filter = filter;
    }

    this.candlestickIndicators[name] = indicator;
    return indicator;
};

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Strategy.Factory = function () {
};
Strategy.Factory.FACTORIES = {};

Strategy.Factory.register = function (name, cls) {
    Strategy.Factory.FACTORIES[name] = function (advisor, handler, options) {
        return new cls(advisor, handler, options);
    };
};

Strategy.Factory.create = function (name, advisor, handler, opts) {
    if (!Strategy.Factory.FACTORIES[name]) {
        return undefined;
    }
    return Strategy.Factory.FACTORIES[name](advisor, handler, opts);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;

// ---------------------------------------------------------------------------------------------------------------------

let ClassLoader = require('../Utility/ClassLoader'),
    path = require('path');
new ClassLoader(__dirname + path.sep + 'Strategy').load();
