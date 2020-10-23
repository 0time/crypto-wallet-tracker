const { get, set } = require('@0ti.me/tiny-pfp');
const has = require('../../has');
const {
  JSON_SELECTORS: {
    CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS,
    RUNTIME_LAST_API_CALL,
    RUNTIME_LOGGER,
  },
} = require('../../constants');

module.exports = (context) => (requestContext) => {
  const logger = get(context, RUNTIME_LOGGER);

  const debounceTime = get(context, CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS);
  const lastApiCall = get(context, RUNTIME_LAST_API_CALL, 0);
  const force = get(requestContext, 'force', null);
  const now = new Date().valueOf();

  if (!debounceTime) throw new Error('Unspecified debounce time');

  const timeElapsed = has(debounceTime).millisecondsElapsedSince(lastApiCall);
  const condition = force === true || (force !== false && timeElapsed);

  logger.trace({ condition, force, debounceTime, lastApiCall, now });

  if (condition) {
    set(context, RUNTIME_LAST_API_CALL, now);
  }

  return condition;
};
