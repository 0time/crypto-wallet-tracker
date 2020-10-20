/**
 * I hate this, this was a horrible idea
 *
 * I should have just used nock
 */

const { get, has, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_SOURCE_URL, RUNTIME_PROMISE },
} = require('../../../src/lib/constants');
const listFilesSync = require('@0ti.me/index-generator/src/lib/list-files-sync');

const getBaseUrl = (url) => url.split('?')[0];

const map = listFilesSync({
  directory: __dirname,
  filesMatchingRegex: '/index.js$',
  ignoreSelf: true,
  outputFilePath: __filename,
}).reduce((acc, ea) => {
  const key = ea.replace(__dirname, '').replace(new RegExp('/index[^/]*$'), '');

  return set(acc, key, require(ea));
}, {});

const simpleParseQuery = (url) =>
  url
    .split('?')[1]
    .split('&')
    .map((each) => each.split('='))
    .reduce((acc, [key, val]) => set(acc, key, val), {});

module.exports = (context) => {
  const promise = get(context, RUNTIME_PROMISE);
  const configUrl = get(context, CONFIG_SOURCE_URL);

  return (options) =>
    Promise.resolve()
      .then(() => {
        const method = get(options, 'method');
        const url = get(options, 'url');
        const query = simpleParseQuery(url);
        const baseUrl = getBaseUrl(url);
        const expectedDomainPart = configUrl;
        const key = baseUrl.replace(expectedDomainPart, '');

        if (method !== 'get') {
          return promise.reject(new Error(`unsupported method '${method}'`));
        }

        if (!has(map, key)) {
          return promise.reject(new Error(`unsupported route '${key}'`));
        }

        set(options, '_mock', {
          baseUrl,
          expectedDomainPart,
          key,
          method,
          query,
          url,
        });

        return map[key](context, options);
      })
      // simulate axios wrapping the data object in the full response
      .then((data) => ({ data }));
};

module.exports.routeList = Object.keys(map);
