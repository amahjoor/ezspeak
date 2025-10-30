// Audio recording functionality for renderer process
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

async function startRecording() {
  try {
    console.log('🎤 Starting recording in renderer...');
    console.log('🔍 Checking navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('🔍 Checking getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    
    audioChunks = [];
    
    // List available devices first
    console.log('📋 Enumerating audio devices...');
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputs = devices.filter(d => d.kind === 'audioinput');
    console.log('🎤 Found', audioInputs.length, 'audio input devices:');
    audioInputs.forEach((device, i) => {
      console.log(`  ${i+1}. ${device.label || 'Unknown'} (${device.deviceId.substring(0, 20)}...)`);
    });
    
    // Get selected microphone from settings
    const micSelect = document.getElementById ? document.getElementById('microphone') : null;
    const selectedDeviceId = micSelect ? micSelect.value : 'default';
    
    console.log('📞 Requesting microphone access...');
    console.log('🎯 Selected device ID:', selectedDeviceId);
    
    // Request microphone access
    const constraints = {
      audio: selectedDeviceId === 'default' ? {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1
      } : {
        deviceId: { exact: selectedDeviceId },
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: true,
        sampleRate: 16000,
        channelCount: 1
      }
    };
    
    audioStream = await navigator.mediaDevices.getUserMedia(constraints);

    console.log('✅ Microphone access granted!');
    const track = audioStream.getAudioTracks()[0];
    console.log('🎙️ Audio track label:', track.label);
    console.log('🎙️ Track settings:', JSON.stringify(track.getSettings()));
    console.log('🎙️ Track enabled:', track.enabled);
    console.log('🎙️ Track muted:', track.muted);
    console.log('🎙️ Track readyState:', track.readyState);
    
    mediaRecorder = new MediaRecorder(audioStream);
    console.log('📼 MediaRecorder created, mimeType:', mediaRecorder.mimeType);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        console.log('📦 Audio chunk received:', event.data.size, 'bytes');
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        console.log('⏹️ Recording stopped, processing', audioChunks.length, 'chunks');
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = Array.from(new Uint8Array(arrayBuffer));
        
        console.log('📤 Sending audio data:', buffer.length, 'bytes');
        // Send to main process via exposed API
        window.electronAPI.sendAudioData(buffer);
        
        // Stop all tracks
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          audioStream = null;
        }
      } catch (error) {
        console.error('❌ Error processing audio:', error);
        window.electronAPI.sendAudioError(error.message);
      }
    };

    mediaRecorder.start(100); // Record in 100ms chunks
    console.log('✅ MediaRecorder started (recording in 100ms chunks)');
    
    // Add audio level visualization for debugging
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.fftSize = 256;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Check audio levels every 500ms
    const checkAudioLevel = setInterval(() => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const maxVolume = Math.max(...dataArray);
      
      console.log(`🔊 Audio level: AVG=${Math.round(average)} MAX=${maxVolume} (0-255 scale)`);
      
      if (average < 2 && maxVolume < 10) {
        console.error('❌ MICROPHONE IS SILENT! No sound detected!');
        console.error('💡 Check: 1) Windows mic permissions 2) Default mic in Windows settings 3) Mic volume');
      } else if (average < 10) {
        console.warn('⚠️ Audio level very low! Speak louder or increase mic volume');
      } else {
        console.log('✅ Audio detected - good level!');
      }
    }, 500);
    
    // Store for cleanup
    window.audioLevelChecker = checkAudioLevel;
    
  } catch (error) {
    console.error('❌ Recording error:', error);
    window.electronAPI.sendAudioError(error.message);
  }
}

function stopRecording() {
  console.log('⏸️ Stop recording requested');
  
  // Clear audio level checker
  if (window.audioLevelChecker) {
    clearInterval(window.audioLevelChecker);
    window.audioLevelChecker = null;
  }
  
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    console.log('🛑 Stopping MediaRecorder...');
    mediaRecorder.stop();
  } else {
    console.warn('⚠️ MediaRecorder not active, state:', mediaRecorder?.state);
  }
}

// Listen for IPC messages via exposed API
if (window.electronAPI) {
  console.log('✓ electronAPI available, setting up listeners');
  window.electronAPI.onStartRecording(startRecording);
  window.electronAPI.onStopRecording(stopRecording);
} else {
  console.error('❌ electronAPI not available!');
}

