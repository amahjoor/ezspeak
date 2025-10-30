// Simple logger with timestamps and emojis
const chalk = require('chalk');

class Logger {
  static log(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] ℹ️ ${message}`, ...args);
  }

  static success(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] ✅ ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`[${new Date().toLocaleTimeString()}] ❌ ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.warn(`[${new Date().toLocaleTimeString()}] ⚠️ ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG || process.argv.includes('--debug')) {
      console.log(`[${new Date().toLocaleTimeString()}] 🔍 ${message}`, ...args);
    }
  }

  static recording(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] 🎤 ${message}`, ...args);
  }

  static transcription(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] 📝 ${message}`, ...args);
  }
}

module.exports = Logger;

