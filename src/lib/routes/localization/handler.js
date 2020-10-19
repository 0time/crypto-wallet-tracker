const {
  fp: { flow },
} = require('@0ti.me/tiny-pfp');
const getLocalizations = require('./get-localizations');

// TODO: More abstraction, probably use the DB for strings, etc.
module.exports = (context) => (req, res, next) =>
  flow([() => ({ json: getLocalizations(context, req) }), next])(
    Promise.resolve(),
  ).catch(next);
