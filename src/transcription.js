const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Config = require('./config');
const Logger = require('./logger');
const LocalTranscriptionService = require('./localTranscription');

class TranscriptionService {
  constructor() {
    this.apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
    this.localService = new LocalTranscriptionService();
    Logger.log('TranscriptionService initialized, API URL:', this.apiUrl);
  }

  /**
   * Transcribe audio file using OpenAI Whisper API (online mode)
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribe(audioFilePath) {
    const transcriptionMode = Config.getTranscriptionMode();
    
    Logger.log(`Transcription mode: ${transcriptionMode}`);
    
    // Route to appropriate service
    if (transcriptionMode === 'offline') {
      return await this.transcribeOffline(audioFilePath);
    } else {
      return await this.transcribeOnline(audioFilePath);
    }
  }

  /**
   * Transcribe audio file using local Whisper model (offline mode)
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeOffline(audioFilePath) {
    Logger.log('Using offline transcription...');
    return await this.localService.transcribe(audioFilePath);
  }

  /**
   * Transcribe audio file using OpenAI Whisper API (online mode)
   * @param {string} audioFilePath - Path to the audio file
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeOnline(audioFilePath) {
    const apiKey = Config.getApiKey();
    
    Logger.log('Using online transcription...');
    Logger.log('Checking API key...');
    if (!apiKey) {
      Logger.error('No API key configured');
      throw new Error('OpenAI API key not configured');
    }
    Logger.success('API key found (starts with: ' + apiKey.substring(0, 10) + '...)');

    if (!fs.existsSync(audioFilePath)) {
      Logger.error('Audio file not found:', audioFilePath);
      throw new Error('Audio file not found');
    }
    
    const stats = fs.statSync(audioFilePath);
    Logger.log(`Audio file: ${path.basename(audioFilePath)}, Size: ${(stats.size / 1024).toFixed(2)} KB`);

    try {
      const formData = new FormData();
      const fileExtension = path.extname(audioFilePath).toLowerCase();
      const mimeType = fileExtension === '.wav' ? 'audio/wav' : 
                       fileExtension === '.webm' ? 'audio/webm' :
                       fileExtension === '.mp3' ? 'audio/mpeg' :
                       fileExtension === '.m4a' ? 'audio/m4a' :
                       'audio/webm'; // default to webm
      
      Logger.log(`Preparing to upload: ${fileExtension} file (${mimeType})`);
      
      formData.append('file', fs.createReadStream(audioFilePath), {
        filename: path.basename(audioFilePath),
        contentType: mimeType
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'en');
      formData.append('response_format', 'text');

      Logger.log('Sending request to OpenAI Whisper API...');
      Logger.log('API URL:', this.apiUrl);
      
      const response = await axios.post(this.apiUrl, formData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          ...formData.getHeaders()
        },
        timeout: 30000 // 30 second timeout
      });
      
      Logger.success('Received response from OpenAI');
      Logger.log('Response status:', response.status);
      Logger.log('Response data type:', typeof response.data);
      Logger.log('Response data length:', response.data?.length || 0);
      Logger.log('RAW Response data:', JSON.stringify(response.data).substring(0, 200));
      
      const transcribedText = typeof response.data === 'string' 
        ? response.data.trim() 
        : String(response.data).trim();
      
      Logger.transcription('ACTUAL TRANSCRIPTION TEXT:', `"${transcribedText}"`);
      Logger.log('Transcription length:', transcribedText.length, 'characters');

      // Clean up audio file after transcription
      try {
        fs.unlinkSync(audioFilePath);
        Logger.log('Temp audio file deleted');
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
        console.error('Error deleting temp audio file:', cleanupError);
      }

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.error?.message || error.message;
        
        if (status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
        } else if (status === 429) {
          throw new Error('API rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          throw new Error(`Audio could not be processed. Try speaking for longer or check your microphone. (${message})`);
        } else if (status === 413) {
          throw new Error('Recording is too large to upload (max 25MB). Try a shorter recording.');
        } else if (status >= 500) {
          throw new Error('OpenAI service error. Please try again in a moment.');
        } else {
          throw new Error(`API Error ${status}: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timed out. Please check your internet connection and try again.');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('No internet connection. Check your network and try again.');
      } else {
        throw new Error(`Transcription failed: ${error.message}`);
      }
    }
  }

  /**
   * Transcribe audio buffer (alternative method)
   * @param {Buffer} audioBuffer - Audio data as buffer
   * @returns {Promise<string>} - Transcribed text
   */
  async transcribeBuffer(audioBuffer) {
    const os = require('os');
    const tempDir = path.join(os.tmpdir(), 'ezspeak');
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `audio_${Date.now()}.wav`);
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    return await this.transcribe(tempFilePath);
  }
}

module.exports = TranscriptionService;

