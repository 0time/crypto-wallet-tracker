const { get, isNumber, isString } = require('@0ti.me/tiny-pfp');

const cronItemValue = /^\*\/([0-9]+)$/;
const numeric = /^[0-9]+$/;

module.exports = (str, relevantData, options = {}) =>
  str.split(',').reduce((acc, ea) => {
    const mod = get(options, 'mod');

    if (acc) return acc;

    if (isString(relevantData)) {
      relevantData = parseInt(relevantData);
    }

    if (cronItemValue.test(ea)) {
      ea = parseInt(cronItemValue.exec(ea).pop());

      if (mod) {
        ea %= mod;
      }

      return relevantData % ea === 0;
    } else {
      if (ea === '*') {
        return true;
      } else if (!isNumber(ea) && !numeric.test(ea)) {
        throw new Error(`not numeric ${ea}`);
      } else if (!isNumber(relevantData)) {
        throw new Error(`not numeric relevantData: ${ea}`);
      } else {
        if (isString(ea)) {
          ea = parseInt(ea);
        }

        if (mod) {
          ea %= mod;
        }

        return relevantData === ea;
      }
    }
  }, false);
