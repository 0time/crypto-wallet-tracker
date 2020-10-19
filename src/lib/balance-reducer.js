const { cloneDeep, get, set } = require('lodash');
const sortOnField = require('./sort-on-field');

const DEFAULTS = require('./defaults');

const reduceSoldQuantity = (quantityField) => (acc, ea) => {
  if (get(ea, quantityField) < 0) {
    return acc - get(ea, quantityField);
  }

  return acc;
};

const balanceReducer = ({ basisField, quantityField, soldQuantityCount }) => (
  acc,
  ea,
) => {
  // Skip sold entries
  if (get(ea, quantityField) < 0) {
    return acc;
  }

  if (soldQuantityCount > 0) {
    soldQuantityCount -= get(ea, quantityField);

    if (soldQuantityCount > 0) {
      return acc;
    } else {
      const copy = cloneDeep(ea);

      set(
        copy,
        basisField,
        get(copy, basisField) * (-soldQuantityCount / get(copy, quantityField)),
      );
      set(copy, quantityField, -soldQuantityCount);

      acc.push(copy);
    }
  } else {
    const copy = cloneDeep(ea);

    acc.push(copy);
  }

  return acc;
};

// Calculates the remaining balances by doing first in first out on the purchases
// with the sales
module.exports = (array, userConfig) => {
  const config = Object.assign({}, DEFAULTS, userConfig);

  const sorter = sortOnField(config.sortField);

  array.sort(sorter);

  let soldQuantityCount = array.reduce(
    reduceSoldQuantity(config.quantityField),
    0,
  );

  return array.reduce(
    balanceReducer(Object.assign({ soldQuantityCount }, config)),
    [],
  );
};
