const duplicatesReversed = require('../../filters/duplicates-reversed');
const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { REQUEST_CONTEXT_LANGUAGE, RUNTIME_LOGGER },
} = require('../../constants');
const { LANGUAGE } = require('../../defaults');
const getLocalization = require('./hard-coded-localizations');

module.exports = (context, req) => {
  const logger = get(context, RUNTIME_LOGGER);
  // These are highest to lowest priority,
  // so reverse them and apply localizations in the reversed order, lowest to highest.
  const reversedLanguages = get(req, REQUEST_CONTEXT_LANGUAGE, [
    LANGUAGE,
  ]).reverse();

  const languages = [LANGUAGE]
    .concat(reversedLanguages)
    .filter(duplicatesReversed);

  logger.debug(languages);

  return languages.reduce(
    (acc, ea) => Object.assign(acc, getLocalization(ea)),
    {},
  );
};
