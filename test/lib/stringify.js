const { get, isObject } = require('lodash');
const util = require('util');

module.exports = (inp, options) =>
  JSON.stringify(
    isObject(inp) ? util.inspect(inp, get(options, 'utilOptions')) : inp,
  );
