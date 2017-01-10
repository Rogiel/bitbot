/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const RSI = require('./RSI');
const _ = require('lodash');
const dl = require('datalib');

let Indicator = function (options) {
    IndicatorBase.call(this, options);

    this.length = options.length || 1000;
    this.history = [];
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('Statistics', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.update = function (value) {
    this.history.push({'value': value});
    if(_.size(this.history) > this.length)
    // remove oldest RSI value
        this.history.shift();

    let data = dl.read(this.history);
    this.value = dl.summary(data)[0];
    // console.log(this.value);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;