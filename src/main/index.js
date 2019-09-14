const { app } = require('electron');

const window = require('./window');
const helpers = require('./helpers');
const ipc = require('./ipc');

function init() {
  app.setName('ssh-git');

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

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    helpers.handleAppURL(url, window.getMainWindow(), ipc.getGithubConfig());
  });
}

init(); // this is where it all starts
