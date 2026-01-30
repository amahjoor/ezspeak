const { clipboard } = require('electron');
const { keyboard, Key } = require('@nut-tree-fork/nut-js');
const os = require('os');

class ClipboardManager {
  /**
   * Automatically paste text at the current cursor position
   * @param {string} text - The text to paste
   * @param {object} [options]
   * @param {boolean} [options.preserveClipboard=false] - Keep transcription in clipboard after paste
   */
  static async autoPaste(text, options = {}) {
    const { preserveClipboard = false } = options;
    const originalClipboard = preserveClipboard ? null : clipboard.readText();

    try {
      // Copy text to clipboard
      clipboard.writeText(text);
      
      // Use Cmd+V on macOS, Ctrl+V on Windows/Linux
      const isMac = os.platform() === 'darwin';
      const modifierKey = isMac ? Key.LeftSuper : Key.LeftControl;
      
      await keyboard.pressKey(modifierKey, Key.V);
      await keyboard.releaseKey(modifierKey, Key.V);
      
      if (!preserveClipboard) {
        // Restore original clipboard after a short delay
        setTimeout(() => {
          clipboard.writeText(originalClipboard);
        }, 500);
      }
      
      return true;
    } catch (error) {
      console.error('Error in auto-paste:', error);
      if (!preserveClipboard && originalClipboard !== null) {
        clipboard.writeText(originalClipboard);
      }
      return false;
    }
  }

  /**
   * Copy text to clipboard without pasting
   * @param {string} text - The text to copy
   */
  static copy(text) {
    clipboard.writeText(text);
  }
}

module.exports = ClipboardManager;

