const Market = require('./../Market');

let GeneratedMarket = function (opts) {
    let self = this;

    this.period = opts.period || 1000;
    this.base = opts.base || 720.00;
    this.frequency = opts.frequency || 0.1;
    this.amplitude = opts.amplitude || 10;

    if (!opts.tradeGenerator) {
        opts.tradeGenerator = function () {
            if(!this.time) {
                this.time = 0;
            }
            this.time += 1;
            return {
                type: (Math.random() < 0.5 ? "sell" : "buy"),
                price: self.base + Math.sin(2 * Math.PI * self.frequency * this.time) * self.amplitude,
                date: new Date()
            };
        }
    }
    this.tradeGenerator = opts.tradeGenerator;

    this.stop = false;
};
GeneratedMarket.prototype = new Market();
Market.Factory.register('generated', GeneratedMarket);

// ---------------------------------------------------------------------------------------------------------------------

GeneratedMarket.prototype.start = function () {
    Logger.debug('Generated market starting with period', this.period);
    this.stop = false;

    this.period = 0;
    this.loaded = true;

    let self = this;
    // var handler = function () {
    while(true) {
        let trade = self.tradeGenerator();
        if (!trade) {
            return;
        }
        self._emitTradeEvent(trade);

        if (self.stop) {
            return;
        }
        // setTimeout(handler, self.period);
    }
    // };
    // setTimeout(handler, self.period);
};

GeneratedMarket.prototype.stop = function () {
    Logger.debug('Generated market stopping....');
    this.stop = true;
    this.loaded = false;
};

// ---------------------------------------------------------------------------------------------------------------------

Market.prototype.getWallet = function () {

};

// ---------------------------------------------------------------------------------------------------------------------

/**
 * Opens a SELL order for bitcoin
 *
 * @param amount the amount to sell
 * @param price the price to sell at
 */
GeneratedMarket.prototype.sell = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant sell order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to sell
 */
GeneratedMarket.prototype.instantSell = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Opens a BUY order for bitcoin
 *
 * @param amount the amount to buy
 * @param price the price to buy at
 */
GeneratedMarket.prototype.buy = function (amount, price) {
    throw new Error('Strategy not implemented');
};

/**
 * Creates a instant buy order for bitcoin. The price is matched
 * automatically by the exchange market. This method is optional.
 *
 * @param amount the amount to buy
 */
GeneratedMarket.prototype.instantBuy = function (amount) {
    throw new Error('Strategy not implemented');
};

/**
 * Gets a list of the active orders
 */
GeneratedMarket.prototype.getOrders = function () {
    throw new Error('Strategy not implemented');
};

/**
 * Cancels a open order
 *
 * @param order the order to cancel
 */
GeneratedMarket.prototype.cancel = function (order) {
    throw new Error('Strategy not implemented');
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = GeneratedMarket;