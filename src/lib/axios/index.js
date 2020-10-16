const axios = require('axios');
const {
  fp: { flow },
} = require('@0ti.me/tiny-pfp');

module.exports = (context) => {
  const debug = (options) => {
    context.logger.debug(options);

    return options;
  };

  return flow([debug, axios]);
};
