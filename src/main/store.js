const Store = require('electron-store');

const store = new Store({
  defaults: {
    skipVersions: [],
  },
});

module.exports = store;
