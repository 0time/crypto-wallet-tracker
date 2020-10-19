/* global lib */

const ensureBool = (input) => {
  if (input === true || input === false) return input;

  if (input === 'true') {
    return true;
  } else if (input === 'false') {
    return false;
  }

  throw new Error(`'${input}' is not a boolean`);
};

const settingsConverters = {
  array: (val) => (val === undefined ? val : JSON.parse(val)),
  bool: ensureBool,
  default: (val) => val,
};

const getUserSetting = (name, defaultValue, type) => {
  const val = (settingsConverters[type] || settingsConverters.default)(
    window.localStorage.getItem(name),
  );

  return val === null || val === undefined ? defaultValue : val;
};

const setUserSetting = (name, val) => window.localStorage.setItem(name, val);

const arrayAppend = (name, val) =>
  setUserSetting(
    name,
    JSON.stringify(
      getUserSetting(name, [], 'array').concat([val]).filter(lib.duplicates),
    ),
  );

// This only works on primitives
const arrayRemoveAll = (name, val) =>
  setUserSetting(
    name,
    getUserSetting(name, [], 'array').filter((v) => v !== val),
  );

const inputBindings = {
  '#preferred-language': 'language',
  '#update-frequency': 'update-frequency-ms',
  '#wallet-id': 'wallet-id',
};

const ensureInt = (input) => {
  if (lib.isString(input)) {
    try {
      return ensureInt(parseInt(input));
    } catch (err) {
      console.error(err);
    }
  } else if (lib.isNumber(input) && !lib.isNaN(input)) {
    return Math.floor(input);
  }

  return false;
};

const ensureNumber = (input) => {
  if (lib.isString(input)) {
    try {
      return ensureNumber(parseFloat(input));
    } catch (err) {
      // ignore, just return false
    }
  } else if (lib.isNumber(input) && !lib.isNaN(input)) {
    return input;
  }

  return false;
};

// fn should return false if it can't produce the type
const getType = (fn) => (key, defaultValue) =>
  fn(getUserSetting(key)) || defaultValue;

const returnFalseOnError = (fn) => (input) => {
  try {
    return fn(input);
  } catch (err) {
    console.error(err);
  }

  return false;
};

// eslint-disable-next-line no-unused-vars
const settings = {
  arrayAppend,
  arrayRemoveAll,
  fpSet: (name) => (val) => setUserSetting(name, val),
  get: getUserSetting,
  getBool: getType(returnFalseOnError(ensureBool)),
  getFloat: getType(ensureNumber),
  getInteger: getType(ensureInt),
  set: setUserSetting,
};

$(document).ready(() =>
  Object.keys(inputBindings).forEach((key) =>
    $(key)
      .val(getUserSetting(inputBindings[key], ''))
      .change(function () {
        const ele = $(this);

        setUserSetting(inputBindings[key], ele.val());
      }),
  ),
);
