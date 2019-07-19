const ipcRenderer = window.ipcRenderer;

export const openExternal = path => {
  ipcRenderer.send('open-external', { path });
};
