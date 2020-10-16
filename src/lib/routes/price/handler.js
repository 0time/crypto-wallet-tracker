const { fp, get, set } = require('@0ti.me/tiny-pfp');
const fpIf = require('../../fp/if');
const fromDbReadSymbolData = require('./from-db-read-symbol-data');
const getMostStaleIncludingSet = require('../../get-most-stale-including-set');
const getOptions = require('./get-options');
const identity = require('../../fp/identity');
const {
  HTTP_STATUS: { OK },
  JSON_SELECTORS: {
    CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS,
    REQUEST_CONTEXT,
    RUNTIME_LAST_API_CALL,
  },
} = require('../../constants');
const makeRequest = require('./make-request');
const processResponse = require('./process-response');

module.exports = (context) => {
  const configuredFromDbReadSymbolData = fromDbReadSymbolData(context);
  const configuredGetOptions = getOptions(context);
  const configuredMakeRequest = makeRequest(context);
  const configuredProcessResponse = processResponse(context);

  const canMakeRequest = () => {
    const debounceTime = get(context, CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS);
    const lastApiCall = get(context, RUNTIME_LAST_API_CALL, 0);
    const now = new Date().valueOf();

    if (!debounceTime) throw new Error('Unspecified debounce time');

    if (lastApiCall + debounceTime < now) {
      set(context, RUNTIME_LAST_API_CALL, now);

      return true;
    }

    return false;
  };

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
