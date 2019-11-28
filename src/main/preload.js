window.ipc = require('electron-better-ipc').ipcRenderer; // Using electron-better-ipc for better ipc comm api.

// Init sentry for renderer process
const initSentry = require('../lib/crash-reporter');
initSentry();
