const {
  fp: { flow },
} = require('@0ti.me/tiny-pfp');
const getOptions = require('./get-options');
const makeRequest = require('./make-request');
const parseResponse = require('./parse-response');

module.exports = (context) =>
  flow([getOptions(context), makeRequest(context), parseResponse(context)]);
