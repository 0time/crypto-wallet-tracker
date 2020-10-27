const createUrl = require('../../create-url');
const { get, pick, set } = require('@0ti.me/tiny-pfp');
const {
  CONTENT_TYPES: { APPLICATION_JSON },
  HEADERS: { CONTENT_TYPE },
  JSON_SELECTORS: {
    CONFIG_SOURCE_HEADER,
    CONFIG_SOURCE_KEY,
    CONFIG_SOURCE_URL,
  },
} = require('../../constants');

module.exports = (context) => {
  const headers = {};

  set(headers, CONTENT_TYPE, APPLICATION_JSON);
  set(
    headers,
    get(context, CONFIG_SOURCE_HEADER),
    get(context, CONFIG_SOURCE_KEY),
  );

  const baseUrl = `${get(
    context,
    CONFIG_SOURCE_URL,
  )}/v1/cryptocurrency/quotes/latest`;

  const crUrl = (requestContext) =>
    createUrl(baseUrl, pick(requestContext, ['symbol']));

  return (requestContext, options = {}) =>
    Object.assign(
      {
        headers,
        method: 'get',
        url: crUrl(requestContext),
      },
      options,
    );
};
