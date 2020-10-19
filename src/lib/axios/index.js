const axios = require('axios');
const {
  fp: { flow },
  get,
} = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_LOGGER },
} = require('../constants');

module.exports = (context) => {
  const logger = get(context, RUNTIME_LOGGER);

  const debug = (options) => {
    logger.debug(options);

    return options;
  };

  return (options) =>
    flow([debug, axios])(options).catch((err) => {
      const data = get(err, 'response.data');

      if (data) {
        err.message += `\n${JSON.stringify(data)}`;
      }

      require('fs').writeFileSync(
        '/tmp/last.err',
        require('util').inspect(err, { depth: 6 }),
        'utf8',
      );

      return Promise.reject(err);
    });
};
