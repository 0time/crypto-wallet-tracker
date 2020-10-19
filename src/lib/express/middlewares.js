const {
  fp: { flow },
} = require('@0ti.me/tiny-pfp');
const log = require('../middlewares/log');
const setLanguage = require('../middlewares/set-language');
const wrapMiddlewares = require('./wrap-middlewares');

module.exports = flow([log, setLanguage].map(wrapMiddlewares));
