/**
 * Created by Rogiel on 11/15/16.
 */

const util = require('util');

let Advice = function (extras = {}) {
    Object.assign(this, extras || {});
};
Advice.prototype.name = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Holds a reference to the advisor that has issued this advice.
 *
 * @type {Advisor}
 */
Advice.prototype.advisor = undefined;

/**
 * Holds a reference to the strategy that has issued this advice.
 *
 * @type {Strategy}
 */
Advice.prototype.strategy = undefined;

/**
 * Holds a reference to the trade that has issued the advice (can be empty).
 *
 * @type {Trade|undefined}
 */
Advice.prototype.trade = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * The date the advice was emitted
 *
 * @type {Date}
 */
Advice.prototype.date = undefined;

/**
 * The date until this advice is valid
 *
 * @type {Date}
 */
Advice.prototype.validUntil = undefined;

/**
 * A function that performs a extensive validation of the advice. Normally
 * set by whoever emits the advice.
 *
 * @type {Function}
 */
Advice.prototype.validator = undefined;

// ---------------------------------------------------------------------------------------------------------------------

/**
 * The estimated advice risk
 *
 * @type {integer}
 */
Advice.prototype.risk = undefined;

/**
 * The estimated advice potential
 *
 * @type {integer}
 */
Advice.prototype.potential = undefined;

// ---------------------------------------------------------------------------------------------------------------------

const IGNORED_KEYS = ['strategy', 'advisor', 'trade'];

// ---------------------------------------------------------------------------------------------------------------------

Advice.Significance = {
    SAME: 0,
    PRICE_CHANGE: 1000,
    LOW: 10000,
    NORMAL: 20000,
    HIGH: 30000,
    URGENT: 100000
};

Advice.SIGNIFICANCE_SAME = Advice.Significance.SAME;
Advice.SIGNIFICANCE_PRICE_CHANGE = Advice.Significance.PRICE_CHANGE;
Advice.SIGNIFICANCE_LOW = Advice.Significance.LOW;
Advice.SIGNIFICANCE_NORMAL = Advice.Significance.NORMAL;
Advice.SIGNIFICANCE_HIGH = Advice.Significance.HIGH;
Advice.SIGNIFICANCE_URGENT = Advice.Significance.URGENT;

// ---------------------------------------------------------------------------------------------------------------------

Advice.Risk = {
    NONE: 0,
    LOW: 1000,
    AVERAGE: 2000,
    HIGH: 3000,
    EXTREME: 10000
};

// ---------------------------------------------------------------------------------------------------------------------

Advice.Potential = {
    EXTREME_LOSS: -10000,
    HIGH_LOSS: -3000,
    AVERAGE_LOSS: -2000,
    LOW_LOSS: -1000,
    NONE: 0,
    LOW_GAIN: 1000,
    AVERAGE_GAIN: 2000,
    HIGH_GAIN: 3000,
    EXTREME_GAIN: 10000
};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Calculates the warning significance over the otherAdvice.
 *
 * @param otherAdvice
 *
 * @return {int}
 */
Advice.prototype.significance = function (otherAdvice) {
    if (otherAdvice == undefined) {
        return Advice.SIGNIFICANCE_NORMAL;
    } else if (this.name != otherAdvice.name) {
        return Advice.SIGNIFICANCE_NORMAL;
    }

    let same = true;
    let priceOnly = true;
    for (const key in this) {
        if (!this.hasOwnProperty(key))  continue;
        if (IGNORED_KEYS.includes(key)) continue;
        if (['date'].includes(key))     continue;
        if (this[key] === undefined)    continue;

        let value = this[key];
        if (value !== otherAdvice[key]) {
            // Logger.debug(key, value, otherAdvice[key]);
            same = false;
            if (key != 'price') {
                priceOnly = false;
            }
        }
    }

    if (same) {
        return Advice.SIGNIFICANCE_SAME;
    } else if (priceOnly) {
        return Advice.SIGNIFICANCE_PRICE_CHANGE;
    } else {
        return Advice.SIGNIFICANCE_NORMAL;
    }
};

// ---------------------------------------------------------------------------------------------------------------------

Advice.prototype.toString = function () {
    let name = this.name || 'Unknown';
    let args = [];
    for (const key in this) {
        if (!this.hasOwnProperty(key))  continue;
        if (IGNORED_KEYS.includes(key)) continue;
        if (!this[key])                 continue;

        let value = this[key];
        if (key == 'extras') {
            if (Object.getOwnPropertyNames(value).length == 0) continue;
            args.push(key + "=" + util.inspect(value));
        } else {
            args.push(key + "=" + value);
        }
    }

    return name + " { " + args.join(', ') + ' }';
};

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Advice.SellAdvice = function (price, amount = undefined, extras = {}) {
    Advice.call(this, extras);
    this.price = price;
    this.amount = amount;
};
Advice.SellAdvice.prototype = new Advice();
Advice.SellAdvice.prototype.name = "Sell";
Advice.SellAdvice.prototype.isSell = true;

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Advice.BuyAdvice = function (price, amount = undefined, extras = {}) {
    Advice.call(this, extras);
    this.price = price;
    this.amount = amount;
    this.stopOrder = extras.stopOrder;
};
Advice.BuyAdvice.prototype = new Advice();
Advice.BuyAdvice.prototype.name = "Buy";
Advice.BuyAdvice.prototype.isBuy = true;

// ---------------------------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------------------------

Advice.createSellAdvice = function (price, amount, extras) {
    return new Advice.SellAdvice(price, amount, extras);
};

Advice.createBuyAdvice = function (price, amount, extras) {
    return new Advice.BuyAdvice(price, amount, extras);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Advice;