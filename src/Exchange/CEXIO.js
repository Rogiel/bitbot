const Exchange = require('./../Exchange');
const Wallet = require('../Wallet');
const moment = require('moment');

let CEXIOAPI = require('cexio'),
    CEXIOWebSocket = require('../Other/CEXIOWebSocket');

let CEXIOExchange = function (options) {
    if (!options) {
        options = {};
    }
    this.api = new CEXIOAPI('BTC_USD', options.username, options.key, options.secret);
    this.wsApi = new CEXIOWebSocket(options.key, options.secret);
    this.stopped = false;
    this.wallet = new Wallet();

    this.lastTransactionID = 0;
};
CEXIOExchange.prototype = new Exchange();
Exchange.Factory.register('cexio', CEXIOExchange);

// ---------------------------------------------------------------------------------------------------------------------

CEXIOExchange.prototype.start = function () {
    Logger.debug('CEX.IO exchange starting....');

    let self = this;
    return this.wsApi.connect().then(function (error) {
        self._fetchMoreTrades();

        // // now, start the real ticker here...
        // let promise = self.wsApi.ticker(function ({symbol1, symbol2, price}) {
        //     if (symbol1 != 'BTC' || symbol2 != 'USD') return;
        //
        //     while(!ready) {}
        //
        //     console.log('ticker response');
        //     // self._fetchMoreTrades();
        //     let trade = {
        //         date: moment().utc().toDate(),
        //         price: price,
        //         tid: self.lastTransactionID
        //     };
        //     self.lastTransactionID += 1;
        //     Logger.debug(trade);
        //     self.eventEmitter.emit(Exchange.EVENT_TRADE, trade);
        // });
        //
        // // use REST api to fetch some trade history...
        // let handler = function (err, trades) {
        //     if (self.stoppped) {
        //         // return immediatly to prevent a reschedule
        //         return;
        //     }
        //
        //     trades = trades.sort(function (o1, o2) {
        //         return o1.date - o2.date;
        //     });
        //     trades.forEach(function (trade) {
        //         trade.date = moment.unix(trade.date).utc().toDate();
        //
        //         // console.log(trade);
        //         self.eventEmitter.emit(Exchange.EVENT_TRADE, trade);
        //         if (self.lastTransactionID < trade.tid) {
        //             self.lastTransactionID = parseInt(trade.tid);
        //         }
        //     });
        //
        //     ready = true;
        // };
        //
        // if (self.lastTransactionID > 0) {
        //     self.api.trades({since: parseInt(self.lastTransactionID) + 1}, handler);
        // } else {
        //     self.api.trades({}, handler);
        // }
    });
};

CEXIOExchange.prototype.stop = function () {
    Logger.debug('CEX.IO exchange stopping....');
    this.stopped = true;
};

// ---------------------------------------------------------------------------------------------------------------------

CEXIOExchange.prototype._fetchMoreTrades = function () {
    if (this.stopped) {
        // return now to prevent a reschedule
        return;
    }

    let self = this;
    let handler = function (err, trades) {
        if (err) {
            Logger.error(err);
            setTimeout(function () {
                self._fetchMoreTrades();
            }, 1000);
            return;
        }

        trades = trades.sort(function (o1, o2) {
            return o1.date - o2.date;
        });
        trades.forEach(function (trade) {
            trade.date = moment.unix(trade.date).utc().toDate();
            trade.tid = parseInt(trade.tid);

            self.eventEmitter.emit(Exchange.EVENT_TRADE, trade);
            if (self.lastTransactionID < trade.tid) {
                self.lastTransactionID = trade.tid;
            }
        });

        if (trades.length > 0) {
            console.log("Got", trades.length, "new trades.");
        }

        setTimeout(function () {
            self._fetchMoreTrades();
        }, 2000);
    };

    if (self.lastTransactionID > 0) {
        self.api.trades({since: self.lastTransactionID + 1}, handler);
    } else {
        self.api.trades({}, handler);
    }
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Gets the account portfolio
 */
CEXIOExchange.prototype.getWallet = function () {
    let self = this;
    return new Promise((resolve, reject) => {
        self.api.balance(function (error, balance) {
            if (error) {
                reject(error);
                return;
            }

            let wallet = new Wallet(balance);
            wallet.update = function () {
                return self.getWallet().then(function (newWallet) {
                    wallet.data = newWallet.data;
                });
            };

            resolve(wallet);
        });
    });
};

CEXIOExchange.prototype.getFee = function () {
    let self = this;
    return new Promise((resolve, reject) => {
        self.api._post('get_myfee', null, function (error, data) {
            if (error) {
                reject(error);
                return;
            }
            let fees = data.data['BTC:USD'];
            fees.buy = fees.buy / 100;
            fees.sell = fees.sell / 100;
            resolve(data.data['BTC:USD']);
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
CEXIOExchange.prototype.sell = function (amount, price) {
    Logger.debug('(CEX.IO) Selling', amount, 'at price', price);
    return this.wsApi.placeOrder('sell', 'BTC', 'USD', amount, price);
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
CEXIOExchange.prototype.instantSell = undefined;

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
CEXIOExchange.prototype.buy = function (amount, price) {
    Logger.debug('(CEX.IO) Buying', amount, 'at price', price);
    return this.wsApi.placeOrder('buy', 'BTC', 'USD', amount, price);
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
CEXIOExchange.prototype.instantBuy = undefined;

/**
 * Gets a list of the active orders
 */
CEXIOExchange.prototype.getOrders = function () {
    return this.wsApi.getOpenOrders('BTC', 'USD');
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
CEXIOExchange.prototype.cancel = function (order) {
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
 * @param tradeHandler a handler that gets called for each imported trade
 */
CEXIOExchange.prototype.import = function (since, tradeHandler) {
    Logger.debug('CEX.IO exchange starting....');

    let self = this;
    return new Promise((resolve, reject) => {
        let firstTransactionID = 0;
        let done = false;
        let handler = function (err, trades) {
            if (err) {
                reject(err);
            }

            trades = trades.sort(function (o1, o2) {
                return o1.date - o2.date;
            });
            trades.forEach(function (trade) {
                trade = CEXIOExchange.parseTrade(trade);

                if (trade.date < since) {
                    done = true;
                    return;
                }

                // console.log(trade);
                tradeHandler(trade);
                if (firstTransactionID < trade.tid) {
                    firstTransactionID = trade.tid;
                }
            });

            console.log(firstTransactionID);

            if (!done) {
                self.api.trades({'since': parseInt(firstTransactionID) - 1999}, handler);
                firstTransactionID = 0;
            } else {
                resolve();
            }
        };
        self.api.trades({}, handler);
    });
};

CEXIOExchange.parseTrade = function (trade) {
    trade.date = moment.unix(trade.date).utc().toDate();
    return trade;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = CEXIOExchange;