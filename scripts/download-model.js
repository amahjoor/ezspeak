const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadFile(url, destPath, name) {
  if (fs.existsSync(destPath)) {
    console.log(`${name} already exists, skipping download`);
    return;
  }

  console.log(`Downloading ${name}...`);
  const dir = path.dirname(destPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 600000 // 10 minute timeout
    });

    const writer = fs.createWriteStream(destPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`${name} downloaded successfully!`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Error downloading ${name}:`, error.message);
    throw error;
  }
}

async function downloadModels() {
  // 1. Download Whisper Model
  const whisperModelName = 'small.en';
  const whisperPath = path.join(__dirname, '..', 'whisper-models', `ggml-${whisperModelName}.bin`);
  const whisperUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${whisperModelName}.bin`;

  await downloadFile(whisperUrl, whisperPath, 'Whisper Model');

  // 2. Download Local LLM (Qwen 2.5 0.5B Instruct)
  // Using Q4_K_M quantization (~398MB)
  const llmModelName = 'qwen2.5-0.5b-instruct-q4_k_m.gguf';
  const llmPath = path.join(__dirname, '..', 'llm-models', llmModelName);
  const llmUrl = `https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF/resolve/main/qwen2.5-0.5b-instruct-q4_k_m.gguf`;

  await downloadFile(llmUrl, llmPath, 'Local LLM (Qwen)');
}

downloadModels().catch(process.exit.bind(process, 1));

