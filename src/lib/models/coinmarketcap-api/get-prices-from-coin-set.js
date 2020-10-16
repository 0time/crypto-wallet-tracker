const axios = require('axios');
const getOptions = require('./get-options');

module.exports = context => coinSet => axios(getOptions(context, coinSet));
