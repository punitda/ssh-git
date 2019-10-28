const ipc = window.ipc;

const openExternal = async uri => {
  await ipc.callMain('open-external', uri);
};

const openFolder = async folderPath => {
  await ipc.callMain('open-folder', folderPath);
};

module.exports = { openExternal, openFolder };
