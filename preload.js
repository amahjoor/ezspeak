const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  getMicrophone: () => ipcRenderer.invoke('get-microphone'),
  setMicrophone: (deviceId) => ipcRenderer.invoke('set-microphone', deviceId),
  getHotkey: () => ipcRenderer.invoke('get-hotkey'),
  setHotkey: (hotkey) => ipcRenderer.invoke('set-hotkey', hotkey),
  getTranscriptionMode: () => ipcRenderer.invoke('get-transcription-mode'),
  setTranscriptionMode: (mode) => ipcRenderer.invoke('set-transcription-mode', mode),
  checkModelDownloaded: () => ipcRenderer.invoke('check-model-downloaded'),
  downloadModel: () => ipcRenderer.invoke('download-model'),
  isConfigured: () => ipcRenderer.invoke('is-configured'),
  closeSettings: () => ipcRenderer.send('close-settings'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  onStatusUpdate: (callback) => {
    ipcRenderer.on('status-update', (event, status) => callback(status));
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
  onError: (callback) => {
    ipcRenderer.on('error', (event, message) => callback(message));
  }
});

