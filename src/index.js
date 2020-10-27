const axios = require('./lib/axios');
const bluebird = require('bluebird');
const config = require('config');
const crons = require('./lib/crons');
const dbCreator = require('./lib/db');
const express = require('./lib/express');
const fpLogger = require('./lib/fp-logger');
const fs = require('fs');
const fsp = fs.promises;
const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: {
    CONFIG_LOG_FUNCTIONS,
    RUNTIME_AXIOS,
    RUNTIME_DB_MODELS,
    RUNTIME_FP_LOGGER,
    RUNTIME_LOG_FUNCTIONS,
    RUNTIME_LOGGER,
    RUNTIME_POOL,
    RUNTIME_PROMISE,
    RUNTIME_QUERY,
    RUNTIME_START_TIME,
    RUNTIME_WORKING_DIR,
  },
} = require('./lib/constants');
const crLogger = require('./lib/logger');
const models = require('./lib/db/models');
const os = require('os');
const path = require('path');
const process = require('./lib/process');
const query = require('./lib/db/query');
const crRefreshMostPopular = require('./lib/refresh-most-popular');

bluebird.config({
  longStackTraces: true,
});

const tmpdir = path.resolve(os.tmpdir(), new Date().toISOString());
const file = path.resolve(tmpdir, 'cmc.html');

const context = {
  config,
  file,
  tmpdir,
};

set(context, RUNTIME_LOG_FUNCTIONS, get(context, CONFIG_LOG_FUNCTIONS));
set(context, RUNTIME_WORKING_DIR, process.cwd());
set(context, RUNTIME_LOGGER, crLogger(context));

['unhandledRejection', 'uncaughtException'].forEach((ea) =>
  process.on(ea, (err) => {
    get(context, RUNTIME_LOGGER, console).error(err);

    process.exit(1);
  }),
);

process.on('SIGINT', () => {
  get(context, 'logger', console).error('SIGINT received');

  process.exit(0);
});

set(context, RUNTIME_FP_LOGGER, fpLogger(context));
set(context, RUNTIME_START_TIME, new Date().valueOf());
set(context, RUNTIME_PROMISE, bluebird);
set(context, RUNTIME_POOL, dbCreator(context));
set(context, RUNTIME_QUERY, query(context));
set(context, RUNTIME_AXIOS, axios(context));
set(context, RUNTIME_DB_MODELS, models(context));

const refreshMostPopular = crRefreshMostPopular(context);

const logger = get(context, RUNTIME_LOGGER);

crons.on('create', (key, cronStr) => logger.debug(key, cronStr));
crons.on('debug', (...args) => logger.debug(...args));
crons.on('execute', (key, cronStr, cronTime) =>
  logger.info({ action: 'execute', cronStr, cronTime, key }),
);
crons.on('skip', (key, cronStr, cronTime) =>
  logger.trace({ action: 'skip', cronStr, cronTime, key }),
);

crons.create(context)('update-every-30-minutes', '*/30 * * * *', () =>
  refreshMostPopular(),
);

const logAndQuit = (x) => {
  get(context, RUNTIME_LOGGER).error(x);

  process.exit(1);
};

fsp
  .mkdir(tmpdir)
  .then(() => express(context))
  .catch(logAndQuit);
