const Promise = require('bluebird');
const update = require('../../lib/update');

module.exports = context => ({
  method: 'POST',
  path: '/refresh',
  handler: () => {
    return Promise.resolve()
      .then(update(context))
      .then(() => JSON.stringify({ status: 'OK' }));
  },
});
