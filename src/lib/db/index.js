const {get} = require('lodash');
const {
  JSON_SELECTORS: {CONFIG_DB},
} = require('../constants');
const {Pool} = require('pg');

module.exports = context => new Pool(get(context, CONFIG_DB));
