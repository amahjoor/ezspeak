const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Logger = require('./logger');

class LocalTranscriptionService {
  constructor() {
    this.modelPath = null;
    this.modelName = 'base.en'; // Default model
    this.isInitialized = false;
    this.ffmpegPath = null; // Cache for extracted FFmpeg path
    Logger.log('LocalTranscriptionService initialized');
  }

  /**
   * Initialize the local transcription service
   * Downloads model if needed
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const { app } = require('electron');
      const modelsDir = path.join(app.getPath('userData'), 'whisper-models');

      // Ensure models directory exists
      if (!fs.existsSync(modelsDir)) {
        fs.mkdirSync(modelsDir, { recursive: true });
        Logger.log('Created models directory:', modelsDir);
      }

      this.modelPath = path.join(modelsDir, `ggml-${this.modelName}.bin`);

      // Check if model exists
      if (!fs.existsSync(this.modelPath)) {
        Logger.log('Model not found, copying from bundle...');
        await this.copyBundledModel(modelsDir);
      } else {
        Logger.success('Local Whisper model found:', this.modelPath);
      }

      this.isInitialized = true;
    } catch (error) {
      Logger.error('Error initializing local transcription:', error);
      throw error;
    }
  }

  /**
   * Copy bundled Whisper model to userData
   */
  async copyBundledModel(modelsDir) {
    Logger.log('Copying bundled Whisper model...');

    let bundledModelPath;
    try {
      const { app } = require('electron');
      if (app && app.isPackaged) {
        // Production: model is in process.resourcesPath
        bundledModelPath = path.join(process.resourcesPath, 'whisper-models', `ggml-${this.modelName}.bin`);
      } else {
        // Development: model is in project root
        bundledModelPath = path.join(__dirname, '..', 'whisper-models', `ggml-${this.modelName}.bin`);
      }
    } catch (e) {
      // Fallback
      bundledModelPath = path.join(process.resourcesPath || path.join(__dirname, '..'), 'whisper-models', `ggml-${this.modelName}.bin`);
    }

    if (!fs.existsSync(bundledModelPath)) {
      throw new Error(`Bundled model not found at: ${bundledModelPath}. Please ensure the build includes the whisper-models folder.`);
    }

    try {
      fs.copyFileSync(bundledModelPath, this.modelPath);
      Logger.success('Model copied successfully!');
    } catch (error) {
      Logger.error('Error copying bundled model:', error);
      throw new Error('Failed to copy Whisper model from bundle.');
    }
  }

  /**
   * Get FFmpeg path, extracting from app.asar if needed
   */
  async getFfmpegPath() {
    // Return cached path if available
    if (this.ffmpegPath && fs.existsSync(this.ffmpegPath)) {
      return this.ffmpegPath;
    }

    let ffmpegPath = require('ffmpeg-static');
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static not found. Please ensure it is installed.');
    }

    // Check if FFmpeg is inside app.asar (packaged build)
    if (ffmpegPath.includes('app.asar')) {
      Logger.log('FFmpeg is inside app.asar, extracting...');

      try {
        const { app } = require('electron');
        const userDataPath = app.getPath('userData');
        const ffmpegDir = path.join(userDataPath, 'ffmpeg');
        const extractedPath = path.join(ffmpegDir, process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');

        // Create directory if it doesn't exist
        if (!fs.existsSync(ffmpegDir)) {
          fs.mkdirSync(ffmpegDir, { recursive: true });
        }

        // Extract FFmpeg if not already extracted
        if (!fs.existsSync(extractedPath)) {
          Logger.log('Extracting FFmpeg to:', extractedPath);
          const ffmpegBuffer = fs.readFileSync(ffmpegPath);
          fs.writeFileSync(extractedPath, ffmpegBuffer);

          // Make executable on Unix systems
          if (process.platform !== 'win32') {
            fs.chmodSync(extractedPath, 0o755);
          }

          Logger.success('FFmpeg extracted successfully');
        } else {
          Logger.log('FFmpeg already extracted');
        }

        this.ffmpegPath = extractedPath;
        return extractedPath;
      } catch (error) {
        Logger.error('Error extracting FFmpeg:', error);
        // Fallback to original path (might fail, but worth trying)
        this.ffmpegPath = ffmpegPath;
        return ffmpegPath;
      }
    } else {
      // Development mode or already extracted
      this.ffmpegPath = ffmpegPath;
      return ffmpegPath;
    }
  }

  /**
   * Convert audio file to WAV format if needed
   * whisper.cpp prefers 16kHz WAV files
   */
  async convertToWav(audioFilePath) {
    const ext = path.extname(audioFilePath).toLowerCase();
    if (ext === '.wav') {
      return audioFilePath;
    }

    // Use getFfmpegPath() to handle app.asar extraction
    const ffmpegPath = await this.getFfmpegPath();
    if (!ffmpegPath) {
      throw new Error('ffmpeg-static not found. Please ensure it is installed.');
    }

    const wavPath = audioFilePath.replace(/\.[^.]+$/, '.wav');
    const args = [
      '-nostats',
      '-loglevel', 'error',
      '-y',
      '-i', audioFilePath,
      '-ar', '16000',        // 16 kHz sample rate
      '-ac', '1',            // mono
      '-c:a', 'pcm_s16le',   // 16-bit PCM
      wavPath
    ];

    Logger.log('Converting to WAV (16kHz mono):', wavPath);
    await new Promise((resolve, reject) => {
      const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stderr = '';
      proc.stderr.on('data', d => { stderr += d.toString(); });
      proc.on('close', code => {
        if (code === 0) return resolve();
        reject(new Error(`ffmpeg failed (code ${code}): ${stderr}`));
      });
      proc.on('error', reject);
    });

    return wavPath;
  }

  /**
   * Transcribe audio file using local Whisper model
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribe(audioFilePath) {
    try {
      // Ensure model is downloaded first
      await this.initialize();

      if (!fs.existsSync(audioFilePath)) {
        Logger.error('Audio file not found:', audioFilePath);
        throw new Error('Audio file not found');
      }

      const stats = fs.statSync(audioFilePath);
      Logger.log(`Transcribing locally: ${path.basename(audioFilePath)}, Size: ${(stats.size / 1024).toFixed(2)} KB`);

      if (!fs.existsSync(this.modelPath)) {
        throw new Error('Whisper model not found. Please ensure the model is downloaded.');
      }

      // Convert to WAV (16kHz mono) if needed
      const wavPath = await this.convertToWav(audioFilePath);

      // Use whisper.cpp CLI
      Logger.log('Starting local transcription with whisper.cpp binary...');
      const result = await this.transcribeWithWhisperBinary(wavPath);

      Logger.log('Transcription result received:', typeof result);

      let transcribedText = '';

      if (Array.isArray(result)) {
        // whisper-node returns array of {start, end, speech} objects
        transcribedText = result.map(segment => segment.speech).join(' ').trim();
      } else if (typeof result === 'string') {
        transcribedText = result.trim();
      } else if (result && result.text) {
        transcribedText = result.text.trim();
      }

      Logger.transcription('Local transcription result:', `"${transcribedText}"`);
      Logger.log('Transcription length:', transcribedText.length, 'characters');

      // Clean up audio files after transcription
      try {
        fs.unlinkSync(audioFilePath);
        Logger.log('Temp audio file deleted');
        if (wavPath !== audioFilePath && fs.existsSync(wavPath)) {
          fs.unlinkSync(wavPath);
        }
        const wavTxt = `${wavPath}.txt`;
        if (fs.existsSync(wavTxt)) fs.unlinkSync(wavTxt);
      } catch (error) {
        Logger.warn('Error deleting temp audio file:', error.message);
      }

      return transcribedText;
    } catch (error) {
      // Clean up audio file even on error
      try {
        if (fs.existsSync(audioFilePath)) {
          fs.unlinkSync(audioFilePath);
        }
      } catch (cleanupError) {
        Logger.error('Error deleting temp audio file:', cleanupError);
      }

      Logger.error('Local transcription error:', error);
      throw new Error(`Local transcription failed: ${error.message}`);
    }
  }

  async transcribeWithWhisperBinary(audioFilePath) {
    const { spawn } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    return new Promise(async (resolve, reject) => {
      try {
        // Ensure we have the whisper binary
        const binaryPath = await this.ensureWhisperBinary();
        Logger.log('Using whisper binary:', binaryPath);

        // whisper.cpp (main/whisper-cli) options:
        //  -m <model>  -f <audio.wav>  -l <lang>  -otxt  -np (no prints)
        const args = [
          '-m', this.modelPath,
          '-f', audioFilePath,
          '-l', 'en',
          '-otxt',
          '-np'  // Suppress extra output, just generate the .txt file
        ];

        Logger.log('Running whisper command:', binaryPath, args.join(' '));

        // Set working directory to whisper-bin so DLLs can be found
        const binaryDir = path.dirname(binaryPath);

        const whisperProcess = spawn(binaryPath, args, {
          stdio: ['pipe', 'pipe', 'pipe'],
          cwd: binaryDir,  // Set working directory so DLLs are found
          env: { ...process.env, PATH: process.env.PATH }
        });

        let stdout = '';
        let stderr = '';

        whisperProcess.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        whisperProcess.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        whisperProcess.on('close', (code) => {
          if (code === 0) {
            // Prefer reading the generated .txt file
            const txtPath = `${audioFilePath}.txt`;
            let transcription = '';
            if (fs.existsSync(txtPath)) {
              try {
                // Read text and replace newlines with spaces to prevent hard wrapping
                transcription = fs.readFileSync(txtPath, 'utf8')
                  .replace(/[\r\n]+/g, ' ') // Replace line breaks with spaces
                  .replace(/\s+/g, ' ')      // Collapse multiple spaces
                  .trim();
              } catch (e) {
                Logger.warn('Failed reading generated txt file, falling back to stdout');
              }
            }
            // Fallback parsing stdout (not guaranteed)
            if (!transcription) {
              const lines = stdout.split('\n').filter(line => line.trim() && !line.startsWith('['));
              transcription = lines.join(' ').trim();
            }
            Logger.log('Whisper transcription successful');
            resolve([{ speech: transcription, start: '00:00:00.000', end: '00:00:10.000' }]);
          } else {
            Logger.error('Whisper process failed with code:', code);
            Logger.error('stdout:', stdout);
            Logger.error('stderr:', stderr);
            const errorMsg = stderr || stdout || `Process exited with code ${code}`;
            reject(new Error(`Whisper binary failed: ${errorMsg}`));
          }
        });

        whisperProcess.on('error', (error) => {
          Logger.error('Whisper process error:', error);
          reject(error);
        });

      } catch (error) {
        Logger.error('Error in transcribeWithWhisperBinary:', error);
        reject(error);
      }
    });
  }

  async ensureWhisperBinary() {
    const fs = require('fs');
    const path = require('path');

    // In production, extraResources are in process.resourcesPath
    // In development, they're in the project root
    let binaryDir;
    try {
      const { app } = require('electron');
      if (app && app.isPackaged) {
        // Production: extraResources are in process.resourcesPath
        binaryDir = path.join(process.resourcesPath, 'whisper-bin');
      } else {
        // Development: in project root
        binaryDir = path.join(__dirname, '..', 'whisper-bin');
      }
    } catch (e) {
      // Fallback: check if we're in packaged app by checking process.resourcesPath
      if (process.resourcesPath) {
        binaryDir = path.join(process.resourcesPath, 'whisper-bin');
      } else {
        binaryDir = path.join(__dirname, '..', 'whisper-bin');
      }
    }

    Logger.log('Looking for whisper binary in:', binaryDir);
    Logger.log('process.resourcesPath:', process.resourcesPath);
    Logger.log('__dirname:', __dirname);
    Logger.log('Directory exists:', fs.existsSync(binaryDir));

    // Check if directory exists
    if (!fs.existsSync(binaryDir)) {
      Logger.error('Whisper binary directory does not exist:', binaryDir);
      Logger.log('Trying alternative paths...');

      // Try alternative paths
      const alternatives = [
        path.join(process.resourcesPath || '', 'whisper-bin'),
        path.join(__dirname, '..', 'whisper-bin'),
        path.join(process.cwd(), 'whisper-bin')
      ];

      // Try to get app path if available
      try {
        const { app } = require('electron');
        if (app && app.getAppPath) {
          alternatives.push(path.join(app.getAppPath(), 'whisper-bin'));
        }
      } catch (e) {
        // Ignore if app not available
      }

      for (const altPath of alternatives) {
        Logger.log('Checking alternative:', altPath);
        if (fs.existsSync(altPath)) {
          Logger.log('Found binary directory at:', altPath);
          binaryDir = altPath;
          break;
        }
      }
    }

    // List files in directory for debugging
    if (fs.existsSync(binaryDir)) {
      try {
        const files = fs.readdirSync(binaryDir);
        Logger.log('Files in binary directory:', files.join(', '));
      } catch (e) {
        Logger.error('Error reading binary directory:', e);
      }
    }

    // Support either whisper-cli.exe or main.exe (common whisper.cpp CLI names on Windows)
    const candidates = process.platform === 'win32'
      ? ['whisper-cli.exe', 'main.exe']
      : ['whisper-cli', 'main'];

    for (const name of candidates) {
      const candidatePath = path.join(binaryDir, name);
      Logger.log('Checking for:', candidatePath, 'exists:', fs.existsSync(candidatePath));
      if (fs.existsSync(candidatePath)) {
        Logger.log('Found whisper binary:', candidatePath);
        return candidatePath;
      }
    }

    // Not found - provide clear actionable instructions
    const expectedList = candidates.map(n => path.join(binaryDir, n)).join(' or ');
    Logger.error('Whisper CLI not found at:', expectedList);
    throw new Error(
      `Whisper CLI not found. Expected location: ${expectedList}\n` +
      `Please ensure the whisper-bin folder is included in the app build.`
    );
  }

  /**
   * Check if model is downloaded
   */
  isModelDownloaded() {
    // Ensure modelPath is set
    if (!this.modelPath) {
      const { app } = require('electron');
      const modelsDir = path.join(app.getPath('userData'), 'whisper-models');
      this.modelPath = path.join(modelsDir, `ggml-${this.modelName}.bin`);
    }
    return this.modelPath && fs.existsSync(this.modelPath);
  }

  /**
   * Get model info
   */
  getModelInfo() {
    return {
      name: this.modelName,
      path: this.modelPath,
      downloaded: this.isModelDownloaded()
    };
  }
}

module.exports = LocalTranscriptionService;

