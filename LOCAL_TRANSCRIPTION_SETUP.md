# Local Transcription Setup Guide

ezspeak now supports **offline, private transcription** using local Whisper models! Your voice never leaves your device.

## Quick Start

1. **Enable Local Mode**
   - Open ezspeak settings
   - Change "Transcription Mode" to "Local (Offline & Private)"
   - Select a Whisper model (Base recommended for balanced performance)
   - Click "Download Model" to download your selected model

2. **Download Whisper.cpp Binary** (First-time setup)
   - Download whisper.cpp for Windows from: https://github.com/ggerganov/whisper.cpp/releases
   - Extract `whisper.exe` (or `main.exe` renamed to `whisper.exe`)
   - Place it in: `D:\CODE\SpeakEz2\bin\whisper.exe`
   - Or build from source (see Advanced Setup below)

3. **Start Using**
   - Press your hotkey and speak
   - Transcription happens entirely on your device
   - No internet connection required!

## Model Comparison

| Model  | Size   | Speed      | Accuracy | Best For                |
|--------|--------|------------|----------|-------------------------|
| Tiny   | ~75MB  | Fastest    | Good     | Quick notes, testing    |
| Base   | ~142MB | Fast       | Better   | General use (Recommended)|
| Small  | ~466MB | Medium     | Great    | High accuracy needs     |
| Medium | ~1.5GB | Slower     | Excellent| Maximum accuracy        |

## Performance Tips

- **First run**: May take longer as models load into memory
- **RAM Usage**: Models stay in memory during app lifetime
  - Tiny/Base: ~500MB RAM
  - Small: ~1GB RAM
  - Medium: ~2.5GB RAM
- **CPU**: Works on any modern CPU, faster on newer processors
- **GPU**: Currently CPU-only (GPU support coming soon)

## Advanced Setup

### Building Whisper.cpp from Source

```bash
# Clone whisper.cpp
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp

# Build for Windows
mkdir build
cd build
cmake ..
cmake --build . --config Release

# Copy the executable
copy Release\main.exe D:\CODE\SpeakEz2\bin\whisper.exe
```

### Manual Model Download

Models are automatically downloaded from Hugging Face, but you can also download manually:

1. Go to: https://huggingface.co/ggerganov/whisper.cpp/tree/main
2. Download desired model (e.g., `ggml-base.bin`)
3. Place in: `%APPDATA%\ezspeak\whisper-models\`

## Troubleshooting

### "Whisper executable not found"
- Ensure `whisper.exe` is in the `bin` folder
- Check that it's not blocked by Windows (Right-click → Properties → Unblock)

### "Model not found"
- Download the model through settings
- Or manually place `.bin` file in the models directory

### Slow transcription
- Try a smaller model (Tiny or Base)
- Close other applications to free up CPU
- Ensure Windows isn't in power saving mode

### Audio format errors
- The app automatically converts audio to the required format
- If issues persist, ensure your microphone is working correctly

## Privacy & Security

✅ **What stays local:**
- All voice recordings
- All transcriptions
- All models
- All settings

✅ **What's never sent:**
- Your voice data
- Transcription results
- Any personal information

**100% Offline**: Once models are downloaded, no internet connection is needed.

## Switching Between Modes

You can switch between Cloud and Local modes anytime:

- **Cloud Mode**: Best accuracy, requires API key, costs ~$0.006/min
- **Local Mode**: Complete privacy, free forever, works offline

Settings are saved per mode, so switching is seamless!

## FAQ

**Q: How accurate is local transcription?**
A: Very accurate! Small and Medium models rival cloud accuracy. Base model is great for general use.

**Q: Can I use it without internet?**
A: Yes! After downloading models, everything works offline.

**Q: Does it work on older computers?**
A: Yes! Even Tiny model on older CPUs works well. Base model recommended for PCs from the last 5-7 years.

**Q: Can I delete models?**
A: Yes, delete `.bin` files from `%APPDATA%\ezspeak\whisper-models\` to free up space.

**Q: Which model should I choose?**
A: Start with Base (142MB). If it's too slow, use Tiny. If you need better accuracy, use Small.

## Contributing

Found a bug or have suggestions? Open an issue on GitHub!

---

Made with ❤️ by the ezspeak team

