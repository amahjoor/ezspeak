# SpeakEz 🎤

A Windows desktop app that enables one-key voice-to-text transcription using OpenAI Whisper API.

## Features

- **One-Click Recording**: Click Start/Stop buttons to record
- **Microphone Selection**: Choose from available microphones (Yeti, HyperX, etc.)
- **Automatic Transcription**: Uses OpenAI Whisper API for accurate transcription
- **Auto-Paste**: Automatically pastes transcribed text at cursor position
- **System Tray**: Runs quietly in background
- **Simple Settings**: Easy API key configuration

## Requirements

- Windows 10 or later
- Node.js 16+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Microphone access (Windows will prompt on first use)

## Installation

1. Clone this repository:
```bash
git clone <repository-url>
cd SpeakEz2
```

2. Install dependencies:
```bash
npm install
```

3. Start the application:
```bash
npm start
```

## Usage

1. **First Time Setup**:
   - The settings window will open automatically
   - Enter your OpenAI API key
   - Select your preferred recording mode (Toggle or Hold)
   - Click "Save Settings"

2. **Recording**:
   - Select your microphone from the dropdown (e.g., "Yeti Classic")
   - Place your cursor in any text field (browser, Word, email, etc.)
   - Click **"🎤 Start Recording"** button
   - Speak clearly for 3-10 seconds
   - Click **"⏹️ Stop Recording"** button
   - Wait a moment → text automatically pastes!

3. **System Tray**:
   - Right-click the system tray icon to:
     - View current status
     - Open Settings
     - View current mode
     - Quit the application

## Building for Distribution

To create a distributable Windows installer:

```bash
npm run build
```

The installer will be created in the `dist` directory.

## Configuration

Settings are stored locally in your user data directory:
- Windows: `%APPDATA%\speakez-config\config.json`

You can modify settings through the Settings window at any time.

## Troubleshooting

### Microphone not working
- Ensure your microphone is connected and enabled
- Check Windows microphone permissions for the app
- Try restarting the application

### API key errors
- Verify your OpenAI API key is correct
- Ensure you have credits in your OpenAI account
- Check your internet connection

### Hotkey not responding
- Ensure no other application is using the Right Ctrl key
- Try restarting the application
- Check if the app has proper permissions

### Transcription not pasting
- Ensure you have cursor focus in a text field
- Some applications may require explicit paste permission
- Try manually pasting (Ctrl+V) to verify clipboard works

## Technology Stack

- **Electron** - Desktop application framework
- **Node.js** - Backend runtime
- **OpenAI Whisper API** - Speech-to-text transcription
- **@nut-tree/nut-js** - Global hotkey detection and keyboard automation
- **mic** - Microphone recording
- **electron-store** - Configuration persistence

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

