# Whisper.cpp Binary Directory

This directory should contain the `whisper.exe` binary for local transcription support.

## Setup Instructions

### Option 1: Download Pre-built Binary (Recommended)

1. Go to: https://github.com/ggerganov/whisper.cpp/releases
2. Download the latest Windows release
3. Extract and copy `main.exe` or `whisper.exe` to this folder
4. Rename to `whisper.exe` if needed

### Option 2: Build from Source

```bash
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
mkdir build && cd build
cmake ..
cmake --build . --config Release
copy Release\main.exe <this_directory>\whisper.exe
```

## File Structure

```
bin/
  ├── whisper.exe    (Required for local transcription)
  └── README.md      (This file)
```

## Verification

To verify the binary works:

```bash
whisper.exe --help
```

You should see whisper.cpp help information.

## Troubleshooting

- **File not found**: Ensure the file is named exactly `whisper.exe`
- **Blocked by Windows**: Right-click → Properties → Check "Unblock"
- **Wrong architecture**: Ensure you downloaded the x64 version for 64-bit Windows

---

For more information, see: https://github.com/ggerganov/whisper.cpp

