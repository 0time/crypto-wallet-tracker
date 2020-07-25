const {expect} = require('chai');
const basis = require('../../lib/basis');

let i = 0;

const buy = (quantity, basisUsd) => ({
  basisUsd,
  quantity,
});

const sell = (x, y) => buy(-x, -y);

it('should calculate right', () => {
  const example = [buy(100, 100), sell(50, 100)];

  expect(basis(example)).to.equal(50);
});

it('should calculate right', () => {
  const example = [buy(100, 100), sell(200, 100)];

  expect(basis(example)).to.equal(0);
});

it('should calculate right', () => {
  const example = [buy(100, 100), sell(10, 100), sell(15, 100)];

  expect(basis(example)).to.equal(75);
});

it('should calculate right', () => {
  const example = [buy(100, 100), sell(10, 100), sell(15, 100), sell(45, 100)];

  expect(basis(example)).to.equal(30);
});

it('should work with deep keys', () => {
  const config = {
    basisField: 'test.basisUsd',
    quantityField: 'test.quantity',
    sortField: 'test.date',
  };

  const example = [buy(100, 100), sell(50, 100)].map(test => ({test}));

  expect(basis(example, config)).to.equal(50);
});
