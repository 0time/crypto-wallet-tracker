/**
 * @file quotes.js
 *
 * This model is intended to abstract away the concept of the coins and values tables to just provide
 * something similar to the cmc quotes endpoints.
 */
const { fp, get, pick } = require('@0ti.me/tiny-pfp');
const getBase = require('./get-base');
const {
  JSON_SELECTORS: { RUNTIME_DB_MODELS, RUNTIME_QUERY, RUNTIME_PROMISE },
} = require('../../../constants');

module.exports = (context) => {
  const query = get(context, RUNTIME_QUERY);
  const promise = get(context, RUNTIME_PROMISE);

  return {
    getOne: (options) => {
      const sql = [];
      const symbol = get(options, 'symbol');
      const values = [];

      if (!symbol) {
        throw new Error(
          'getOne not implemented without a symbol, which was not found',
        );
      }

      sql.push(getBase);
      sql.push(' WHERE symbol = ? LIMIT 1');
      values.push(symbol);

      return query(sql, values);
    },
    getMany: (options) => {
      const limit = get(options, 'limit');
      const sql = [];
      const symbol = get(options, 'symbol');
      const values = [];

      if (!symbol || !Array.isArray(symbol)) {
        throw new Error(
          'getOne not implemented without a symbol array, which was not found',
        );
      }

      sql.push(getBase);
      sql.push('WHERE symbol = ANY ( $1 )');

      if (limit) {
        values.push(limit);
        sql.push('LIMIT $2');
      }

      return query(sql, [[symbol]].concat(values));
    },
    // eslint-disable-next-line no-unused-vars
    putMany: (list, options) => {
      const coins = get(context, `${RUNTIME_DB_MODELS}.coins`);
      const coinValues = get(context, `${RUNTIME_DB_MODELS}.values`);
      const symbols = list.map(fp.get('symbol'));

      // Can this first part (69-80) be abstracted into another file or two?
      return (
        query('SELECT id, symbol FROM "coins" WHERE symbol = ANY ( $1 )', [
          symbols,
        ])
          .then(fp.get('rows'))
          .then(fp.map(fp.get('symbol')))
          .then((curr) => symbols.filter((ea) => !curr.includes(ea)))
          //.then( fp.negate(curr.includes))
          .then((newSymbols) => {
            const existingSymbols = symbols.filter(
              (ea) => !newSymbols.includes(ea),
              //fp.negate(newSymbols.includes),
            );

            const promiseNewSymbols =
              newSymbols.length > 0
                ? coins.putMany(
                    list.filter(({ symbol }) => newSymbols.includes(symbol)),
                  )
                : null;

            const promiseUpdate =
              existingSymbols.length > 0
                ? coins.updateMany(
                    list.filter(({ symbol }) =>
                      existingSymbols.includes(symbol),
                    ),
                  )
                : null;

            return promise.all([promiseNewSymbols, promiseUpdate]);
          })
          .then(() =>
            query(
              'SELECT c.id FROM ( SELECT UNNEST( $1::text[] ) sourceSymbol ) t LEFT JOIN "coins" c ON t.sourceSymbol = symbol',
              [symbols],
            ),
          )
          .then(fp.get('rows'))
          .then((rows) =>
            list.map((ea, i) => Object.assign({}, ea, { idCoin: rows[i].id })),
          )
          .then((result) =>
            coinValues.putMany(result, pick(options, ['ignore'])),
          )
      );
    },
  };
};
