const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_LOG_FUNCTIONS },
} = require('../../src/lib/constants');
const {
  sinon: { spy },
} = deps;

module.exports = (context) =>
  get(context, CONFIG_LOG_FUNCTIONS, []).reduce(
    (acc, ea) => Object.assign(acc, { [ea]: spy() }),
    {},
  );
