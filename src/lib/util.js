function getCommands(config) {
  if (process.platform === 'darwin') {
    return [
      `ssh-keygen -t rsa -b 4096 -C "${config.email}" -f ${
        config.rsaFileName
      } -P ${config.passphrase}`,
      `eval "$(ssh-agent -s)"`,
      `ssh-add -K ${config.rsaFileName}`,
    ];
  } else {
    return [
      `ssh-keygen -t rsa -b 4096 -C "${config.email}" -f ${
        config.rsaFileName
      } -P ${config.passphrase}`,
      `eval "$(ssh-agent -s)"`,
      `ssh-add ${config.rsaFileName}`,
    ];
  }
}

function createSshConfig(config) {
  let sshConfig = {};
  sshConfig.host = `${config.selectedProvider}.com-${config.username}`;
  sshConfig.hostName = `${config.selectedProvider}.com`;
  sshConfig.rsaFileName = `${config.selectedProvider}_${
    config.username
  }_id_rsa`;

  return { ...sshConfig, ...config };
}

module.exports = {
  getCommands,
  createSshConfig,
};
