const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const Logger = require('./logger');

const execAsync = promisify(exec);

class LocalTranscriptionService {
  constructor() {
    this.modelsDir = path.join(require('electron').app.getPath('userData'), 'whisper-models');
    this.whisperExecutable = null;
    this.initialized = false;
    
    // Ensure models directory exists
    if (!fs.existsSync(this.modelsDir)) {
      fs.mkdirSync(this.modelsDir, { recursive: true });
    }
    
    Logger.log('LocalTranscriptionService initialized, models dir:', this.modelsDir);
  }

  /**
   * Initialize the local transcription service
   */
  async initialize() {
    if (this.initialized) {
      return;
    }

    try {
      // Check if whisper.cpp executable exists
      // In development: __dirname/../bin/whisper.exe
      // In production (packaged): resources/bin/whisper.exe
      const { app } = require('electron');
      const isDev = !app.isPackaged;
      
      let whisperPath;
      if (isDev) {
        // Development path
        whisperPath = path.join(__dirname, '..', 'bin', 'whisper.exe');
      } else {
        // Production path (inside resources folder)
        whisperPath = path.join(process.resourcesPath, 'bin', 'whisper.exe');
      }
      
      Logger.log('Looking for whisper.exe at:', whisperPath);
      Logger.log('App packaged status:', !isDev);
      
      if (!fs.existsSync(whisperPath)) {
        Logger.warn('Whisper executable not found at:', whisperPath);
        throw new Error('Whisper executable not found. Please download whisper.cpp binaries.');
      }

      this.whisperExecutable = whisperPath;
      this.initialized = true;
      Logger.success('Local transcription service initialized successfully');
      Logger.log('Whisper executable path:', this.whisperExecutable);
    } catch (error) {
      Logger.error('Error initializing local transcription:', error.message);
      throw error;
    }
  }

  /**
   * Check if a model is available
   * @param {string} modelName - Model name (e.g., 'base', 'small', 'medium')
   */
  isModelAvailable(modelName) {
    const modelPath = path.join(this.modelsDir, `ggml-${modelName}.bin`);
    return fs.existsSync(modelPath);
  }

  /**
   * Get path to model file
   * @param {string} modelName - Model name
   */
  getModelPath(modelName) {
    return path.join(this.modelsDir, `ggml-${modelName}.bin`);
  }

  /**
   * Get list of available models
   */
  getAvailableModels() {
    if (!fs.existsSync(this.modelsDir)) {
      return [];
    }

    const files = fs.readdirSync(this.modelsDir);
    return files
      .filter(file => file.startsWith('ggml-') && file.endsWith('.bin'))
      .map(file => file.replace('ggml-', '').replace('.bin', ''));
  }

  /**
   * Get model download URLs
   */
  getModelDownloadUrl(modelName) {
    const baseUrl = 'https://huggingface.co/ggerganov/whisper.cpp/resolve/main';
    return `${baseUrl}/ggml-${modelName}.bin`;
  }

  /**
   * Transcribe audio file using local Whisper model
   * @param {string} audioFilePath - Path to the audio file
   * @param {string} modelName - Model name to use (default: 'base')
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribe(audioFilePath, modelName = 'base') {
    if (!this.initialized) {
      await this.initialize();
    }

    Logger.log('Starting local transcription...');
    Logger.log('Audio file:', audioFilePath);
    Logger.log('Model:', modelName);

    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Audio file not found');
    }

    const modelPath = this.getModelPath(modelName);
    if (!fs.existsSync(modelPath)) {
      throw new Error(`Model "${modelName}" not found. Please download it first.`);
    }

    try {
      // Convert audio to WAV 16kHz mono if needed
      const processedAudioPath = await this.prepareAudioFile(audioFilePath);

      // Run whisper.cpp
      const command = `"${this.whisperExecutable}" -m "${modelPath}" -f "${processedAudioPath}" -l en -nt --output-txt`;
      
      Logger.log('Executing whisper command...');
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer
      });

      Logger.log('Whisper stdout:', stdout);
      if (stderr) {
        Logger.log('Whisper stderr:', stderr);
      }

      // Read the output file
      const outputFilePath = processedAudioPath.replace(/\.[^.]+$/, '.txt');
      let transcribedText = '';

      if (fs.existsSync(outputFilePath)) {
        transcribedText = fs.readFileSync(outputFilePath, 'utf-8').trim();
        
        // Clean up output file
        try {
          fs.unlinkSync(outputFilePath);
        } catch (e) {
          Logger.warn('Could not delete output file:', e.message);
        }
      }

      // Clean up audio files
      try {
        if (audioFilePath !== processedAudioPath) {
          fs.unlinkSync(processedAudioPath);
        }
        fs.unlinkSync(audioFilePath);
        Logger.log('Temp audio files deleted');
      } catch (error) {
        Logger.warn('Error deleting temp audio files:', error.message);
      }

      Logger.transcription('Local transcription result:', transcribedText);
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

      Logger.error('Local transcription error:', error.message);
      throw new Error(`Local transcription failed: ${error.message}`);
    }
  }

  /**
   * Prepare audio file for whisper.cpp (requires 16kHz WAV mono)
   * @param {string} audioFilePath - Original audio file path
   * @returns {Promise<string>} - Path to prepared audio file
   */
  async prepareAudioFile(audioFilePath) {
    const ext = path.extname(audioFilePath).toLowerCase();
    
    // If already WAV, check if it needs resampling
    if (ext === '.wav') {
      // For now, assume it's already in the correct format
      // In production, you'd want to check sample rate and convert if needed
      return audioFilePath;
    }

    // For other formats, we would need ffmpeg to convert
    // For now, just return the path and hope it works
    Logger.warn('Audio file is not WAV format. Conversion may be needed.');
    return audioFilePath;
  }

  /**
   * Download a model from Hugging Face
   * @param {string} modelName - Model name to download
   * @param {function} progressCallback - Progress callback (percent, message)
   */
  async downloadModel(modelName, progressCallback) {
    const https = require('https');
    const modelUrl = this.getModelDownloadUrl(modelName);
    const modelPath = this.getModelPath(modelName);

    Logger.log(`Downloading model "${modelName}" from ${modelUrl}`);
    
    if (progressCallback) {
      progressCallback(0, `Starting download of ${modelName} model...`);
    }

    return new Promise((resolve, reject) => {
      https.get(modelUrl, { headers: { 'User-Agent': 'ezspeak' } }, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          https.get(response.headers.location, (redirectResponse) => {
            this.handleDownloadResponse(redirectResponse, modelPath, progressCallback, resolve, reject);
          }).on('error', reject);
        } else {
          this.handleDownloadResponse(response, modelPath, progressCallback, resolve, reject);
        }
      }).on('error', reject);
    });
  }

  /**
   * Handle download response
   */
  handleDownloadResponse(response, modelPath, progressCallback, resolve, reject) {
    if (response.statusCode !== 200) {
      reject(new Error(`Failed to download model: HTTP ${response.statusCode}`));
      return;
    }

    const totalSize = parseInt(response.headers['content-length'], 10);
    let downloadedSize = 0;
    const file = fs.createWriteStream(modelPath);

    response.on('data', (chunk) => {
      downloadedSize += chunk.length;
      const percent = Math.floor((downloadedSize / totalSize) * 100);
      
      if (progressCallback) {
        const sizeMB = (downloadedSize / 1024 / 1024).toFixed(1);
        const totalMB = (totalSize / 1024 / 1024).toFixed(1);
        progressCallback(percent, `Downloading: ${sizeMB}MB / ${totalMB}MB`);
      }
    });

    response.pipe(file);

    file.on('finish', () => {
      file.close();
      Logger.success(`Model "${path.basename(modelPath)}" downloaded successfully`);
      if (progressCallback) {
        progressCallback(100, 'Download complete!');
      }
      resolve(modelPath);
    });

    file.on('error', (err) => {
      fs.unlink(modelPath, () => {});
      reject(err);
    });
  }

  /**
   * Delete a model
   * @param {string} modelName - Model name to delete
   */
  deleteModel(modelName) {
    const modelPath = this.getModelPath(modelName);
    if (fs.existsSync(modelPath)) {
      fs.unlinkSync(modelPath);
      Logger.log(`Model "${modelName}" deleted`);
      return true;
    }
    return false;
  }

  /**
   * Get model file size in MB
   * @param {string} modelName - Model name
   */
  getModelSize(modelName) {
    const modelPath = this.getModelPath(modelName);
    if (fs.existsSync(modelPath)) {
      const stats = fs.statSync(modelPath);
      return (stats.size / 1024 / 1024).toFixed(1);
    }
    return null;
  }
}

module.exports = LocalTranscriptionService;

