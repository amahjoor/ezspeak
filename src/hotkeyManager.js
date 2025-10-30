const Config = require('./config');
const Logger = require('./logger');

class HotkeyManager {
  constructor(onRecordStart, onRecordStop, globalShortcut) {
    this.onRecordStart = onRecordStart;
    this.onRecordStop = onRecordStop;
    this.globalShortcut = globalShortcut;
    this.isRecording = false;
    this.lastKeyPressTime = 0;
    this.keyPressDebounce = 300; // 300ms debounce for toggle mode
    this.holdModeTimer = null;
    this.isMonitoring = false;
    this.registeredHotkey = null;
  }

  /**
   * Start monitoring for hotkey
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      Logger.warn('Hotkey monitoring already active');
      return;
    }

    this.isMonitoring = true;
    Logger.log('Starting hotkey monitoring...');
    
    // Check if globalShortcut is available
    if (!this.globalShortcut) {
      Logger.error('CRITICAL: globalShortcut not available!');
      return;
    }
    
    Logger.log('globalShortcut API available:', !!this.globalShortcut);
    
    // Try multiple hotkeys in order of preference
    const hotkeys = ['F9', 'F8', 'F7', 'F6', 'CommandOrControl+Shift+R'];
    let registered = false;
    
    for (const hotkey of hotkeys) {
      try {
        Logger.debug(`Attempting to register hotkey: ${hotkey}`);
        const success = this.globalShortcut.register(hotkey, () => {
          Logger.debug(`Hotkey ${hotkey} pressed!`);
          this.handleHotkeyPress();
        });
        
        if (success) {
          Logger.success(`Hotkey registered: ${hotkey}`);
          console.log(`\n🎯 Press ${hotkey} to start/stop recording!\n`);
          registered = true;
          this.registeredHotkey = hotkey;
          break;
        } else {
          Logger.warn(`Failed to register ${hotkey}, trying next...`);
        }
      } catch (error) {
        Logger.error(`Error registering ${hotkey}:`, error.message);
      }
    }
    
    if (!registered) {
      Logger.error('CRITICAL: Could not register ANY hotkey! The app may not work.');
      Logger.error('Try closing other apps that might use these keys.');
    }
  }

  /**
   * Handle hotkey press
   */
  async handleHotkeyPress() {
    Logger.debug('Hotkey press detected');
    const mode = Config.getMode();
    const now = Date.now();
    
    // Debounce
    if (now - this.lastKeyPressTime < this.keyPressDebounce) {
      Logger.debug('Debounced - too soon after last press');
      return;
    }
    this.lastKeyPressTime = now;

    Logger.log(`Mode: ${mode}, Currently recording: ${this.isRecording}`);

    if (mode === 'toggle') {
      // Toggle mode: start on press, stop on next press
      if (!this.isRecording) {
        Logger.recording('Starting recording (toggle mode)');
        this.isRecording = true;
        if (this.onRecordStart) {
          await this.onRecordStart();
        }
      } else {
        Logger.recording('Stopping recording (toggle mode)');
        this.isRecording = false;
        if (this.onRecordStop) {
          await this.onRecordStop();
        }
      }
    } else {
      // Hold mode: not properly supported with globalShortcut
      // Just do toggle for now
      if (!this.isRecording) {
        this.isRecording = true;
        if (this.onRecordStart) {
          await this.onRecordStart();
        }
      } else {
        this.isRecording = false;
        if (this.onRecordStop) {
          await this.onRecordStop();
        }
      }
    }
  }

  /**
   * Stop monitoring for hotkey
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.holdModeTimer) {
      clearTimeout(this.holdModeTimer);
      this.holdModeTimer = null;
    }
    
    // Unregister all shortcuts
    if (this.globalShortcut) {
      try {
        this.globalShortcut.unregisterAll();
        Logger.log('Global hotkeys unregistered');
      } catch (error) {
        Logger.error('Error unregistering shortcuts:', error);
      }
    }
  }

  /**
   * Get current recording status
   */
  getRecordingStatus() {
    return this.isRecording;
  }
}

module.exports = HotkeyManager;
