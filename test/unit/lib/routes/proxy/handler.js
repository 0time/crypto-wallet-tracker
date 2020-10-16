const { cloneDeep } = require('lodash');
const {
  JSON_SELECTORS: { RUNTIME_AXIOS, RUNTIME_PROMISE },
} = require('../../../../../src/lib/constants');
const mockCoinMarketCap = require('../../../../lib/mock-coinmarketcap');
const { set } = require('@0ti.me/tiny-pfp');
const stringify = require('../../../../lib/stringify');

const {
  bluebird,
  d,
  expect,
  sinon: { spy },
  tquire,
} = deps;

const me = __filename;

d(me, () => {
  let context = null;
  let handler = null;
  let method = null;
  let next = null;
  let originalUrl = null;
  let req = null;
  let res = null;
  let wrappedAxios = null;

  beforeEach(() => {
    context = {};

    set(context, 'config', cloneDeep(require('config')));
    set(context, RUNTIME_PROMISE, bluebird);

    wrappedAxios = spy(mockCoinMarketCap(context));
    set(context, RUNTIME_AXIOS, wrappedAxios);

    method = 'get';
    originalUrl = '/proxy/v1/cryptocurrency/quotes/latest?symbol=BTC,LTC,NANO';
    req = { method, originalUrl };
    res = null;
    next = spy(({ json }) => json);

    handler = () => tquire(me)(context)(req, res, next);
  });

  it('should proxy the request i want right now', () =>
    handler().then((result) =>
      expect(result, stringify(result)).to.have.nested.property('BTC'),
    ));
});
