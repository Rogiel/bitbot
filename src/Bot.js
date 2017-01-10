/**
 * Created by Rogiel on 11/15/16.
 */

const MarketHistory = require('./MarketHistory');
const Market = require('./Market');

const Advisor = require('./Advisor/Advisor');
const Trader = require('./Trader/Trader');

let Bot = function (options) {
    let self = this;

    if (!options.market) {
        throw new Error('"market" option is required.');
    }
    this.market = Market.Factory.create(options.market.name, options.market);
    if(!this.market) {
        throw new Error('Invalid market.');
    }

    this.marketHistory = new MarketHistory();

    if (options.advisor) {
        this.advisor = new Advisor(this.market, this.marketHistory, options.advisor);
        this.advisor.addAdviceListener(function (advice) {
            self._adviceListener(advice);
        });
    }

    this.market.addTradeListener(function (trade) {
        self._tradeListener(trade);
    });

    if (options.simulator) {
        this.simulator = new Simulator(this.market, options.simulator);
    }

    if (options.trader) {
        if(!this.advisor) {
            throw new Error('The trader requires a advisor.');
        }
        this.trader = new Trader(this.market, this.advisor, options.trader);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Market} */
Bot.prototype.market = undefined;

/** @type {MarketHistory} */
Bot.prototype.marketHistory = undefined;

/** @type {Advisor} */
Bot.prototype.advisor = undefined;

// ---------------------------------------------------------------------------------------------------------------------

Bot.prototype._tradeListener = function(trade) {
    if(this.advisor) {
        this.advisor.handleTrade(trade);
    }
    this.marketHistory.handleTrade(trade);
};

Bot.prototype._adviceListener = function(advice) {
    if(this.simulator) {
        this.simulator.handleAdvice(advice);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

Bot.prototype.start = function () {
    this.market.start();
};

Bot.prototype.stop = function () {
    this.market.stop();
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Bot;