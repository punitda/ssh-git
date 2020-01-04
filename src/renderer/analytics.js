import package from '../../package.json';

const appName = 'app.ssh-git';
const appVersion = package.version;

export async function trackScreen(screenName) {
  try {
    await window.ipc.callMain('track-screen', {
      screenName,
      appName,
      appVersion,
    });
  } catch (error) {
    console.error('error tracking screen view');
  }
}

export async function trackEvent(category, action) {
  try {
    await window.ipc.callMain('track-event', { category, action });
  } catch (error) {
    console.error('error tracking event');
  }
}
