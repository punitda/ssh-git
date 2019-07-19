const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const isDev = require('./electron-is-dev');

let mainWindow;

const preloadScriptPath = path.join(__dirname, 'preload.js');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences : {
      nodeIntegration : false,
      preload: preloadScriptPath
    }
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

app.on('ready', () => {
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
