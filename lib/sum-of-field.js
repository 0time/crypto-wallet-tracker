const {get} = require('lodash');

module.exports = field => (acc, ea) => {
  const val = get(ea, field, 0);

  return acc + val;
};
