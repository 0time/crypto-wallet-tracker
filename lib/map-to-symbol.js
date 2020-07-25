const {isArray, isObject} = require('lodash');

module.exports = data =>
  isArray(data)
    ? data.reduce(
        (acc, coinObj) =>
          Object.assign({}, acc, {
            [coinObj.symbol]: coinObj,
          }),
        {},
      )
    : data;
