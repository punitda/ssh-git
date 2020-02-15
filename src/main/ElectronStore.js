const Store = require('electron-store');
const uuid = require('uuid/v4');

const VersionStore = new Store({
  defaults: {
    skipVersions: [],
  },
});

const TrackingIdStore = new Store({
  defaults: {
    userId: uuid(),
  },
});

const KeyStore = new Store({
  defaults: {
    keyStore: [],
  },
});

module.exports = { VersionStore, TrackingIdStore, KeyStore };
