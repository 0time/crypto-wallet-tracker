const coerceIntToFloat = require('./coerce-int-to-float');
const mapToArray = require('./map-to-array');
const mapToSymbol = require('./map-to-symbol');
const {get, mapValues} = require('lodash');
const requestPromise = require('request-promise');

const getUri = context => path =>
  `${get(
    context,
    'config.server.elasticsearch.baseUri',
    'https://elasticsearch.0ti.me',
  )}${path}`;

module.exports = context => ({data, date}) =>
  Promise.all(
    [
      requestPromise({
        body: {
          data: mapToArray(data),
          date,
        },
        json: true,
        method: 'POST',
        resolveWithFullResponse: true,
        uri: getUri(context)('/crypto-array/_doc'),
      }).promise(),
      requestPromise({
        body: {
          data: mapToSymbol(data),
          date,
        },
        json: true,
        method: 'POST',
        resolveWithFullResponse: true,
        uri: getUri(context)('/crypto-object/_doc'),
      }).promise(),
    ].concat(
      mapToArray(data)
        .map(each =>
          Object.assign({}, mapValues(each, coerceIntToFloat), {date}),
        )
        .map(each =>
          requestPromise({
            body: each,
            json: true,
            method: 'POST',
            resolveWithFullResponse: true,
            uri: getUri(context)('/crypto-ray-ray/_doc'),
          })
            .promise()
            .catch(({message}) => context.logger.error(message, data)),
        ),
    ),
  );
