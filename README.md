# ezspeak

Voice-to-text transcription using OpenAI Whisper API. Press a button, speak, and text appears.

## Setup

```bash
npm install
npm start
```

Enter your [OpenAI API key](https://platform.openai.com/api-keys) when prompted.

## Usage

Press button → Speak → Press again → Text pastes automatically
OR
Hold button → Speak → Stop holding button → Text pastes automatically

## Build

```bash
npm run build
```

# Project Structure

- **Root**
  - `main.js`: Electron main process entry point.
  - `preload.js`: Bridge between Electron's main process and renderer.
  - `package.json`: App configuration and builder settings.
- **`src/`** (Backend logic and services)
  - `audioRecorder.js`: Handles microphone capture and temp file management.
  - `transcription.js`: Routes transcription between OpenAI API and local Whisper.
  - `localTranscription.js`: Wrapper for local `whisper-bin` execution.
  - `hotkeyManager.js`: Global key interception and smart hold/toggle logic.
  - `clipboardManager.js`: Handles auto-pasting functionality.
  - `config.js`: Persistent settings management (electron-store).
  - `logger.js`: Customized file and console logging.
- **`renderer/`** (Frontend UI)
  - `settings.html/js/css`: Main configuration interface.
  - `recording-indicator.html`: Floating UI overlay shown during active recording.
  - `microphone-selector.js`: Logic for detecting and selecting audio inputs.
- **`website/`**: Next.js landing page (Splash page) hosted on Vercel.
- **`whisper-bin/`**: Pre-built Whisper.cpp binaries for local transcription.
- **`scripts/`**: Utility scripts like `download-model.js` for local Whisper models.
- **`assets/`**: Store app icons (`.ico`, `.png`).
