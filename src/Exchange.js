const EventEmitter = require('events');

let Exchange = function () {
    this.eventEmitter = new EventEmitter();
};

// ---------------------------------------------------------------------------------------------------------------------

Exchange.EVENT_TRADE            = 'trade';
Exchange.EVENT_TRADE_COMPLETE   = 'trade-complete';
Exchange.EVENT_TRADE_CANCELED   = 'trade-canceled';

// ---------------------------------------------------------------------------------------------------------------------

Exchange.prototype.start = function () {
    throw new Error('Strategy not implemented');
};

Exchange.prototype.stop = function () {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

Exchange.prototype.addTradeListener = function (listener, filter) {
    this.eventEmitter.addListener(Exchange.EVENT_TRADE, function (trade) {
        if(filter) {
            if(!filter(trade)) {
                return;
            }
        }
        listener(trade);
    });
};

Exchange.prototype.removeTradeListener = function (listener) {
    this.eventEmitter.removeListener(Exchange.EVENT_TRADE, listener);
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Gets the account wallet
 */
Exchange.prototype.getWallet = function () {
    throw new Error('Strategy not implemented');
};

Exchange.prototype.getFee = function () {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Opens a SELL order for bitcoin
 *
 * @param amount the amount to sell
 * @param price the price to sell at
 */
Exchange.prototype.sell = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
Exchange.prototype.instantSell = undefined;

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
Exchange.prototype.buy = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
Exchange.prototype.instantBuy = undefined;

/**
 * Gets a list of the active orders
 */
Exchange.prototype.getOrders = function () {
    throw new Error('Strategy not implemented');
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
Exchange.prototype.cancel = function (order) {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Imports historical market data, if available. If the exchange does not support importing,
 * the value is undefined.
 *
 * Exchanges implementations are free to fetch the data in any order they want.
 *
 * @param since the starting date to import
 */
Exchange.prototype.import = undefined;

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Exchange.Factory = function () {
};
Exchange.Factory.FACTORIES = {};

Exchange.Factory.register = function (name, cls) {
    Exchange.Factory.FACTORIES[name] = function (options) {
        return new cls(options);
    };
};

Exchange.Factory.create = function(name, opts) {
    if(!Exchange.Factory.FACTORIES[name]) {
        return undefined;
    }
    return Exchange.Factory.FACTORIES[name](opts);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Exchange;

// ---------------------------------------------------------------------------------------------------------------------

let ClassLoader = require('./Utility/ClassLoader'),
    path = require('path');
new ClassLoader(__dirname + path.sep + 'Exchange').load();
