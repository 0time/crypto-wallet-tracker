const app = require('./app');
const error = require('../middlewares/error');
const {
  fp: { flow },
  set,
} = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP, RUNTIME_SERVER },
} = require('../constants');
const listen = require('./listen');
const middlewares = require('./middlewares');
const routes = require('./routes');
const send = require('../middlewares/send');

module.exports = (context) =>
  flow([
    // TODO: Middlewares and routes go here
    // TODO: More abstraction around these middlewares and routes obviously
    () => set(context, RUNTIME_APP, app),
    middlewares,
    routes,
    send,
    error,
    listen,
    (server) => set(context, RUNTIME_SERVER, server),
  ])(app);
