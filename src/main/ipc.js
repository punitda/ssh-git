const path = require('path');
const os = require('os');
const { ipcMain, shell } = require('electron');

// core methods
const {
  generateKey,
  retryGeneratingKey,
  getPublicKeyContent,
  getSystemName,
  cloneRepo,
  updateRemoteUrl,
  parseSSHConfigFile,
} = require('./core');

// errors
const {
  SSHKeyExistsError,
  SshAskPassNotInstalledError,
} = require('../lib/error');

// constants
const {
  PUBLIC_KEY_COPY_REQUEST_CHANNEL,
  PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
  SELECT_GIT_FOLDER_REQUEST_CHANNEL,
  SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
  CLONE_REPO_REQUEST_CHANNEL,
  CLONE_REPO_RESPONSE_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_REQUEST_CHANNEL,
  SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL,
  UPDATE_REMOTE_URL_REQUEST_CHANNEL,
  UPDATE_REMOTE_URL_RESPONSE_CHANNEL,
  SSH_CONFIG_REQUEST_CHANNEL,
  SSH_CONFIG_RESPONSE_CHANNEL,
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
} = require('../lib/constants');

// dialog wrapper
const dialog = require('./dialog');

let githubConfig = null; //workaround to store github config because electron-builder doesn't works with .env files.

// Register for all ipc channel in the app over here once.
function register() {
  // Listen to request from renderer process to open external links
  ipcMain.on('open-external', (_event, uri) => {
    shell.openExternal(uri);
  });

  // Listen to request from renderer process to open folder
  ipcMain.on('open-folder', (_event, folderPath) => {
    shell.openItem(folderPath);
  });

  // Workaround to store github config coming in from our renderer process :(
  ipcMain.on('github-config', (_event, config) => {
    githubConfig = config;
  });

  // Listen to renderer process and start generating keys based on currently passed `config`.
  ipcMain.on('start-generating-keys', async (event, config) => {
    try {
      const result = await generateKey(config);
      if (result === 0) {
        event.reply('generated-keys-result', { success: true, error: null });
      }
    } catch (error) {
      console.log('error inside ipc: ', error);
      if (error instanceof SSHKeyExistsError) {
        try {
          const result = await retryGeneratingKey(
            config,
            error.rsaFileName,
            event
          );
          return;
        } catch (error) {
          console.log('do we reach inside nested catch lol : ', error);
          if (error.message)
            event.reply('generated-keys-result', {
              success: false,
              error: { message: error.message },
            });
          else event.reply('generated-keys-result', { success: false, error });
        }
      }
      console.log('error in ipc: ', error);
      event.reply('generated-keys-result', { success: false, error });
    }
  });

  // Listen to renderer process and send content of public key file based on config passed
  ipcMain.on(PUBLIC_KEY_COPY_REQUEST_CHANNEL, async (event, data) => {
    try {
      const { selectedProvider, username } = data;
      const publicKeyContent = await getPublicKeyContent(
        selectedProvider,
        username
      );
      const systemName = getSystemName();
      if (publicKeyContent) {
        event.reply(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, {
          key: publicKeyContent,
          title: systemName,
        });
      }
    } catch (error) {
      event.reply(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, null);
    }
  });

  // Listen to request asking for system's desktop folder path coming from "updateRemote" screens
  ipcMain.on(SYSTEM_DESKTOP_FOLDER_PATH_REQUEST_CHANNEL, (event, _data) => {
    const desktopFolderPath = path.join(os.homedir(), 'Desktop');
    event.reply(SYSTEM_DESKTOP_FOLDER_PATH_RESPONSE_CHANNEL, desktopFolderPath);
  });

  // Listen to request for selecting folder to which to "clone the repo" or "update remote url" to coming in from "updateRemote" screens
  ipcMain.on(SELECT_GIT_FOLDER_REQUEST_CHANNEL, async (event, _data) => {
    const filePaths = await dialog.showOpenDirectoryDialog();
    if (filePaths) event.reply(SELECT_GIT_FOLDER_RESPONSE_CHANNEL, filePaths);
  });

  // Listen to "clone repo" request and clone the repo based on data passed
  ipcMain.on(CLONE_REPO_REQUEST_CHANNEL, async (event, data) => {
    const { selectedProvider, username, repoUrl, selectedFolder } = data;

    try {
      const { code, repoFolder } = await cloneRepo(
        selectedProvider,
        username,
        repoUrl,
        selectedFolder
      );

      if (code === 0) {
        event.reply(CLONE_REPO_RESPONSE_CHANNEL, {
          success: true,
          repoFolder,
          error: null,
        });
      }
    } catch (error) {
      event.reply(CLONE_REPO_RESPONSE_CHANNEL, {
        error,
        success: false,
      });
    }
  });

  ipcMain.on(UPDATE_REMOTE_URL_REQUEST_CHANNEL, async (event, data) => {
    const { selectedProvider, username, repoFolder } = data;

    try {
      const result = await updateRemoteUrl(
        selectedProvider,
        username,
        repoFolder
      );
      if (result === 0) {
        event.reply(UPDATE_REMOTE_URL_RESPONSE_CHANNEL, {
          success: true,
          error: null,
        });
      }
    } catch (error) {
      event.reply(UPDATE_REMOTE_URL_RESPONSE_CHANNEL, {
        error,
        success: false,
      });
    }
  });

  ipcMain.on(SSH_CONFIG_REQUEST_CHANNEL, async (event, _data) => {
    try {
      const sshConfig = await parseSSHConfigFile();
      event.reply(SSH_CONFIG_RESPONSE_CHANNEL, {
        success: true,
        sshConfig,
        error: null,
      });
    } catch (error) {
      event.reply(SSH_CONFIG_RESPONSE_CHANNEL, {
        error,
        success: false,
      });
    }
  });

  // Generic channel to listen to error messages sent in from renderer process
  // and show Native Error dialog to user.
  ipcMain.on(SHOW_ERROR_DIALOG_REQUEST_CHANNEL, (_event, error) => {
    if (!error) {
      dialog.showErrorDialog('Uh-Oh! Something went wrong.');
    } else if (error instanceof Error) {
      dialog.showErrorDialog(error.message);
    } else {
      dialog.showErrorDialog(error);
    }
  });
}

function getGithubConfig() {
  return githubConfig;
}

module.exports = { register, getGithubConfig };
