const { get } = require('lodash');
const crProcessQuotes = require('./process-quotes');

module.exports = (context) => {
  const processQuotes = crProcessQuotes(context);

  return (resp) =>
    // If we get quotes in the response, toss them in the DB
    get(resp, 'data.data') ? processQuotes(resp).then(() => resp) : resp;
};
