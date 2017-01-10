const Market = require('./../Market');
const Wallet = require('./../Wallet');
const co = require('co');
const moment = require('moment');

let SimulatedMarket = function (options) {
    let self = this;

    this.environment = Market.Factory.create(options.environment.name, options.environment);
    this.environment.addTradeListener(function (trade) {
        if(!self.firstTrade) {
            self.firstTrade = trade;
        }
        self._handleTrade(trade);
    });

    this.currency = options.currency || 0.0;
    this.initialCurrency = this.currency;

    this.asset = options.asset || 0.0;
    this.initialAsset = this.asset;

    options.fees = options.fees || {};

    this.buyFee = options.fees.buy || 0.0;
    this.sellFee = options.fees.sell || 0.0;

    this.sellOrders = [];
    this.buyOrders = [];
    this.tradeCount = 0;
};
SimulatedMarket.prototype = new Market();
Market.Factory.register('simulated', SimulatedMarket);

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Market} */
SimulatedMarket.prototype.environment = undefined;

/** @type {Wallet} */
SimulatedMarket.prototype.wallet = undefined;

// ---------------------------------------------------------------------------------------------------------------------

Object.defineProperty(SimulatedMarket.prototype, 'loaded', {
    get: function () {
        return this.environment.loaded;
    }
});

// ---------------------------------------------------------------------------------------------------------------------

SimulatedMarket.prototype.start = function () {
    return this.environment.start();
};

SimulatedMarket.prototype.stop = function () {
    return this.environment.stop();
};

// ---------------------------------------------------------------------------------------------------------------------

SimulatedMarket.prototype._handleTrade = function (trade) {
    this._emitTradeEvent(trade);
};

// ---------------------------------------------------------------------------------------------------------------------

SimulatedMarket.prototype.getWallet = function () {
    return co(function *() {
        return new Wallet({
            USD: {
                available: this.currency,
                orders: 0.0
            },
            BTC: {
                available: this.asset,
                orders: 0.0
            }
        });
    });
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Opens a SELL order for bitcoin
 *
 * @param amount the amount to sell
 * @param price the price to sell at
 */
SimulatedMarket.prototype.sell = function (amount, price) {
    if (price == undefined) {
        price = this.lastTrade.price;
    }

    if (!amount) {
        amount = this.asset;
    }
    if (amount > this.asset) {
        amount = this.asset;
    }
    if (amount == 0.0) {
        return;
    }

    let fee = Market.feeRounding(amount * price * this.sellFee);
    // console.log('selling fee', fee, 'price', amount * price);

    Logger.info('(MARKET)', amount * price, '<=', amount, '(fee:', fee, ')');

    this.currency += amount * price - fee;
    if (this.currency < 1e-2) {
        this.currency = 0;
    }
    // this.currency = parseFloat(this.currency).toFixed(2);

    this.asset -= amount;
    this.tradeCount++;
    // this.asset = parseFloat(this.asset).toFixed(8);

    // this.report();

    return Promise.resolve({
        price: price,
        amount: amount,
        fee: fee,
        date: moment().utc().toDate()
    });
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
SimulatedMarket.prototype.instantSell = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
SimulatedMarket.prototype.buy = function (amount, price) {
    if (price == undefined) {
        price = this.lastTrade.price;
    }
    let max = this.currency / (price * (1 + this.buyFee));

    if (!amount) {
        amount = max;
    }
    if (amount > max) {
        amount = max;
    }
    if (amount == 0.0) {
        return;
    }

    // var fee = amount * price * this.buyFee;

    let calculated = Market.calculateFee(price, amount, this.buyFee);

    this.tradeCurrency = this.currency;
    this.tradeAsset = this.asset;

    Logger.info('(MARKET)', calculated.amount * calculated.price, '=>', calculated.amount, '(fee:', calculated.fee, ')');

    this.asset += calculated.amount;
    // this.asset = parseFloat(this.asset).toFixed(8);

    this.currency -= calculated.amount * calculated.price + calculated.fee;
    if (this.currency < 1e-2) {
        this.currency = 0;
    }
    // this.currency = parseFloat(this.currency).toFixed(2);

    this.tradeCount++;

    return Promise.resolve({
        price: calculated.price,
        amount: calculated.amount,
        fee: calculated.fee,
        date: moment().utc().toDate()
    });
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
SimulatedMarket.prototype.instantBuy = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Gets a list of the active orders
 */
SimulatedMarket.prototype.getOrders = function () {
    throw new Error('Strategy not implemented');
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
SimulatedMarket.prototype.cancel = function (order) {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

SimulatedMarket.prototype.report = function () {
    Logger.debug("Simulation report");

    Logger.debug("\tAsset:   ", this.asset);
    Logger.debug("\tCurrency:", this.currency);
    Logger.debug("\tTrades:  ", this.tradeCount);

    let currency = this.currency + this.getPrice() * this.asset;
    let profit = ((currency) / this.initialCurrency - 1);

    // days
    let delta = 0;
    if(this.lastTrade && this.firstTrade) {
        delta = (this.lastTrade.date - this.firstTrade.date) / 1000 / 24 / 60 / 60;
    }

    Logger.debug("\tProfit:", ((currency - this.tradeCurrency) / this.tradeCurrency) * 100);
    Logger.debug("\t       ", (profit * 100), "over period (about", delta, "days)");
    Logger.debug("\t       ", (profit * 100) / delta * 30, "over month");
    Logger.debug("\t       ", (profit * 100) / delta * 365, "over year");
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = SimulatedMarket;