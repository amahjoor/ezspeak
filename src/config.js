const Store = require('electron-store');
const os = require('os');

const store = new Store({
  name: 'ezspeak-config',
  defaults: {
    apiKey: '',
    mode: 'toggle', // 'toggle' or 'hold'
    microphoneDeviceId: 'default',
    hotkey: os.platform() === 'darwin' ? 'MetaRight' : 'CtrlRight', // Platform-specific: Right Command (⌘) on macOS, Right Ctrl on Windows/Linux
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16,
    transcriptionMode: 'online', // 'online' or 'offline'
    launchAtStartup: false,
    llmPostProcessing: true // Clean up transcription with LLM (requires API key)
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
    return store.get('hotkey'); // Uses the platform-specific default from store initialization
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

  static getTranscriptionMode() {
    return store.get('transcriptionMode', 'online');
  }

  static setTranscriptionMode(mode) {
    if (mode === 'online' || mode === 'offline') {
      store.set('transcriptionMode', mode);
    }
  }

  static getLaunchAtStartup() {
    return store.get('launchAtStartup', false);
  }

  static setLaunchAtStartup(enabled) {
    store.set('launchAtStartup', enabled);
  }

  static getLlmPostProcessing() {
    return store.get('llmPostProcessing', true);
  }

  static setLlmPostProcessing(enabled) {
    store.set('llmPostProcessing', enabled);
  }

  static isConfigured() {
    const mode = this.getTranscriptionMode();
    // If offline mode, no API key needed
    if (mode === 'offline') {
      return true;
    }
    // If online mode, API key is required
    return this.getApiKey().length > 0;
  }
}

module.exports = Config;

