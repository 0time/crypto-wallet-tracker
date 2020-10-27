const checkCronTime = require('./check-cron-time');
const { get, set } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONTEXT_CRON, CONTEXT_CRON_INTERVAL, RUNTIME_LOGGER },
} = require('../constants');
const on = require('./on');

const getCronTime = () => {
  const now = new Date().valueOf();

  return now - (now % 60000);
};

module.exports = (context) => {
  const crons = get(context, CONTEXT_CRON);
  const logger = get(context, RUNTIME_LOGGER);
  const interval = get(context, CONTEXT_CRON_INTERVAL, 30000);

  on.emit('debug', `setting up interval ${JSON.stringify(interval)}`);

  return setInterval(
    () => {
      on.emit(
        'debug',
        `checking crons -- ${Object.keys(crons).length} to check`,
      );

      return Object.keys(crons).forEach((key) => {
        const cron = crons[key];
        const cronStr = get(cron, 'cronStr');
        const cronTime = getCronTime();
        const lastExecuted = get(cron, 'lastExecuted', 0);

        if (checkCronTime(cronTime, cronStr) && lastExecuted !== cronTime) {
          const cronFn = get(cron, 'fn');

          on.emit('execute', key, cronStr, cronTime);

          try {
            cronFn();
          } catch (err) {
            err.message = `crons[${key}] error: ${err.message}`;
            logger.error(err);
          }

          set(cron, 'lastExecuted', cronTime);
        } else {
          on.emit('skip', key, cronStr, cronTime);
        }
      });
    },
    // every 30 seconds
    interval,
  );
};
