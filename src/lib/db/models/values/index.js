const duplicates = require('../../../filters/duplicates');
const { get, has } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_QUERY },
} = require('../../../constants');

module.exports = (context) => {
  const query = get(context, RUNTIME_QUERY);
  const validFields = ['idCoin', 'price', 'timestamp'];
  const DEFAULTS = { price: 0 };

  return {
    putMany: (list, options = {}) => {
      if (!list || !list.length)
        return Promise.reject(new Error('Tried to put 0 records'));

      const uniqueFields = has(options, 'uniqueFields')
        ? get(options, 'uniqueFields')
        : list.reduce(
            (acc, ea) => acc.concat(Object.keys(ea)).filter(duplicates),
            [],
          );
      const fields = uniqueFields.filter((ea) => validFields.includes(ea));

      const formatterValues = [];
      const sql = [];
      const values = [];

      sql.push('INSERT INTO "values" (');

      fields.forEach((field, i) => {
        sql.push(`${i === 0 ? '' : ','} %I`);
        formatterValues.push(field);
      });

      sql.push(') VALUES');

      let counter = 0;

      list.forEach((ea, i) => {
        sql.push(`${i === 0 ? '' : ','} (`);

        fields.forEach((field, j) => {
          ++counter;
          sql.push(`${j === 0 ? '' : ','} $${counter}`);
          values.push(get(ea, field, DEFAULTS[field]));
        });

        sql.push(')');
      });

      return query(sql, values, formatterValues);
    },
  };
};
