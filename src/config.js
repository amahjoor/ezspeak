const Store = require('electron-store');
const os = require('os');

const HISTORY_MAX = 50;

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
    transcriptionHistory: [] // Array of { id, text, timestamp } objects
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

  static isConfigured() {
    const mode = this.getTranscriptionMode();
    // If offline mode, no API key needed
    if (mode === 'offline') {
      return true;
    }
    // If online mode, API key is required
    return this.getApiKey().length > 0;
  }

  // ─── Transcription history ───────────────────────────────────────

  static getHistory() {
    return store.get('transcriptionHistory', []);
  }

  static addToHistory(text) {
    const history = this.getHistory();
    const entry = {
      id: Date.now().toString(),
      text: text.trim(),
      timestamp: new Date().toISOString()
    };
    // Prepend newest first, then cap at max
    const updated = [entry, ...history].slice(0, HISTORY_MAX);
    store.set('transcriptionHistory', updated);
    return entry;
  }

  static clearHistory() {
    store.set('transcriptionHistory', []);
  }
}

module.exports = Config;

