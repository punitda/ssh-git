//built-in
const os = require('os');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

// Using promisify utility from node to convert readFile function to return Promise.
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);

// libs
const { onExit, streamWrite, streamEnd } = require('@rauschma/stringio');

// internal
const {
  getCommands,
  createSshConfig,
  getConfigFileContents,
  getPublicKeyFileName,
} = require('./util');
const { SSHKeyExistsError } = require('./error');

const sshDir = path.join(os.homedir(), '.ssh'); // used to change cwd when running our commands using `spawn`.
const sshConfigFileLocation = path.join(os.homedir(), '.ssh', 'config'); // ssh config file location

//Core method(Meat of the App)
async function generateKey(config) {
  const sshConfig = createSshConfig(config);
  const privateKeyFilePath = path.join(sshDir, sshConfig.rsaFileName);
  const publicKeyFilePath = path.join(sshDir, `${sshConfig.rsaFileName}.pub`);

  // Check if SSH key with same name exists and user hasn't instructed to override keys yet?
  // In that case, throw error instructing calling process to show user dialog asking whether they
  // wish to override keys or not.
  if (!sshConfig.overrideKeys && fs.existsSync(privateKeyFilePath)) {
    return Promise.reject(new SSHKeyExistsError(sshConfig.rsaFileName));
  }
  if (sshConfig.overrideKeys) {
    //Removing ssh key pair in case of overriding keys.
    fs.unlinkSync(privateKeyFilePath);
    fs.unlinkSync(publicKeyFilePath);
  }

  const commands = getCommands(sshConfig); //Get list of commands based on `config` object passed.

  //Traditional for-loop #FTW.
  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    try {
      let code;
      if (index === 2) {
        //Pass passphrase stored in config for our 3rd command(ssh-add) so user don't have to type and remember the password again.
        code = await runCommand(command, sshConfig.passphrase);
      } else {
        code = await runCommand(command);
      }
      if (code) {
        throw new Error(`${command} failed with code : ${code}`);
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * In case we aren't overriding ssh keys, we need to add our ssh config info
   * into `config` file so that when using SSH this file can be used as lookup
   * to use correct keys based on **host** value.
   */
  if (!sshConfig.overrideKeys) {
    const configFileContents = getConfigFileContents(sshConfig);
    fs.appendFileSync(sshConfigFileLocation, configFileContents);
  }
  return Promise.resolve(0); //If everything goes well send status code of '0' indicating success.
}

async function runCommand() {
  const [commandToRun, passphrase] = arguments;
  const childProcess = spawn(commandToRun, {
    stdio: ['pipe', process.stdout, process.stderr],
    cwd: `${sshDir}`,
    shell: true,
    /**
     * This is important. Otherwise we cannot input our passphrase unless
     * this child process is detached from parent process.
     * This i guess makes it parent allowing us to write our passphrase
     * into child process's stdin waiting for that passphrase when 3rd step is run.
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
      writePassPhraseToStdIn(childProcess.stdin, passphrase);
    }

    await onExit(childProcess);
  } catch (error) {
    throw new Error(error);
  }
}

async function writePassPhraseToStdIn(writable, passphrase) {
  await streamWrite(writable, `${passphrase}\n`);
  await streamEnd(writable);
}

// get contents of public key based on current config values like username and selectedProvider.
async function getPublicKeyContent(config) {
  const publicKeyFileName = getPublicKeyFileName(config);
  const publicKeyFilePath = path.join(os.homedir(), '.ssh', publicKeyFileName);

  try {
    const publicKeyContent = await readFileAsync(publicKeyFilePath);
    return publicKeyContent;
  } catch (error) {
    return null;
  }
}

module.exports = {
  generateKey,
  getPublicKeyContent,
};
