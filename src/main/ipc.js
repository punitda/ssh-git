const { ipcMain, shell } = require('electron');
const {
  generateKey,
  getPublicKeyContent,
  getSystemName,
  cloneRepo,
} = require('./core');

const { SSHKeyExistsError } = require('../lib/error');

const {
  PUBLIC_KEY_COPY_REQUEST_CHANNEL,
  PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
  SELECT_GIT_FOLDER_REQUEST_CHANNEL,
  SELECT_GIT_FOLDER_RESPONSE_CHANNEL,
  CLONE_REPO_REQUEST_CHANNEL,
  CLONE_REPO_RESPONSE_CHANNEL,
  SHOW_ERROR_DIALOG_REQUEST_CHANNEL,
} = require('../lib/constants');

function registerListeners() {
  // Listen to request from renderer process to open external links
  ipcMain.on('open-external', (_event, { path }) => {
    shell.openExternal(path);
  });

  // Workaround to store github config coming in from our renderer process:(
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
      if (error instanceof SSHKeyExistsError) {
        await retryGeneratingKey(config, error.rsaFileName, event);
        return;
      }
      event.reply('generated-keys-result', { success: false, error });
    }
  });

  // Listen to renderer process and send content of public key file based on config passed
  ipcMain.on(PUBLIC_KEY_COPY_REQUEST_CHANNEL, async (event, config) => {
    try {
      const publicKeyContent = await getPublicKeyContent(config);
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

  ipcMain.on(SELECT_GIT_FOLDER_REQUEST_CHANNEL, async (event, _data) => {
    const filePaths = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    });

    if (filePaths) event.reply(SELECT_GIT_FOLDER_RESPONSE_CHANNEL, filePaths);
  });

  ipcMain.on(CLONE_REPO_REQUEST_CHANNEL, async (event, data) => {
    const { selectedProvider, username, repoUrl, repoFolder } = data;

    try {
      const result = await cloneRepo(
        selectedProvider,
        username,
        repoUrl,
        repoFolder
      );

      if (result === 0) {
        event.reply(CLONE_REPO_RESPONSE_CHANNEL, {
          success: true,
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

  // Generic channel to listen to error messages sent in from renderer process
  // and show Native Error dialog to user.
  ipcMain.on(SHOW_ERROR_DIALOG_REQUEST_CHANNEL, (_event, errorMessage) => {
    showError(errorMessage);
  });
}

module.exports = { registerListeners };
