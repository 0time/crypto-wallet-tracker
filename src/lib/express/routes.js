const {
  fp: { flow },
  get,
} = require('@0ti.me/tiny-pfp');
const fpIf = require('../fp/if');
const identity = require('../fp/identity');
const {
  JSON_SELECTORS: { CONFIG_PROXY_ENABLED },
} = require('../constants');
const localization = require('../routes/localization');
const price = require('../routes/price');
const proxy = require('../routes/proxy');
const utf8 = require('../routes/utf8');

module.exports = (context) =>
  flow([
    localization,
    fpIf(get(context, CONFIG_PROXY_ENABLED, false), proxy, identity),
    price,
    utf8,
  ])(context);
