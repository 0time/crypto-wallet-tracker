const { fp } = require('@0ti.me/tiny-pfp');
const getOptions = require('./get-options');
const makeRequest = require('./make-request');
const mapResponse = require('./map-response');

module.exports = (context) => {
  const configuredGetOptions = getOptions(context);
  const configuredMakeRequest = makeRequest(context);

  return (req, res, next) =>
    fp
      .flow([
        () => configuredGetOptions(req, res),
        configuredMakeRequest,
        mapResponse,
        next,
      ])()
      .catch(next);
};
