module.exports = (condition, fnIfTrue, fnIfFalse) => (input) =>
  (condition ? fnIfTrue : fnIfFalse)(input);
