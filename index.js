const config = require('./config');
const fse = require('fs-extra');
const {get} = require('lodash');
const hapi = require('hapi');
const Joi = require('joi');
const os = require('os');
const path = require('path');
const Promise = require('bluebird');
const rp = require('request-promise');
const util = require('util');

const parse = require('./parse');

const dt = () => new Date().toISOString();

const context = {
  config,
  logger: ['log', 'info', 'error', 'warn', 'debug', 'trace'].reduce(
    (acc, key) =>
      Object.assign({}, acc, {
        [key]: (...args) => console.error(`${key} ${dt()}: `, ...args),
      }),
    {},
  ),
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

  await server.start();

  context.logger.info(`Server running at: ${server.info.uri}`);
};

const nextInt = (max, min) => Math.random() * (max - min) + min;

const file = path.resolve(os.tmpdir(), 'cmc.html');

const update = () =>
  Promise.resolve({
    resolveWithFullResponse: true,
    timeout: 60000,
    uri: 'https://coinmarketcap.com',
  })
    .tap(({uri}) => context.logger.info(`querying ${uri}`))
    .then(rp)
    .tap(response =>
      context.logger.info(`received ${get(response, 'statusCode')}`),
    )
    .then(response => {
      if (response.statusCode !== 200) {
        throw new Error(`Unexpected statusCode ${response.statusCode}`);
      }

      return response;
    })
    .tap(({body}) => fse.writeFile(`${file}.${new Date().toISOString()}`, body))
    .then(({body}) => fse.writeFile(file, body))
    .then(() => nextInt(300000, 30000))
    .then(next => {
      context.logger.info(`Updating again in ${next} milliseconds`);

      return {
        createdAt: new Date(),
        file,
        next,
        nextTime: new Date(Date.now() + next + 5000),
      };
    })
    .tap(parse(context))
    .then(({next}) => setTimeout(update, next))
    .catch(err => {
      context.logger.error(87, err);

      setTimeout(update, 2000);
    });

init();

update();
