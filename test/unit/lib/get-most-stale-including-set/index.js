const {
  JSON_SELECTORS: { CONFIG_SOURCE_LIMIT, RUNTIME_QUERY, RUNTIME_PROMISE },
} = require('../../../../src/lib/constants');
const { set } = require('@0ti.me/tiny-pfp');

const {
  bluebird,
  d,
  expect,
  sinon: { stub },
  tquire,
  uuid,
} = deps;

const me = __filename;

d(me, () => {
  let accumulatedExpectations = null;
  let checkExpectations = null;
  let context = null;
  let getMostStaleIncludingSet = null;
  let query = null;
  let rows = null;
  let symbol1 = null;
  let symbol2 = null;
  let symbols = null;

  beforeEach(() => {
    context = {};

    symbol1 = `symbol-${uuid()}`;
    symbol2 = `symbol-${uuid()}`;

    rows = [{ symbol: symbol1 }];

    query = stub().usingPromise(bluebird).resolves({ rows });

    set(context, CONFIG_SOURCE_LIMIT, 1);
    set(context, RUNTIME_QUERY, query);
    set(context, RUNTIME_PROMISE, bluebird);

    accumulatedExpectations = [];

    checkExpectations = (result) => {
      accumulatedExpectations.forEach((fn) => fn(result));

      return result;
    };

    getMostStaleIncludingSet = () =>
      bluebird
        .resolve()
        .then(() => tquire(me)(context)(symbols))
        .then(checkExpectations);
  });

  describe('given no symbols', () => {
    beforeEach(() => {
      symbols = [];
    });

    it('should end up with just symbol1', () =>
      expect(
        getMostStaleIncludingSet(),
      ).to.eventually.be.fulfilled.and.deep.equal([symbol1]));
  });

  describe('given a set', () => {
    beforeEach(() => {
      symbols = [symbol2];
    });

    it('should prioritize the symbols in that set', () =>
      expect(
        getMostStaleIncludingSet(),
      ).to.eventually.be.fulfilled.and.deep.equal([symbol2]));
  });

  describe('given a limit of two', () => {
    beforeEach(() => {
      set(context, CONFIG_SOURCE_LIMIT, 2);
    });

    describe('and a set of one, both should appear', () => {
      beforeEach(() => {
        symbols = [symbol2];
      });

      it('should prioritize symbol2 over symbol1', () =>
        expect(
          getMostStaleIncludingSet(),
        ).to.eventually.be.fulfilled.and.deep.equal([symbol2, symbol1]));
    });

    describe('and a set and a row which are duplicates of each other', () => {
      beforeEach(() => {
        symbols = [symbol1];
      });

      it('should return a set containing just the one symbol', () =>
        expect(
          getMostStaleIncludingSet(),
        ).to.eventually.be.fulfilled.and.deep.equal([symbol1]));
    });

    describe('and a set of two', () => {
      beforeEach(() => {
        symbols = [symbol2, symbol1];
      });

      describe('and both symbols later in the rows', () => {
        beforeEach(() => {
          rows = [
            { symbol: uuid() },
            { symbol: uuid() },
            { symbol: symbol1 },
            { symbol: symbol2 },
          ];

          query = stub().usingPromise(bluebird).resolves({ rows });

          set(context, RUNTIME_QUERY, query);
        });

        it('should return those two', () =>
          expect(
            getMostStaleIncludingSet(),
          ).to.eventually.be.fulfilled.and.deep.equal([symbol2, symbol1]));
      });
    });
  });

  describe('given a limit that is not a number', () => {
    [
      [null, 'null'],
      [undefined, 'undefined'],
      [{}, 'object'],
      [() => ({}), 'function'],
      ['string', 'string'],
    ].forEach(([limit, type]) => {
      beforeEach(() => {
        // Since we're erroring, no accumulated expectations
        accumulatedExpectations = [];
        set(context, CONFIG_SOURCE_LIMIT, limit);
      });

      describe(`but instead a ${type}`, () =>
        it('should no throw', () =>
          expect(getMostStaleIncludingSet()).to.eventually.be.rejected));
    });
  });
});
