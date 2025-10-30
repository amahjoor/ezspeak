const { clipboard } = require('electron');
const { keyboard, Key } = require('@nut-tree-fork/nut-js');

class ClipboardManager {
  /**
   * Automatically paste text at the current cursor position
   * @param {string} text - The text to paste
   */
  static async autoPaste(text) {
    try {
      // Save current clipboard content
      const originalClipboard = clipboard.readText();
      
      // Copy text to clipboard
      clipboard.writeText(text);
      
      // Simulate Ctrl+V to paste
      await keyboard.pressKey(Key.LeftControl, Key.V);
      await keyboard.releaseKey(Key.LeftControl, Key.V);
      
      // Restore original clipboard after a short delay
      setTimeout(() => {
        clipboard.writeText(originalClipboard);
      }, 500);
      
      return true;
    } catch (error) {
      console.error('Error in auto-paste:', error);
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

