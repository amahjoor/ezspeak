/**
 * Download whisper.cpp binary for Windows
 * This script downloads the pre-built whisper.cpp executable from GitHub releases
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const WHISPER_CPP_REPO = 'ggerganov/whisper.cpp';
const BIN_DIR = path.join(__dirname, '..', 'bin');
const WHISPER_EXE_PATH = path.join(BIN_DIR, 'whisper.exe');

/**
 * Fetch the latest release info from GitHub
 */
async function getLatestReleaseInfo() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${WHISPER_CPP_REPO}/releases/latest`,
      headers: {
        'User-Agent': 'ezspeak-setup'
      }
    };

    https.get(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Failed to fetch release info: ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Download a file from URL
 */
async function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'ezspeak-setup' }
    }, (response) => {
      // Follow redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        downloadFile(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      let lastPercent = 0;

      response.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const percent = Math.floor((downloadedSize / totalSize) * 100);
        
        if (percent > lastPercent && percent % 10 === 0) {
          console.log(`Progress: ${percent}%`);
          lastPercent = percent;
        }
      });

      const fileStream = fs.createWriteStream(outputPath);
      
      streamPipeline(response, fileStream)
        .then(() => {
          console.log('Download completed!');
          resolve();
        })
        .catch(reject);
    }).on('error', reject);
  });
}

/**
 * Extract executable from zip file (simplified - for .exe files)
 * Note: This assumes the release provides a direct .exe file or you need to manually extract
 */
async function downloadWhisperBinary() {
  console.log('========================================');
  console.log('  Whisper.cpp Binary Downloader');
  console.log('========================================\n');
  
  // Ensure bin directory exists
  if (!fs.existsSync(BIN_DIR)) {
    fs.mkdirSync(BIN_DIR, { recursive: true });
    console.log('Created bin directory');
  }

  // Check if whisper.exe already exists
  if (fs.existsSync(WHISPER_EXE_PATH)) {
    console.log('✓ whisper.exe already exists at:', WHISPER_EXE_PATH);
    console.log('\nIf you want to re-download, delete the existing file first.');
    return;
  }

  try {
    console.log('Fetching latest whisper.cpp release info...');
    const releaseInfo = await getLatestReleaseInfo();
    
    console.log(`Latest version: ${releaseInfo.tag_name}`);
    console.log(`Release name: ${releaseInfo.name}\n`);

    // Look for Windows binary asset
    const windowsAssets = releaseInfo.assets.filter(asset => 
      asset.name.includes('win') && 
      (asset.name.includes('x64') || asset.name.includes('win64'))
    );

    if (windowsAssets.length === 0) {
      console.error('❌ No Windows x64 binary found in latest release.');
      console.log('\nPlease download manually from:');
      console.log(`   https://github.com/${WHISPER_CPP_REPO}/releases/latest`);
      console.log('\nLook for a Windows x64 build, extract it, and:');
      console.log('   1. Find "main.exe" or "whisper.exe" in the archive');
      console.log('   2. Copy it to: bin/whisper.exe');
      process.exit(1);
    }

    // Prefer specific naming patterns
    let selectedAsset = windowsAssets.find(a => a.name.toLowerCase().includes('whisper')) 
                     || windowsAssets[0];

    console.log('Found Windows binary asset:');
    console.log(`   Name: ${selectedAsset.name}`);
    console.log(`   Size: ${(selectedAsset.size / 1024 / 1024).toFixed(2)} MB\n`);

    // Check if it's a zip file or direct executable
    if (selectedAsset.name.endsWith('.zip')) {
      console.log('⚠️  The release is packaged as a ZIP file.');
      console.log('\nManual steps required:');
      console.log(`   1. Download: ${selectedAsset.browser_download_url}`);
      console.log('   2. Extract the ZIP file');
      console.log('   3. Find "main.exe" or "whisper.exe" inside');
      console.log('   4. Copy it to: bin/whisper.exe\n');
      
      // Open browser to release page
      console.log('Opening release page in browser...');
      console.log(`URL: https://github.com/${WHISPER_CPP_REPO}/releases/latest`);
      process.exit(0);
    } else if (selectedAsset.name.endsWith('.exe')) {
      // Direct executable - download it
      console.log('Downloading binary...');
      await downloadFile(selectedAsset.browser_download_url, WHISPER_EXE_PATH);
      console.log(`\n✓ Successfully downloaded whisper.exe to: ${WHISPER_EXE_PATH}`);
    } else {
      console.log('⚠️  Unexpected file format.');
      console.log('\nPlease download manually from:');
      console.log(`   ${selectedAsset.browser_download_url}`);
      console.log('\nThen extract and copy the executable to: bin/whisper.exe');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nManual download instructions:');
    console.log(`   1. Visit: https://github.com/${WHISPER_CPP_REPO}/releases/latest`);
    console.log('   2. Download the Windows x64 build');
    console.log('   3. Extract and find "main.exe" or "whisper.exe"');
    console.log('   4. Copy to: bin/whisper.exe\n');
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  downloadWhisperBinary()
    .then(() => {
      console.log('\n========================================');
      console.log('  Setup Complete!');
      console.log('========================================');
      console.log('\nYou can now build ezspeak with offline transcription support.');
      console.log('Run: npm run build\n');
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { downloadWhisperBinary };

