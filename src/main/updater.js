const { autoUpdater, shell } = require('electron');

const store = require('./store');
const { createNotification } = require('./notification');
const dialog = require('./dialog');

const request = require('../lib/http');
const packageJSON = require('../../package.json');

const APP_VERSION = packageJSON.version;
const APP_NAME = packageJSON.name;

const UPDATE_BASE_URL = 'https://ssh-git.com/api';
const AUTO_UPDATE_URL = `${UPDATE_BASE_URL}/api/check-updates?version=${APP_VERSION}&platform=${process.platform}`;

function init() {
  if (process.platform === 'linux') {
    initLinux();
  } else {
    initMac();
  }
}

// Electron auto-updater does not support Linux.
// So, we do a get request and based on response show
// notification to user telling them that update is available.
async function initLinux() {
  try {
    const response = await request(
      UPDATE_BASE_URL,
      `check-updates?version=${APP_VERSION}&platform=${process.platform}`,
      'GET'
    );
    if (response.statusCode === 200) {
      const { version, url } = response;

      const skippedVersions = store.get('skipVersions');
      if (!skippedVersions.includes(version)) {
        const result = await dialog.showUpdateDialog(APP_NAME, version);
        if (result === 1) {
          store.set('skipVersions', [...skippedVersions, version]);
        } else {
          shell.openExternal(url); // Open download url
        }
      }
    } else if (response.statusCode === 204) {
      console.log(`No new update available`);
    } else {
      console.log(`Unexpected status code received : ${response.statusCode}`);
    }
  } catch (error) {
    console.log(`check-updates api failed: ${error.message}`);
  }
}

// AutoUpdater in Mac using "Squirrel.Mac" to handle auto updates for us.
// We just tell it our  api url using `setFeedUrl()`.
function initMac() {
  autoUpdater.on('error', err => {
    console.log(`Update error: ${err.message}`);
  });

  autoUpdater.on('checking-for-update', () => {
    console.log(`checking for update`);
  });

  autoUpdater.on('update-available', () => {
    console.log('Update available');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available');
  });

  autoUpdater.on(
    'update-downloaded',
    (_e, _releaseNotes, releaseName, _releaseDate, updateUrl) => {
      console.log(`Update downloaded : ${releaseName} : ${updateUrl}`);
      setTimeout(() => showRestartNotification(), 10 * 1000); // Wait for 10 sec before showing update notification
    }
  );

  autoUpdater.setFeedURL({ url: AUTO_UPDATE_URL });
  autoUpdater.checkForUpdates();
}

function showRestartNotification() {
  let actions = [
    {
      type: 'button',
      text: 'Restart App',
    },
  ];
  const notification = createNotification(
    (title = '🚀 New version available'),
    (body = `A new version(${releaseName}) of ${APP_NAME} has been downloaded. Restart the app to get the update.`),
    (actions = actions)
  );
  notification.show();

  notification.on('click', _event => autoUpdater.quitAndInstall());
  notification.on('action', (_event, _index) => autoUpdater.quitAndInstall());
}

module.exports = { init };
