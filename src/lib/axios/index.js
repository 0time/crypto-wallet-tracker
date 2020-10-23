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
    flow([debug, axios])(options)
      .then((resp) => {
        const headers = get(resp, 'headers');

        logger.trace(headers);

        return resp;
      })
      .catch((err) => {
        const data = get(err, 'response.data');
        const headers = get(err, 'response.headers');

        logger.trace(headers);

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
