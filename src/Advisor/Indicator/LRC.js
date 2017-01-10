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
    // We need sufficient history to get the right result.
    if(this.value === false && this.age < this.depth) {

        this.history[this.age] = value;
        this.age++;
        this.value = false;
        // log.debug("Waiting for sufficient age: ", this.age, " out of ", this.depth);
        //
        return;
    }

    this.age++;
    // shift history
    for (let i = 0; i < (this.depth - 1); i++) {
        this.history[i] = this.history[i+1];
    }
    this.history[this.depth-1] = value;

    // this.calculate(value);
    // get the reg
    let reg = linreg(this.x, this.history);

    // y = a * x + b
    this.value = ((this.depth-1) * reg[0]) + reg[1];
};

// ---------------------------------------------------------------------------------------------------------------------

/*
 * Least squares linear regression fitting.
 */
function linreg(values_x, values_y) {
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var count = 0;

    /*
     * We'll use those variables for faster read/write access.
     */
    var x = 0;
    var y = 0;
    var values_length = values_x.length;

    if (values_length != values_y.length) {
        throw new Error('The parameters values_x and values_y need to have same size!');
    }

    /*
     * Nothing to do.
     */
    if (values_length === 0) {
        return [ [], [] ];
    }

    /*
     * Calculate the sum for each of the parts necessary.
     */
    for (var v = 0; v < values_length; v++) {
        x = values_x[v];
        y = values_y[v];
        sum_x += x;
        sum_y += y;
        sum_xx += x*x;
        sum_xy += x*y;
        count++;
    }

    /*
     * Calculate m and b for the formular:
     * y = x * m + b
     */
    var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
    var b = (sum_y/count) - (m*sum_x)/count;

    return [m, b];
}

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Indicator;