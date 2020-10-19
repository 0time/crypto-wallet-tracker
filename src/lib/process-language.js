const { get } = require('@0ti.me/tiny-pfp');

module.exports = (str) =>
  str.split(',').map((ea) =>
    ea.split(';').reduce(
      (acc, ea, i) =>
        ({
          0: () => ({ language: ea }),
          1: () => ({ language: get(acc, 'language'), weight: ea }),
          2: () => {
            throw new Error(`Unable to parse str '${str}'`);
          },
        }[i]()),
      null,
    ),
  );
