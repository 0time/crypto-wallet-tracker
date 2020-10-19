const {
  JSON_SELECTORS: { RUNTIME_LOGGER },
} = require('../constants');
const { get, pick } = require('@0ti.me/tiny-pfp');

const skipLogRegex = /(\.css$)|(\.css\.map$)|(\.js$)|(\.js.map$)|(\.html$)/;
const shouldSkip = (inp) => {
  const bool = skipLogRegex.test(inp);

  skipLogRegex.lastIndex = 0;

  return !bool;
};

module.exports = (context) => {
  const logger = get(context, RUNTIME_LOGGER);

  return (req, res, next) => {
    const originalUrl = get(req, 'originalUrl');

    // TODO: Make this a more useful log statement
    logger.info(originalUrl);

    if (shouldSkip(originalUrl)) {
      logger.debug(pick(req, ['body', 'headers', 'query', 'path']));
    }

    next();
  };
};
