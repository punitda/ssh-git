const { dialog } = require('electron');

function showErrorDialog(errorMessage) {
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

module.exports = { showErrorDialog, showDialogAskingToOverrideKeys };
