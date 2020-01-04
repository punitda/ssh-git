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

module.exports = { VersionStore, TrackingIdStore };
