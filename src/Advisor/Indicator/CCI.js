/**
 * Created by Rogiel on 11/15/16.
 */

const IndicatorBase = require('../Indicator');
const LRC = require('./LRC');

let Indicator = function (options = {}) {
    IndicatorBase.call(this, options);

    this.tp = 0.0;
    this.TP = new LRC(settings.history);
    this.hist = []; // needed for mean?
    this.mean = 0.0;
    this.size = 0;
    this.constant = settings.constant;
    this.maxSize = settings.history;
    for (let i = 0; i < this.maxSize; i++) {
        this.hist.push(0.0);
    }
};
Indicator.prototype = new IndicatorBase();
IndicatorBase.Factory.register('CCI', Indicator);

// ---------------------------------------------------------------------------------------------------------------------

Indicator.prototype.handleCandlestick = function (candle) {
    let tp = (candle.high + candle.close + candle.low) / 3;
    if (this.size < this.maxSize) {
        this.hist[this.size] = tp;
        this.size++;
    } else {
        for (let i = 0; i < this.maxSize - 1; i++) {
            this.hist[i] = this.hist[i + 1];
        }
        this.hist[this.maxSize - 1] = tp;
    }

    this.TP.update(tp);

    if (this.size < this.maxSize) {
        this.value = false;
        return;
    }
    // calculate current TP

    let avgtp = this.TP.value;
    if (typeof(avgtp) == 'boolean') {
        log.error("Failed to get average tp from indicator.");
        return;
    }

    this.tp = tp;

    let sum = 0.0;
    // calculate tps
    for (let i = 0; i < this.size; i++) {

        let z = (this.hist[i] - avgtp);
        if (z < 0) z = z * -1.0;
        sum = sum + z;

    }

    this.mean = (sum / this.size);
    this.value = (this.tp - avgtp) / (this.constant * this.mean);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;