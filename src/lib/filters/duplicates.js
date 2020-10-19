module.exports = (each, i, array) =>
  !array.find((ea, j) => j < i && each === ea);
