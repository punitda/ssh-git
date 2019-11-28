const path = require('path');
const { app, shell, Menu, BrowserWindow } = require('electron');
const isDev = require('../lib/electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      devTools: isDev ? true : false,
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
  setAppMenu();
}

function setAppMenu() {
  const isMac = process.platform === 'darwin';
  const CHANGELOG_BASE_URL = 'https://ssh-git.com/changelog';

  const template = [
    // App menu
    ...(isMac
      ? [
          {
            label: app.name,
            submenu: [
              { role: 'about' },
              {
                label: 'Changelog',
                click: function(_menuItem, window, __e) {
                  if (!window || !window.webContents) {
                    return;
                  }
                  shell.openExternal(CHANGELOG_BASE_URL);
                },
              },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideothers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' },
            ],
          },
        ]
      : []),
    // File menu
    {
      label: 'File',
      submenu: [isMac ? { role: 'close' } : { role: 'quit' }],
    },
    // Edit menu
    {
      label: 'Edit',
      submenu: [{ role: 'copy' }, { role: 'paste' }],
    },
    // View menu
    {
      label: 'View',
      submenu: [
        ...(isDev
          ? [
              { role: 'reload' },
              { role: 'forcereload' },
              { role: 'toggledevtools' },
              { type: 'separator' },
            ]
          : []),
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [
              { type: 'separator' },
              { role: 'front' },
              { type: 'separator' },
              { role: 'window' },
            ]
          : [{ role: 'close' }]),
      ],
    },
    // Help menu
    {
      label: 'Help',
      role: 'help',
      submenu: [
        ...(isMac
          ? [
              {
                label: 'Learn More',
                click: () => {
                  shell.openExternal('https://ssh-git.com');
                },
              },
            ]
          : [
              {
                label: 'Learn More',
                click: () => {
                  shell.openExternal('https://ssh-git.com');
                },
              },
              {
                label: 'Changelog',
                click: function(_menuItem, window, __e) {
                  if (!window || !window.webContents) {
                    return;
                  }
                  shell.openExternal(CHANGELOG_BASE_URL);
                },
              },
            ]),
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function getMainWindow() {
  return mainWindow;
}

module.exports = {
  createWindow,
  getMainWindow,
};
