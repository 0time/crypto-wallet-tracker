const { get } = require('@0ti.me/tiny-pfp');
const handler = require('./handler');
const {
  JSON_SELECTORS: { RUNTIME_APP },
} = require('../../constants');

module.exports = (context) => {
  const app = get(context, RUNTIME_APP);

  // TODO other methods?
  app.get('/price', handler(context));

  return context;
};
