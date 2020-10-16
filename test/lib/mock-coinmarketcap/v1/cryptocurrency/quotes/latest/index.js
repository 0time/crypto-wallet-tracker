const data = require('./data');
const { pick } = require('lodash');

module.exports = (context, options) =>
  pick(
    data,
    ['status'].concat(
      options._mock.query.symbol.split(',').map((ea) => `data.${ea}`),
    ),
  );
