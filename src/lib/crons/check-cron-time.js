const checkCronValue = require('./check-cron-value');

const cronStrSplitter = /[ \t]+/g;
const validCronItem = /(^[*]\/[0-9]+$)|(^[*]$)|(^([0-9]{1,2},)*[0-9]{1,2}$)/;

module.exports = (cronTime, cronStr) => {
  const dt = new Date(cronTime);

  const cronStrValues = cronStr.split(cronStrSplitter);
  const relevantData = [
    dt.getMinutes(),
    dt.getHours(),
    dt.getDate() - 1, // Make it zero based like all the others
    dt.getMonth(),
    dt.getDay(),
  ];

  if (cronStrValues.length !== 5) {
    throw new Error(
      `invalid cron str ${cronStr}, ${cronStrValues.length} !== 5`,
    );
  } else if (
    !cronStrValues.reduce(
      (acc, ea) => (acc && validCronItem.test(ea)) || console.error(acc, ea),
      true,
    )
  ) {
    throw new Error(`invalid cron str ${cronStr}`);
  }

  const options = [{}, {}, {}, {}, { mod: 7 }];

  return cronStrValues.reduce(
    (acc, ea, index) =>
      acc && checkCronValue(ea, relevantData[index], options[index]),
    true,
  );
};
