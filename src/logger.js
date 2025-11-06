// Simple logger with timestamps
class Logger {
  static log(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] [INFO] ${message}`, ...args);
  }

  static success(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] [SUCCESS] ${message}`, ...args);
  }

  static error(message, ...args) {
    console.error(`[${new Date().toLocaleTimeString()}] [ERROR] ${message}`, ...args);
  }

  static warn(message, ...args) {
    console.warn(`[${new Date().toLocaleTimeString()}] [WARN] ${message}`, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG || process.argv.includes('--debug')) {
      console.log(`[${new Date().toLocaleTimeString()}] [DEBUG] ${message}`, ...args);
    }
  }

  static recording(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] [REC] ${message}`, ...args);
  }

  static transcription(message, ...args) {
    console.log(`[${new Date().toLocaleTimeString()}] [TRANSCRIPT] ${message}`, ...args);
  }
}

module.exports = Logger;

