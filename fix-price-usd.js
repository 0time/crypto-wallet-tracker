const fs = require('fs');
const {isNumber} = require('lodash');
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
  .map(x =>
    Object.assign({}, x, {
      json: Object.assign({}, x.json, {
        data: x.json.data.map(each =>
          Object.assign({}, each, {
            priceUsd: isNumber(each.priceUsd)
              ? each.priceUsd
              : Number.parseFloat(each.priceUsd),
          }),
        ),
      }),
    }),
  )
  .forEach(({filename, json}) =>
    fs.writeFileSync(filename, JSON.stringify(json)),
  );
