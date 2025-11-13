// Configure PATH for ffmpeg-static before anything else loads
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const ffmpegDir = path.dirname(ffmpegPath);
const originalPath = process.env.PATH || '';
process.env.PATH = ffmpegDir + path.delimiter + originalPath;

const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, nativeTheme, shell } = require('electron');
const HotkeyManager = require('./src/hotkeyManager');
const AudioRecorder = require('./src/audioRecorder');
const TranscriptionService = require('./src/transcription');
const ClipboardManager = require('./src/clipboardManager');
const Config = require('./src/config');
const Logger = require('./src/logger');

// Configure shelljs globally for Electron compatibility
require('shelljs').config.execPath = process.execPath;

// Disable GPU to prevent flashing and GPU errors
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

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
    acceptFirstMouse: false, // Prevent window from stealing focus on macOS
    visibleOnAllWorkspaces: true, // Show on all desktops without stealing focus
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
    recordingIndicator.showInactive(); // Show without stealing focus
    // Trigger timer reset by sending a message to reload the page
    recordingIndicator.webContents.executeJavaScript('if (typeof startTimer === "function") startTimer();');
  } else {
    createRecordingIndicator();
    recordingIndicator.once('ready-to-show', () => {
      recordingIndicator.showInactive(); // Show without stealing focus
      // Trigger timer start after window is shown
      recordingIndicator.webContents.executeJavaScript('if (typeof startTimer === "function") startTimer();');
    });
  }
}

function hideRecordingIndicator() {
  if (recordingIndicator && !recordingIndicator.isDestroyed()) {
    recordingIndicator.hide();
  }
}

function createTray() {
  // Use SVG on macOS, ICO on Windows
  const iconFile = process.platform === 'darwin' ? 'icon.svg' : 'icon.ico';
  const iconPath = path.join(__dirname, 'assets', iconFile);
  const icon = nativeImage.createFromPath(iconPath);
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
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('ezspeak - Voice to Text');
}

function createSettingsWindow() {
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 550,
    resizable: false,
    frame: false, // Remove default frame for custom title bar
    show: false, // Don't show window automatically - only show when explicitly called
    skipTaskbar: false, // Show in taskbar when visible
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    },
    backgroundColor: '#1e1e1e'
  });

  settingsWindow.loadFile('renderer/settings.html');
  
  // Open DevTools only in dev mode
  if (process.argv.includes('--dev')) {
    settingsWindow.webContents.openDevTools({ mode: 'detach' });
    Logger.log('DevTools opened (dev mode)');
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}

function showSettingsWindow() {
  if (settingsWindow) {
    settingsWindow.show();
    settingsWindow.focus();
  } else {
    createSettingsWindow();
    settingsWindow.show();
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
    Logger.log(`Audio file size: ${fileSizeKB} KB`);

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

ipcMain.handle('is-configured', () => {
  return Config.isConfigured();
});

ipcMain.handle('get-microphone', () => {
  return Config.getMicrophoneDeviceId();
});

ipcMain.handle('set-microphone', (event, deviceId) => {
  Config.setMicrophoneDeviceId(deviceId);
  return true;
});

ipcMain.handle('get-hotkey', () => {
  return Config.getHotkey();
});

ipcMain.handle('set-hotkey', async (event, hotkey) => {
  Config.setHotkey(hotkey);
  
  // Restart hotkey monitoring with new key
  if (hotkeyManager) {
    Logger.log(`Changing hotkey to ${hotkey}, restarting monitoring...`);
    hotkeyManager.stopMonitoring();
    await hotkeyManager.startMonitoring();
  }
  
  return true;
});

ipcMain.handle('get-transcription-mode', () => {
  return Config.getTranscriptionMode();
});

ipcMain.handle('set-transcription-mode', (event, mode) => {
  Config.setTranscriptionMode(mode);
  Logger.log(`Transcription mode set to: ${mode}`);
  return true;
});

ipcMain.handle('check-model-downloaded', () => {
  return transcriptionService.localService.isModelDownloaded();
});

ipcMain.handle('download-model', async () => {
  try {
    await transcriptionService.localService.initialize();
    return { success: true };
  } catch (error) {
    Logger.error('Error downloading model:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.on('close-settings', () => {
  if (settingsWindow) {
    settingsWindow.close();
  }
});

ipcMain.on('minimize-window', () => {
  if (settingsWindow) {
    settingsWindow.minimize();
  }
});

ipcMain.on('open-external', (event, url) => {
  shell.openExternal(url);
});

// App lifecycle
app.whenReady().then(async () => {
  Logger.log('App ready, initializing...');
  
  // Force dark mode for window chrome
  nativeTheme.themeSource = 'dark';
  
  createTray();
  Logger.success('System tray created');
  
  createRecordingIndicator(); // Pre-create indicator
  Logger.success('Recording indicator created');
  
  await initializeServices();
  Logger.success('Services initialized');
  
  // Start monitoring for hotkey
  await hotkeyManager.startMonitoring();
  
  // Create settings window (needed for audio recording) but don't show it initially
  createSettingsWindow();
  Logger.success('Settings window created');
  
  // Only show settings window if not configured (first time setup)
  if (!Config.isConfigured()) {
    settingsWindow.show();
    Logger.log('First time setup - showing settings window');
  } else {
    Logger.log('App running in background - use tray icon to open settings');
  }
  
  console.log('\n========================================');
  console.log('   ezspeak is ready!');
  console.log('========================================\n');
});

app.on('window-all-closed', (event) => {
  // Don't quit the app when all windows are closed - keep running in system tray
  // This works on both Windows and macOS
});

app.on('activate', () => {
  // On macOS, clicking the dock icon should show the settings window
  showSettingsWindow();
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

