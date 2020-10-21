// English language implementations of logic
const { isDate, isNumber, isString } = require('@0ti.me/tiny-pfp');

module.exports = (input) => ({
  millisecondsElapsedSince: (dt) => {
    let date = dt;
    let milliseconds = input;
    const now = new Date().valueOf();

    if (isString(date) || isNumber(date)) {
      date = new Date(date).valueOf();
    } else if (isDate(date)) {
      date = date.valueOf();
    }

    if (!isNumber(date) || isNaN(date) || date < 0) {
      throw new Error(`invalid date '${JSON.stringify(date)}'`);
    }

    if (isString(milliseconds)) {
      milliseconds = parseInt(input);
    }

    if (!isNumber(milliseconds) || isNaN(milliseconds)) {
      throw new Error(
        `invalid number of milliseconds '${JSON.stringify(milliseconds)}`,
      );
    }

    return now >= date + milliseconds;
  },
});
