const { app } = require('electron');

const dialog = require('./dialog');

const parseAppURL = require('../lib/parse-app-url');
const requestGithubAccessToken = require('../lib/github-api');

// constants
const {
  ADD_KEYS_PERMISSION_RESULT_CHANNEL,
  BASIC_INFO_PERMISSION_RESULT_CHANNEL,
} = require('../lib/constants');

const APP_SCHEMA = 'ssh-git';

function registerAppSchema() {
  app.setAsDefaultProtocolClient(APP_SCHEMA);
  if (process.platform === 'linux') {
    installLinux();
  }
}

function installLinux() {
  const fs = require('fs');
  const path = require('path');
  const os = require('os');

  const templatePath = path.join(__dirname, 'ssh-git.desktop');
  let desktopFile = fs.readFileSync(templatePath, 'utf8');

  desktopFile = desktopFile.replace(/\$APP_NAME/g, 'ssh-git');
  desktopFile = desktopFile.replace(
    /\$APP_PATH/g,
    path.dirname(process.execPath)
  );
  desktopFile = desktopFile.replace(/\$EXEC_PATH/g, process.execPath);

  var desktopFilePath = path.join(
    os.homedir(),
    '.local',
    'share',
    'applications',
    'ssh-git.desktop'
  );
  fs.writeFileSync(desktopFilePath, desktopFile);
}

function showWindow(window) {
  if (window.isMinimized()) window.restore();
  if (window.isVisible()) window.focus();
  window.show();
}

async function handleAppURL(callbackUrl, mainWindow, githubConfig = null) {
  const authState = parseAppURL(callbackUrl);
  let { code = null, state = null, token = null } = authState;

  showWindow(mainWindow);

  if (authState) {
    try {
      if (code) {
        // This means it is github callbackUrl and we need to first obtain "access_token" value.
        token = await requestGithubAccessToken(code, githubConfig);
        if (!token) {
          dialog.showErrorDialog(`Something went wrong. Please try again`);
          return;
        }
      }

      if (callbackUrl.includes('basic')) {
        mainWindow.webContents.send(BASIC_INFO_PERMISSION_RESULT_CHANNEL, {
          state,
          token,
        });
      } else if (callbackUrl.includes('admin')) {
        mainWindow.webContents.send(ADD_KEYS_PERMISSION_RESULT_CHANNEL, {
          state,
          token,
        });
      } else {
        throw new Error('Invalid callback url received');
      }
    } catch (error) {
      dialog.showErrorDialog(
        `Something went wrong. Please try again. ${error}`
      );
    }
  } else {
    dialog.showErrorDialog(
      `Something went wrong. We couldn't verify the validity of the request. Please try again.`
    );
  }
}

module.exports = { registerAppSchema, showWindow, handleAppURL };
