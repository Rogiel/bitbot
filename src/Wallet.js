/**
 * Created by Rogiel on 11/15/16.
 */
const EventEmitter = require('events');

let Wallet = function (data) {
    this.eventEmitter = new EventEmitter();
    this.data = data;
};

// ---------------------------------------------------------------------------------------------------------------------

Wallet.EVENT_WALLET = 'wallet';

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Performs a wallet update
 *
 * @return Promise
 */
Wallet.prototype.update = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 *
 * @param currency
 */
Wallet.prototype.getAvailable = function (currency) {
    return this.data[currency].available;
};

/**
 *
 * @param currency
 */
Wallet.prototype.getOrders = function (currency) {
    return this.data[currency].orders;
};

module.exports = Wallet;