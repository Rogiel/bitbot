/**
 * Created by Rogiel on 11/16/16.
 */

const FilterBase = require('../Filter');
const Fili = require('fili');

let Filter = function (options) {
    FilterBase.call(this, options);

    let iirCalculator = new Fili.CalcCascades();

    // calculate filter coefficients
    let filterCoeffs = iirCalculator.lowpass({
        order: options.order || 3,
        characteristic: options.type || 'butterworth',
        Fs: options.sampleFrequency || 1000,
        Fc: options.cutoffFrequency || 100,
    });

    // create a filter instance from the calculated coeffs
    this.filter = new Fili.IirFilter(filterCoeffs);

};
Filter.prototype = new FilterBase();
FilterBase.Factory.register('LowPass', Filter);

// ---------------------------------------------------------------------------------------------------------------------

Filter.prototype.apply = function (value) {
    return this.filter.singleStep(value);
};

// ---------------------------------------------------------------------------------------------------------------------

module.exports = Filter;