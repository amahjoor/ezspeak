# ezspeak

Voice-to-text transcription for Windows. Press a button, speak naturally, and watch your words appear instantly.

## ✨ Features

- 🎤 **One-Key Recording** - Press hotkey to start/stop recording
- 🔒 **Local & Private** - Run Whisper models offline on your device
- ☁️ **Cloud Option** - Use OpenAI API for best accuracy
- 🎯 **Auto-Paste** - Text appears instantly at cursor
- ⚙️ **Customizable** - Set your own hotkey and preferences
- 🌍 **50+ Languages** - Multilingual support

## 🚀 Quick Start

### Installation

```bash
npm install
npm start
```

### Choose Your Mode

**Option 1: Cloud Mode (OpenAI API)**
- Enter your [OpenAI API key](https://platform.openai.com/api-keys) in settings
- Best accuracy, costs ~$0.006 per minute
- Requires internet connection

**Option 2: Local Mode (Offline & Private)** 🆕
- No API key needed
- 100% free and private
- Works completely offline
- See [LOCAL_TRANSCRIPTION_SETUP.md](LOCAL_TRANSCRIPTION_SETUP.md) for setup

## 📝 Usage

**Toggle Mode:**
Press button → Speak → Press again → Text pastes automatically

**Hold Mode:**
Hold button → Speak → Release button → Text pastes automatically

## 🔐 Privacy & Security

**Local Mode:**
- ✅ Your voice NEVER leaves your device
- ✅ 100% offline after model download
- ✅ No data collection
- ✅ Complete privacy

**Cloud Mode:**
- Audio sent to OpenAI API for transcription
- Immediately deleted after processing
- API key stored locally and encrypted

## 🏗️ Build

```bash
npm run build
```

The installer will be created in the `dist/` folder.

## 📚 Documentation

- [Local Transcription Setup Guide](LOCAL_TRANSCRIPTION_SETUP.md)
- [Website](website/) - Next.js landing page

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT

## 🌟 Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition model
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) - C/C++ implementation for local inference

