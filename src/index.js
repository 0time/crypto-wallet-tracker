/* global __function, __line, __stack */
const axios = require('./lib/axios');
const bluebird = require('bluebird');
const config = require('config');
const dbCreator = require('./lib/db');
const express = require('./lib/express');
const fs = require('fs');
const fsp = fs.promises;
const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: {
    CONFIG_LOG_LINE_NUMBERS_ENABLED,
    RUNTIME_AXIOS,
    RUNTIME_DB_MODELS,
    RUNTIME_POOL,
    RUNTIME_PROMISE,
    RUNTIME_QUERY,
    RUNTIME_START_TIME,
  },
} = require('./lib/constants');
const models = require('./lib/db/models');
const os = require('os');
const path = require('path');
const process = require('./lib/process');
const query = require('./lib/db/query');

bluebird.config({
  longStackTraces: true,
});

const dt = () => new Date().toISOString();

const tmpdir = path.resolve(os.tmpdir(), dt());
const file = path.resolve(tmpdir, 'cmc.html');

const logFns = ['log', 'info', 'error', 'warn', 'debug', 'trace'];

const context = {
  config,
  file,
  tmpdir,
};

const logLineNumbers = get(context, CONFIG_LOG_LINE_NUMBERS_ENABLED, false);
// eslint-disable-next-line no-console
let loggerFn = (key) => (...args) => console.error(`${key} ${dt()}: `, ...args);

if (logLineNumbers) {
  Object.defineProperty(global, '__stack', {
    get: function () {
      var orig = Error.prepareStackTrace;
      Error.prepareStackTrace = function (_, stack) {
        return stack;
      };
      var err = new Error();
      Error.captureStackTrace(err, arguments.callee);
      var stack = err.stack;
      Error.prepareStackTrace = orig;
      return stack;
    },
  });

  Object.defineProperty(global, '__line', {
    get: function () {
      return __stack[2].getLineNumber();
    },
  });

  Object.defineProperty(global, '__function', {
    get: function () {
      return __stack[2].getFunctionName();
    },
  });

  loggerFn = (key) => (...args) =>
    // eslint-disable-next-line no-console
    console.error(`${key} ${dt()} ${__function} ${__line}: `, ...args);
}

context.logger = logFns.reduce(
  (acc, key) =>
    Object.assign({}, acc, {
      [key]: loggerFn(key),
    }),
  {},
);

['unhandledRejection', 'uncaughtException'].forEach((ea) =>
  process.on(ea, (err) => {
    get(context, 'logger', console).error(err);

    process.exit(1);
  }),
);

process.on('SIGINT', () => {
  get(context, 'logger', console).error('SIGINT received');

  process.exit(0);
});

set(context, RUNTIME_START_TIME, new Date().valueOf());

set(
  context,
  'logger.fp',
  logFns.reduce((acc, key) =>
    Object.assign({}, acc, {
      [key]: (...args) => context.logger[key](...args),
    }),
  ),
);
set(context, RUNTIME_PROMISE, bluebird);
set(context, RUNTIME_POOL, dbCreator(context));
set(context, RUNTIME_QUERY, query(context));

set(context, RUNTIME_AXIOS, axios(context));
set(context, RUNTIME_DB_MODELS, models(context));

const logAndQuit = (x) => {
  context.logger.error(x);

  process.exit(1);
};

fsp
  .mkdir(tmpdir)
  .then(() => express(context))
  .catch(logAndQuit);
