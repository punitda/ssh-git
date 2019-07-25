const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('./electron-is-dev');
const parseAppURL = require('../lib/parse-app-url');

let mainWindow;

const preloadScriptPath = path.join(__dirname, 'preload.js');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      preload: preloadScriptPath,
    },
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

function handleAppURL(url) {
  const authState = parseAppURL(url);
  if (authState) {
    const { code = null, state = null, token = null } = authState;
    mainWindow.focus();
    mainWindow.webContents.send('start-auth', {
      code,
      state,
      token,
    });
  } else {
    mainWindow.focus();
    mainWindow.webContents.send(
      'auth-error',
      `Sorry, we couldn't fetch details. Please try again`
    );
  }
}
