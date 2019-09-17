const ipcRenderer = window.ipcRenderer;

const openExternal = path => {
  ipcRenderer.send('open-external', path);
};

const openFolder = folderPath => {
  ipcRenderer.send('open-folder', folderPath);
};

module.exports = { openExternal, openFolder };
