// built-in
const path = require('path');
const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');

// internal
const isDev = require('./electron-is-dev');
const requestGithubAccessToken = require('./api');
const parseAppURL = require('../lib/parse-app-url');
const { generateKey, getPublicKeyContent } = require('../lib/core');
const { SSHKeyExistsError, DoNotOverrideKeysError } = require('../lib/error');

const {
  PUBLIC_KEY_COPY_REQUEST_CHANNEL,
  PUBLIC_KEY_COPY_RESPONSE_CHANNEL,
} = require('../lib/constants');

let mainWindow; //reference to our mainWindow.
let githubConfig = {}; //workaround to store github config because electron-builder doesn't works with .env files.
const preloadScriptPath = path.join(__dirname, 'preload.js');

/**
 * Creating main window and loading the contents in it.
 */
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 960,
    height: 720,
    webPreferences: {
      nodeIntegration: false,
      preload: preloadScriptPath,
    },
    maximizable: false,
    backgroundColor: '#e2e8f0',
  });

  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000'
      : `file://${path.join(__dirname, '/../../build/index.html')}`
  );

  mainWindow.on('closed', () => (mainWindow = null));
}

/**
 * Set up listeners for specific actions from renderer processes.
 */
function setUpListeners() {
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
      if (publicKeyContent) {
        event.reply(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, publicKeyContent);
      }
    } catch (error) {
      event.reply(PUBLIC_KEY_COPY_RESPONSE_CHANNEL, null);
    }
  });

  // Generic channel to listen to error messages sent in from renderer process
  // and show Native Error dialog to user.
  ipcMain.on('show-error-dialog', (_event, errorMessage) => {
    showError(errorMessage);
  });
}

/**
 * Electron Application lifecycle listeners.
 */
app.on('ready', () => {
  setAsDefaultProtocolClient('ssh-git');
  createWindow();
  setUpListeners();
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

app.on('will-finish-launching', () => {
  // MacOS only
  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleAppURL(url);
  });
});

/**
 * Need to set default protocol to which app could listen to.
 * It is set to `ssh-git` so that app can handle all deeplinks of type
 * `ssh-git://` clicked/redirected from our browser
 * @param {*} protocol - default protocol to handle `ssh-git://` links
 */
function setAsDefaultProtocolClient(protocol) {
  // TODO: we need to add windows specific logic over here to set up default protocol
  app.setAsDefaultProtocolClient(protocol);
}

/**
 * Called when key with same name already exists.
 *  Show dialog asking user whether they wish to override keys or not.
 *  Depending on user's response we either
 *  - Start with generate key process again this time telling it to override keys
 *  OR
 *  - Send error back to our renderer process telling it that user doesn't
 *  wishes to override keys using custom error `DoNotOverrideKeysError`.
 * @param {*} config - intialConfig passed from our renderer process for which we're generating key.
 * @param {*} rsaFileName - used to show specific filename in dialog where we ask user to override key.
 * @param {*} event - event object used to reply/send events to renderer process listening under `start-generating-key` channel.
 */
async function retryGeneratingKey(config, rsaFileName, event) {
  try {
    const userResponse = await showDialogAskingToOverrideKeys(rsaFileName);
    if (userResponse === 0) {
      const newSshConfig = { ...config, overrideKeys: true };
      const result = await generateKey(newSshConfig); //Start with generate key method telling it to override the keys
      if (result === 0) {
        event.reply('generated-keys-result', {
          success: true,
          error: null,
        });
      }
    } else {
      event.reply('generated-keys-result', {
        success: false,
        error: new DoNotOverrideKeysError(), // Notify our GenerateKey screen that user doesn't wishes to move ahead.
      });
    }
  } catch (error) {
    event.reply('generated-keys-result', {
      success: false,
      error: new Error('Error overriding the SSH key'),
    });
  }
}

/**
 * Used for handle Auth redirect urls coming back from auth providers
 * like Github, Bitbucket and Gitlab with auth details like `code or access_token and state`
 * @param {*} callbackurl - url which is received when `ssh-git://` deeplinks are opened
 */
async function handleAppURL(callbackurl) {
  const authState = parseAppURL(callbackurl);
  let { code = null, state = null, token = null } = authState;

  if (authState) {
    try {
      if (code) {
        // This means it is github callbackurl and we need to first obtain "access_token" value.
        token = await requestGithubAccessToken(code, githubConfig);

        if (!token) {
          showError(`Something went wrong. Please try again`);
          return;
        }
      }
      mainWindow.focus();
      mainWindow.webContents.send('start-auth', {
        state,
        token,
      });
    } catch (error) {
      showError(`Something went wrong. Please try again. ${error}`);
    }
  } else {
    showError(
      `Something went wrong. We couldn't verify the validity of the request. Please try again.`
    );
  }
}

/**
 * Showing User facing dialogs
 */
function showError(errorMessage) {
  dialog.showErrorBox(
    'Oops!',
    errorMessage
      ? errorMessage
      : `Something went wrong there. Looks like we messed up somewhere when generating SSH key for you. :(`
  );
}

function showDialogAskingToOverrideKeys(rsaFileName) {
  const buttons = ['Yes, please', 'No, thanks'];

  const options = {
    type: 'question',
    buttons,
    title: 'Override keys',
    defaultId: 0,
    detail: `We found out that account for which you are generating key there exists a key with same name "${rsaFileName}". Do you want us to override the key?\n\nNote: If you haven't used the key we're talking about in a while we recommend overriding the key.`,
    message: 'Do you wish to override the key?',
  };

  return new Promise((resolve, _reject) => {
    dialog.showMessageBox(mainWindow, options, (response, _checkboxChecked) => {
      resolve(response);
    });
  });
}
