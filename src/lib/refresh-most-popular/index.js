const crCmcRequest = require('../requests/coin-market-cap');
const duplicates = require('../filters/duplicates');
const {
  fp: { flow },
  get,
  set,
} = require('@0ti.me/tiny-pfp');
const getMostPopularSql = require('./select-most-popular-sql');
const {
  JSON_SELECTORS: { RUNTIME_LAST_API_CALL, RUNTIME_QUERY },
} = require('../constants');

module.exports = (context) => {
  const blacklist = Object.keys(get(context, 'config.coinBlacklist', {}));
  const query = get(context, RUNTIME_QUERY);
  const cmcRequest = crCmcRequest(context);

  const forcedRefresh = [
    'BTC',
    'NANO',
    'LTC',
    'XMR',
    'DASH',
    'BCH',
    'SC',
    'RVN',
    'ETH',
  ];

  return () =>
    flow([
      () => query(getMostPopularSql),
      (result) => result.rows.map(({ symbol }) => symbol),
      (symbol) => ({
        symbol: forcedRefresh
          .concat(symbol)
          .filter(duplicates)
          .filter((ea) => !blacklist.includes(ea))
          .slice(0, 100),
      }),
      cmcRequest,
      () => set(context, RUNTIME_LAST_API_CALL, new Date().valueOf()),
    ])({});
};
