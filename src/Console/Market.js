const co = require('co');

let scope = 'market';

let cmd = {
    report: function (callback, args) {
        bot.market.report();
        callback();
    },
    wallet: function (callback, args) {
        co(function*() {
            let wallet = yield bot.market.getWallet();

            Logger.info('BTC:');
            Logger.info('   Available:', wallet.getAvailable('BTC'));
            Logger.info('      Orders:', wallet.getOrders('BTC'));

            Logger.info();

            Logger.info('USD:');
            Logger.info('   Available:', wallet.getAvailable('USD'));
            Logger.info('      Orders:', wallet.getOrders('USD'));

            callback();
        });
    },

    sell: function (callback, [price, amount]) {
        if(amount == 'all') {
            amount = undefined;
        }
        if(amount) amount = parseFloat(amount);

        bot.market.sell(amount, price).then(function(result) {
            if(!result) {
                Logger.error('Unable to execute sell.');
            }
            callback();
        });
    },

    buy: function (callback, [price, amount]) {
        if(amount == 'all') {
            amount = undefined;
        }
        if(amount) amount = parseFloat(amount);

        bot.market.buy(amount, price).then(function(result) {
            if(!result) {
                Logger.error('Unable to execute sell.');
            }
            callback();
        });
    },

    orders: function (callback) {
        co(function*() {
            let orders = yield bot.market.getOrders();

            console.log(orders);

            callback();
        });
    },


};

exports.register = function (extension, callback) {
    extension
        .command('market-report', 'print market report', {
            wizard: false,
            // scope: scope
        }, cmd.report)
        .command('wallet', 'print wallet information', {
            wizard: false,
            // scope: scope
        }, cmd.wallet)
        .command('sell', 'sell a asset', {
            // scope: scope,
            params: {
                value: 'price',
                price: 'value'
            }
        }, cmd.sell)
        .command('buy', 'buy a asset', {
            // scope: scope,
            params: {
                value: 'price',
                price: 'value'
            }
        }, cmd.buy)
        .command('orders', 'show a list of open orders', {
            // scope: scope,
        }, cmd.orders)
    ;

    callback();
};

exports.unregister = function (callback) {
    /* internal stuff */
    callback();
};