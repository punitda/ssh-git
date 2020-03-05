const { getSshConfig } = require('./core');
const { KeyStore: store } = require('./ElectronStore');

const importStore = async () => {
  const keyStore = store.get('keyStore');
  try {
    const sshConfig = await getSshConfig();
    if (keyStore.length === 0 || keyStore.length !== sshConfig.length) {
      store.set('keyStore', sshConfig);
      return store.get('keyStore');
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
