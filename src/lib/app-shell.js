const ipcRenderer = window.ipcRenderer;

const openExternal = uri => {
  ipcRenderer.send('open-external', uri);
};

const openFolder = folderPath => {
  ipcRenderer.send('open-folder', folderPath);
};

module.exports = { openExternal, openFolder };
