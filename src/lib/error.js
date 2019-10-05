class DoNotOverrideKeysError extends Error {
  constructor() {
    super("User doesn't wishes to override ssh keys");
    this.name = 'DoNotOverrideKeysError';
  }
}

class SshAskPassNotInstalledError extends Error {
  constructor() {
    super(
      `You don't have "ssh-askpass" installed on your system. Please install it by running command "sudo apt-get install ssh-askpass"`
    );
    this.name = 'SshAskPassNotInstalledError';
  }
}

module.exports = {
  DoNotOverrideKeysError,
  SshAskPassNotInstalledError,
};
