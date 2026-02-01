const path = require('path');
const fs = require('fs');
const Logger = require('./logger');

class LocalLLMService {
    constructor() {
        this.modelName = 'qwen2.5-0.5b-instruct-q4_k_m.gguf';
        this.modelPath = null;
        this.llama = null;
        this.model = null;
        this.context = null;
        this.session = null;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            Logger.log('Initializing Local LLM Service...');

            // Dynamic import for node-llama-cpp (ESM module)
            const { getLlama, LlamaChatSession } = await import("node-llama-cpp");

            this.modelPath = await this.getModelPath();
            Logger.log('Loading Local LLM from:', this.modelPath);

            this.llama = await getLlama();

            this.model = await this.llama.loadModel({
                modelPath: this.modelPath,
                gpuLayers: 0 // Force CPU for compatibility/reliability on all Windows machines
            });

            this.context = await this.model.createContext({
                contextSize: 2048,
                threads: 4
            });

            this.session = new LlamaChatSession({
                contextSequence: this.context.getSequence(),
                systemPrompt: `You are an expert editor for voice-to-text transcripts. Your goal is to convert imperfect spoken text into clean, readable written text.

Rules:
1. **Fix Phonetic/Context Errors**: INTELLIGENTLY correct words that sound similar but make no sense in context (e.g., "process males" -> "process emails", "rockin' ricks" -> "rocking rigs" or similar based on context).
2. **Remove False Starts & Stutters**: Eliminate stuttering, false starts, and repeated phrases where the speaker is thinking.
3. **Fix Repetitions**: If a phrase is said multiple times, keep it only once.
4. **Remove Filler Words**: Remove "um", "uh", "like", "you know".
5. **Formatting**: Add proper capitalization and punctuation.
6. **Output**: Return ONLY the cleaned text.

Context Examples:
- Input: "I want to rite a letter." -> Output: "I want to write a letter."
- Input: "The meet in started light." -> Output: "The meeting started late."`
            });

            this.isInitialized = true;
            Logger.success('Local LLM Initialized successfully');
        } catch (error) {
            Logger.error('Failed to initialize Local LLM:', error.message);
            if (error.stack) {
                Logger.error('Stack:', error.stack);
            }
            throw error;
        }
    }

    async getModelPath() {
        const { app } = require('electron');
        let modelPath;

        // Check in userData (updates)
        const userDataPath = path.join(app.getPath('userData'), 'llm-models', this.modelName);
        if (fs.existsSync(userDataPath)) return userDataPath;

        // Check in resources (production)
        if (app.isPackaged) {
            modelPath = path.join(process.resourcesPath, 'llm-models', this.modelName);
        } else {
            // Development
            modelPath = path.join(__dirname, '..', 'llm-models', this.modelName);
        }

        if (!fs.existsSync(modelPath)) {
            throw new Error(`LLM model not found at ${modelPath}`);
        }

        return modelPath;
    }

    async processText(text) {
        if (!text || !text.trim()) return text;

        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            Logger.log('Running Local LLM cleanup on text:', text.substring(0, 50) + '...');
            const startTime = Date.now();

            // Qwen template is usually ChatML-like, but LlamaChatSession handles formatting usually.
            // We'll just pass the user text.
            const response = await this.session.prompt(text, {
                maxTokens: 1024,
                temperature: 0.2, // Low temp for precision
                topP: 0.9,
            });

            const elapsed = Date.now() - startTime;
            Logger.log(`Local LLM finished in ${elapsed}ms`);
            Logger.log(`Cleaned text: "${response.substring(0, 50)}..."`);

            // Cleanup cleanup (remove quotes if model added them)
            let cleaned = response.trim();
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                cleaned = cleaned.substring(1, cleaned.length - 1);
            }

            return cleaned;
        } catch (error) {
            Logger.error('Error during Local LLM processing:', error);
            return text; // Fallback to original text
        }
    }
}

module.exports = new LocalLLMService();
