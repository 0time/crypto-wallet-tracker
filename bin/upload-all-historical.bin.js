#!/usr/bin/env node
/* eslint-disable */

const fse = require('fs-extra');
const { isEmpty } = require('lodash');
const minimist = require('minimist');
const path = require('path');
const Promise = require('bluebird');
const uploadElasticsearch = require('../lib/upload-elasticsearch');

const historicalDir = path.join(__dirname, '..', 'historical');

const join = (...args) => x => path.join(...args, x);

const context = {
  logger: ['log', 'info', 'error', 'warn', 'debug', 'trace'].reduce(
    (acc, key) => Object.assign({}, acc, { [key]: console.error }),
    {},
  ),
};

const throttlePromiseAll = (count, cb) => inp =>
  inp
    .reduce((acc, each) => {
      const last = acc[acc.length - 1];

      if (acc.length === 0 || (last && last.length >= count)) {
        acc.push([each]);
      } else {
        last.push(each);
      }

      return acc;
    }, [])
    .reduce(
      (prom, setOfCount) =>
        prom
          .then(() => Promise.all(setOfCount.map(cb)))
          .then(result =>
            context.logger.debug(
              `Finished ${result && result.length} promises`,
            ),
          ),
      Promise.resolve(),
    );

const uploadAllHistorical = args =>
  fse
    .readdir(path.join(historicalDir))
    .then(files =>
      files
        .filter(name => name.endsWith('.json'))
        .map(join(historicalDir))
        .map(require),
    )
    .then(throttlePromiseAll(1, uploadElasticsearch(context)));

if (require.main === module) {
  Promise.try(() => uploadAllHistorical(process.argv))
    .then(result => isEmpty(result) || console.log(result))
    .catch(err => {
      console.error(err);

      return -1;
    })
    .then(process.exit);
} else {
  module.exports = uploadAllHistorical;
}
