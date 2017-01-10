const Market = require('./../Market');

let BacktestMarket = function () {
};
BacktestMarket.prototype = new Market();
Market.Factory.register('backtest', BacktestMarket);

// ---------------------------------------------------------------------------------------------------------------------

BacktestMarket.prototype.start = function () {
    Logger.debug('Backtest market starting....');
};

BacktestMarket.prototype.stop = function () {
    Logger.debug('Backtest market stopping....');
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = BacktestMarket;