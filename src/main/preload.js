window.ipc = require('electron-better-ipc').ipcRenderer; // Using electron-better-ipc for better ipc comm api.

// Init sentry for renderer process and catch global errors on window
const { initSentry, catchGlobalErrors } = require('../lib/crash-reporter');
initSentry();
catchGlobalErrors();
