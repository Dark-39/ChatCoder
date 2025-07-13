const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendPrompt: (text) => ipcRenderer.invoke('prompt-to-llama', text),
});
