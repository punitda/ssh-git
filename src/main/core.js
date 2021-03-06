//built-in
const os = require('os');
const path = require('path');
const fs = require('fs');
const { promises: fsAsync } = fs;

const { spawn } = require('child_process');
const pty = require('node-pty');

const SSHConfig = require('ssh-config');

// npm lib(used to simplify dealing with child_process i/o)
const {
  onExit,
  streamWrite,
  streamEnd,
  chunksToLinesAsync,
} = require('@rauschma/stringio');

// utils
const {
  getCommands,
  createSshConfig,
  getConfigFileContents,
  getPublicKeyFileName,
  getCloneRepoCommand,
  getNewRemoteUrlAndAliasName,
  getDefaultShell,
} = require('../lib/util');

const { providers } = require('../lib/config');

// Paths to be used in core logic
const sshDir = path.join(os.homedir(), '.ssh'); // used to change cwd when running our commands using `spawn`.
const sshConfigFileLocation = path.join(os.homedir(), '.ssh', 'config'); // ssh config file location

//Core method(Meat of the App)
async function generateKey(config) {
  const sshConfig = createSshConfig(config);
  const commands = getCommands(sshConfig); //Get list of commands based on `config` object passed.

  if (sshConfig.overrideKeys) {
    const filesDeleted = await overrideExistingKeys(sshConfig.rsaFileName);
    if (filesDeleted && filesDeleted.length === 0) {
      throw new Error(
        'Something went wrong when deleting existing ssh key files'
      );
    }
  }
  //Traditional for-loop #FTW.
  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    try {
      if (index === 2) {
        //Pass passphrase stored in config for our 3rd command(ssh-add) so user don't have to type and remember the password again.
        if (process.platform === 'linux') {
          await runSshAddCommandInLinux(command, sshConfig.passphrase); // ssh-add command on Linux
        } else {
          await runCommand(command, sshConfig.passphrase); // ssh-add command on Windows and MacOS
        }
      } else {
        await runCommand(command);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * In case we aren't overriding ssh keys, we need to add our ssh config info
   * into `config` file so that when using SSH this file can be used as lookup
   * to use correct keys based on **host** value.
   */
  if (!sshConfig.overrideKeys) {
    const configFileContents = getConfigFileContents(sshConfig);
    await fsAsync.appendFile(sshConfigFileLocation, configFileContents);
  }
  return 0; //If everything goes well send status code of '0' indicating success.
}

async function overrideExistingKeys(fileName) {
  const privateKeyFilePath = path.join(sshDir, fileName);
  const publicKeyFilePath = path.join(sshDir, `${fileName}.pub`);

  const [privateKeyDeleted, publickKeyDeleted] = await Promise.all([
    fsAsync.unlink(privateKeyFilePath),
    fsAsync.unlink(publicKeyFilePath),
  ]);

  return [privateKeyDeleted, publickKeyDeleted];
}

function doKeyAlreadyExists(selectedProvider, mode, username) {
  let privateKeyFilePath, publicKeyFilePath;
  if (mode === 'MULTI') {
    privateKeyFilePath = path.join(
      sshDir,
      `${selectedProvider}_${username}_id_rsa`
    );
    publicKeyFilePath = path.join(
      sshDir,
      `${selectedProvider}_${username}_id_rsa.pub`
    );
  } else {
    privateKeyFilePath = path.join(sshDir, `${selectedProvider}_id_rsa`);
    publicKeyFilePath = path.join(sshDir, `${selectedProvider}_id_rsa.pub`);
  }

  return fs.existsSync(publicKeyFilePath) || fs.existsSync(privateKeyFilePath);
}

// Internal method for running one command at a time using `spawn`.
async function runCommand() {
  const [commandToRun, passphrase] = arguments;
  const childProcess = spawn(commandToRun, {
    stdio: ['pipe', process.stdout, process.stderr],
    cwd: `${sshDir}`,
    shell: true,
    /**
     * This is important. Otherwise we cannot input our passphrase unless
     * this child process is detached from parent process.
     * Detaching this child process i guess makes it parent allowing us to write our passphrase
     * into it's stdin which is waiting for that passphrase when 3rd step is run.
     */
    detached: passphrase ? true : false,
  });

  try {
    /**
     * Write to our childprocess's stdin in 3rd step when
     * we add SSH keys to agent and keychain(in case of MacOS)
     * 3rd command in the process(ssh-add) asks for passphrase which user used
     * when creating the SSH key in previous step(Step #1).
     * With this passphrase written to childprocess's stdin, user won't
     * have to worry and enter the same passphrase again.
     */
    if (passphrase) {
      await writePassPhraseToStdIn(childProcess.stdin, passphrase);
    }

    await onExit(childProcess);
  } catch (error) {
    throw error;
  }
}

async function runSshAddCommandInLinux(command, passphrase) {
  const shell = getDefaultShell();

  try {
    const ptyProcess = pty.spawn(shell, [], {
      cwd: sshDir,
    });

    ptyProcess.on('data', data => {
      process.stdout.write(data);
      if (data && data.includes('Enter passphrase')) {
        ptyProcess.write(`${passphrase}\r`);
      } else if (data && data.includes('Identity added:')) {
        setTimeout(() => {
          ptyProcess.kill();
          return 0;
        }, 1500);
      }
    });

    ptyProcess.write(`${command}\r`);
  } catch (error) {
    throw error;
  }
}

async function writePassPhraseToStdIn(writable, passphrase) {
  await streamWrite(writable, `${passphrase}\n`);
  await streamEnd(writable);
}

// get contents of public key based on username, mode and selectedProvider.
async function getPublicKey(selectedProvider, mode, username) {
  const publicKeyFileName = getPublicKeyFileName(
    selectedProvider,
    mode,
    username
  );
  const publicKeyFilePath = path.join(os.homedir(), '.ssh', publicKeyFileName);

  try {
    const publicKeyContent = await fsAsync.readFile(publicKeyFilePath);
    return publicKeyContent;
  } catch (error) {
    return null;
  }
}

/**
 * Run `git clone` command using child process and report back results.
 * @param {*} selectedProvider - used to construct modified SSH url based on this value.
 * @param {*} username - used to construct modified SSH url based on this value.
 * @param {*} repoUrl - used to do some validations and clone the repo
 * @param {*} repoFolder - used to determine the path where to clone the repo.
 */
async function cloneRepo(
  selectedProvider,
  username,
  mode,
  repoUrl,
  selectedFolder,
  shallowClone
) {
  // Check if user has entered correct repo url based on currently selected provider
  if (
    repoUrl.startsWith('git@') &&
    repoUrl.endsWith('.git') &&
    !repoUrl.includes(selectedProvider)
  ) {
    throw new Error(
      `Looks like you've entered the wrong repo url. It doesn't belongs to ${selectedProvider} account. Please check.`
    );
  }

  // Check if the repoUrl entered by user is a valid SSH url
  if (
    !(
      repoUrl.startsWith(`git@${selectedProvider}`) &&
      repoUrl.includes(`git@${selectedProvider}`) &&
      repoUrl.endsWith('.git')
    )
  ) {
    throw new Error(
      'The SSH url you just entered is not correct one. Please enter correct SSH url'
    );
  }

  // Extracting repo name from repoUrl using combination of `substring()` and `replace()` method.
  let lastPartOfRepoUrl = repoUrl.substring(
    repoUrl.lastIndexOf('/') + 1,
    repoUrl.length
  );
  let repoName = lastPartOfRepoUrl.replace('.git', '');

  // Check if the folder with same name as "repoName" exists in currently "selectedFolder"
  // and if yes throw error message correctly notifying user about it.
  let repoFolder = path.join(selectedFolder, repoName);
  if (fs.existsSync(repoFolder)) {
    throw new Error(
      `The repo your are trying to clone with name "${repoName}" already exists in path : "${repoFolder}". Please check`
    );
  }

  const disableLogging = true;
  // Run clone command if everything looks good
  const cloneRepoCommand = getCloneRepoCommand(
    selectedProvider,
    username,
    mode,
    repoUrl,
    disableLogging,
    shallowClone
  );

  try {
    const childProcess = spawn(cloneRepoCommand, {
      stdio: [process.stdin, process.stdout, 'pipe'],
      cwd: `${selectedFolder}`, //Change working directory to selectedFolder path
      shell: true,
      detached: process.platform === 'linux' ? true : false,
    });

    const errorOutput = await readChildProcessOutput(childProcess.stderr);
    if (
      !errorOutput ||
      errorOutput.toLowerCase().includes('permanently added')
    ) {
      return { code: 0, repoFolder };
    } else if (
      errorOutput &&
      errorOutput.includes('Host key verification failed')
    ) {
      const result = await runCloneRepoCommandUsingNodePty(
        selectedFolder,
        selectedProvider,
        username,
        repoUrl,
        repoFolder,
        shallowClone
      );
      return result;
    } else {
      throw new Error(errorOutput);
    }
  } catch (error) {
    throw error;
  }
}

async function runCloneRepoCommandUsingNodePty(
  selectedFolder,
  selectedProvider,
  username,
  repoUrl,
  repoFolder,
  shallowClone
) {
  const disableLogging = false;
  const cloneRepoCommand = getCloneRepoCommand(
    selectedProvider,
    username,
    repoUrl,
    disableLogging,
    shallowClone
  );
  const shell = getDefaultShell();

  return new Promise((resolve, reject) => {
    try {
      const ptyProcess = pty.spawn(shell, [], {
        cwd: selectedFolder, //Change working directory to selectedFolder path
      });

      ptyProcess.on('data', data => {
        if (
          data &&
          data.includes('Are you sure you want to continue connecting')
        ) {
          ptyProcess.write('yes\r');
        } else if (data && data.includes('Resolving deltas: 100%')) {
          setTimeout(() => {
            ptyProcess.kill();
            resolve({ code: 0, repoFolder });
          }, 1500);
        }
      });

      ptyProcess.write(`${cloneRepoCommand}\r`);
    } catch (error) {
      reject(error.message);
    }
  });
}

async function updateRemoteUrl(selectedProvider, username, repoFolder) {
  // check if it is git repo or not and show error message accordingly.
  const gitFolder = path.join(repoFolder, '.git');
  if (!fs.existsSync(gitFolder)) {
    throw new Error(
      "The folder you selected is not .git repository. Please make sure you're selecting correct folder."
    );
  }

  try {
    const childProcess = spawn('git remote -v', {
      stdio: [process.stdin, 'pipe', process.stderr],
      cwd: `${repoFolder}`,
      shell: true,
    });

    const remoteCommandResult = await readChildProcessOutput(
      childProcess.stdout
    );

    // Throw error in case git remote -v gives no result.
    // This would happen in case repo has git init done but no remote url set.
    // We could do nothing over here.
    if (!remoteCommandResult) {
      throw new Error(
        `No remote url found on the repo you just selected. Strange! Nothing to update here.
If you have setup SSH keys using this App, we suggest you use clone feature and updating remote url thing will be taken care of :)`
      );
    }

    // Split `git remote -v` command's result by new line and assign it to remoteUrls array
    const remoteUrls = remoteCommandResult.split('\n');
    // Throw error indicating to user in case no remote urls found after running `git remote -v`
    if (!remoteUrls || remoteUrls.length === 0) {
      throw new Error(
        `No remote url found on the repo you just selected. Strange! Nothing to update here.
If you have setup SSH keys using this App, we suggest you use clone feature and updating remote url thing will be taken care of :)`
      );
    }

    // Extracting fetchUrl.
    // Note : Usually fetch and push urls are same in most of the cases. So, we're just using fetch url.
    let fetchUrl = remoteUrls[0];
    if (fetchUrl.includes('(fetch)')) {
      fetchUrl = fetchUrl.replace('(fetch)', '').trim();
    }

    const {
      newRemoteUrlAliasName,
      updatedRemoteUrl: newRemoteUrl,
    } = await getNewRemoteUrlAndAliasName(fetchUrl, selectedProvider, username);

    if (newRemoteUrl && newRemoteUrlAliasName) {
      const childProcess = spawn(
        `git remote set-url ${newRemoteUrlAliasName} ${newRemoteUrl}`,
        {
          stdio: [process.stdin, process.stdout, process.stderr],
          cwd: `${repoFolder}`,
          shell: true,
        }
      );

      const result = await onExit(childProcess);
      if (!result) {
        return 0;
      }
    } else {
      throw new Error('Error updating remote url');
    }
  } catch (error) {
    throw error;
  }
}

async function readChildProcessOutput(readable) {
  let result = '';
  for await (const line of chunksToLinesAsync(readable)) {
    result += line;
  }
  return result;
}

async function parseSSHConfigFile() {
  try {
    const initialValue = { github: [], bitbucket: [], gitlab: [] };

    // When ssh file doesn't exists do early return with default values.
    if (!fs.existsSync(sshConfigFileLocation)) {
      return initialValue;
    }

    const sshConfigFileContents = await fsAsync.readFile(
      sshConfigFileLocation,
      {
        encoding: 'utf8',
      }
    );

    // Using ssh-config lib from npm to parse the contents of ssh config file
    // and converting it into meaningful object which we could use for
    // direct clone repo/update remote functionality
    const parsedConfig = SSHConfig.parse(sshConfigFileContents);
    const hosts = parsedConfig.map(config => config.value); // Getting hosts value out of it.

    // Reducing values based on "host" by separating username from it.
    // Below logic is reducing only host who have values like `github-username`, `bitbucket-username` or `gitlab-username`.
    // and ignoring rest.
    const result = hosts.reduce((accumulator, host) => {
      if (!host.includes('-')) return accumulator;

      // Extracting username from `host` value.
      // E.x if host value is `github-punitd` it will get back `punitd` from it
      const username = host.substring(host.indexOf('-') + 1, host.length);
      if (host.includes('github')) {
        accumulator.github.push(username);
      } else if (host.includes('bitbucket')) {
        accumulator.bitbucket.push(username);
      } else if (host.includes('gitlab')) {
        accumulator.gitlab.push(username);
      }
      return accumulator;
    }, initialValue);

    return result;
  } catch (error) {
    throw error;
  }
}

async function getSshConfig() {
  // When ssh config file doesn't exists do early return with empty array
  if (!fs.existsSync(sshConfigFileLocation)) {
    return [];
  }

  const sshConfigFileContents = await fsAsync.readFile(sshConfigFileLocation, {
    encoding: 'utf8',
  });
  const configs = SSHConfig.parse(sshConfigFileContents);

  // Running reduce on configs and obtaining following values:
  // 1. Host(check for '-' and get username from it)
  // 2. Get HostName(provider)
  // 3. IdentityFile(path),
  // 4. Mode(if it contains '-' in host value then it is MULTI mode)
  const userConfig = configs.reduce((acc, config) => {
    const sshConfig = {};

    const { param: key, value: host } = config;
    sshConfig.username = findUsername({ key, host });

    const { config: providerConfig } = config;
    providerConfig.forEach(key => {
      switch (key.param) {
        case 'HostName': {
          if (key.value.includes('github.com')) {
            sshConfig.provider = providers.GITHUB;
          } else if (key.value.includes('bitbucket.org')) {
            sshConfig.provider = providers.BITBUCKET;
          } else if (key.value.includes('gitlab.com')) {
            sshConfig.provider = providers.GITLAB;
          } else {
            sshConfig.provider = key.value;
          }
          break;
        }
        case 'IdentityFile':
          sshConfig.path = key.value;
          break;
        default:
          break;
      }
    });

    sshConfig.username
      ? (sshConfig.mode = 'MULTI')
      : (sshConfig.mode = 'SINGLE');

    acc.push(sshConfig);
    return acc;
  }, []);

  return userConfig.filter(
    config =>
      config.provider.includes(providers.GITHUB) ||
      config.provider.includes(providers.BITBUCKET) ||
      config.provider.includes(providers.GITLAB)
  );
}

function findUsername({ key, host }) {
  let username = '';
  if (key === 'Host') {
    if (!host.includes('-')) {
      return username;
    } else if (
      host.includes('github.com-') ||
      host.includes('gitlab.com-') ||
      host.includes('bitbucket.org-')
    ) {
      const startIndex = host.indexOf('-');
      username = host.substring(startIndex + 1, host.length);
    }
  }
  return username;
}

function getRsaFilePath(config) {
  let rsaFilePath;
  if (config.mode === 'MULTI') {
    rsaFilePath = path.join(
      os.homedir(),
      '.ssh',
      `${config.selectedProvider}_${config.username}_id_rsa`
    );
  } else {
    rsaFilePath = path.join(
      os.homedir(),
      '.ssh',
      `${config.selectedProvider}_id_rsa`
    );
  }
  return rsaFilePath;
}

async function deleteKey(key) {
  // 1. Delete keys from file system
  const privateKeyPath = key.path;
  const publicKeyPath = `${key.path}.pub`;
  if (fs.existsSync(privateKeyPath)) {
    await fsAsync.unlink(privateKeyPath);
  }
  if (fs.existsSync(publicKeyPath)) {
    await fsAsync.unlink(publicKeyPath);
  }

  // 2. Remove from .config file
  const sshConfigFileContents = await fsAsync.readFile(sshConfigFileLocation, {
    encoding: 'utf8',
  });
  const config = SSHConfig.parse(sshConfigFileContents);

  // Adding proper suffixes like '.com' or '.org' to provider before using it.
  let provider;
  if (key.provider === providers.BITBUCKET) {
    provider = `${key.provider}.org`;
  } else {
    provider = `${key.provider}.com`;
  }

  // Finding by 'Host' value and removing particular SSH key using SSHConfig lib.
  if (key.mode === 'MULTI') {
    config.remove({
      Host: `${provider}-${key.username}`,
    });
  } else {
    config.remove({
      Host: `${provider}`,
    });
  }

  // Dumping back modified config file with above key removed from config
  // and then overriding ".ssh/config" file with new config
  fsAsync.writeFile(sshConfigFileLocation, SSHConfig.stringify(config));

  return 1;
}

module.exports = {
  generateKey,
  getPublicKey,
  cloneRepo,
  updateRemoteUrl,
  parseSSHConfigFile,
  getSshConfig,
  doKeyAlreadyExists,
  getRsaFilePath,
  deleteKey,
};
