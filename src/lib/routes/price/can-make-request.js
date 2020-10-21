const { get, set } = require('@0ti.me/tiny-pfp');
const has = require('../../has');
const {
  JSON_SELECTORS: { CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS, RUNTIME_LAST_API_CALL },
} = require('../../constants');

module.exports = (context) => () => {
  const debounceTime = get(context, CONFIG_SOURCE_MIN_DEBOUNCE_TIME_MS);
  const lastApiCall = get(context, RUNTIME_LAST_API_CALL, 0);
  const now = new Date().valueOf();

  if (!debounceTime) throw new Error('Unspecified debounce time');

  if (has(debounceTime).millisecondsElapsedSince(lastApiCall)) {
    set(context, RUNTIME_LAST_API_CALL, now);

    return true;
  }

  return false;
};
