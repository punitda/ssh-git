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

/**
 * Generate `git clone` command to be run.
 * Based on selectedProvider and username generates the repoUrl such that it works
 * in accordance with our host naming convention set in ssh config file
 * @param {*} selectedProvider - e.x :  github, bitbucket or gitlab
 * @param {*} username  - e.x : punitd
 * @param {*} repoUrl - e.x : git@github.com:punitd/node.git
 */
function getCloneRepoCommand(selectedProvider, username, repoUrl) {
  let modifiedRepoUrl;
  if (selectedProvider === providers.BITBUCKET) {
    modifiedRepoUrl = repoUrl.replace(
      `${selectedProvider}.org`,
      `${selectedProvider}.org-${username}`
    );
  } else {
    modifiedRepoUrl = repoUrl.replace(
      `${selectedProvider}.com`,
      `${selectedProvider}.com-${username}`
    );
  }

  return `git clone ${modifiedRepoUrl}`;
}

function getManualSteps(selectedProvider) {
  switch (selectedProvider) {
    case providers.GITHUB:
      return github_steps;
    case providers.BITBUCKET:
      return bitbucket_steps;
    case providers.GITLAB:
      return gitlab_steps;
    default:
      break;
  }
}

const github_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Github account`,
  `Open this `,
  `Once you're on that page, paste the key you just copied in 1st step under "Key" input and
  for "Title" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

const bitbucket_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Bitbucket account`,
  `Open this `,
  `Once you're on that page, click on "Add key" button and paste the key you just copied in 1st step under "Key" input
  and for "Label" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

const gitlab_steps = [
  `Copy the Public Key you see on the right side to the clipboard`,
  `Login in to your Gitlab account`,
  `Open this `,
  `Once you're on that page, paste the key you just copied in 1st step under "Key" input 
  and for "Title" input you can give it any value you prefer to identify the key in future. [E.x. Macbook Pro(Office)]`,
  `Update Remote url of the repository`,
];

module.exports = {
  getCommands,
  createSshConfig,
  getConfigFileContents,
  getPublicKeyFileName,
  getManualSteps,
  getCloneRepoCommand,
};
