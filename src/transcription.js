const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const Config = require('./config');
const Logger = require('./logger');
const LocalTranscriptionService = require('./localTranscription');
const LocalLLMService = require('./localLlm');

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
    let text;
    if (transcriptionMode === 'offline') {
      text = await this.transcribeOffline(audioFilePath);
    } else {
      text = await this.transcribeOnline(audioFilePath);
    }

    // Apply LLM post-processing (Always enabled)
    const llmEnabled = true;

    if (llmEnabled && text && text.length > 0) {
      try {
        Logger.log('Applying LLM post-processing...');

        if (transcriptionMode === 'offline') {
          // Offline mode: Use local Qwen model
          text = await LocalLLMService.processText(text);
        } else {
          // Online mode: Use OpenAI (requires key)
          const apiKey = Config.getApiKey();
          if (apiKey) {
            text = await this.postProcessWithLLM(text, apiKey);
          } else {
            Logger.warn('LLM enabled but no API key processing available for online mode without key (should theoretically fail earlier)');
          }
        }
      } catch (error) {
        Logger.warn('LLM post-processing failed, using raw transcription:', error.message);
        // Continue with unprocessed text
      }
    }

    return text;
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
        } else {
          throw new Error(`API Error: ${message}`);
        }
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection.');
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

  /**
   * Post-process transcription with LLM for cleanup
   * @param {string} text - Raw transcription text
   * @param {string} apiKey - OpenAI API key
   * @returns {Promise<string>} - Cleaned up text
   */
  async postProcessWithLLM(text, apiKey) {
    const startTime = Date.now();

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an expert editor for voice-to-text transcripts. Your goal is to convert imperfect spoken text into clean, readable written text while preserving the original meaning and voice.

Rules:
1. **Fix Phonetic/Context Errors**: INTELLIGENTLY correct words that sound similar but make no sense in context (e.g., "process males" -> "process emails").
2. **Remove False Starts & Stutters**: Eliminate stuttering ("I- I- I want"), false starts, and self-corrections.
3. **Fix Repetitions**: Remove redundant phrases.
4. **Remove Filler Words**: Strip out "um", "uh", "like", "you know" unless highly relevant.
5. **Formatting**: Add proper capitalization and punctuation.
6. **Output**: Return ONLY the cleaned text.

Examples:
- Input: "The two was to hard" -> Output: "The tool was too hard"
- Input: "I um like want to uh go" -> Output: "I want to go"
- Input: "lets run the process males" -> Output: "Let's run the process emails"`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: 1024,
          temperature: 0.3 // Low temperature for consistent output
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const cleanedText = response.data.choices[0]?.message?.content?.trim();
      const elapsed = Date.now() - startTime;
      Logger.log(`LLM post-processing completed in ${elapsed}ms`);
      Logger.log(`Original: "${text.substring(0, 50)}..."`);
      Logger.log(`Cleaned: "${cleanedText?.substring(0, 50)}..."`);

      return cleanedText || text;
    } catch (error) {
      Logger.error('LLM post-processing error:', error.message);
      throw error;
    }
  }
}

module.exports = TranscriptionService;

