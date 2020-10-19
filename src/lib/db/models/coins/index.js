const duplicates = require('../../../filters/duplicates');
const { get, has } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_QUERY },
} = require('../../../constants');

module.exports = (context) => {
  const query = get(context, RUNTIME_QUERY);
  const validFields = [
    'circulatingSupply',
    'lastUpdated',
    'marketCap',
    'maxSupply',
    'name',
    'percentChange1h',
    'percentChange24h',
    'percentChange7d',
    'slug',
    'symbol',
    'volume24h',
  ];

  const DEFAULTS = {
    circulatingSupply: 0,
    lastUpdated: '1970-01-01T00:00:00.000Z',
    marketCap: 0,
    maxSupply: 0,
    name: null,
    percentChange1h: 0,
    percentChange24h: 0,
    percentChange7d: 0,
    slug: null,
    symbol: null,
    volume24h: 0,
  };

  const FORCE_NUMERIC = {
    circulatingSupply: true,
    marketCap: true,
    maxSupply: true,
    percentChange1h: true,
    percentChange24h: true,
    percentChange7d: true,
    volume24h: true,
  };

  const mapValue = (field, row) => {
    const value = get(row, field, DEFAULTS[field]);

    if (FORCE_NUMERIC[field] && value === null) {
      return DEFAULTS[field];
    }

    return value;
  };

  return {
    updateMany: (list, options = {}) => {
      if (!list || !list.length)
        return Promise.reject(new Error('Tried to update 0 records'));

      const uniqueFields = has(options, 'uniqueFields')
        ? get(options, 'uniqueFields')
        : list.reduce(
            (acc, ea) => acc.concat(Object.keys(ea)).filter(duplicates),
            [],
          );
      const fields = uniqueFields.filter((ea) => validFields.includes(ea));

      if (!fields.includes('symbol')) {
        return Promise.reject(
          new Error(
            `Field 'symbol' not found on list -- fields: '${JSON.stringify(
              fields,
            )}'`,
          ),
        );
      }

      const formatterValues = [];
      const sql = [];
      const values = [];

      sql.push('UPDATE "coins" AS c SET');

      fields.forEach((field, i) => {
        if (FORCE_NUMERIC[field]) {
          sql.push(
            `%I = coinsNewTemp.%I::numeric ${
              i === fields.length - 1 ? '' : ','
            }`,
          );
        } else {
          sql.push(
            `%I = coinsNewTemp.%I ${i === fields.length - 1 ? '' : ','}`,
          );
        }
        formatterValues.push(field);
        formatterValues.push(`${field}`);
      });

      sql.push('FROM ( VALUES');

      let counter = 0;

      list.forEach((row, i) => {
        sql.push('(');

        fields.forEach((field, j) => {
          ++counter;
          sql.push(`$${counter} ${j === fields.length - 1 ? '' : ','}`);
          values.push(mapValue(field, row));
        });

        sql.push(`)${i === list.length - 1 ? '' : ','}`);
      });

      sql.push(') AS coinsNewTemp (');

      fields.forEach((field, i) => {
        sql.push(`%I${i === fields.length - 1 ? '' : ','}`);
        formatterValues.push(field);
      });

      sql.push(') WHERE coinsNewTemp.symbol = c.symbol;');

      return query(sql, values, formatterValues);
    },
    putMany: (list, options) => {
      if (!list || !list.length)
        return Promise.reject(new Error('Tried to put 0 records'));

      const uniqueFields = has(options, 'uniqueFields')
        ? get(options, 'uniqueFields')
        : list.reduce(
            (acc, ea) => acc.concat(Object.keys(ea)).filter(duplicates),
            [],
          );
      const fields = uniqueFields.filter(validFields.includes);

      const formatterValues = [];
      const sql = [];
      const values = [];

      sql.push('INSERT INTO "coins" (');

      fields.forEach((field) => {
        sql.push('%I');
        formatterValues.push(field);
      });

      sql.push(') VALUES');

      let counter = 0;

      list.forEach((row, i) => {
        sql.push(`${i > 0 ? ',' : ''}(`);
        fields.forEach((field) => {
          ++counter;
          sql.push(`$${counter}`);
          values.push(mapValue(field, row));
        });
      });

      if (options.ignore) {
        sql.push('ON CONFLICT DO NOTHING');
      }

      return query(sql, values, formatterValues);
    },
  };
};
