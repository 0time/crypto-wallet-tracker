const createUrl = require('../../create-url');
const { get, pick } = require('@0ti.me/tiny-pfp');
const {
  CONTENT_TYPES: { APPLICATION_JSON },
  HEADERS: { CONTENT_TYPE },
  JSON_SELECTORS: {
    CONFIG_SOURCE_HEADER,
    CONFIG_SOURCE_KEY,
    CONFIG_SOURCE_URL,
  },
} = require('../../constants');

module.exports = (context) => (requestContext) => ({
  headers: {
    [CONTENT_TYPE]: APPLICATION_JSON,
    [get(context, CONFIG_SOURCE_HEADER)]: get(context, CONFIG_SOURCE_KEY),
  },
  method: 'get',
  // TODO: some kind of generalization around axios that maps the request to the configured runtime base url.
  url: createUrl(
    `${get(context, CONFIG_SOURCE_URL)}/v1/cryptocurrency/quotes/latest`,
    pick(requestContext, ['symbol']),
  ),
});
