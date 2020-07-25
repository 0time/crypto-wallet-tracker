const fs = require('fs');
const {isArray} = require('lodash');
const mapToSymbol = require('./lib/map-to-symbol');
const path = require('path');

const HISTORICAL = 'historical';

const join = y => x => path.join(y, x);

const files = fs
  .readdirSync(HISTORICAL)
  .filter(x => x.endsWith('.json'))
  .map(join(HISTORICAL))
  .map(x => ({
    filename: x,
    json: require(`./${x}`),
  }))
  .map(({filename, json}) => ({
    filename,
    json: Object.assign({}, json, {
      data: isArray(json.data) ? mapToSymbol(json.data) : json.data,
    }),
  }))
  .forEach(({filename, json}) =>
    fs.writeFileSync(filename, JSON.stringify(json)),
  );
