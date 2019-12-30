require('dotenv').config();
const { notarize } = require('electron-notarize');

module.exports = async function notarizing(context) {
  console.log('starting with notarizing process...');
  const { electronPlatformName, appOutDir } = context;

  if (electronPlatformName !== 'darwin') {
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  if (!(process.env.APPLEID && process.env.APPLEIDPASS)) {
    console.warn(
      'Skipping MacOS notarization because required creds not provided'
    );
    return;
  }

  return await notarize({
    appBundleId: 'app.ssh-git',
    appPath: `${appOutDir}/${appName}.app`,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
  });
};
