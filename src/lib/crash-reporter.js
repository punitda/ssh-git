const { init } = require('@sentry/electron');

const { sentry } = require('./config');
const isDev = require('../lib/electron-is-dev');

function initSentry() {
  if (!isDev) {
    init({
      dsn: sentry.dsn,
    });
  }
}

module.exports = initSentry;
