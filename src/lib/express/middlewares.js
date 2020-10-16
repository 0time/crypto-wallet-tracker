const {
  fp: { flow },
} = require('@0ti.me/tiny-pfp');
const log = require('../middlewares/log');
const wrapMiddlewares = require('./wrap-middlewares');

module.exports = flow([log].map(wrapMiddlewares));
