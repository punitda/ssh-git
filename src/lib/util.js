const { providers } = require('../lib/config');
const path = require('path');
const os = require('os');
const fs = require('fs');

function getCommands(config) {
  const sshDir = path.join(os.homedir(), '.ssh');
  const rsaFilePath = path.join(sshDir, config.rsaFileName);

  if (!fs.existsSync(sshDir)) fs.mkdirSync(sshDir); // Making sure we create ".ssh" directory if doesn't exists before proceeding to generate keys

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

function getPublicKeyFileName(selectedProvider, username) {
  return `${selectedProvider}_${username}_id_rsa.pub`;
}

function getConfigFileContents(config) {
  const rsaFilePath = path.join(os.homedir(), '.ssh', config.rsaFileName);
  if (process.platform === 'darwin') {
    return `
Host ${config.host}
  HostName ${config.hostName}
  User git
  UseKeychain yes
  AddKeysToAgent yes
  IdentityFile ${rsaFilePath}
  
  `;
  } else {
    return `
Host ${config.host}
  HostName ${config.hostName}
  User git
  AddKeysToAgent yes
  IdentityFile ${rsaFilePath}
  
  `;
  }
}

/**
 * Generate `git clone` command to be run.
 * Based on selectedProvider and username generates the repoUrl such that it works
 * in accordance with our host naming convention set in ssh config file
 * @param {*} selectedProvider - e.x :  github, bitbucket or gitlab
 * @param {*} username  - e.x : punitd
 * @param {*} repoUrl - e.x : git@github.com:punitd/node.git
 */
function getCloneRepoCommand(
  selectedProvider,
  username,
  repoUrl,
  disableLogging = true,
  shallowClone = false
) {
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

  return `git clone ${modifiedRepoUrl} ${shallowClone ? '--depth=1' : ''} ${
    disableLogging ? `--quiet` : ''
  } `;
}

async function getNewRemoteUrlAndAliasName(
  fetchUrl,
  selectedProvider,
  username
) {
  // Check if user has entered correct repo url based on currently selected provider
  // If fetchUrl doesn't contains selectedProvider it means wrong repo folder
  // was selected by user.
  if (!fetchUrl.includes(selectedProvider)) {
    throw new Error(
      `Looks like either you've selected wrong folder or wrong account because the remote url for the selected repo folder is not setup for ${selectedProvider} account. Please check.`
    );
  }

  // Handle https remote url
  if (fetchUrl.includes('https://')) {
    const {
      newRemoteUrlAliasName = null,
      newRemoteUrl = null,
    } = getNewRemoteUrlAndAliasNameForHttpsUrl(
      fetchUrl,
      selectedProvider,
      username
    );
    if (newRemoteUrlAliasName && newRemoteUrl) {
      return { newRemoteUrlAliasName, newRemoteUrl };
    } else {
      throw new Error("Invalid remote url found(https). We couldn't update it");
    }
  }

  // Check if remote url is already updated with correct url we want to update to
  // like `git@github.com-{username}:owner/repo.git`.
  // If that is the case, don't do anything just notify user about it.
  const requiredSSHUrlRegex = getRequiredSshUrlRegex(
    selectedProvider,
    username
  );
  const alreadyUpdatedUrl = fetchUrl.match(requiredSSHUrlRegex);
  if (alreadyUpdatedUrl && alreadyUpdatedUrl.length > 0) {
    throw new Error(
      'The remote url is already updated correctly. No update required.'
    );
  }

  // Check if remote url is already updated to format we need but contains different username
  // in url then the one entered by user.
  // If that is the case, throw error indicating to user that they might have selected wrong username
  // or wrong folder when filling up the update remote url form.
  const requiredGenericSSHUrlRegex = getRequiredGenericSshUrlRegex(
    selectedProvider
  );
  const alreadyUpdatedButIncorrectUrl = fetchUrl.match(
    requiredGenericSSHUrlRegex
  );

  if (
    alreadyUpdatedButIncorrectUrl &&
    alreadyUpdatedButIncorrectUrl.length > 0
  ) {
    throw new Error(
      `The remote url of selected repo folder is already updated but doesn't belongs to "username: ${username}" you selected for "${selectedProvider}" account. 
Please check you're using selecting correct username`
    );
  }

  // If we reach here, now we need to check if ssh url matches the standard ssh url format:
  // `git@<provider>:<repoOwner>/<repoName>.git`
  // If yes, we extract that from fetchUrl using match method and see if exists.
  // And, then we replace it with our own format of `git@<provider> - <username>:<repoOwner>/<repoName>.git`
  const validSshUrlRegex = getValidGitSshUrlRegex(selectedProvider);
  const remoteUrlMatches = fetchUrl.match(validSshUrlRegex);
  // Check if it is an valid ssh url based on selectedProvider and throw error if not.
  if (!remoteUrlMatches || remoteUrlMatches.length === 0) {
    throw new Error(
      'The repo you selected has an invalid remote ssh url. Please check.'
    );
  }

  const remoteUrl = remoteUrlMatches[0];
  // Update remote url based on selectedProvider and username
  const updatedRemoteUrl = replaceRemoteUrl(
    remoteUrl,
    selectedProvider,
    username
  );

  // Extract remote url's alias name(like origin or upstream)
  const newRemoteUrlAliasName = fetchUrl
    .substring(0, fetchUrl.indexOf('git@'))
    .trim();

  return { newRemoteUrlAliasName, updatedRemoteUrl };
}

function getNewRemoteUrlAndAliasNameForHttpsUrl(
  fetchUrl,
  selectedProvider,
  username
) {
  const urlParts = fetchUrl
    .split('/')
    .filter(item => item)
    .slice(1);

  // Https urls has to be divided in 3 parts max(after slicing 1st element) no matter whether it is github/bitbucket/gitlab.
  if (urlParts.length !== 3) {
    throw new Error(
      "Invalid remote url found(https). We couldn't update remote url"
    );
  }

  const [, repoOwner, repoName] = urlParts;
  let newRemoteUrlAliasName = fetchUrl
    .substring(0, fetchUrl.indexOf('https://'))
    .trim();

  // Bitbucket case
  // This is because bitbucket https url are of format :
  // `https://<username>@bitbucket.org/<repoOwner>/<repoName>.git`
  if (
    selectedProvider === providers.BITBUCKET &&
    urlParts.includes(`${username}@${selectedProvider}.org`)
  ) {
    const newRemoteUrl = `git@${selectedProvider}.org-${username}:${repoOwner}/${repoName}`;
    return { newRemoteUrlAliasName, newRemoteUrl };
  }
  // Github and Gitlab
  // This is because gitlab https url are of format:
  // - `https://github.com/<repoOwner>/<repoName>.git`
  // - `https://gitlab.com/<repoOwner>/<repoName>.git`
  else if (urlParts.includes(`${selectedProvider}.com`)) {
    let newRemoteUrl = `git@${selectedProvider}.com-${username}:${repoOwner}/${repoName}`;
    return { newRemoteUrlAliasName, newRemoteUrl };
  } else {
    return null;
  }
}

function getValidGitSshUrlRegex(selectedProvider) {
  if (selectedProvider === providers.BITBUCKET) {
    return new RegExp(`git@${selectedProvider}.org:(.*).git`);
  } else {
    return new RegExp(`git@${selectedProvider}.com:(.*).git`);
  }
}

function getRequiredSshUrlRegex(selectedProvider, username) {
  if (selectedProvider === providers.BITBUCKET) {
    return new RegExp(`git@${selectedProvider}.org-${username}:(.*).git`);
  } else {
    return new RegExp(`git@${selectedProvider}.com-${username}:(.*).git`);
  }
}

function getRequiredGenericSshUrlRegex(selectedProvider) {
  if (selectedProvider === providers.BITBUCKET) {
    return new RegExp(`git@${selectedProvider}.org-(.*):(.*).git`);
  } else {
    return new RegExp(`git@${selectedProvider}.com-(.*):(.*).git`);
  }
}

function replaceRemoteUrl(remoteUrl, selectedProvider, username) {
  if (selectedProvider === providers.BITBUCKET) {
    return remoteUrl.replace(
      `git@${selectedProvider}.org`,
      `git@${selectedProvider}.org-${username}`
    );
  } else {
    return remoteUrl.replace(
      `git@${selectedProvider}.com`,
      `git@${selectedProvider}.com-${username}`
    );
  }
}

function getDefaultShell() {
  const env = process.env;

  if (process.platform === 'darwin') {
    return env.SHELL || '/bin/bash';
  }

  if (process.platform === 'win32') {
    return env.COMPSEC || 'cmd.exe';
  }

  return env.SHELL || '/bin/sh';
}

function openNewGithubIssueUrl(options = {}) {
  let repoUrl;
  if (options.repoUrl) {
    repoUrl = options.repoUrl;
  } else if (options.user && options.repo) {
    repoUrl = `https://github.com/${options.user}/${options.repo}`;
  } else {
    throw new Error(
      'You need to specify either the `repoUrl` option or both the `user` and `repo` options'
    );
  }

  const url = new URL(`${repoUrl}/issues/new`);

  const types = [
    'body',
    'title',
    'labels',
    'template',
    'milestone',
    'assignee',
    'projects',
  ];

  for (const type of types) {
    let value = options[type];
    if (value === undefined) {
      continue;
    }

    if (type === 'labels' || type === 'projects') {
      if (!Array.isArray(value)) {
        throw new TypeError(`The \`${type}\` option should be an array`);
      }
      value = value.join(',');
    }
    url.searchParams.set(type, value);
  }
  return url.toString();
}

module.exports = {
  getCommands,
  createSshConfig,
  getConfigFileContents,
  getPublicKeyFileName,
  getCloneRepoCommand,
  getNewRemoteUrlAndAliasName,
  getDefaultShell,
  openNewGithubIssueUrl,
};
