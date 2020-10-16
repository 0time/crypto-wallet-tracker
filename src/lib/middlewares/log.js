const { pick } = require('@0ti.me/tiny-pfp');

module.exports = (context) => (req, res, next) => {
  context.logger.info(pick(req, ['originalUrl']));

  next();
};
