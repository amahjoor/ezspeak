// Audio recording functionality for renderer process
let mediaRecorder = null;
let audioChunks = [];
let audioStream = null;

async function startRecording() {
  try {
    audioChunks = [];
    
    // Get selected microphone from settings
    const micSelect = document.getElementById('microphone');
    const selectedDeviceId = micSelect ? micSelect.value : 'default';
    
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
    
    // Try different MIME types in order of preference
    let mimeType = '';
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus'
    ];
    
    for (const type of mimeTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        mimeType = type;
        console.log('Using MIME type:', type);
        break;
      }
    }
    
    mediaRecorder = new MediaRecorder(audioStream, {
      mimeType: mimeType || undefined
    });
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      try {
        // Use the same MIME type that was used for recording
        const audioBlob = new Blob(audioChunks, { type: mimeType || 'audio/webm' });
        const arrayBuffer = await audioBlob.arrayBuffer();
        const buffer = Array.from(new Uint8Array(arrayBuffer));
        
        // Send to main process
        window.electronAPI.sendAudioData(buffer);
        
        // Stop all tracks
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop());
          audioStream = null;
        }
      } catch (error) {
        console.error('Error processing audio:', error);
        window.electronAPI.sendAudioError(error.message);
      }
    };

    mediaRecorder.start(100);
  } catch (error) {
    console.error('Recording error:', error);
    window.electronAPI.sendAudioError(error.message);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
}

// Listen for IPC messages
if (window.electronAPI) {
  window.electronAPI.onStartRecording(startRecording);
  window.electronAPI.onStopRecording(stopRecording);
}

