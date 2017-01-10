const EventEmitter = require('events');

let Market = function () {
    this.eventEmitter = new EventEmitter();
    this.lastTrade = undefined;
};

// ---------------------------------------------------------------------------------------------------------------------

Market.EVENT_TRADE = 'trade';

// ---------------------------------------------------------------------------------------------------------------------

Market.prototype.loaded = false;

// ---------------------------------------------------------------------------------------------------------------------

Market.prototype.start = function () {

};

Market.prototype.stop = function () {

};

// ---------------------------------------------------------------------------------------------------------------------

Market.prototype.getWallet = function () {

};

Market.prototype.getPrice = function () {
    if (!this.lastTrade) {
        return undefined;
    }
    return this.lastTrade.price;
};

Market.prototype.getBuyFee = function () {

};

Market.prototype.getSellFee = function () {

};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Opens a SELL order for bitcoin
 *
 * @param amount the amount to sell
 * @param price the price to sell at
 */
Market.prototype.sell = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
Market.prototype.instantSell = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
Market.prototype.buy = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
Market.prototype.instantBuy = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Gets a list of the active orders
 */
Market.prototype.getOrders = function () {
    throw new Error('Strategy not implemented');
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
Market.prototype.cancel = function (order) {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

Market.prototype.addTradeListener = function (listener) {
    this.eventEmitter.addListener(Market.EVENT_TRADE, function (trade) {
        listener(trade);
    });
};

Market.prototype.removeTradeListener = function (listener) {
    this.eventEmitter.removeListener(Market.EVENT_TRADE, listener);
};

Market.prototype._emitTradeEvent = function (trade) {
    this.lastTrade = trade;
    this.eventEmitter.emit(Market.EVENT_TRADE, trade);
    // Logger.debug("(MARKET) New trade at price", trade.price);
};

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Market.Factory = function () {
};
Market.Factory.FACTORIES = {};

Market.Factory.register = function (name, cls) {
    Market.Factory.FACTORIES[name] = function (options) {
        return new cls(options);
    };
};

Market.Factory.create = function (name, opts) {
    if (!Market.Factory.FACTORIES[name]) {
        return undefined;
    }
    return Market.Factory.FACTORIES[name](opts);
};

// ---------------------------------------------------------------------------------------------------------------------

Market.feeRounding = function (fee, digits = 2) {
    return parseFloat(Math.ceil(fee * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(2);
};

Market.calculateFee = function (price, amount, feeRate) {
    price = parseFloat(price).toFixed(4);
    amount = parseFloat(amount).toFixed(8);
    feeRate = parseFloat(feeRate);

    let currency = amount * price;
    let fee = Market.feeRounding(amount * price * feeRate);

    amount = parseFloat((currency - fee - 0.01) / price).toFixed(8);

    currency = parseFloat(amount * price).toFixed(2);

    return {
        price: parseFloat(price),
        amount: parseFloat(amount),
        fee: parseFloat(fee),
        currency: parseFloat(currency)
    };
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Market;

// ---------------------------------------------------------------------------------------------------------------------

let ClassLoader = require('./Utility/ClassLoader'),
    path = require('path');
new ClassLoader(__dirname + path.sep + 'Market').load();
