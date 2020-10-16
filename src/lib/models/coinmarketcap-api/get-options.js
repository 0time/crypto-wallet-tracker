const {
  CONTENT_TYPES: { WWW_FORM_URLENCODED },
  HEADERS: { CONTENT_TYPE },
  HTTP_METHODS: { GET },
  JSON_SELECTORS: {
    CONFIG_SOURCE_HEADER,
    CONFIG_SOURCE_KEY,
    CONFIG_SOURCE_URL,
  },
} = require('../../constants');
const createUrl = require('../../create-url');
const { get } = require('lodash');

module.exports = (context, symbols = []) => ({
  headers: {
    [CONTENT_TYPE]: WWW_FORM_URLENCODED,
    [get(context, CONFIG_SOURCE_HEADER)]: get(context, CONFIG_SOURCE_KEY),
  },
  method: GET,
  url: createUrl(get(context, CONFIG_SOURCE_URL), {
    symbol: symbols.join(','),
  }),
});
