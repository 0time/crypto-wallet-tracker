const canMakeRequestCreator = require('./can-make-request');
const crUpdateSymbols = require('../../requests/coin-market-cap');
const { fp, get, set } = require('@0ti.me/tiny-pfp');
const fpIf = require('../../fp/if');
const fromDbReadSymbolData = require('./from-db-read-symbol-data');
const getMostStaleIncludingSet = require('../../get-most-stale-including-set');
const identity = require('../../fp/identity');
const {
  HTTP_STATUS: { OK },
  JSON_SELECTORS: { REQUEST_CONTEXT, REQUEST_QUERY_FORCE },
} = require('../../constants');

module.exports = (context) => {
  const canMakeRequest = canMakeRequestCreator(context);
  const configuredFromDbReadSymbolData = fromDbReadSymbolData(context);

  const updateSymbols = crUpdateSymbols(context);

  return (req, res, next) => {
    const force = get(req, REQUEST_QUERY_FORCE, null);
    const querySymbol = get(req, 'query.symbol')
      ? get(req, 'query.symbol').split(',')
      : [];

    const requestContext = { req, res, next, querySymbol, symbol: querySymbol };

    if (force === 'true') {
      requestContext.force = true;
    } else if (force === 'false') {
      requestContext.force = false;
    }

    return fp
      .flow([
        (startingContext) => set(req, REQUEST_CONTEXT, startingContext),
        () => getMostStaleIncludingSet(context)(get(requestContext, 'symbol')),
        (symbols) => set(requestContext, 'symbol', symbols),
        fpIf(canMakeRequest(requestContext), updateSymbols, identity),
        () => configuredFromDbReadSymbolData(get(req, REQUEST_CONTEXT)),
        fp.get('rows'),
        (json) => ({ json, status: OK }),
        next,
      ])(requestContext)
      .catch(next);
  };
};
