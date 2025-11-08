const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => ipcRenderer.invoke('get-api-key'),
  setApiKey: (key) => ipcRenderer.invoke('set-api-key', key),
  getMicrophone: () => ipcRenderer.invoke('get-microphone'),
  setMicrophone: (deviceId) => ipcRenderer.invoke('set-microphone', deviceId),
  getHotkey: () => ipcRenderer.invoke('get-hotkey'),
  setHotkey: (hotkey) => ipcRenderer.invoke('set-hotkey', hotkey),
  isConfigured: () => ipcRenderer.invoke('is-configured'),
  // Transcription mode
  getTranscriptionMode: () => ipcRenderer.invoke('get-transcription-mode'),
  setTranscriptionMode: (mode) => ipcRenderer.invoke('set-transcription-mode', mode),
  getWhisperModel: () => ipcRenderer.invoke('get-whisper-model'),
  setWhisperModel: (model) => ipcRenderer.invoke('set-whisper-model', model),
  // Model management
  isModelAvailable: (modelName) => ipcRenderer.invoke('is-model-available', modelName),
  getModelSize: (modelName) => ipcRenderer.invoke('get-model-size', modelName),
  downloadModel: (modelName, progressCallback) => ipcRenderer.invoke('download-model', modelName),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, percent, message) => callback(percent, message));
  },
  // Window controls
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
  }
});

