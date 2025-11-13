// Simple logger with timestamps and file logging
const fs = require('fs');
const path = require('path');
const os = require('os');

class Logger {
  static logFile = null;
  
  static init() {
    try {
      const { app } = require('electron');
      const logDir = path.join(app.getPath('userData'), 'logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      const logFile = path.join(logDir, `ezspeak-${new Date().toISOString().split('T')[0]}.log`);
      this.logFile = logFile;
      this.writeToFile('=== Logging started ===');
    } catch (e) {
      // If electron app not available, skip file logging
    }
  }
  
  static writeToFile(message) {
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, message + '\n', 'utf8');
      } catch (e) {
        // Ignore file write errors
      }
    }
  }
  
  static log(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [INFO] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.log(logMsg);
    this.writeToFile(logMsg);
  }

  static success(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [SUCCESS] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.log(logMsg);
    this.writeToFile(logMsg);
  }

  static error(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [ERROR] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.error(logMsg);
    this.writeToFile(logMsg);
  }

  static warn(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [WARN] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.warn(logMsg);
    this.writeToFile(logMsg);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG || process.argv.includes('--debug')) {
      const logMsg = `[${new Date().toLocaleTimeString()}] [DEBUG] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
      console.log(logMsg);
      this.writeToFile(logMsg);
    }
  }

  static recording(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [REC] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.log(logMsg);
    this.writeToFile(logMsg);
  }

  static transcription(message, ...args) {
    const logMsg = `[${new Date().toLocaleTimeString()}] [TRANSCRIPT] ${message} ${args.length > 0 ? JSON.stringify(args) : ''}`;
    console.log(logMsg);
    this.writeToFile(logMsg);
  }
}

module.exports = Logger;

