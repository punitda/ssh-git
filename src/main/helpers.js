const { app } = require('electron');

const dialog = require('./dialog');

const parseAppURL = require('../lib/parse-app-url');
const requestGithubAccessToken = require('../lib/github-api');

const { ipcMain: ipc } = require('electron-better-ipc');

const APP_SCHEMA = 'ssh-git';

function registerAppSchema() {
  app.setAsDefaultProtocolClient(APP_SCHEMA);
}

function showWindow(window) {
  if (window.isMinimized()) window.restore();
  if (window.isVisible()) window.focus();
  window.show();
}

async function handleAppURL(callbackUrl, mainWindow) {
  showWindow(mainWindow);
  ipc.callFocusedRenderer('connecting-account');

  const authState = parseAppURL(callbackUrl);
  if (!authState) {
    showError(
      "Invalid redirect uri received. We couldn't verify the validity of the request. Please try again"
    );
    return;
  }

  const { code = null, state: client_state = null, token = null } = authState;

  // Bitbucket and Gitlab will give back token directly
  if (token) {
    const result = await ipc.callFocusedRenderer('connect-account', {
      state: client_state,
      token,
    });

    if (!result) {
      dialog.showErrorDialog(
        "We couldn't verify the validity of the request. Please try again."
      );
    }
  }
  // Github Route : Using code to get back "access_token" in exchange from our serverless function.
  else if (code) {
    try {
      const {
        access_token: token = null,
        state = null,
      } = await requestGithubAccessToken(code, client_state);

      if (!(token && state)) {
        showError('We could verify the validity of request. Please try again');
        return;
      }

      const result = await ipc.callFocusedRenderer('connect-account', {
        state,
        token,
      });

      if (!result) {
        dialog.showErrorDialog(
          "We couldn't verify the validity of the request. Please try again."
        );
      }
    } catch (error) {
      showError(error.message);
    }
  }
}

async function showError(error_message) {
  dialog.showErrorDialog(error_message);
  await ipc.callFocusedRenderer('connect-account', { state: null });
}

module.exports = { registerAppSchema, showWindow, handleAppURL };
