const {isInteger} = require('lodash');

module.exports = inp => (isInteger(inp) ? 1.0 * inp : inp);
