const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_AXIOS },
} = require('../../constants');

module.exports = (context) => (options) => get(context, RUNTIME_AXIOS)(options);
