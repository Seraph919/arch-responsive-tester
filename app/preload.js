const { contextBridge, ipcRenderer } = require('electron');

const bridgeAPI = {
  getThemeData: () => ipcRenderer.invoke('get-theme'),
  onThemeChanged: (callback) => {
    ipcRenderer.on('theme-changed', (event, data) => callback(data));
  },
  onLoadUrl: (callback) => {
    ipcRenderer.on('load-url', (event, url) => callback(url));
  },
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
};

// Expose as testerBridge and omarchyBridge for full compatibility
contextBridge.exposeInMainWorld('testerBridge', bridgeAPI);
contextBridge.exposeInMainWorld('omarchyBridge', bridgeAPI);
