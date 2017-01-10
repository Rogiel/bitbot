'use strict';

let scope = 'advisor';

let cmd = {
    report: function (callback, args) {
        let advisor = bot.advisor;

        Logger.info('\tMarket position: ', advisor.marketPosition);

        callback();
    }
};

exports.register = function (extension, callback) {
    extension
        .command('advisor-report', 'print market report', {
            wizard: true,
            // scope: scope
        }, cmd.report)
    ;

    callback();
};

exports.unregister = function (callback) {
    /* internal stuff */
    callback();
};