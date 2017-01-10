const Market = require('../Market');
const Exchange = require('../Exchange');
const co = require('co');
const moment = require('moment');

let RealtimeMarket = function (opts) {
    this.exchange = Exchange.Factory.create(opts.exchange.name, opts.exchange);

    let self = this;
    this.exchange.addTradeListener(function (trade) {
        self._emitTradeEvent(trade);
    });
};
RealtimeMarket.prototype = new Market();
Market.Factory.register('realtime', RealtimeMarket);

// ---------------------------------------------------------------------------------------------------------------------

/** @type {Exchange} */
RealtimeMarket.prototype.exchange = undefined;

// ---------------------------------------------------------------------------------------------------------------------

RealtimeMarket.prototype.start = function () {
    Logger.debug('Realtime market starting....');

    let self = this;
    return this.exchange.start().then(function() {
        self.loaded = true;
    });
};

RealtimeMarket.prototype.stop = function () {
    Logger.debug('Realtime market stopping....');

    let self = this;
    return this.exchange.stop().then(function() {
        self.loaded = false;
    });
};

// ---------------------------------------------------------------------------------------------------------------------

RealtimeMarket.prototype.getWallet = function () {
    return this.exchange.getWallet();
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Opens a SELL order for bitcoin
 *
 * @param amount the amount to sell
 * @param price the price to sell at
 */
RealtimeMarket.prototype.sell = function (amount, price) {
    if (price == undefined) {
        price = this.lastTrade.price;
    }

    var self = this;
    return co(function *() {
        let wallet = yield self.getWallet();
        let max = wallet.getAvailable('BTC');

        if (!amount) {
            amount = max;
        }
        if (amount > max) {
            amount = max;
        }
        if (amount == 0.0) {
            return;
        }

        let currency = parseFloat(amount * price).toFixed(4);

        Logger.info('(REALTIME MARKET)', currency, '<=', amount);
        self.exchange.sell(amount, price);

        return {
            price: price,
            amount: amount,
            fee: fee,
            date: moment().utc().toDate()
        };
    });
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
RealtimeMarket.prototype.instantSell = function (amount) {
    return this.exchange.instantSell(amount);
};

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
RealtimeMarket.prototype.buy = function (amount, price) {
    if (price == undefined) {
        price = this.lastTrade.price;
    }

    let self = this;
    return co(function *() {
        let wallet = yield self.getWallet();
        let fees = yield self.exchange.getFee();

        price = parseFloat(price).toFixed(4);

        let usd = parseFloat(wallet.getAvailable('USD')).toFixed(4);
        let max = usd / (price * (1 + fees.buy));
        max = parseFloat(max).toFixed(8);

        if (!amount) {
            amount = max;
        }
        if (amount > max) {
            amount = max;
        }
        if (amount == 0.0) {
            return;
        }

        amount = parseFloat(amount).toFixed(8);

        console.log(fees);

        let fee = parseFloat(Math.ceil((amount * price * fees.buy) * 100) / 100).toFixed(2);

        if (amount == max) {
            amount = parseFloat((wallet.getAvailable('USD') - fee - 0.01) / price).toFixed(8);
            console.log(amount);
        }

        let currency = parseFloat(amount * price).toFixed(2);

        Logger.info('(REALTIME MARKET)', currency, '=>', amount, '(fee:', fee, ')');
        self.exchange.buy(amount, price);

        return {
            price: price,
            amount: amount,
            fee: fee,
            date: moment().utc().toDate()
        };
    });
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
RealtimeMarket.prototype.instantBuy = function (amount) {
    return this.exchange.instantBuy(amount);
};

/**
 * Gets a list of the active orders
 */
RealtimeMarket.prototype.getOrders = function () {
    return this.exchange.getOrders();
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
RealtimeMarket.prototype.cancel = function (order) {
    return this.exchange.cancel(order);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = RealtimeMarket;