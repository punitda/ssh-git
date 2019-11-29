const { shell } = require('electron');
const { init, captureException } = require('@sentry/electron');
const unhandled = require('electron-unhandled');

const { sentry } = require('./config');
const { openNewGithubIssueUrl } = require('./util');
const isDev = require('../lib/electron-is-dev');

function initSentry() {
  if (!isDev) {
    init({
      dsn: sentry.dsn,
    });
  }
}

function catchGlobalErrors() {
  unhandled({
    logger: error => {
      captureException(error);
    },
    showDialog: true,
    reportButton: error => {
      const githubIssueUrl = openNewGithubIssueUrl({
        user: 'punitda',
        repo: 'ssh-git',
        body: `\`\`\`\n${error.stack}\n\`\`\`\n\n`,
      });
      shell.openExternal(githubIssueUrl);
    },
  });
}

module.exports = {
  initSentry,
  catchGlobalErrors,
};
