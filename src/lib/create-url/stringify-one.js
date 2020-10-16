const { isString } = require('@0ti.me/tiny-pfp');

module.exports = (one) => {
  if (Array.isArray(one)) {
    return one.join(',');
  } else if (isString(one)) {
    return one;
  }

  throw new Error(
    `Unsupported type ${one.toString && one.toString()} ${typeof one}`,
  );
};
