const balanceReducer = require('./balance-reducer');
const { get } = require('lodash');
const sumOfField = require('./sum-of-field');

const DEFAULTS = require('./defaults');

// Calculates the remaining cost basis by doing first in first out on the purchases
// with the sales
module.exports = (array, userConfig) => {
  const config = Object.assign({}, DEFAULTS, userConfig);

  return balanceReducer(array, config).reduce(
    sumOfField(get(config, 'basisField', DEFAULTS.basisField)),
    0,
  );
};
