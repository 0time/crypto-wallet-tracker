const canMakeRequestCreator = require('./can-make-request');
const { fp, get, set } = require('@0ti.me/tiny-pfp');
const fpIf = require('../../fp/if');
const fromDbReadSymbolData = require('./from-db-read-symbol-data');
const getMostStaleIncludingSet = require('../../get-most-stale-including-set');
const getOptions = require('./get-options');
const identity = require('../../fp/identity');
const {
  HTTP_STATUS: { OK },
  JSON_SELECTORS: { REQUEST_CONTEXT },
} = require('../../constants');
const makeRequest = require('./make-request');
const processResponse = require('./process-response');

module.exports = (context) => {
  const canMakeRequest = canMakeRequestCreator(context);
  const configuredFromDbReadSymbolData = fromDbReadSymbolData(context);
  const configuredGetOptions = getOptions(context);
  const configuredMakeRequest = makeRequest(context);
  const configuredProcessResponse = processResponse(context);

  const updateSymbols = fp.flow([
    configuredGetOptions,
    configuredMakeRequest,
    configuredProcessResponse,
  ]);

  return (req, res, next) =>
    fp
      .flow([
        (startingContext) => set(req, REQUEST_CONTEXT, startingContext),
        // TODO: Get from user storage if user is logged in (instead? in addition?)
        fp.get(REQUEST_CONTEXT),
        fp.set('querySymbol', get(req, 'query.symbol', '').split(',')),
        (requestContext) =>
          set(requestContext, 'symbol', get(requestContext, 'querySymbol')),
        (requestContext) =>
          getMostStaleIncludingSet(context)(get(requestContext, 'symbol')),
        (symbols) => set(req, `${REQUEST_CONTEXT}.symbol`, symbols),
        () => get(req, REQUEST_CONTEXT),
        fpIf(canMakeRequest(), updateSymbols, identity),
        () => configuredFromDbReadSymbolData(get(req, REQUEST_CONTEXT)),
        fp.get('rows'),
        (json) => ({ json, status: OK }),
        next,
      ])({ req, res, next })
      .catch(next);
};
