const { dialog } = require('electron');
const window = require('./window');

// Dialog to show generic error message when something goes wrong.
function showErrorDialog(errorMessage) {
  dialog.showErrorBox(
    'Oops!',
    errorMessage
      ? errorMessage
      : `Something went wrong there. Looks like we messed up somewhere when generating SSH key for you. :(`
  );
}

// Dialog asking user whether they wish to override ssh keys or not.
function showOverrideKeysDialog(rsaFileName) {
  const buttons = ['Yes, please', 'No, thanks'];

  const options = {
    type: 'question',
    buttons,
    title: 'Override keys',
    defaultId: 0,
    detail: `We found out that account for which you are generating key there exists a key with same name "${rsaFileName}". Do you want us to override the key?\n\nNote: If you haven't used the key we're talking about in a while we recommend overriding the key.`,
    message: 'Do you wish to override the key?',
  };

  const mainWindow = window.getMainWindow();
  return new Promise((resolve, _reject) => {
    dialog.showMessageBox(mainWindow, options, (response, _checkboxChecked) => {
      resolve(response);
    });
  });
}

// Used to show default system dialog for selecting directory.
async function showOpenDirectoryDialog() {
  return dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
}

module.exports = {
  showErrorDialog,
  showOverrideKeysDialog,
  showOpenDirectoryDialog,
};
