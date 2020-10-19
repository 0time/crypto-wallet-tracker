const express = require('express');
const { get } = require('@0ti.me/tiny-pfp');
const {
  JSON_SELECTORS: { RUNTIME_APP },
} = require('../constants');

module.exports = (context) => {
  const app = get(context, RUNTIME_APP);

  app.use(express.static('static'));

  return context;
};
