const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const Logger = require('./logger');

class LocalTranscriptionService {
  constructor() {
    this.modelPath = null;
    this.modelName = 'base.en'; // Default model
    this.isInitialized = false;
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
        Logger.log('Model not found, will download on first use');
        await this.downloadModel(modelsDir);
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
   * Download Whisper model
   */
  async downloadModel(modelsDir) {
    Logger.log('Downloading Whisper model...');
    
    const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${this.modelName}.bin`;
    const axios = require('axios');
    
    try {
      Logger.log(`Downloading from: ${modelUrl}`);
      
      const response = await axios({
        method: 'GET',
        url: modelUrl,
        responseType: 'stream',
        timeout: 300000, // 5 minute timeout for download
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            if (percentCompleted % 10 === 0) {
              Logger.log(`Download progress: ${percentCompleted}%`);
            }
          }
        }
      });

      const writer = fs.createWriteStream(this.modelPath);
      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on('finish', () => {
          Logger.success('Model downloaded successfully!');
          resolve();
        });
        writer.on('error', reject);
      });
    } catch (error) {
      Logger.error('Error downloading model:', error);
      throw new Error('Failed to download Whisper model. Please check your internet connection.');
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

    const ffmpegPath = require('ffmpeg-static');
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
                transcription = fs.readFileSync(txtPath, 'utf8').trim();
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
    const binaryDir = path.join(__dirname, '..', 'whisper-bin');

    // Support either whisper-cli.exe or main.exe (common whisper.cpp CLI names on Windows)
    const candidates = process.platform === 'win32'
      ? ['whisper-cli.exe', 'main.exe']
      : ['whisper-cli', 'main'];

    for (const name of candidates) {
      const candidatePath = path.join(binaryDir, name);
      if (fs.existsSync(candidatePath)) {
        // Ensure executable bit or rely on Windows
        return candidatePath;
      }
    }

    // Not found - provide clear actionable instructions
    const expectedList = candidates.map(n => path.join(binaryDir, n)).join(' or ');
    throw new Error(
      `Whisper CLI not found. Please place a prebuilt whisper.cpp CLI at: ${expectedList}\n` +
      `Notes:\n` +
      `- Download a Windows build of whisper.cpp (the CLI is typically 'main.exe' or 'whisper-cli.exe').\n` +
      `- Put it in the 'whisper-bin' folder at the app root.\n` +
      `- Ensure your model exists at ${this.modelPath} (it does in your case).\n` +
      `After placing the binary, try again.`
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

