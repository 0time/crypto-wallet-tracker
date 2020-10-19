const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: {
    REQUEST_BODY_LANGUAGE,
    REQUEST_CONTEXT_LANGUAGE,
    REQUEST_HEADERS_ACCEPT_LANGUAGE,
    REQUEST_HEADERS_X_ACCEPT_LANGUAGE,
    REQUEST_PARAMS_LANGUAGE,
    REQUEST_QUERY_LANGUAGE,
  },
} = require('../constants');
const processLanguage = require('../process-language');

module.exports = () => (req, res, next) => {
  set(
    req,
    REQUEST_CONTEXT_LANGUAGE,
    // The order should be highest priority values to lowest priority values
    [
      get(req, REQUEST_QUERY_LANGUAGE),
      get(req, REQUEST_PARAMS_LANGUAGE),
      get(req, REQUEST_BODY_LANGUAGE),
      get(req, REQUEST_HEADERS_X_ACCEPT_LANGUAGE),
      get(req, REQUEST_HEADERS_ACCEPT_LANGUAGE),
    ]
      .reduce((acc, ea) => {
        if (ea && Array.isArray(ea)) {
          return acc.concat(ea);
        } else if (ea) {
          return acc.concat(processLanguage(ea));
        }

        return acc;
      }, [])
      // TODO: Do something with weight, probably a sort with a high default weight?
      // Might be weighting rules defined here: https://tools.ietf.org/html/rfc7231#section-5.3.5
      // Found that link here: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Language
      .map((ea) => get(ea, 'language') || ea),
  );

  next();
};
