/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');

let Indicator = function (options = {}) {
    IndicatorBase.call(this, options);
    this.depth = options.depth || 100;
    this.age = 0;
    this.history = [];
    this.x = [];

    /*
     * Do not use array(depth) as it might not be implemented
     */
    for (let i = 0; i < this.depth; i++) {
        this.history.push(0.0);
        this.x.push(i);
    }
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('LRC', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.lowestRSI = _.min(this.history);
    this.highestRSI = _.max(this.history);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;