const { providers } = require('../lib/config');
const path = require('path');
const os = require('os');

function getCommands(config) {
  const rsaFilePath = path.join(os.homedir(), '.ssh', config.rsaFileName);
  if (process.platform === 'darwin') {
    return [
      `ssh-keygen -t rsa -b 4096 -C "${config.email}" -f ${config.rsaFileName} -P ${config.passphrase}`,
      `eval "$(ssh-agent -s)"`,
      `ssh-add -K ${rsaFilePath}`,
    ];
  } else {
    return [
      `ssh-keygen -t rsa -b 4096 -C "${config.email}" -f ${config.rsaFileName} -P ${config.passphrase}`,
      `eval "$(ssh-agent -s)"`,
      `ssh-add ${rsaFilePath}`,
    ];
  }
}

function createSshConfig(config) {
  let sshConfig = {};
  //Check for bitbucket because it is `.org`
  if (config.selectedProvider === providers.BITBUCKET) {
    sshConfig.host = `${config.selectedProvider}.org-${config.username}`;
    sshConfig.hostName = `${config.selectedProvider}.org`;
  } else {
    sshConfig.host = `${config.selectedProvider}.com-${config.username}`;
    sshConfig.hostName = `${config.selectedProvider}.com`;
  }
  sshConfig.rsaFileName = `${config.selectedProvider}_${config.username}_id_rsa`;

  return { ...sshConfig, ...config };
}

function getPublicKeyFileName(config) {
  return `${config.selectedProvider}_${config.username}_id_rsa.pub`;
}

function getConfigFileContents(config) {
  const rsaFilePath = path.join(os.homedir(), '.ssh', config.rsaFileName);
  return `
Host ${config.host}
  HostName ${config.hostName}
  User git
  IgnoreUnknown UseKeychain
  UseKeychain yes
  IdentityFile ${rsaFilePath}

`;
}

module.exports = {
  getCommands,
  createSshConfig,
  getConfigFileContents,
  getPublicKeyFileName,
};
