const duplicates = require('../filters/duplicates');
const { fp, get } = require('@0ti.me/tiny-pfp');
const { isNumber } = require('lodash');
const {
  JSON_SELECTORS: { CONFIG_SOURCE_LIMIT, RUNTIME_QUERY, RUNTIME_PROMISE },
} = require('../constants');
const sql = require('./sql');

const fpConcat = (begin) => (end) => begin.concat(end);
const fpFilter = (cb) => (array) => array.filter(cb);

module.exports = (context) => {
  const query = get(context, RUNTIME_QUERY);
  const blacklist = Object.keys(get(context, 'config.coinBlacklist', {}));

  return (symbols) => {
    const limit = get(context, CONFIG_SOURCE_LIMIT);
    const promise = get(context, RUNTIME_PROMISE);

    if (!isNumber(limit)) {
      return promise.reject(`${limit} was not a number`);
    }

    return query(sql, [limit]).then(
      fp.flow([
        fp.get('rows'),
        fp.map(({ symbol }) => symbol),
        fpConcat(symbols),
        fpFilter(duplicates),
        fpFilter((ea) => !blacklist.includes(ea)),
        fpFilter((_, i) => i < limit),
      ]),
    );
  };
};
