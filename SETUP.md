# SpeakEz Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run the Application**
   ```bash
   npm start
   ```

3. **First Time Configuration**
   - When the app starts, the settings window will appear
   - Enter your OpenAI API key (get one at https://platform.openai.com/api-keys)
   - Choose your recording mode (Toggle or Hold)
   - Click "Save Settings"

4. **Start Using**
   - Place cursor in any text field
   - Press **Right Ctrl** to start recording
   - Speak into your microphone
   - Press **Right Ctrl** again (toggle) or release (hold) to stop
   - Text will be automatically pasted!

## Building Native Modules

Some dependencies require native compilation:

### Windows

The `iohook` and `mic` modules require native compilation. If you encounter build errors:

1. Install Windows Build Tools:
   ```bash
   npm install --global windows-build-tools
   ```

2. Or install Visual Studio Build Tools manually from Microsoft

3. Rebuild native modules:
   ```bash
   npm rebuild
   ```

### Troubleshooting Native Modules

If `iohook` fails to build:
- The app will automatically fall back to polling method
- It will still work, but may use slightly more CPU

If `mic` fails:
- Check that you have a microphone connected
- Try running with administrator privileges
- Make sure microphone permissions are granted

## Icon Setup (Optional)

To add a custom icon for the system tray:

1. Create or download a 16x16 or 32x32 PNG icon
2. Save it as `assets/icon.png`
3. For Windows build, also create `assets/icon.ico`
4. Restart the application

## Requirements

- Node.js 16 or higher
- Windows 10 or later
- Microphone access
- OpenAI API key with credits

## Testing

Test the application:

1. Open a text editor (Notepad, Word, etc.)
2. Click in the text field
3. Press Right Ctrl
4. Say something like "Hello, this is a test"
5. Press Right Ctrl again
6. Wait a few seconds for transcription
7. Your text should appear!

## Common Issues

### "Mic module not available"
- Install Windows Build Tools
- Run `npm rebuild mic`
- Make sure you have a microphone connected

### "iohook not available"
- This is normal if native build fails
- App will use fallback method
- Functionality is preserved

### Hotkey not working
- Ensure Right Ctrl is not used by another app
- Try running as administrator
- Restart the application

### No transcription
- Check your API key is correct
- Verify you have OpenAI credits
- Check internet connection
- Look at console for error messages

