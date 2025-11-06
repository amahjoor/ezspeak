const Config = require('./config');
const Logger = require('./logger');
const { uIOhook, UiohookKey } = require('uiohook-napi');

class HotkeyManager {
  constructor(onRecordStart, onRecordStop, globalShortcut) {
    this.onRecordStart = onRecordStart;
    this.onRecordStop = onRecordStop;
    this.globalShortcut = globalShortcut;
    this.isRecording = false;
    this.lastKeyPressTime = 0;
    this.keyPressDebounce = 200; // 200ms debounce
    this.holdDetectionTime = 1000; // 1 second to detect hold mode
    this.keyDownTime = null;
    this.holdModeTimer = null;
    this.isMonitoring = false;
    this.registeredHotkey = null;
    this.uiohookStarted = false;
    this.isHoldMode = false; // Track if current recording is in hold mode
  }

  /**
   * Start monitoring for hotkey (smart mode: both toggle and hold)
   */
  async startMonitoring() {
    if (this.isMonitoring) {
      Logger.warn('Hotkey monitoring already active');
      return;
    }

    this.isMonitoring = true;
    Logger.log('Starting smart hotkey monitoring...');
    
    try {
      // Get saved hotkey from config
      const Config = require('./config');
      const hotkeyName = Config.getHotkey();
      const HOTKEY = UiohookKey[hotkeyName];
      
      if (!HOTKEY) {
        Logger.error(`Invalid hotkey: ${hotkeyName}`);
        return;
      }
      
      uIOhook.on('keydown', (e) => {
        if (e.keycode === HOTKEY) {
          this.handleKeyDown();
        }
      });
      
      uIOhook.on('keyup', (e) => {
        if (e.keycode === HOTKEY) {
          this.handleKeyUp();
        }
      });
      
      uIOhook.start();
      this.uiohookStarted = true;
      Logger.success(`Hotkey registered: ${hotkeyName} (smart mode)`);
      console.log(`\n>> Press ${hotkeyName} to toggle, or hold to record!\n`);
      
    } catch (error) {
      Logger.error('Error starting uiohook:', error.message);
      Logger.error('Smart mode requires uiohook to work properly');
    }
  }

  /**
   * Handle key down - start timer and potentially start recording
   */
  async handleKeyDown() {
    const now = Date.now();
    
    // Debounce to prevent key repeat (silent - no spam)
    if (this.keyDownTime && now - this.keyDownTime < this.keyPressDebounce) {
      return;
    }
    
    this.keyDownTime = now;
    
    // If already recording in toggle mode, mark for stopping on key up
    if (this.isRecording && !this.isHoldMode) {
      // Don't start a new timer, just let keyUp handle the stop
      return;
    }
    
    // If not recording, start timer to detect hold mode
    if (!this.isRecording) {
      this.holdModeTimer = setTimeout(async () => {
        // User held for 1 second, enter hold mode
        Logger.log('Hold mode activated, starting recording');
        this.isHoldMode = true;
        this.isRecording = true;
        if (this.onRecordStart) {
          await this.onRecordStart();
        }
      }, this.holdDetectionTime);
    }
  }

  /**
   * Handle key up - determine if toggle or hold mode
   */
  async handleKeyUp() {
    if (!this.keyDownTime) {
      return;
    }
    
    const now = Date.now();
    const pressDuration = now - this.keyDownTime;
    this.keyDownTime = null;
    
    // Clear the hold detection timer
    if (this.holdModeTimer) {
      clearTimeout(this.holdModeTimer);
      this.holdModeTimer = null;
    }
    
    // If in hold mode and recording, stop
    if (this.isHoldMode && this.isRecording) {
      Logger.log(`Hold mode: Stopping (${(pressDuration/1000).toFixed(1)}s)`);
      this.isHoldMode = false;
      this.isRecording = false;
      if (this.onRecordStop) {
        await this.onRecordStop();
      }
      return;
    }
    
    // If already recording in toggle mode, stop it
    if (this.isRecording && !this.isHoldMode) {
      Logger.log('Toggle: Stopping recording');
      this.isRecording = false;
      if (this.onRecordStop) {
        await this.onRecordStop();
      }
      return;
    }
    
    // Quick press (< 1 second) = toggle mode start
    if (pressDuration < this.holdDetectionTime) {
      // Debounce check
      if (now - this.lastKeyPressTime < this.keyPressDebounce) {
        return;
      }
      this.lastKeyPressTime = now;
      
      if (!this.isRecording) {
        Logger.log('Toggle: Starting recording');
        this.isRecording = true;
        this.isHoldMode = false;
        if (this.onRecordStart) {
          await this.onRecordStart();
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
    
    // Stop uiohook if it was started
    if (this.uiohookStarted) {
      try {
        uIOhook.stop();
        this.uiohookStarted = false;
        Logger.log('uiohook stopped');
      } catch (error) {
        Logger.error('Error stopping uiohook:', error);
      }
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
