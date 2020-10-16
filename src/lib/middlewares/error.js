const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP },
} = require('../constants');

module.exports = (context) => {
  const app = get(context, RUNTIME_APP);

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    context.logger.error(
      JSON.stringify({
        err: err.message,
        headersSent: res.headersSent,
        stack: err.stack.split('\n'),
        url: req.originalUrl,
      }),
    );

    if (!res.headersSent) {
      res.status(500).json({ message: 'INTERNAL SERVER ERROR' });
    }
  });

  return context;
};
