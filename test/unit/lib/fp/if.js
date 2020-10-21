const { d, expect, nextInt, tquire } = deps;

const me = __filename;

d(me, () => {
  let condition = null;
  let fpIf = null;
  let ifFalse = null;
  let ifTrue = null;
  let input = null;

  beforeEach(() => {
    condition = null;
    ifTrue = (i) => i + 1;
    ifFalse = (i) => i - 1;
    input = nextInt();

    fpIf = () => tquire(me)(condition, ifTrue, ifFalse)(input);
  });

  it('should execute ifFalse if condition is falsy', () =>
    expect(fpIf()).to.equal(input - 1));

  describe('given condition is truthy', () => {
    beforeEach(() => {
      condition = 'a truthy value';
    });

    it('should execute ifTrue', () => expect(fpIf()).to.equal(input + 1));
  });
  describe('given condition is explicitly true', () => {
    beforeEach(() => {
      condition = true;
    });

    it('should execute ifTrue', () => expect(fpIf()).to.equal(input + 1));
  });

  describe('given condition is explicitly false', () => {
    beforeEach(() => {
      condition = false;
    });

    it('should execute ifFalse', () => expect(fpIf()).to.equal(input - 1));
  });
});
