const { get, set } = require('@0ti.me/tiny-pfp');

const handlers = {};

const getHandlerList = (key) =>
  get(handlers, key) || set(handlers, key, [])[key];

module.exports = (key, cb) => getHandlerList(key).push(cb);

module.exports.emit = (key, ...args) =>
  getHandlerList(key).forEach((fn) => fn(...args));
