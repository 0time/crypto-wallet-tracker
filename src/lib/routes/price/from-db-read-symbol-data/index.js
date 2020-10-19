const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_DB_MODELS, RUNTIME_LOGGER },
} = require('../../../constants');

module.exports = (context) => (requestContext) => {
  const logger = get(context, RUNTIME_LOGGER);

  const symbol = requestContext.querySymbol
    ? requestContext.querySymbol
    : requestContext.symbol;

  logger.trace(JSON.stringify(symbol));

  return get(context, `${RUNTIME_DB_MODELS}.quotes`).getMany({ symbol });
};
