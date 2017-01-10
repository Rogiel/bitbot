let config = {};

config.market = {
    name: 'simulated',
    currency: 2000.0,
    asset: 0.0,

    fees: {
        buy: 0.002,
        sell: 0.002
    },

    environment: {
        name: 'realtime',
        exchange: {
            name: 'cexio',
            key: 'YOUR-CEXIO-KEY',          // CHANGE HERE
            secret: 'YOUR-CEXIO-SECRET',    // CHANGE HERE
            username: 'YOUR-CEXIO-USERNAME' // CHANGE HERE
        }
    }
};

config.advisor = {
    strategies: {
        'MACD': {
            name: 'MACD',
            macd: {
                short: 10,
                long: 21,
                signal: 9,
            },
        },
    }
};

config.trader = {};

module.exports = config;