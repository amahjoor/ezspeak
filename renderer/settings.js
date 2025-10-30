// Load current settings
async function loadSettings() {
    try {
        const apiKey = await window.electronAPI.getApiKey();
        const mode = await window.electronAPI.getMode();
        
        const apiKeyInput = document.getElementById('apiKey');
        const modeSelect = document.getElementById('mode');
        
        if (apiKeyInput) {
            apiKeyInput.value = apiKey || '';
        }
        if (modeSelect) {
            modeSelect.value = mode || 'toggle';
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        showStatus('Error loading settings', 'error');
    }
}

// Save settings
async function saveSettings() {
    try {
        const apiKey = document.getElementById('apiKey').value.trim();
        const mode = document.getElementById('mode').value;
        
        if (!apiKey || !apiKey.startsWith('sk-')) {
            showStatus('Please enter a valid OpenAI API key', 'error');
            return;
        }
        
        await window.electronAPI.setApiKey(apiKey);
        await window.electronAPI.setMode(mode);
        
        showStatus('Settings saved successfully!', 'success');
        
        // Clear status after 3 seconds
        setTimeout(() => {
            hideStatus();
        }, 3000);
    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus('Error saving settings: ' + error.message, 'error');
    }
}

// Show status message
function showStatus(message, type) {
    const statusSection = document.getElementById('statusSection');
    const statusMessage = document.getElementById('statusMessage');
    
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
    statusSection.style.display = 'block';
}

// Hide status message
function hideStatus() {
    const statusSection = document.getElementById('statusSection');
    statusSection.style.display = 'none';
}

// Toggle password visibility
function setupToggleVisibility() {
    const toggleBtn = document.getElementById('toggleVisibility');
    const apiKeyInput = document.getElementById('apiKey');
    
    if (toggleBtn && apiKeyInput) {
        toggleBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                toggleBtn.textContent = '🙈';
            } else {
                apiKeyInput.type = 'password';
                toggleBtn.textContent = '👁️';
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupToggleVisibility();
    
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }
    
    // Close button
    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeSettings();
        });
    }
    
    // Listen for status updates from main process
    window.electronAPI.onStatusUpdate((status) => {
        if (status.error) {
            showStatus(status.error, 'error');
        } else if (status.success) {
            showStatus(status.success, 'success');
        }
    });
});

// Manual recording controls
let isManuallyRecording = false;

function startManualRecording() {
    if (isManuallyRecording) return;
    
    console.log('🎤 Manual START button clicked');
    isManuallyRecording = true;
    
    const startBtn = document.getElementById('manualStartBtn');
    const stopBtn = document.getElementById('manualStopBtn');
    
    if (startBtn) startBtn.disabled = true;
    if (stopBtn) stopBtn.disabled = false;
    
    showStatus('🎤 Recording... (speak now for 3-5 seconds!)', 'success');
    
    // Trigger recording via exposed API
    window.electronAPI.manualRecordStart();
    console.log('✅ Sent manual-record-start to main process');
}

function stopManualRecording() {
    if (!isManuallyRecording) return;
    
    console.log('⏹️ Manual STOP button clicked');
    isManuallyRecording = false;
    
    const startBtn = document.getElementById('manualStartBtn');
    const stopBtn = document.getElementById('manualStopBtn');
    
    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;
    
    showStatus('⏳ Processing transcription...', 'success');
    
    // Trigger stop via exposed API
    window.electronAPI.manualRecordStop();
    console.log('✅ Sent manual-record-stop to main process');
}

// Handle Enter key in API key input
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveSettings();
            }
        });
    }
    
    // Manual recording buttons
    const manualStartBtn = document.getElementById('manualStartBtn');
    const manualStopBtn = document.getElementById('manualStopBtn');
    
    if (manualStartBtn) {
        manualStartBtn.addEventListener('click', startManualRecording);
    }
    if (manualStopBtn) {
        manualStopBtn.addEventListener('click', stopManualRecording);
    }
    
    // Show recording status
    window.electronAPI.onStartRecording(() => {
        console.log('📥 Received start-recording event from main');
        showStatus('🎤 Recording...', 'success');
        const startBtn = document.getElementById('manualStartBtn');
        const stopBtn = document.getElementById('manualStopBtn');
        if (startBtn) startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        isManuallyRecording = true;
    });
    
    window.electronAPI.onStopRecording(() => {
        console.log('📥 Received stop-recording event from main');
        showStatus('⏹️ Processing...', 'success');
        const startBtn = document.getElementById('manualStartBtn');
        const stopBtn = document.getElementById('manualStopBtn');
        if (startBtn) startBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        isManuallyRecording = false;
    });
});

