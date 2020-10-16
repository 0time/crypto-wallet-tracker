const {
  fp: { flow },
  get,
} = require('@0ti.me/tiny-pfp');
const fpIf = require('../fp/if');
const identity = require('../fp/identity');
const {
  JSON_SELECTORS: { CONFIG_PROXY_ENABLED },
} = require('../constants');
const price = require('../routes/price');
const proxy = require('../routes/proxy');

module.exports = (context) =>
  flow([
    fpIf(get(context, CONFIG_PROXY_ENABLED, false), proxy, identity),
    price,
  ])(context);
