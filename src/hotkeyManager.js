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
    this.isPaused = false; // True while the settings UI is capturing a new hotkey
    this.registeredHotkey = null;
    this.uiohookStarted = false;
    this.isHoldMode = false; // Track if current recording is in hold mode
    this.pressedKeys = new Set(); // Track currently pressed keys

    // Modifier mappings
    this.modifiers = {
      'Ctrl': [UiohookKey.Ctrl, UiohookKey.CtrlRight],
      'Alt': [UiohookKey.Alt, UiohookKey.AltRight],
      'Shift': [UiohookKey.Shift, UiohookKey.ShiftRight],
      'Meta': [UiohookKey.Meta, UiohookKey.MetaRight],
      'Command': [UiohookKey.Meta, UiohookKey.MetaRight], // MacOS alias
      'Cmd': [UiohookKey.Meta, UiohookKey.MetaRight]      // MacOS alias
    };
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
      const hotkeyString = Config.getHotkey();

      // Parse the hotkey string (e.g., "Ctrl+Shift+A")
      this.targetHotkey = this.parseHotkey(hotkeyString);

      if (!this.targetHotkey) {
        Logger.error(`Invalid hotkey config: ${hotkeyString}`);
        return;
      }

      Logger.log(`Parsed hotkey: ${JSON.stringify(this.targetHotkey)}`);

      uIOhook.on('keydown', (e) => {
        if (this.isPaused) return;
        this.pressedKeys.add(e.keycode);

        // Check if combination is met
        if (this.checkHotkey()) {
          this.handleKeyDown();
        }
      });

      uIOhook.on('keyup', (e) => {
        if (this.isPaused) {
          this.pressedKeys.delete(e.keycode);
          return;
        }
        // Stop recording if the main key or a required modifier is released
        // (If we were holding, releasing checks should happen here)

        const wasPressed = this.pressedKeys.has(e.keycode);
        this.pressedKeys.delete(e.keycode);

        if (wasPressed && (this.isMainKey(e.keycode) || this.isRequiredModifier(e.keycode))) {
          if (this.isMainKey(e.keycode)) {
            // Main key released - trigger keyup logic
            this.handleKeyUp();
          } else if (this.isRecording && this.isHoldMode) {
            // Modifier released while holding - valid release, stop recording
            this.handleKeyUp();
          }
        }
      });

      uIOhook.start();
      this.uiohookStarted = true;
      Logger.success(`Hotkey registered: ${hotkeyString} (smart mode)`);
      console.log(`\n>> Press ${hotkeyString} to toggle, or hold to record!\n`);

    } catch (error) {
      Logger.error('Error starting uiohook:', error.message);
      Logger.error('Smart mode requires uiohook to work properly');
    }
  }

  parseHotkey(hotkeyString) {
    if (!hotkeyString) return null;

    // Split by '+' and clean whitespace
    const parts = hotkeyString.split('+').map(p => p.trim());
    const conditions = [];

    for (const part of parts) {
      if (this.modifiers[part]) {
        // It's a modifier alias (e.g. "Ctrl" -> [Ctrl, CtrlRight])
        conditions.push(this.modifiers[part]);
      } else {
        // It's a specific key (e.g. "A" -> [A])
        const code = UiohookKey[part];
        if (code) {
          conditions.push([code]);
        }
      }
    }

    if (conditions.length === 0) return null;

    return conditions; // Array of arrays (CNF-ish: AND of ORs)
  }

  isMainKey(keycode) {
    // With generic combos, any key could be the "trigger" key.
    // We strictly check if the combo is satisfied in checkHotkey.
    // This helper might generally return true if the key exists in our conditions,
    // but for the "keyup" logic, we just want to know if a relevant key was released.
    if (!this.targetHotkey) return false;
    return this.targetHotkey.some(group => group.includes(keycode));
  }

  isRequiredModifier(keycode) {
    // Alias for compatibility, same logic as isMainKey in generic mode
    return this.isMainKey(keycode);
  }

  // New helper to check if a released key is part of the hotkey combination
  isRelevantKey(keycode) {
    if (!this.targetHotkey) return false;
    return this.targetHotkey.some(group => group.includes(keycode));
  }

  checkHotkey() {
    if (!this.targetHotkey) return false;

    // For every condition (key part), we need at least one of its variants pressed
    for (const validOptions of this.targetHotkey) {
      const isSatisfied = validOptions.some(code => this.pressedKeys.has(code));
      if (!isSatisfied) return false;
    }

    return true;
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
      Logger.log(`Hold mode: Stopping (${(pressDuration / 1000).toFixed(1)}s)`);
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
   * Temporarily ignore hotkey events while the UI is capturing a new hotkey.
   * uIOhook keeps running so we avoid the cost of stop/start.
   */
  pauseMonitoring() {
    this.isPaused = true;
    // Clear any in-progress press state so a half-registered keydown
    // during capture doesn't bleed into the next real press
    this.pressedKeys.clear();
    this.keyDownTime = null;
    if (this.holdModeTimer) {
      clearTimeout(this.holdModeTimer);
      this.holdModeTimer = null;
    }
    Logger.log('Hotkey monitoring paused (capturing new hotkey)');
  }

  /**
   * Resume normal hotkey handling after the UI finishes capturing.
   */
  resumeMonitoring() {
    this.pressedKeys.clear(); // discard any keys pressed during capture
    this.isPaused = false;
    Logger.log('Hotkey monitoring resumed');
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
