import { types } from 'mobx-state-tree';

const SshKey = types
  .model('sshkey', {
    provider: types.enumeration('provider', ['github', 'bitbucket', 'gitlab']),
    mode: types.enumeration('mode', ['SINGLE', 'MULTI']),
    path: types.string,
    username: types.string,
    email: types.optional(types.string, ''),
    avatar_url: types.optional(types.string, ''),
    bitbucket_uuid: types.optional(types.string, ''),
    label: types.optional(types.string, ''),
    state: types.optional(types.string, ''),
    token: types.optional(types.string, ''),
  })
  .actions(self => ({
    resetKey() {
      self.provider = 'github';
      self.email = '';
      self.username = '';
      self.avatar_url = '';
      self.path = '';
      self.mode = 'SINGLE';
      self.state = '';
      self.token = '';
    },
    addProvider(provider) {
      self.provider = provider;
    },
    addUserName(username) {
      self.username = username;
    },
    addKeyPath(path) {
      self.path = path;
    },
    addEmail(email) {
      self.email = email;
    },
    addAvatarUrl(avatar_url) {
      self.avatar_url = avatar_url;
    },
    addMode(mode) {
      self.mode = mode;
    },
    addState(state) {
      self.state = state;
    },
    addToken(token) {
      self.token = token;
    },
    addBitbucketUUID(bitbucket_uuid) {
      self.bitbucket_uuid = bitbucket_uuid;
    },
    addLabel(label) {
      self.label = label;
    },
  }));

const KeyStore = types
  .model('keystore', {
    sshKeys: types.array(SshKey),
  })
  .actions(self => ({
    addKey(key) {
      const {
        provider,
        path,
        mode,
        username = '',
        email = '',
        avatar_url = '',
        bitbucket_uuid = '',
        label = '',
      } = key;

      self.sshKeys.push({
        provider,
        path,
        mode,
        username,
        email,
        avatar_url,
        bitbucket_uuid,
        label,
      });
    },
    removeKey(key) {
      const keyIndex = self.sshKeys.findIndex(
        sshKey =>
          (sshKey.provider === key.provider &&
            sshKey.username === key.username) ||
          (sshKey.provider === key.provider && sshKey.path === key.path)
      );
      if (keyIndex !== -1) self.sshKeys.splice(keyIndex, 1);
    },
    addKeys(keys) {
      if (keys && keys.length > 0) {
        keys.forEach(key => {
          const {
            provider,
            path,
            mode,
            username = '',
            email = '',
            avatar_url = '',
            bitbucket_uuid = '',
            label = '',
          } = key;

          self.sshKeys.push({
            provider,
            path,
            mode,
            username,
            email,
            avatar_url,
            bitbucket_uuid,
            label,
          });
        });
      }
    },
    addUsername(key, username) {
      const keyIndex = self.sshKeys.findIndex(
        sshKey => sshKey.provider === key.provider && sshKey.path === key.path
      );

      if (keyIndex !== -1) {
        const updatedKey = { ...key, username };
        self.sshKeys.splice(keyIndex, 1, updatedKey);
      }
    },
    addLabel(key, label) {
      const keyIndex = self.sshKeys.findIndex(
        sshKey => sshKey.provider === key.provider && sshKey.path === key.path
      );

      if (keyIndex !== -1) {
        const updatedKey = { ...key, label };
        self.sshKeys.splice(keyIndex, 1, updatedKey);
      }
    },
    clear() {
      self.sshKeys = [];
    },
  }))
  .views(self => ({
    getMode(provider) {
      const matchingProviders = self.sshKeys.filter(
        sshKey => sshKey.provider === provider
      );
      return matchingProviders.length > 0 ? 'MULTI' : 'SINGLE';
    },
    checkIfKeyAlreadyExists(provider, username) {
      if (!username) return false;

      const matches = self.sshKeys.filter(
        sshKey => sshKey.provider === provider && sshKey.username === username
      );
      return matches.length > 0;
    },
    getModeOfExistingKeyInStore(provider, username) {
      const matches = self.sshKeys.filter(
        sshKey => sshKey.provider === provider && sshKey.username === username
      );

      if (matches.length > 0) {
        return matches[0].mode ? matches[0].mode : 'SINGLE';
      } else {
        return 'SINGLE';
      }
    },
    get keysGroupByProvider() {
      return groupBy(self.sshKeys, 'provider', {
        github: [],
        bitbucket: [],
        gitlab: [],
      });
    },
    get totalNoOfKeys() {
      return self.sshKeys.length;
    },
  }));

const RootStore = types.model('RootStore', {
  keyStore: types.optional(KeyStore, {}),
  sessionStore: types.optional(SshKey, {
    provider: 'github',
    username: '',
    path: '',
    mode: 'SINGLE',
  }),
});

const store = RootStore.create({});

function groupBy(objectArray, property, initialValue = {}) {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, initialValue);
}

export default store;
