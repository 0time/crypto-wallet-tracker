const {isArray, isObject} = require('lodash');

module.exports = data =>
  !isArray(data) && isObject(data)
    ? Object.keys(data).map(key => Object.assign({symbol: key}, data[key]))
    : data;
