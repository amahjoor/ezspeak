const fs = require('fs');
const path = require('path');
const os = require('os');
const { ipcMain } = require('electron');
const Logger = require('./logger');

class AudioRecorder {
  constructor() {
    this.isRecording = false;
    this.tempFilePath = null;
    this.resolveStart = null;
    this.rejectStart = null;
    this.resolveStop = null;
    this.rejectStop = null;
    this.setupIPC();
    Logger.log('AudioRecorder initialized');
  }

  setupIPC() {
    Logger.debug('Setting up IPC handlers for audio recording');
    ipcMain.removeAllListeners('audio-recorded');
    ipcMain.removeAllListeners('audio-error');
    
    ipcMain.on('audio-recorded', (event, audioData) => {
      Logger.debug('Received audio-recorded event, data size:', audioData.length, 'bytes');
      
      // Calculate recording duration
      const recordingDuration = this.recordingStartTime 
        ? ((Date.now() - this.recordingStartTime) / 1000).toFixed(1) 
        : 'unknown';
      Logger.recording(`Recording duration: ${recordingDuration} seconds`);
      
      if (this.resolveStop) {
        try {
          const buffer = Buffer.from(audioData);
          const fileSizeKB = (buffer.length / 1024).toFixed(2);
          Logger.log(`Writing audio buffer to file: ${this.tempFilePath} (${fileSizeKB} KB)`);
          
          // Warn if file is very small
          if (buffer.length < 5000) {
            Logger.warn(`⚠️ Audio file is very small (${fileSizeKB} KB) - recording might be too short!`);
            Logger.warn('💡 Try speaking for at least 2-3 seconds for better transcription');
          }
          
          fs.writeFileSync(this.tempFilePath, buffer);
          this.isRecording = false;
          Logger.success(`Audio file written successfully (${fileSizeKB} KB, ${recordingDuration}s)`);
          
          // Clear the timeout since we got the data
          if (this.stopTimeoutId) {
            clearTimeout(this.stopTimeoutId);
            this.stopTimeoutId = null;
          }
          
          this.resolveStop(this.tempFilePath);
          this.resolveStop = null;
          this.rejectStop = null;
        } catch (error) {
          Logger.error('Error writing audio file:', error);
          if (this.rejectStop) {
            this.rejectStop(error);
            this.rejectStop = null;
          }
        }
      } else {
        Logger.warn('Received audio data but resolveStop is null');
      }
    });
    
    ipcMain.on('audio-error', (event, error) => {
      Logger.error('Received audio-error event:', error);
      if (this.rejectStart) {
        this.isRecording = false;
        this.rejectStart(new Error(error));
        this.rejectStart = null;
        this.resolveStart = null;
      } else if (this.rejectStop) {
        this.isRecording = false;
        this.rejectStop(new Error(error));
        this.rejectStop = null;
        this.resolveStop = null;
      } else {
        Logger.warn('Received audio error but no reject handlers available');
      }
    });
    
    Logger.success('IPC handlers set up');
  }

  async startRecording() {
    Logger.log('startRecording called');
    if (this.isRecording) {
      Logger.warn('Already recording');
      throw new Error('Recording already in progress');
    }

    const tempDir = path.join(os.tmpdir(), 'speakez');
    if (!fs.existsSync(tempDir)) {
      Logger.log('Creating temp directory:', tempDir);
      fs.mkdirSync(tempDir, { recursive: true });
    }

    this.tempFilePath = path.join(tempDir, `recording_${Date.now()}.webm`);
    this.isRecording = true;
    this.recordingStartTime = Date.now(); // Track when recording started
    Logger.log('Temp file path:', this.tempFilePath);
    Logger.log('⏱️ Recording started at:', new Date(this.recordingStartTime).toLocaleTimeString());

    return new Promise((resolve, reject) => {
      this.resolveStart = resolve;
      this.rejectStart = reject;
      
      Logger.log('Notifying windows to start recording...');
      // Notify any listening windows to start recording
      const { BrowserWindow } = require('electron');
      const windows = BrowserWindow.getAllWindows();
      Logger.log(`Found ${windows.length} windows`);
      
      let sent = 0;
      windows.forEach(win => {
        if (win && !win.isDestroyed()) {
          Logger.debug(`Sending start-recording to window: ${win.getTitle()}`);
          win.webContents.send('start-recording');
          sent++;
        }
      });
      
      Logger.log(`Sent start-recording to ${sent} windows`);
      setTimeout(() => {
        Logger.debug('Resolving startRecording promise');
        resolve(this.tempFilePath);
      }, 500);
    });
  }

  async stopRecording() {
    Logger.log('stopRecording called, isRecording:', this.isRecording);
    if (!this.isRecording) {
      Logger.error('Not recording - cannot stop');
      throw new Error('No recording in progress');
    }

    return new Promise((resolve, reject) => {
      Logger.log('Setting up promise handlers for stopRecording');
      this.resolveStop = resolve;
      this.rejectStop = reject;

      Logger.log('Notifying windows to stop recording...');
      // Notify any listening windows to stop recording
      const { BrowserWindow } = require('electron');
      const windows = BrowserWindow.getAllWindows();
      Logger.log(`Found ${windows.length} windows`);
      
      let sent = 0;
      windows.forEach(win => {
        if (win && !win.isDestroyed()) {
          Logger.debug(`Sending stop-recording to window: ${win.getTitle()}`);
          win.webContents.send('stop-recording');
          sent++;
        }
      });
      
      Logger.log(`Sent stop-recording to ${sent} windows`);

      // Timeout after 5 seconds
      this.stopTimeoutId = setTimeout(() => {
        Logger.warn('Recording timeout triggered - checking if audio was already received');
        Logger.debug('Checking promise handlers - resolveStop:', !!this.resolveStop, 'rejectStop:', !!this.rejectStop);
        
        // Only reject if we haven't already resolved
        if (this.rejectStop && typeof this.rejectStop === 'function') {
          this.isRecording = false;
          const error = new Error('Recording timeout - no audio received');
          this.rejectStop(error);
          this.rejectStop = null;
          this.resolveStop = null;
        } else if (this.resolveStop) {
          Logger.log('Audio already received, ignoring timeout');
        } else {
          Logger.debug('Promise already settled, timeout is harmless');
        }
      }, 5000);
    });
  }

  getRecordingStatus() {
    return this.isRecording;
  }

  cleanup() {
    Logger.log('Cleanup called');
    if (this.tempFilePath && fs.existsSync(this.tempFilePath)) {
      try {
        fs.unlinkSync(this.tempFilePath);
        Logger.log('Temp file deleted:', this.tempFilePath);
      } catch (error) {
        Logger.error('Error cleaning up:', error);
      }
    }
    this.tempFilePath = null;
  }
}

module.exports = AudioRecorder;
