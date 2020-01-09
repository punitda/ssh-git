const { autoUpdater, shell } = require('electron');

const { web_base_url } = require('../lib/config');

const { VersionStore: store } = require('./store');
const { createNotification } = require('./notification');
const dialog = require('./dialog');

const request = require('../lib/http');
const packageJSON = require('../../package.json');

const APP_VERSION = packageJSON.version;
const APP_NAME = packageJSON.name;

const UPDATE_BASE_URL = `${web_base_url}/api`;
const AUTO_UPDATE_URL = `${UPDATE_BASE_URL}/check-updates?version=${APP_VERSION}&platform=${process.platform}`;

const { trackEvent } = require('./analytics');

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
      `/check-updates?version=${APP_VERSION}&platform=${process.platform}`,
      'GET'
    );
    if (response.status === 200) {
      const { version, url } = response.data;

      const skippedVersions = store.get('skipVersions');
      if (!skippedVersions.includes(version)) {
        const result = await dialog.showUpdateDialog(APP_NAME, version);
        if (result === 1) {
          store.set('skipVersions', [...skippedVersions, version]);
          trackEvent('update-linux', `skip-${version}`);
        } else {
          shell.openExternal(url); // Open download url
          trackEvent('update-linux', 'download-url-opened');
        }
      }
    } else if (response.status === 204) {
      console.log(`No new update available`);
      trackEvent('update-linux', 'no-update-available');
    } else {
      console.log(`Unexpected status code received : ${response.statusCode}`);
      trackEvent(
        'update-linux',
        `incorrect-status-code-${response.statusCode}`
      );
    }
  } catch (error) {
    console.log(`check-updates api failed: ${error.message}`);
    trackEvent('update-linux-error', error.message);
  }
}

// AutoUpdater in Mac using "Squirrel.Mac" to handle auto updates for us.
// We just tell it our  api url using `setFeedUrl()`.
function initMac() {
  autoUpdater.on('error', err => {
    console.log(`Update error: ${err.message}`);
    trackEvent('auto-update-error', err.message);
  });

  autoUpdater.on('checking-for-update', () => {
    console.log(`checking for update`);
    trackEvent('auto-update-checking', 'checking...');
  });

  autoUpdater.on('update-available', () => {
    console.log('Update available');
    trackEvent('auto-update-available', 'yes');
  });

  autoUpdater.on('update-not-available', () => {
    console.log('No update available');
    trackEvent('auto-update-not-available', 'yes');
  });

  autoUpdater.on(
    'update-downloaded',
    (_e, _releaseNotes, releaseName, _releaseDate, updateUrl) => {
      console.log(`Update downloaded : ${releaseName} : ${updateUrl}`);
      trackEvent('auto-update-downloaded', releaseName);
      setTimeout(() => showRestartNotification(releaseName), 10 * 1000); // Wait for 10 sec before showing update notification
    }
  );

  autoUpdater.setFeedURL({ url: AUTO_UPDATE_URL });
  autoUpdater.checkForUpdates();
}

function showRestartNotification(releaseName) {
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
