const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  connect: (address) => ipcRenderer.invoke('connect', address),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  updateFactor: (factor) => ipcRenderer.invoke('update-factor', factor)
});