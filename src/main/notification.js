const { Notification, shell } = require('electron');

function sendCloneRepoResultNotification(success, error, repoFolder = null) {
  if (Notification.isSupported) {
    let toast;
    let actions = [];

    if (success) {
      // MacOS only notification actions for showing button 'Open Folder' in notification
      actions.push({
        type: 'button',
        text: 'Open Folder',
      });

      toast = createNotification(
        (title = 'Clone Success!'),
        (body = `Repo was cloned to ${repoFolder} folder`),
        (actions = actions)
      );

      toast.on('click', _event => shell.openItem(repoFolder));
      toast.on('action', (_event, _index) => shell.openItem(repoFolder));
    } else {
      toast = createNotification(
        (title = 'Clone Error!'),
        (body = error.message),
        (actions = actions)
      );
    }

    toast.show();
  } else {
    console.log('Notification not supported...');
  }
}

function createNotification(title, body, actions = []) {
  const notification = new Notification({
    title,
    body,
    actions,
  });

  return notification;
}

module.exports = {
  sendCloneRepoResultNotification,
  createNotification,
};
