const path = require('path');
const os = require('os');
const { shell } = require('electron');
const { ipcMain: ipc } = require('electron-better-ipc');

// core methods
const {
  generateKey,
  getPublicKey,
  cloneRepo,
  updateRemoteUrl,
  parseSSHConfigFile,
  doKeyAlreadyExists,
} = require('./core');

// dialog wrapper
const dialog = require('./dialog');
const notification = require('./notification');

let githubConfig = null; //workaround to store github config because electron-builder doesn't works with .env files.

// Register for all ipc channel in the app over here once.
function register() {
  registerGeneralIpcs();
  registerIpcForConnectAccountScreen();
  registerIpcForGenerateKeyScreen();
  registerIpcForAddKeyScreen();
  registerIpcForUpdateRemoteScreen();
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

  // Workaround to store github config coming in from our renderer process :(
  // We can get rid of this workaround once we use Parcel for bundling electron process as well.
  ipc.answerRenderer('github-config', async config => {
    githubConfig = config;
    return;
  });
}

function registerIpcForConnectAccountScreen() {
  // No listeners added.
}

function registerIpcForGenerateKeyScreen() {
  ipc.answerRenderer(
    'check-key-already-exists',
    async ({ selectedProvider, username }) => {
      const keyAlreadyExists = doKeyAlreadyExists(selectedProvider, username);
      return keyAlreadyExists;
    }
  );

  ipc.answerRenderer(
    'ask-to-override-keys',
    async ({ selectedProvider, username }) => {
      const rsaFileName = `${selectedProvider}_${username}_id_rsa`;
      const userResponse = await dialog.showOverrideKeysDialog(rsaFileName);
      return userResponse === 0 ? true : false;
    }
  );

  // Listen to renderer process and start generating keys based on currently passed `config`.
  ipc.answerRenderer('generate-key', async config => {
    try {
      const result = await generateKey(config);
      if (result === 0) {
        return {
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
      const { selectedProvider, username } = data;
      const publicKey = await getPublicKey(selectedProvider, username);
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
      repoUrl,
      selectedFolder,
      shallowClone,
    } = data;

    try {
      const { code, repoFolder } = await cloneRepo(
        selectedProvider,
        username,
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

function getGithubConfig() {
  return githubConfig;
}

module.exports = { register, getGithubConfig };
