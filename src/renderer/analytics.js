import package from '../../package.json';

const appName = 'app.ssh-git';
const appVersion = package.version;

export async function trackScreen(screenName) {
  await window.ipc.callMain('track-screen', {
    screenName,
    appName,
    appVersion,
  });
}

export async function trackEvent(category, action) {
  await window.ipc.callMain('track-event', { category, action });
}
