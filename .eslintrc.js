const eslintrcJs = require('@0ti.me/test-deps/configuration-templates/eslintrc.js');

module.exports = Object.assign(
  {
    ignorePatterns: ['jquery*.js', 'bootstrap*.js'],
    overrides: [
      {
        files: ['static/*.js'],
        env: { browser: true, node: false, jquery: true },
        rules: { 'no-unused-vars': 'warn', 'no-console': 'off' },
      },
    ],
  },
  eslintrcJs,
);
