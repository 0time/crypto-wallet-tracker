const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { CONFIG_SERVER_OPTIONS, RUNTIME_APP },
} = require('../constants');

module.exports = (context) =>
  new Promise((resolve, reject) => {
    const app = get(context, RUNTIME_APP);
    const options = get(context, CONFIG_SERVER_OPTIONS);

    const server = app.listen(options, (err) =>
      err ? reject(err) : resolve(server),
    );
  });
