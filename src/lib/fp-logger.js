const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_LOG_FUNCTIONS, RUNTIME_LOGGER },
} = require('./constants');

module.exports = (context) => {
  const logFns = get(context, RUNTIME_LOG_FUNCTIONS);
  const logger = get(context, RUNTIME_LOGGER);

  return logFns.reduce((acc, key) =>
    Object.assign({}, acc, {
      [key]: (...args) => logger[key](...args),
    }),
  );
};
