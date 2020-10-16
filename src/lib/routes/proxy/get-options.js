const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_SOURCE_URL },
} = require('../../constants');

module.exports = (context) => (req) => ({
  method: req.method,
  // TODO: some kind of generalization around axios that maps the request to the configured runtime base url.
  url: `${get(context, CONFIG_SOURCE_URL)}${req.originalUrl.replace(
    /^\/proxy/,
    '',
  )}`,
});
