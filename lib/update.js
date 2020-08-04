const fse = require('fs-extra');
const {get} = require('lodash');
const os = require('os');
const path = require('path');
const Promise = require('bluebird');
const rp = require('request-promise');

const nextInt = require('./next-int');
const parse = require('./parse');

let next = new Date(Date.now() - 100000);
let theTimeout = null;

const setTheTimeout = (fn, time) => {
  clearTimeout(theTimeout);

  theTimeout = setTimeout(fn, time);

  return theTimeout;
};

const update = context => () => {
  if (new Date(Date.now()) < next) {
    setTheTimeout(update(context), 2000);

    return Promise.resolve();
  } else {
    return Promise.resolve({
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
      .tap(({body}) =>
        fse.writeFile(`${context.file}.${new Date().toISOString()}`, body),
      )
      .then(({body}) => fse.writeFile(context.file, body))
      .then(() => nextInt(300000, 30000))
      .then(next => {
        context.logger.info(`Updating again in ${next} milliseconds`);

        return {
          createdAt: new Date(),
          file: context.file,
          next,
          nextTime: new Date(Date.now() + next + 5000),
        };
      })
      .tap(parse(context))
      .then(result => (next = new Date(Date.now() + result.next)))
      .then(() => setTheTimeout(update(context), 2000))
      .catch(err => {
        context.logger.error(87, err);

        setTheTimeout(update(context), 2000);
      });
  }
};

module.exports = update;
