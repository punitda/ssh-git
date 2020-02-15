const { getSshConfig } = require('./core');
const { KeyStore: store } = require('./ElectronStore');

const importStore = async () => {
  const keyStore = store.get('keyStore');
  try {
    if (keyStore.length === 0) {
      const sshConfig = await getSshConfig();
      store.set('keyStore', sshConfig);
    }
    return keyStore;
  } catch (error) {
    console.error('Error parsing ssh config file', error.message);
    return keyStore;
  }
};

const exportStore = keyStore => {
  try {
    store.set('keyStore', keyStore);
  } catch (error) {
    console.error('Error storing snapshot in store', error.message);
  }
};

module.exports = { importStore, exportStore };
