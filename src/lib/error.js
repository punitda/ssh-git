class SSHKeyExistsError extends Error {
  constructor(fileName) {
    super('SSH Key with same name already exists');
    this.name = 'SSHKeyExistsError';
    this.rsaFileName = fileName;
  }
}

class DoNotOverrideKeysError extends Error {
  constructor() {
    super("User doesn't wishes to override ssh keys");
    this.name = 'DoNotOverrideKeysError';
  }
}

module.exports = { SSHKeyExistsError, DoNotOverrideKeysError };
