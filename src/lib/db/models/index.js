const coins = require('./coins');
const { mapValues } = require('@0ti.me/tiny-pfp');
const quotes = require('./quotes');
const values = require('./values');

module.exports = (context) =>
  mapValues({ coins, quotes, values }, (fn) => fn(context));
