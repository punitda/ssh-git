// built-in
const path = require('path');

const { app, BrowserWindow } = require('electron');
const { registerListeners } = require('./ipc.js');

// internal
const isDev = require('./electron-is-dev');

let mainWindow; //reference to our mainWindow.
const preloadScriptPath = path.join(__dirname, 'preload.js');

const { handleAppURL } = require('./core');
/**
 * Creating main window and loading the contents in it.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      preload: preloadScriptPath,
    },
    maximizable: false,
    backgroundColor: '#e2e8f0',
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '/../../build/index.html')}`
  );

  mainWindow.on('closed', () => (mainWindow = null));
}

/**
 * Electron Application lifecycle listeners.
 */
app.on('ready', () => {
  setAsDefaultProtocolClient('ssh-git');
  createWindow();
  registerListeners();
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

/**
 * Need to set default protocol to which app could listen to.
 * It is set to `ssh-git` so that app can handle all deeplinks of type
 * `ssh-git://` clicked/redirected from our browser
 * @param {*} protocol - default protocol to handle `ssh-git://` links
 */
function setAsDefaultProtocolClient(protocol) {
  // TODO: we need to add windows specific logic over here to set up default protocol
  app.setAsDefaultProtocolClient(protocol);
}

function getMainWindow() {
  return mainWindow;
}

module.exports = { getMainWindow };
