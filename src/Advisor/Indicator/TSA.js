/**
 * Created by Rogiel on 11/15/16.
 */

let IndicatorBase = require('../Indicator');
let EMA = require('./EMA');

let Indicator = function (options) {
    IndicatorBase.call(this, options);
    this.lastClose = 0;
    this.inner = new EMA({weight: options.long});
    this.outer = new EMA({weight: options.short});
    this.absoluteInner = new EMA({weight: options.long});
    this.absoluteOuter = new EMA({weight: options.short});
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('TSA', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    let close = value;
    let prevClose = this.lastClose;
    let momentum = close - prevClose;

    this.inner.update(momentum);
    this.outer.update(this.inner.value);

    this.absoluteInner.update(Math.abs(momentum));
    this.absoluteOuter.update(this.absoluteInner.value);

    this.value = 100 * this.outer.value / this.absoluteOuter.value;

    this.lastClose = close;
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;