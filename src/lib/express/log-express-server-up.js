const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_SERVER_OPTIONS, RUNTIME_LOGGER },
} = require('../constants');

module.exports = (context) => {
  const logger = get(context, RUNTIME_LOGGER);
  const options = get(context, CONFIG_SERVER_OPTIONS);

  logger.info({ message: 'express server started with options', options });

  return context;
};
