/* global settings */

// eslint-disable-next-line no-unused-vars
const lib = (function () {
  const duplicates = (each, i, array) => !array.includes(each, i + 1);

  const deleteKeysForUndefinedValues = (obj) =>
    Object.keys(obj).reduce(
      (acc, key) =>
        obj[key] === undefined ? acc : Object.assign(acc, { [key]: obj[key] }),
      {},
    );

  let fadeInterval = null;
  let fades = [];
  const fadeStep = 0.015;

  const parseableBackgroundColor = new RegExp(
    '^rgba?\\(([0-9]+,){2,3}([0-9]+)\\)$',
  );

  const doFades = () => {
    if (fades.length === 0) return;

    const deletions = [];

    fades.forEach((fade, fadeIndex) => {
      const { id, resolve, reject } = fade;

      if (!fade.ele.attr) {
        if (isString(fade.ele)) {
          fade.ele = $(fade.ele);
        } else {
          deletions.unshift(fadeIndex);

          return reject(
            new Error(
              `'${
                fade.ele
              }' (${typeof fade.ele}) not valid -- fadeBackground failed`,
            ),
          );
        }
      }

      const { ele } = fade;

      if (!isArray(fade.fade)) {
        const currBg = fade.fade || ele.css('background-color');
        const matches = parseableBackgroundColor.exec(currBg);

        if (matches === null) {
          deletions.unshift(fadeIndex);

          return reject(new Error(`matches was null ${JSON.stringify(fade)}`));
        }

        matches.shift();

        if (matches.length === 3 || matches.length === 4) {
          matches.forEach((ea, i) => {
            fade.fade[i] = parseInt(ea);
          });

          if (!fade.fade[3]) {
            fade.fade[3] = 1.0;
          }
        } else {
          deletions.unshift(fadeIndex);

          return reject(new Error(`Unexpected currBg=${currBg}`));
        }
      }

      if (!fade.fade[3]) {
        fade.fade[3] = 1.0;
      }

      fade.fade[3] -= fadeStep;

      if (fade.fade[3] <= 0) {
        ele.css('background-color', '');

        deletions.unshift(fadeIndex);

        return resolve();
      }

      const [r, g, b, a] = fade.fade;
      const newRgba = `rgba(${r}, ${g}, ${b}, ${a})`;

      ele.css('background-color', newRgba);
    });

    fades = fades.filter(filterWithoutIndices(deletions));
  };

  const ensureFadeInterval = () => {
    if (fadeInterval) return;

    fadeInterval = setInterval(() => doFades(), 100);
  };

  const everyMap = {};

  const every = (key, timeMs, cb) => {
    const now = new Date().valueOf();

    if (!everyMap[key] || everyMap[key] + timeMs < now) {
      everyMap[key] = now;

      cb();
    }
  };

  const everyLog = (key, timeMs, ...args) =>
    every(key, timeMs, () => console.info(...args));

  const fadeBackground = (ele, fade) =>
    new Promise((resolve, reject) => {
      ensureFadeInterval();

      fades.push(
        Object.assign(
          { debug: { ele, fade, id: uuidv4(), resolve, reject } },
          { ele, fade, id: uuidv4(), resolve, reject },
        ),
      );
    });

  const filterWithinIndices = (indices) => (ea, i) => indices.includes(i);
  const filterWithoutIndices = (indices) => (ea, i) => !indices.includes(i);

  const has = (x) => ({
    millisecondsElapsedSince: (y) => {
      const dt = new Date().valueOf();

      return y < dt - x;
    },
  });

  const identity = (x) => x;

  const metrifyFactorMap = [
    {
      factor: -2,
      value: '\u00b5',
    },
    { factor: -1, value: 'm' },
    { factor: 0, value: '' },
    { factor: 1, value: 'k' },
    { factor: 2, value: 'M' },
    { factor: 3, value: 'G' },
    { factor: 4, value: 'T' },
    { factor: 5, value: 'E' },
  ];

  /**
   * @param string|Number number  Float value to convert to 5k, 4m, 3M, etc.
   */
  const metrify = (number) => {
    let factor = 0;
    let val = isString(number) ? Number.parseFloat(number) : number;

    while (Math.abs(val) > 1000) {
      ++factor;
      val /= 1000;

      if (factor > 10) {
        console.error(new Error('probably infinity ' + number));
        break;
      }
    }

    while (Math.abs(val) < 0.001) {
      --factor;
      val *= 1000;

      if (factor < -10) {
        console.error(new Error('probably infinity ' + number));
        break;
      }
    }

    const factorResult = metrifyFactorMap.find((ea) => ea.factor === factor);

    if (!factorResult || factorResult.value === undefined) {
      throw new Error(`factor ${factor} not implemented`);
    }

    return `${val}${factorResult.value}`;
  };

  const min = (maxValue) => (...args) =>
    args.reduce((acc, ea) => (acc > ea ? ea : acc), maxValue);

  const max = (minValue) => (...args) =>
    args.reduce((acc, ea) => (acc < ea ? ea : acc), minValue);

  /**
   * A simplified sigfig counter that treats all numbers as significant and
   * tries to retain all other characters, recommended you metrify or exponentify
   * before running this.
   *
   * TODO: Why am I not rounding?
   */
  const sig = (count) => (number) => {
    let accumulatedNumbers = 0;
    let out = '';
    const val = isString(number) ? number : number.toString();

    for (let i = 0; i < val.length; ++i) {
      if (val[i] >= '0' && val[i] <= '9') {
        if (accumulatedNumbers < count) {
          ++accumulatedNumbers;
          out += val[i];
        }
      } else if (val[i] !== '.' || accumulatedNumbers < count) {
        out += val[i];
      }
    }

    return out;
  };

  const sig3 = sig(3);
  const sig4 = sig(4);

  // TODO: Allow a setting to override this somehow
  const date = (inp) => new Date(inp).toLocaleString();
  const log = (inp) => console.log(inp) || inp;
  const logE = (inp) => console.error(inp) || inp;

  const accountify = (inp) =>
    (inp.startsWith('-') && `(${inp.substr(1)})`) ||
    (inp.startsWith('$-') && `($${inp.substr(2)})`) ||
    inp;
  const btc = (inp) => `${inp}\u20BF`;
  const percent = (inp) => `${inp}%`;
  const usd = (inp) => `$${inp}`;

  const isArray = (item) => Array.isArray(item);
  const isNaN = (item) => Number.isNaN(item);
  const isNumber = (item) => typeof item === 'number' || item instanceof Number;
  const isString = (inp) => typeof inp === 'string' || inp instanceof String;

  const dataOpMap = {
    accountify,
    btc,
    date,
    log,
    logE,
    metrify,
    percent,
    sig3,
    sig4,
    usd,
  };

  const get = (obj, key, defaultValue = undefined) => {
    if (obj && obj[key] !== undefined) {
      return obj[key];
    }

    return defaultValue;
  };

  const getQueryParameters = (options) => {
    const userSettings = {};
    const language = settings.get('language');

    if (language && language != '') {
      userSettings.language = language;
    }

    return Object.assign(
      {},
      options ? deleteKeysForUndefinedValues(options) : {},
      userSettings,
    );
  };

  const alerts = {};

  const presentAlert = (text, alertClass = 'alert-warning', time = 2000) => {
    const id = uuidv4();

    const alertEle = $(
      `<div id="${id}" class="alert ${alertClass}" role="alert">${text}</div>`,
    );

    alerts[id] = new Date().valueOf();

    alertEle.appendTo($('#alert-container'));

    setTimeout(() => {
      delete alerts[id];

      alertEle.remove();
    }, time);
  };

  const sortOnField = (field, desc = false, treatUndefinedAsMin = true) => (
    a,
    b,
  ) => {
    const lhs =
      a[field] !== undefined || treatUndefinedAsMin === false
        ? a[field]
        : Number.MIN_INTEGER;
    const rhs =
      b[field] !== undefined || treatUndefinedAsMin === false
        ? b[field]
        : Number.MIN_INTEGER;

    if (lhs < rhs) {
      return desc ? 1 : -1;
    }

    if (lhs > rhs) {
      return desc ? -1 : 1;
    }

    return 0;
  };

  const sumOfField = (val) => (acc, ea) => acc + ((ea && ea[val]) || 0);

  const balanceReducer = (config) => (acc, ea) => {
    // Skip sold entries
    if (ea.quantity < 0) {
      return acc;
    }

    if (config.soldQuantityCount > 0) {
      config.soldQuantityCount -= ea.quantity;

      if (config.soldQuantityCount > 0) {
        return acc;
      } else {
        const copy = Object.assign({}, ea);

        copy.basisUsd =
          copy.basisUsd * (-config.soldQuantityCount / copy.quantity);
        copy.quantity = -config.soldQuantityCount;

        acc.push(copy);
      }
    } else {
      const copy = Object.assign({}, ea);

      acc.push(copy);
    }

    return acc;
  };

  const reduceSoldQuantity = (acc, ea) => {
    if (ea && ea.quantity < 0) {
      return acc - ea.quantity;
    }

    return acc;
  };

  // Calculates the remaining balances by doing first in first out on the purchases
  // with the sales
  const calculateBalances = (array) => {
    const sorter = lib.sortOnField('date');

    array.sort(sorter);

    let soldQuantityCount = array.reduce(reduceSoldQuantity, 0);

    return array.reduce(balanceReducer({ soldQuantityCount }), []);
  };

  const basis = (val) =>
    calculateBalances(val).reduce(sumOfField('basisUsd'), 0);

  const YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;

  const processWallet = (wallet) =>
    !wallet
      ? {}
      : Object.keys(wallet)
          .map((symbol) => {
            const result = { symbol };
            const val = wallet[symbol];

            if (isString(val) || isNumber(val)) {
              // Assume it's an owned quantity
              result.held = val;
            } else if (isArray(val)) {
              const balances = calculateBalances(val);

              result.basis = balances.reduce(sumOfField('basisUsd'), 0);
              result.held = val.reduce(sumOfField('quantity'), 0);

              result['held-cap-long'] = 0;
              result['held-cap-short'] = 0;

              balances.reduce((acc, ea) => {
                has(YEAR_IN_MS).millisecondsElapsedSince(new Date(ea.date))
                  ? (result['held-cap-long'] += ea.quantity)
                  : (result['held-cap-short'] += ea.quantity);

                return acc;
              }, result);
            } else {
              console.error(val);

              throw new Error(`cannot process wallet like the above ^`);
            }

            return result;
          })
          .reduce((acc, obj) => {
            acc[obj.symbol] = obj;

            return acc;
          }, {});

  const tryParseFloat = (val) => {
    try {
      val = parseFloat(val);

      if (lib.isNaN(val)) {
        return false;
      }

      return val;
    } catch (err) {
      return false;
    }
  };

  const uuidv4 = () =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });

  return {
    basis,
    dataOpMap,
    duplicates,
    every,
    everyLog,
    fadeBackground,
    filterWithinIndices,
    filterWithoutIndices,
    get,
    getQueryParameters,
    has,
    identity,
    isArray,
    isNaN,
    isNumber,
    isString,
    min,
    max,
    presentAlert,
    processWallet,
    sortOnField,
    sumOfField,
    tryParseFloat,
    uuid: uuidv4,
    uuidv4,
  };
})();

try {
  module.exports = lib;
} catch (err) {
  // don't care
}
