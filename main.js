const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const HotkeyManager = require('./src/hotkeyManager');
const AudioRecorder = require('./src/audioRecorder');
const TranscriptionService = require('./src/transcription');
const ClipboardManager = require('./src/clipboardManager');
const Config = require('./src/config');
const Logger = require('./src/logger');

let mainWindow = null;
let settingsWindow = null;
let recordingIndicator = null;
let tray = null;
let hotkeyManager = null;
let audioRecorder = null;
let transcriptionService = null;
let recordingStatus = 'idle'; // 'idle', 'recording', 'processing'
let isRecording = false;


function createRecordingIndicator() {
  const { screen } = require('electron');
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width } = primaryDisplay.workAreaSize;

  recordingIndicator = new BrowserWindow({
    width: 180,
    height: 50,
    x: Math.floor(width / 2 - 90), // Center horizontally
    y: 20, // 20px from top
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    show: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  recordingIndicator.loadFile('renderer/recording-indicator.html');
  recordingIndicator.setIgnoreMouseEvents(false); // Allow dragging
}

function showRecordingIndicator() {
  if (recordingIndicator && !recordingIndicator.isDestroyed()) {
    recordingIndicator.show();
  } else {
    createRecordingIndicator();
    recordingIndicator.once('ready-to-show', () => {
      recordingIndicator.show();
    });
  }
}

function hideRecordingIndicator() {
  if (recordingIndicator && !recordingIndicator.isDestroyed()) {
    recordingIndicator.hide();
  }
}

function createTray() {
  const icon = nativeImage.createFromDataURL('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
  tray = new Tray(icon);
  updateTrayMenu();
  tray.on('double-click', () => {
    showSettingsWindow();
  });
}

function updateTrayMenu() {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: `Status: ${recordingStatus === 'recording' ? 'Recording...' : recordingStatus === 'processing' ? 'Processing...' : 'Ready'}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Settings',
      click: () => {
        showSettingsWindow();
      }
    },
    {
      label: `Mode: ${Config.getMode() === 'toggle' ? 'Toggle' : 'Hold'}`,
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('SpeakEz - Voice to Text');
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    autoHideMenuBar: true,
    title: 'SpeakEz Settings'
  });

  settingsWindow.loadFile('renderer/settings.html');
  
  // Open DevTools only in dev mode
  if (process.argv.includes('--dev')) {
    settingsWindow.webContents.openDevTools({ mode: 'detach' });
    Logger.log('💻 DevTools opened (dev mode)');
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function showSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.focus();
  } else {
    createSettingsWindow();
  }
}

async function initializeServices() {
  const { globalShortcut } = require('electron');
  
  audioRecorder = new AudioRecorder();
  transcriptionService = new TranscriptionService();
  
  // Initialize hotkey manager
  hotkeyManager = new HotkeyManager(
    handleRecordStart,
    handleRecordStop,
    globalShortcut
  );
}

async function handleRecordStart() {
  Logger.log('handleRecordStart called');
  
  if (isRecording) {
    Logger.warn('Already recording, ignoring start request');
    return;
  }

  if (!Config.isConfigured()) {
    Logger.warn('Not configured, showing settings window');
    showSettingsWindow();
    return;
  }

  try {
    Logger.recording('Starting recording...');
    isRecording = true;
    recordingStatus = 'recording';
    updateTrayMenu();
    showRecordingIndicator(); // Show visual indicator
    
    await audioRecorder.startRecording();
    Logger.success('Recording started successfully');
  } catch (error) {
    Logger.error('Error starting recording:', error);
    isRecording = false;
    recordingStatus = 'idle';
    updateTrayMenu();
    hideRecordingIndicator();
  }
}

async function handleRecordStop() {
  Logger.log('handleRecordStop called');
  
  if (!isRecording) {
    Logger.warn('Not recording, ignoring stop request');
    return;
  }

  try {
    Logger.recording('Stopping recording...');
    hideRecordingIndicator(); // Hide indicator immediately
    recordingStatus = 'processing';
    updateTrayMenu();
    isRecording = false;

    const audioFilePath = await audioRecorder.stopRecording();
    Logger.success('Recording stopped, file:', audioFilePath);
    
    // Check file size
    const stats = require('fs').statSync(audioFilePath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    Logger.log(`📊 Audio file size: ${fileSizeKB} KB`);

    if (!audioFilePath || !require('fs').existsSync(audioFilePath)) {
      throw new Error('Audio file was not created');
    }

    // Transcribe audio
    Logger.log('Sending to Whisper API for transcription...');
    const transcribedText = await transcriptionService.transcribe(audioFilePath);
    Logger.transcription('Transcription result:', transcribedText);

    if (transcribedText && transcribedText.trim().length > 0) {
      // Auto-paste the transcribed text
      Logger.log('Auto-pasting text...');
      await ClipboardManager.autoPaste(transcribedText.trim());
      Logger.success('Text pasted successfully!');
    } else {
      Logger.warn('No text to paste (empty transcription)');
    }

    recordingStatus = 'idle';
    updateTrayMenu();
  } catch (error) {
    Logger.error('Error in recording/transcription:', error.message);
    Logger.error('Stack:', error.stack);
    recordingStatus = 'idle';
    updateTrayMenu();
    hideRecordingIndicator();
    
    // Optionally show error notification
    if (settingsWindow) {
      settingsWindow.webContents.send('error', error.message);
    }
  }
}

// IPC Handlers
ipcMain.handle('get-api-key', () => {
  return Config.getApiKey();
});

ipcMain.handle('set-api-key', (event, key) => {
  Config.setApiKey(key);
  return true;
});

ipcMain.handle('get-mode', () => {
  return Config.getMode();
});

ipcMain.handle('set-mode', (event, mode) => {
  Config.setMode(mode);
  updateTrayMenu();
  return true;
});

ipcMain.handle('is-configured', () => {
  return Config.isConfigured();
});

ipcMain.on('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

ipcMain.on('manual-record-start', async () => {
  Logger.log('📍 Manual recording start requested from UI');
  await handleRecordStart();
});

ipcMain.on('manual-record-stop', async () => {
  Logger.log('📍 Manual recording stop requested from UI');
  await handleRecordStop();
});

// App lifecycle
app.whenReady().then(async () => {
  Logger.log('App ready, initializing...');
  
  createTray();
  Logger.success('System tray created');
  
  createRecordingIndicator(); // Pre-create indicator
  Logger.success('Recording indicator created');
  
  await initializeServices();
  Logger.success('Services initialized');
  
  // Start monitoring for hotkey
  await hotkeyManager.startMonitoring();
  
  // Always show settings window so audio recording works
  showSettingsWindow();
  Logger.success('Settings window shown');
  
  Logger.log('\n✨ SpeakEz is ready!\n');
});

app.on('window-all-closed', (event) => {
  // On Windows, keep app running even when all windows are closed
  // (since we're using system tray)
  if (process.platform !== 'darwin') {
    // Don't quit on Windows
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    showSettingsWindow();
  }
});

app.on('before-quit', () => {
  // Cleanup
  if (hotkeyManager) {
    hotkeyManager.stopMonitoring();
  }
  if (audioRecorder && audioRecorder.getRecordingStatus()) {
    audioRecorder.stopRecording().catch(console.error);
  }
  if (recordingIndicator && !recordingIndicator.isDestroyed()) {
    recordingIndicator.close();
  }
});

