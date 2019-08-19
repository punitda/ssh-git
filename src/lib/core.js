const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const { onExit, streamWrite, streamEnd } = require('@rauschma/stringio');
const { getCommands, createSshConfig } = require('./util');

const sshDir = path.join(os.homedir(), '.ssh'); // used to change cwd when running our commands using `spawn`.

//Core method
async function generateKey(config, event) {
  const sshConfig = createSshConfig(config);
  const commands = getCommands(sshConfig);

  //Traditional for-loop #FTW.
  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    try {
      let code;
      if (index === 2) {
        code = await runCommand(command, sshConfig.passphrase);
      } else {
        code = await runCommand(command);
      }
      if (code) {
        throw new Error(`${command} failed with code : ${code}`);
      } else {
        // Using this to communicate with renderer process
        // Current step done in ssh generationg process to be used
        // in UI to notify user about current state.
        // Looks like a workaround, because we're passing the event object
        // in from the electron process. Not sure if this is the correct way.
        event.reply('generate-keys-step-result', {
          index,
          success: true,
          error: null,
        });
      }
    } catch (error) {
      // Communicate error to our renderer process in case something goes wrong.
      event.reply('generate-keys-step-result', {
        index,
        success: false,
        error,
      });
      return Promise.reject(error);
    }
  }
  return Promise.resolve(0);
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
      writeToWritable(childProcess.stdin, passphrase);
    }

    await onExit(childProcess);
  } catch (error) {
    throw new Error(error);
  }
}

async function writeToWritable(writable, passphrase) {
  await streamWrite(writable, `${passphrase}\n`);
  await streamEnd(writable);
}

module.exports = {
  generateKey,
};
