const Store = require('electron-store');

const store = new Store({
  name: 'easyspeak-config',
  defaults: {
    apiKey: '',
    mode: 'toggle', // 'toggle' or 'hold'
    microphoneDeviceId: 'default',
    hotkey: 'CtrlRight', // Default to Right Control
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
  }
});

class Config {
  static getApiKey() {
    return store.get('apiKey', '');
  }

  static setApiKey(apiKey) {
    store.set('apiKey', apiKey);
  }

  static getMode() {
    return store.get('mode', 'toggle');
  }

  static setMode(mode) {
    if (mode === 'toggle' || mode === 'hold') {
      store.set('mode', mode);
    }
  }

  static getMicrophoneDeviceId() {
    return store.get('microphoneDeviceId', 'default');
  }

  static setMicrophoneDeviceId(deviceId) {
    store.set('microphoneDeviceId', deviceId);
  }

  static getHotkey() {
    return store.get('hotkey', 'CtrlRight');
  }

  static setHotkey(hotkey) {
    store.set('hotkey', hotkey);
  }

  static getAudioSettings() {
    return {
      sampleRate: store.get('sampleRate', 16000),
      channels: store.get('channels', 1),
      bitDepth: store.get('bitDepth', 16)
    };
  }

  static isConfigured() {
    return this.getApiKey().length > 0;
  }
}

module.exports = Config;

