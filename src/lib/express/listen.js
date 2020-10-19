const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_SERVER_OPTIONS, RUNTIME_APP, RUNTIME_PROMISE },
} = require('../constants');

module.exports = (context) => {
  const promise = get(context, RUNTIME_PROMISE);

  new promise((resolve, reject) => {
    const app = get(context, RUNTIME_APP);
    const options = get(context, CONFIG_SERVER_OPTIONS);

    const server = app.listen(options, (err) =>
      err ? reject(err) : resolve(server),
    );
  });
};
