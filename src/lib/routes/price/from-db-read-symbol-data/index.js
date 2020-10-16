const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_DB_MODELS },
} = require('../../../constants');

module.exports = (context) => (requestContext) => {
  const symbol = requestContext.querySymbol
    ? requestContext.querySymbol
    : requestContext.symbol;

  context.logger.trace(__filename, symbol);
  return get(context, `${RUNTIME_DB_MODELS}.quotes`).getMany({ symbol });
};
