const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  getMode: () => ipcRenderer.invoke('get-mode'),
  setMode: (mode) => ipcRenderer.invoke('set-mode', mode),
  isConfigured: () => ipcRenderer.invoke('is-configured'),
  closeSettings: () => ipcRenderer.send('close-settings'),
  onStatusUpdate: (callback) => {
    ipcRenderer.on('status-update', (event, status) => callback(status));
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  // Audio recording IPC
  sendAudioData: (buffer) => ipcRenderer.send('audio-recorded', buffer),
  sendAudioError: (error) => ipcRenderer.send('audio-error', error),
  onStartRecording: (callback) => {
    ipcRenderer.on('start-recording', callback);
  },
  onStopRecording: (callback) => {
    ipcRenderer.on('stop-recording', callback);
  },
  // Manual recording controls
  manualRecordStart: () => ipcRenderer.send('manual-record-start'),
  manualRecordStop: () => ipcRenderer.send('manual-record-stop')
});

