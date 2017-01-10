/**
 * Created by Rogiel on 11/15/16.
 */

const StrategyBase = require('../Strategy');
const Advice = require('../Advice');

const Advisor = require('../Advisor');
const Filter = require('../Filter');

let Strategy = function (advisor, handler, options) {
    StrategyBase.call(this, advisor, handler, options);

    this.trend = {
        direction: 'none',
        duration: 0,
        persisted: false,
        adviced: false
    };

    this.high = options.thresholds.high;
    this.low = options.thresholds.low;
    this.persistence = options.thresholds.persistence;

    this.candlestickLength = options.candlestickLength || 15;

    // define the indicators we need
    this.addCandlestickIndicator('uo', 'UO', 'close', options.uo);
};
Strategy.prototype = new StrategyBase();
StrategyBase.Factory.register('UO', Strategy);

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.updateCandlestick = function (trade, indicators) {
    let uoVal = indicators.uo.value;

    if(uoVal > this.high) {
        // new trend detected
        if(this.trend.direction !== 'high')
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'high',
                adviced: false
            };

        this.trend.duration++;
        if(this.trend.duration >= this.persistence)
            this.trend.persisted = true;

        if(this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            this.handler.adviceSelling(trade.close);
        }
    } else if(uoVal < this.low) {
        // new trend detected
        if(this.trend.direction !== 'low')
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'low',
                adviced: false
            };

        this.trend.duration++;
        if(this.trend.duration >= this.persistence)
            this.trend.persisted = true;
        if(this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            // this.advice('long');
            this.handler.adviceBuying(trade.close);
        }
    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;