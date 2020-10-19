const { d, expect } = deps;

const me = __filename;

d(me, () => {
  const lib = require('../../../static/lib');

  describe('basis', () => {
    const basis = lib.basis;
    const oldBasis = require('../../../src/lib/basis');

    const expected = 0.5;
    const input = [
      { basisUsd: -2, date: '2020-08-06T:00:00:00.000Z', quantity: -1 },
      { basisUsd: 1, date: '2020-08-05T:00:00:00.000Z', quantity: 2 },
    ];

    it('should do it right', () => expect(basis(input)).to.equal(expected));

    it('should do it right, too', () =>
      expect(oldBasis(input)).to.equal(expected));
  });
});
