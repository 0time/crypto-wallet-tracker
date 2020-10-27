const checkCrons = require('./check-crons');
const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONTEXT_CRON, CONTEXT_CRON_INTERVAL },
} = require('../constants');
const on = require('./on');

module.exports = (context) => {
  if (!get(context, CONTEXT_CRON)) {
    set(context, CONTEXT_CRON, {});
    set(context, CONTEXT_CRON_INTERVAL, checkCrons(context));
  }

  const crons = get(context, CONTEXT_CRON);

  return (key, cronStr, fn) => {
    on.emit('create', key, cronStr);

    if (crons[key]) {
      throw new Error(`Tried to re-create cron for key ${key}`);
    }

    set(crons, key, { cronStr, fn });
  };
};
