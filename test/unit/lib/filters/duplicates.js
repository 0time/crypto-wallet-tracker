const { d, expect, tquire } = deps;

const me = __filename;

d(me, () => {
  let duplicatesReversed = null;
  let input = null;
  let wrap = null;

  beforeEach(() => {
    input = [];

    duplicatesReversed = tquire(me);

    wrap = (expected) =>
      expect(input.filter(duplicatesReversed)).to.deep.equal(expected);
  });

  describe('given an empty list', () =>
    it('should return an empty list', () => wrap([])));

  describe('given a list with duplicates', () => {
    beforeEach(() => {
      input.push(1);
      input.push(1);
      input.push(2);
      input.push(1);
    });

    it('should only keep the first for each duplicate', () => wrap([1, 2]));
  });

  describe('given a list without duplicates', () => {
    beforeEach(() => {
      for (let i = 0; i < 100; ++i) {
        input.push(i);
      }
    });

    it('should be an exact copy', () => wrap(input));
  });
});
