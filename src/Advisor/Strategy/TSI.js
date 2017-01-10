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

    // define the indicators we need
    this.addTradeIndicator('tsi', 'TSI', options);

    this.thresholds = options.thresholds || {};

    this.thresholds.low = this.thresholds.low || 0;
    this.thresholds.high = this.thresholds.high || 0;
    this.thresholds.persistence = this.thresholds.persistence || 0;
};
Strategy.prototype = new StrategyBase();
StrategyBase.Factory.register('TSI', Strategy);

// ---------------------------------------------------------------------------------------------------------------------

Strategy.prototype.update = function (trade, indicators) {
    if (indicators.tsi.value > this.thresholds.high) {

        // new trend detected
        if (this.trend.direction !== 'high')
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'high',
                adviced: false
            };

        this.trend.duration++;

        if (this.trend.duration >= this.thresholds.persistence)
            this.trend.persisted = true;

        if (this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            this.handler.adviceSelling(trade.price);
        }

    } else if (indicators.tsi.value < this.thresholds.low) {

        // new trend detected
        if (this.trend.direction !== 'low')
            this.trend = {
                duration: 0,
                persisted: false,
                direction: 'low',
                adviced: false
            };

        this.trend.duration++;

        if (this.trend.duration >= this.thresholds.persistence)
            this.trend.persisted = true;

        if (this.trend.persisted && !this.trend.adviced) {
            this.trend.adviced = true;
            this.handler.adviceBuying(trade.price);
        }

    }
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Strategy;