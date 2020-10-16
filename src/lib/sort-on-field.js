module.exports = (field, desc = false) => (a, b) => {
  const multiplier = desc ? -1 : 1;

  if (a[field] < b[field]) {
    return multiplier * -1;
  }

  if (a[field] > b[field]) {
    return multiplier * 1;
  }

  return 0;
};
