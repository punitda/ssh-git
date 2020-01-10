require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { notarize } = require('electron-notarize');

module.exports = async function notarizing(context) {
  console.log('Starting with notarizing process...');

  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== 'darwin') {
    return;
  }

  if (!(process.env.APPLEID && process.env.APPLEIDPASS)) {
    console.warn('Skipping MacOS notarization...');
    return;
  }

  const appName = `${context.packager.appInfo.productFilename}.app`;
  const appPath = path.join(appOutDir, appName);

  if (!fs.existsSync(appPath)) {
    throw new Error(`Cannot find application at: ${appPath}`);
  }

  try {
    const notarizeConfig = {
      appBundleId: 'app.ssh-git',
      appPath,
      appleId: process.env.APPLEID,
      appleIdPassword: process.env.APPLEIDPASS,
    };
    await notarize(notarizeConfig);
  } catch (error) {
    console.error(`Error notarizing: ${error.message}`);
  }

  console.log('Done notarizing!');
};
