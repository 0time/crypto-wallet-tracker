const stringifyOne = require('./stringify-one');

module.exports = (baseUrl, queryObject) =>
  Object.keys(queryObject).reduce(
    (acc, key, i) =>
      `${acc}${i === 0 ? '?' : '&'}${key}=${stringifyOne(queryObject[key])}`,
    baseUrl,
  );
