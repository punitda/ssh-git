const path = require('path');
const { BrowserWindow } = require('electron');
const isDev = require('../lib/electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
    },
    maximizable: false,
    backgroundColor: '#2d3748',
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '/../../build/index.html')}`
  );

  mainWindow.on('closed', () => (mainWindow = null));
}

function getMainWindow() {
  return mainWindow;
}

module.exports = {
  createWindow,
  getMainWindow,
};
