const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('./electron-is-dev');
const parseAppURL = require('../lib/parse-app-url');
const requestGithubAccessToken = require('./api');
const { generateKey } = require('../lib/core');

let mainWindow; //reference to our mainWindow.
let githubConfig = {}; //workaround to store github config because electron-builder doesn't works with .env files.
const preloadScriptPath = path.join(__dirname, 'preload.js');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      preload: preloadScriptPath,
    },
    maximizable: false,
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '/../../build/index.html')}`
  );

  mainWindow.on('closed', () => (mainWindow = null));
}

function setUpListeners() {
  ipcMain.on('open-external', (_event, { path }) => {
    shell.openExternal(path);
  });

  ipcMain.on('github-config', (_event, config) => {
    githubConfig = config;
  });

  ipcMain.on('start-generating-keys', async (event, config) => {
    try {
      const result = await generateKey(config, event);
      if (result === 0) {
        event.reply('generated-keys-result', { success: true, error: null });
      }
    } catch (error) {
      event.reply('generated-keys-result', { success: false, error });
    }
  });
}

function setAsDefaultProtocolClient(protocol) {
  // TODO: we need to add windows specific logic over here to set up default protocol
  app.setAsDefaultProtocolClient(protocol);
}

app.on('ready', () => {
  setAsDefaultProtocolClient('ssh-git');
  createWindow();
  setUpListeners();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('will-finish-launching', () => {
  // MacOS only
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAppURL(url);
  });
});

async function handleAppURL(callbackurl) {
  const authState = parseAppURL(callbackurl);
  let { code = null, state = null, token = null } = authState;

  if (authState) {
    try {
      if (code) {
        // This means it is github callbackurl and we need to first obtain "access_token" value.
        token = await requestGithubAccessToken(code, githubConfig);

        if (!token) {
          showError(`Something went wrong. Please try again`);
          return;
        }
      }
      mainWindow.focus();
      mainWindow.webContents.send('start-auth', {
        state,
        token,
      });
    } catch (error) {
      showError(`Something went wrong. Please try again. ${error}`);
    }
  } else {
    showError(
      `Something went wrong. We couldn't verify the validity of the request. Please try again.`
    );
  }
}

function showError(message) {
  mainWindow.focus();
  mainWindow.webContents.send('auth-error', message);
}
