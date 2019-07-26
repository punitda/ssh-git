const ipcRenderer = window.ipcRenderer;

const openExternal = path => {
  ipcRenderer.send('open-external', { path });
};

module.exports = { openExternal };
