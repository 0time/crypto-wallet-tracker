const fs = require('fs');
const fsp = require('fs/promises');
const {get} = require('lodash');
const hapi = require('hapi');
const Joi = require('joi');
const os = require('os');
const path = require('path');
const util = require('util');

const config = require('./config');
const routes = require('./routes');
const update = require('./lib/update');

const dt = () => new Date().toISOString();

const tmpdir = path.resolve(os.tmpdir(), dt());
const file = path.resolve(tmpdir, 'cmc.html');

// This has to be a directory
const rmrf = dir => {
  const files = path.readdirSync(dir);

  files.forEach(file => {
    if (fs.statSync(file).isDirectory()) {
      rmrf(file);
    } else {
      fs.unlinkSync(file);
    }
  });

  fs.rmdirSync(file);
};

process.on('SIGINT', () => {
  console.error('SIGINT received');

  if (fs.existsSync(tmpdir)) {
    console.error('deleting dir ' + tmpdir);

    fs.readdirSync(tmpdir);
  }

  process.exit(0);
});

const context = {
  config,
  file,
  logger: ['log', 'info', 'error', 'warn', 'debug', 'trace'].reduce(
    (acc, key) =>
      Object.assign({}, acc, {
        [key]: (...args) => console.error(`${key} ${dt()}: `, ...args),
      }),
    {},
  ),
  tmpdir,
};

const server = hapi.server({
  port: get(config, 'server.port', 3000),
});

const init = async () => {
  await server.register({
    plugin: require('inert'),
  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    handler: {
      directory: {
        path: './',
      },
    },
    options: {
      validate: {
        query: (value, options) => {
          if (
            false &&
            !get(config, 'access.ipWhitelist', []).includes(
              options.context.headers['x-forwarded-for'],
            )
          ) {
            context.logger.info(util.inspect({value, options}, {depth: 10}));

            throw new Error('bla');
          }
        },
      },
    },
  });

  server.route(routes.refresh(context));

  await server.start();

  context.logger.info(`Server running at: ${server.info.uri}`);
};

fsp
  .mkdir(tmpdir)
  .then(() => init())
  .then(() => update(context)());
