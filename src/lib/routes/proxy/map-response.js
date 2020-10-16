const { get } = require('@0ti.me/tiny-pfp');

module.exports = (response) => ({ json: get(response, 'data.data') });
