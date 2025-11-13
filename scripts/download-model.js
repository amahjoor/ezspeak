const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function downloadModel() {
  const modelName = 'base.en';
  const modelPath = path.join(__dirname, '..', 'whisper-models', `ggml-${modelName}.bin`);
  const modelUrl = `https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-${modelName}.bin`;

  console.log('Downloading Whisper model for build...');

  // Ensure directory exists
  const modelDir = path.dirname(modelPath);
  if (!fs.existsSync(modelDir)) {
    fs.mkdirSync(modelDir, { recursive: true });
  }

  // Skip if already exists
  if (fs.existsSync(modelPath)) {
    console.log('Model already exists, skipping download');
    return;
  }

  try {
    const response = await axios({
      method: 'GET',
      url: modelUrl,
      responseType: 'stream',
      timeout: 300000 // 5 minute timeout
    });

    const writer = fs.createWriteStream(modelPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log('Model downloaded successfully!');
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error('Error downloading model:', error.message);
    throw error;
  }
}

downloadModel().catch(process.exit.bind(process, 1));

