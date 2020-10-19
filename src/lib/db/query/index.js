/**
 * A configurable wrapper for the pool query to abstract logging and validation.
 */

const {
  fp: { flow },
  get,
  pick,
} = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_LOGGER, RUNTIME_POOL, RUNTIME_PROMISE },
} = require('../../constants');
const pgFormat = require('pg-format');

module.exports = (context) => {
  const logger = get(context, RUNTIME_LOGGER);
  const pool = get(context, RUNTIME_POOL);
  const promise = get(context, RUNTIME_PROMISE);

  const dupWhitespaceRegex = new RegExp(/[ \n\r]+/g);

  const trace = (inp) => {
    logger.trace(
      __filename,
      JSON.stringify(
        Object.assign({}, inp, {
          sql: inp.sql.replace(dupWhitespaceRegex, ' '),
        }),
      ),
    );

    return inp;
  };

  const getTrace = (keys) => (inp) => {
    const val = keys && Array.isArray(keys) ? pick(inp, keys) : inp;

    if (val !== undefined) {
      logger.trace(val);
    }

    return inp;
  };

  const fixSqlArrayToString = (inp) =>
    Array.isArray(inp.sql)
      ? Object.assign({}, inp, {
          sql: inp.sql.join(' '),
        })
      : inp;

  const formatPg = (inp) => {
    const formatterValues = get(inp, 'formatterValues', false);

    if (formatterValues) {
      trace(inp);

      return {
        sql: pgFormat(inp.sql, ...inp.formatterValues),
        values: inp.values,
      };
    } else {
      return inp;
    }
  };

  const regexForPcentIs = /%I/g;
  const regexForNumbers = /[0-9]+/g;

  const validate = (inp) => {
    const lastDollar = inp.sql.lastIndexOf('$');
    const lastDollarMatchResult = inp.sql
      .substr(lastDollar)
      .match(regexForNumbers);
    const highestDollarValue = parseInt(lastDollarMatchResult[0]);
    const countIs = (inp.sql.match(regexForPcentIs) || { length: 0 }).length;
    const expectedIs = inp.formatterValues ? inp.formatterValues.length : 0;
    const expectedDollarValue = inp.values.length;

    const debug = (extra) =>
      logger.debug(
        JSON.stringify({
          countIs,
          expectedIs,
          expectedDollarValue,
          extra,
          highestDollarValue,
          lastDollar,
          lastDollarMatchResult,
          substrLastDollar: inp.sql.substr(lastDollar),
          substrLastDollarSearch: inp.sql
            .substr(lastDollar)
            .search(regexForNumbers),
        }),
      );

    if (highestDollarValue !== expectedDollarValue) {
      debug();

      return promise.reject(
        new Error(
          `Expected last parameter $${highestDollarValue} to equal length of values: ${expectedDollarValue}`,
        ),
      );
    } else if (countIs !== expectedIs) {
      debug();

      return promise.reject(
        new Error(
          `Expected counted Is ${countIs} to equal length of formatterValues: ${expectedIs}`,
        ),
      );
    }

    return promise.resolve(inp);
  };

  return (sql, values, formatterValues) =>
    flow([
      fixSqlArrayToString,
      validate,
      formatPg,
      trace,
      ({ sql, values }) => pool.query(sql, values),
      getTrace(['command', 'rowCount']),
    ])(promise.resolve({ formatterValues, sql, values }));
};
