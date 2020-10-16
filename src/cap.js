const balanceReducer = require('./lib/balance-reducer');
const config = require('config');
const moment = require('moment');
const { mapValues, reduce } = require('lodash');

const { wallet } = config;

const CAP_GAINS_DATE = moment().subtract({ years: 1 });

const fix = (x) => x.toFixed(3);

const reduceToShortLong = (acc, { basisUsd, date, quantity }) => {
  if (moment(date).isBefore(CAP_GAINS_DATE) || quantity <= 0) {
    acc.long += quantity;

    // if (quantity > 0) {
    acc.longBasis += basisUsd;
    //}
  } else {
    acc.short += quantity;
  }

  return acc;
};

// eslint-disable-next-line no-console
console.error(
  reduce(
    mapValues(wallet, (buys) =>
      reduce(balanceReducer(buys), reduceToShortLong, {
        long: 0,
        longBasis: 0,
        short: 0,
      }),
    ),
    (acc, { long, longBasis, short }, symbol) =>
      `${acc}\n${symbol}\t\t${fix(long)}\t\t${fix(short)}\t\t${longBasis}`,
    'Symbol\t\tLong\t\tShort\t\tLong Basis',
  ),
);
