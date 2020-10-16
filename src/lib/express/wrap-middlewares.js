const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP },
} = require('../constants');

module.exports = (middleware) => (context) => {
  const app = get(context, RUNTIME_APP);

  app.use(middleware(context));

  return context;
};
