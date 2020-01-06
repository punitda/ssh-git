const { app } = require('electron');

const window = require('./window');
const helpers = require('./helpers');
const ipc = require('./ipc');
const updater = require('./updater');

const { initSentry, catchGlobalErrors } = require('../lib/crash-reporter');
const isDev = require('../lib/electron-is-dev');

const { initAnalytics } = require('./analytics');

function init() {
  app.setName('ssh-git');

  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
    return;
  }

  app.on('second-instance', (event, argv, _workingDir) => {
    const mainWindow = window.getMainWindow();
    if (mainWindow) {
      helpers.showWindow(mainWindow);
    }
    app.emit('open-url', event, argv.pop() || '');
  });

  app.on('ready', () => {
    helpers.registerAppSchema();
    window.createWindow();
    ipc.register();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', (_event, hasVisibleWindows) => {
    if (!hasVisibleWindows) {
      try {
        window.createWindow();
      } catch (error) {
        console.error(error);
      }
    }
  });

  // MacOS only(for handling deeplinks)
  app.on('open-url', (event, url) => {
    event.preventDefault();
    helpers.handleAppURL(url, window.getMainWindow(), ipc.getGithubConfig());
  });

  initSentry();
  catchGlobalErrors();

  // Check if app update is available after 10 secs
  if (!isDev) {
    setTimeout(() => updater.init(), 10 * 1000);
    initAnalytics(); // initialize analytics only in prod
  }
}

init(); // this is where it all starts
