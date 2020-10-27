/* eslint-disable no-unused-vars */

const { d, expect, tquire } = deps;

const me = __filename;

d(me, () => {
  let cronStr = null;
  let wExpect = null;

  const everyMinute = (dt = new Date()) =>
    new Array(60)
      .fill(0)
      .map((_, i) => dt.valueOf() - (dt.valueOf() % 3600000) + i * 60000)
      .map((ea) => wExpect(ea, `${ea / 60000} ${new Date(ea)}`));

  const lastYear = (inp = new Date()) => {
    const dt = new Date(inp.valueOf());

    dt.setFullYear(dt.getFullYear() - 1);

    return dt;
  };

  const hour = (desiredHour, inp = new Date()) => {
    const dt = new Date(inp.valueOf());

    dt.setHours(desiredHour);

    return dt;
  };

  const date = (desiredDay, inp = new Date()) => {
    const dt = new Date(inp.valueOf());

    dt.setDate(desiredDay);

    return dt;
  };

  const month = (desiredMonth, inp = new Date()) => {
    const dt = new Date(inp.valueOf());

    dt.setMonth(desiredMonth);

    return dt;
  };

  const subtractUntilDay = (desired) => (inp = new Date()) => {
    const dt = new Date(inp.valueOf());

    for (let i = 0; dt.getDay() !== desired && i < 8; ++i) {
      if (i === 7) throw new Error('what?');

      dt.setDate(dt.getDate() - 1);
    }

    return dt;
  };

  const sunday = subtractUntilDay(0);
  const monday = subtractUntilDay(1);
  const tuesday = subtractUntilDay(2);
  const wednesday = subtractUntilDay(3);
  const thursday = subtractUntilDay(4);
  const friday = subtractUntilDay(5);
  const saturday = subtractUntilDay(6);

  beforeEach(() => {
    wExpect = (cronTime, e) => expect(tquire(me)(cronTime, cronStr), e);
  });

  describe('given a cron string "* * * * *"', () => {
    beforeEach(() => {
      cronStr = '* * * * *';
    });

    it('should work for any time', () =>
      everyMinute()
        .concat(everyMinute(lastYear()))
        .map((ea) => ea.to.equal(true)));
  });

  describe('given a cron string "*/2 * * * *"', () => {
    beforeEach(() => {
      cronStr = '*/2 * * * *';
    });

    it('should work for even minutes', () =>
      everyMinute().map((ea, i) => ea.to.equal(i % 2 === 0)));
  });

  describe('given a cron string "2,4,5 * * * *"', () => {
    beforeEach(() => {
      cronStr = '2,4,5 * * * *';
    });

    it('should work for minutes 2, 4, and 5 only', () =>
      everyMinute().map((ea, i) => ea.to.equal([2, 4, 5].includes(i))));
  });

  describe('given a cron string "* 1,7,9 * * *"', () => {
    beforeEach(() => {
      cronStr = '* 1,7,9 * * *';
    });

    it('should work for hours 1, 7, and 9', () =>
      everyMinute(hour(1))
        .concat(everyMinute(hour(7)))
        .concat(everyMinute(hour(9)))
        .map((ea) => ea.to.equal(true)));

    it('should not work for a different hour', () =>
      everyMinute(hour(13))
        .concat(everyMinute(hour(19)))
        .concat(everyMinute(hour(21)))
        .map((ea) => ea.to.equal(false)));
  });

  describe('given a cron string "* * 5 * *"', () => {
    beforeEach(() => {
      cronStr = '* * 5 * *';
    });

    it('should work for the sixth day of the month', () =>
      everyMinute(date(6)).map((ea) => ea.to.equal(true)));

    it('should not work for the fifth day of the month', () =>
      everyMinute(date(5)).map((ea) => ea.to.equal(false)));
  });

  describe('given a cron string "* * * 3 *"', () => {
    beforeEach(() => {
      cronStr = '* * * 3 *';
    });

    it('should work for April', () =>
      everyMinute(month(3)).map((ea) => ea.to.equal(true)));

    it('should fail for March, May, and August', () =>
      everyMinute(month(2))
        .concat(everyMinute(month(4)))
        .concat(everyMinute(7))
        .map((ea) => ea.to.equal(false)));
  });

  describe('given a cron string "* * * * 2,6"', () => {
    beforeEach(() => {
      cronStr = '* * * * 2,6';
    });

    it('should work on Tuesday and Saturday', () =>
      everyMinute(tuesday())
        .concat(everyMinute(saturday()))
        .map((ea) => ea.to.equal(true)));
  });

  describe('given a cron string "* * * * 7"', () => {
    beforeEach(() => {
      cronStr = '* * * * 7';
    });

    it('should work on Sunday', () =>
      everyMinute(sunday()).map((ea) => ea.to.equal(true)));
  });

  describe('given a cron string "1 1 * * *"', () => {
    beforeEach(() => {
      cronStr = '1 1 * * *';
    });

    it('should work when both minute and hour is one', () =>
      everyMinute(hour(1)).map((ea, i) => ea.to.equal(i === 1)));

    it('should not work when the hour is not one', () =>
      everyMinute(hour(2)).map((ea) => ea.to.equal(false)));
  });

  describe('given a cron string "*/30 * * * *"', () => {
    beforeEach(() => {
      cronStr = '*/30 * * * *';
    });

    it('should work at :30 and :00', () =>
      everyMinute().map((ea, i) => ea.to.equal([0, 30].includes(i))));
  });
});
