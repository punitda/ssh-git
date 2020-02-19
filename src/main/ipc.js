const path = require('path');
const os = require('os');
const { shell } = require('electron');
const { ipcMain: ipc } = require('electron-better-ipc');

const { trackScreen, trackEvent } = require('./analytics');

// core methods
const {
  generateKey,
  getPublicKey,
  cloneRepo,
  updateRemoteUrl,
  parseSSHConfigFile,
  doKeyAlreadyExists,
  getRsaFilePath,
} = require('./core');

// dialog wrapper
const dialog = require('./dialog');
const notification = require('./notification');

const isDev = require('../lib/electron-is-dev');
const { importStore, exportStore } = require('./import-export-store');
const { KeyStore } = require('./ElectronStore');

// Register for all ipc channel in the app over here once.
function register() {
  registerIpcForStore();
  registerGeneralIpcs();
  registerIpcForConnectAccountScreen();
  registerIpcForGenerateKeyScreen();
  registerIpcForAddKeyScreen();
  registerIpcForUpdateRemoteScreen();
  if (!isDev) registerIpcForAnalytics();
}

function registerIpcForStore() {
  ipc.answerRenderer('import-store', async () => {
    const storeSnapshot = await importStore();
    return storeSnapshot;
  });

  ipc.answerRenderer('export-store', ({ snapshot }) => {
    if (snapshot.sshKeys && snapshot.sshKeys.length > 0) {
      exportStore(snapshot.sshKeys);
    }
  });

  ipc.answerRenderer('clear-store', () => {
    KeyStore.delete('keyStore');
  });
}

function registerGeneralIpcs() {
  // Listen to request from renderer process to open external links
  ipc.answerRenderer('open-external', async uri => {
    shell.openExternal(uri);
    return;
  });

  // Listen to request from renderer process to open folder
  ipc.answerRenderer('open-folder', async folderPath => {
    shell.openItem(folderPath);
    return;
  });
}

function registerIpcForConnectAccountScreen() {
  ipc.answerRenderer('check-if-linux', async () => {
    return process.platform === 'linux';
  });
}

function registerIpcForGenerateKeyScreen() {
  ipc.answerRenderer(
    'check-key-already-exists',
    async ({ selectedProvider, mode, username }) => {
      const keyAlreadyExists = doKeyAlreadyExists(
        selectedProvider,
        mode,
        username
      );
      return keyAlreadyExists;
    }
  );

  ipc.answerRenderer(
    'ask-to-override-keys',
    async ({ selectedProvider, mode, username }) => {
      let rsaFileName;
      if (mode === 'MULTI') {
        rsaFileName = `${selectedProvider}_${username}_id_rsa`;
      } else {
        rsaFileName = `${selectedProvider}_id_rsa`;
      }
      const userResponse = await dialog.showOverrideKeysDialog(rsaFileName);
      return userResponse === 0 ? true : false;
    }
  );

  // Listen to renderer process and start generating keys based on currently passed `config`.
  ipc.answerRenderer('generate-key', async config => {
    try {
      const result = await generateKey(config);
      const rsaFilePath = getRsaFilePath(config);
      if (result === 0) {
        return {
          rsaFilePath,
          success: true,
          error: null,
        };
      }
    } catch (error) {
      setTimeout(() =>
        dialog.showErrorDialog(
          error.message ? error.message : 'Something went wrong.'
        )
      );
      return { success: false, error };
    }
  });
}

function registerIpcForAddKeyScreen() {
  // Listen to renderer process and send content of public key based on config passed
  ipc.answerRenderer('get-public-key', async data => {
    try {
      const { selectedProvider, mode, username } = data;
      const publicKey = await getPublicKey(selectedProvider, mode, username);
      return publicKey.toString();
    } catch (error) {
      return null;
    }
  });
}

function registerIpcForUpdateRemoteScreen() {
  // Listen to request for selecting folder to which to "clone the repo" or "update remote url" to coming in from "updateRemote" screens
  ipc.answerRenderer('select-git-folder', async () => {
    const filePaths = await dialog.showOpenDirectoryDialog();
    if (filePaths && filePaths.length > 0) return filePaths[0];
  });

  // Listen to request asking for system's desktop folder path coming from "updateRemote" screens
  ipc.answerRenderer('get-system-desktop-path', async () => {
    const desktopFolderPath = path.join(os.homedir(), 'Desktop');
    return desktopFolderPath;
  });

  // Listen to "clone repo" request and clone the repo based on data passed
  ipc.answerRenderer('clone-repo', async data => {
    const {
      selectedProvider,
      username,
      mode,
      repoUrl,
      selectedFolder,
      shallowClone,
    } = data;

    try {
      const { code, repoFolder } = await cloneRepo(
        selectedProvider,
        username,
        mode,
        repoUrl,
        selectedFolder,
        shallowClone
      );

      if (code === 0) {
        notification.sendCloneRepoResultNotification(
          (success = true),
          (error = null),
          repoFolder
        );
        return {
          success: true,
          repoFolder,
          error: null,
        };
      }
    } catch (error) {
      notification.sendCloneRepoResultNotification(
        (success = false),
        (error = {
          message: error.message
            ? error.message
            : 'Something went wrong when cloning repo',
        })
      );
      setTimeout(() =>
        dialog.showErrorDialog(
          error.message
            ? error.message
            : 'Something went wrong when updating remote url :('
        )
      );
      return {
        error: { message: error.message },
        success: false,
      };
    }
  });

  ipc.answerRenderer('update-remote-url', async data => {
    const { selectedProvider, username, repoFolder } = data;

    try {
      const result = await updateRemoteUrl(
        selectedProvider,
        username,
        repoFolder
      );
      if (result === 0) {
        return {
          success: true,
          error: null,
        };
      }
    } catch (error) {
      setTimeout(() =>
        dialog.showErrorDialog(
          error.message
            ? error.message
            : 'Something went wrong when updating remote url of the repo :('
        )
      );
      return {
        error: { message: error.message },
        success: false,
      };
    }
  });

  ipc.answerRenderer('get-ssh-config', async () => {
    try {
      const sshConfig = await parseSSHConfigFile();
      return {
        success: true,
        sshConfig,
        error: null,
      };
    } catch (error) {
      setTimeout(() =>
        dialog.showErrorDialog(
          error.message
            ? error.message
            : 'Something went wrong when parsing ssh config file :('
        )
      );
      return {
        error,
        success: false,
      };
    }
  });
}

function registerIpcForAnalytics() {
  ipc.answerRenderer(
    'track-screen',
    async ({ screenName, appName, appVersion }) => {
      trackScreen(screenName, appName, appVersion);
    }
  );

  ipc.answerRenderer('track-event', async ({ category, action }) => {
    trackEvent(category, action);
  });
}

module.exports = { register };
