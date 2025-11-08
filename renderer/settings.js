// Key mapping from keyboard events to uiohook key names
const keyToUiohook = {
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'ControlLeft': 'CtrlLeft', 'ControlRight': 'CtrlRight',
    'AltLeft': 'AltLeft', 'AltRight': 'AltRight',
    'ShiftLeft': 'ShiftLeft', 'ShiftRight': 'ShiftRight',
    'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Escape',
    'Tab': 'Tab', 'CapsLock': 'CapsLock'
};

// Display friendly names for keys
const keyDisplayNames = {
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'CtrlRight': 'Right Ctrl',
    'CtrlLeft': 'Left Ctrl',
    'AltRight': 'Right Alt',
    'AltLeft': 'Left Alt',
    'ShiftRight': 'Right Shift',
    'ShiftLeft': 'Left Shift',
    'Space': 'Space',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Tab': 'Tab',
    'CapsLock': 'Caps Lock'
};

// Load current settings
async function loadSettings() {
    try {
        const apiKey = await window.electronAPI.getApiKey();
        const hotkey = await window.electronAPI.getHotkey();
        const transcriptionMode = await window.electronAPI.getTranscriptionMode();
        const whisperModel = await window.electronAPI.getWhisperModel();
        
        const apiKeyInput = document.getElementById('apiKey');
        const hotkeyInput = document.getElementById('hotkey');
        const transcriptionModeSelect = document.getElementById('transcriptionMode');
        const whisperModelSelect = document.getElementById('whisperModel');
        
        if (apiKeyInput) {
            apiKeyInput.value = apiKey || '';
        }
        
        if (transcriptionModeSelect) {
            transcriptionModeSelect.value = transcriptionMode || 'cloud';
            updateModeVisibility(transcriptionMode || 'cloud');
        }
        
        if (whisperModelSelect) {
            whisperModelSelect.value = whisperModel || 'base';
        }
        
        const displayName = keyDisplayNames[hotkey] || hotkey;
        
        if (hotkeyInput) {
            hotkeyInput.value = displayName;
        }

        // Check model status if in local mode
        if (transcriptionMode === 'local') {
            await checkModelStatus();
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

// Update visibility of mode-specific settings
function updateModeVisibility(mode) {
    const apiKeyGroup = document.getElementById('apiKeyGroup');
    const whisperModelGroup = document.getElementById('whisperModelGroup');
    
    if (mode === 'local') {
        apiKeyGroup.style.display = 'none';
        whisperModelGroup.style.display = 'block';
        checkModelStatus();
    } else {
        apiKeyGroup.style.display = 'block';
        whisperModelGroup.style.display = 'none';
    }
}

// Check if the selected model is available
async function checkModelStatus() {
    try {
        const modelSelect = document.getElementById('whisperModel');
        const modelStatus = document.getElementById('modelStatus');
        const downloadBtn = document.getElementById('downloadModelBtn');
        const selectedModel = modelSelect.value;
        
        const isAvailable = await window.electronAPI.isModelAvailable(selectedModel);
        
        if (isAvailable) {
            const size = await window.electronAPI.getModelSize(selectedModel);
            modelStatus.textContent = `Model installed (${size} MB)`;
            modelStatus.style.color = '#6BB589';
            downloadBtn.style.display = 'none';
        } else {
            modelStatus.textContent = 'Model not installed';
            modelStatus.style.color = '#e74c3c';
            downloadBtn.style.display = 'inline-block';
        }
    } catch (error) {
        console.error('Error checking model status:', error);
    }
}

// Download the selected model
async function downloadModel() {
    try {
        const modelSelect = document.getElementById('whisperModel');
        const modelStatus = document.getElementById('modelStatus');
        const downloadBtn = document.getElementById('downloadModelBtn');
        const selectedModel = modelSelect.value;
        
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Downloading...';
        modelStatus.textContent = 'Starting download...';
        
        await window.electronAPI.downloadModel(selectedModel, (percent, message) => {
            modelStatus.textContent = message;
        });
        
        showToast('Model downloaded successfully!');
        await checkModelStatus();
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Model';
    } catch (error) {
        console.error('Error downloading model:', error);
        const modelStatus = document.getElementById('modelStatus');
        const downloadBtn = document.getElementById('downloadModelBtn');
        
        modelStatus.textContent = 'Download failed. Please try again.';
        modelStatus.style.color = '#e74c3c';
        downloadBtn.disabled = false;
        downloadBtn.textContent = 'Download Model';
        showToast('Download failed: ' + error.message);
    }
}

// Auto-save API key
async function saveApiKey() {
    try {
        const apiKey = document.getElementById('apiKey').value.trim();
        
        if (!apiKey) {
            return; // Don't save empty
        }
        
        if (!apiKey.startsWith('sk-')) {
            return; // Invalid format, skip silently
        }
        
        await window.electronAPI.setApiKey(apiKey);
        showToast('Changes saved');
    } catch (error) {
        console.error('Error saving API key:', error);
    }
}

// Show toast notification
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 1000);
}

// Toggle password visibility
function setupToggleVisibility() {
    const toggleBtn = document.getElementById('toggleVisibility');
    const apiKeyInput = document.getElementById('apiKey');
    
    if (toggleBtn && apiKeyInput) {
        const eyeIcon = toggleBtn.querySelector('.eye-icon');
        const eyeOffIcon = toggleBtn.querySelector('.eye-off-icon');
        
        toggleBtn.addEventListener('click', () => {
            if (apiKeyInput.type === 'password') {
                apiKeyInput.type = 'text';
                eyeIcon.style.display = 'none';
                eyeOffIcon.style.display = 'block';
            } else {
                apiKeyInput.type = 'password';
                eyeIcon.style.display = 'block';
                eyeOffIcon.style.display = 'none';
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupToggleVisibility();
});

// Setup tooltip for API key info
function setupTooltip() {
    const infoIcon = document.getElementById('apiKeyInfo');
    const tooltip = document.getElementById('apiKeyTooltip');
    
    if (infoIcon && tooltip) {
        let hideTimeout;
        
        const showTooltip = () => {
            clearTimeout(hideTimeout);
            tooltip.style.display = 'block';
        };
        
        const hideTooltip = () => {
            hideTimeout = setTimeout(() => {
                tooltip.style.display = 'none';
            }, 100);
        };
        
        infoIcon.addEventListener('mouseenter', showTooltip);
        infoIcon.addEventListener('mouseleave', hideTooltip);
        tooltip.addEventListener('mouseenter', showTooltip);
        tooltip.addEventListener('mouseleave', hideTooltip);
    }
}

// Setup window controls
function setupWindowControls() {
    const minimizeBtn = document.getElementById('minimize-btn');
    const closeBtn = document.getElementById('close-btn');
    
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', () => {
            window.electronAPI.minimizeWindow();
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            window.electronAPI.closeSettings();
        });
    }
}

// Setup hotkey capture
function setupHotkeyCapture() {
    const hotkeyInput = document.getElementById('hotkey');
    if (!hotkeyInput) return;
    
    let isCapturing = false;
    
    hotkeyInput.addEventListener('click', () => {
        if (isCapturing) return;
        
        isCapturing = true;
        hotkeyInput.value = 'Press any key...';
        hotkeyInput.style.borderColor = '#0078d4';
        hotkeyInput.style.background = '#2d2d30';
    });
    
    hotkeyInput.addEventListener('keydown', async (e) => {
        if (!isCapturing) return;
        
        e.preventDefault();
        
        // Map the key to uiohook format
        const uiohookKey = keyToUiohook[e.code];
        
        if (uiohookKey) {
            try {
                await window.electronAPI.setHotkey(uiohookKey);
                const displayName = keyDisplayNames[uiohookKey] || uiohookKey;
                hotkeyInput.value = displayName;
                
                showToast('Hotkey changed');
            } catch (error) {
                console.error('Error setting hotkey:', error);
                hotkeyInput.value = 'Error - try again';
            }
        } else {
            hotkeyInput.value = 'Key not supported - try another';
            setTimeout(async () => {
                const current = await window.electronAPI.getHotkey();
                hotkeyInput.value = keyDisplayNames[current] || current;
            }, 1500);
        }
        
        hotkeyInput.style.borderColor = '#3e3e42';
        hotkeyInput.style.background = '#252526';
        isCapturing = false;
    });
    
    // Handle blur (click away)
    hotkeyInput.addEventListener('blur', async () => {
        if (isCapturing) {
            const current = await window.electronAPI.getHotkey();
            hotkeyInput.value = keyDisplayNames[current] || current;
            hotkeyInput.style.borderColor = '#3e3e42';
            hotkeyInput.style.background = '#252526';
            isCapturing = false;
        }
    });
}

// Setup auto-save for API key and microphone
document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const micSelect = document.getElementById('microphone');
    const transcriptionModeSelect = document.getElementById('transcriptionMode');
    const whisperModelSelect = document.getElementById('whisperModel');
    const downloadModelBtn = document.getElementById('downloadModelBtn');
    
    // Setup window controls
    setupWindowControls();
    
    // Setup hotkey capture
    setupHotkeyCapture();
    
    // Handle transcription mode change
    if (transcriptionModeSelect) {
        transcriptionModeSelect.addEventListener('change', async () => {
            try {
                const mode = transcriptionModeSelect.value;
                await window.electronAPI.setTranscriptionMode(mode);
                updateModeVisibility(mode);
                showToast('Transcription mode changed');
            } catch (error) {
                console.error('Error saving transcription mode:', error);
            }
        });
    }
    
    // Handle whisper model change
    if (whisperModelSelect) {
        whisperModelSelect.addEventListener('change', async () => {
            try {
                const model = whisperModelSelect.value;
                await window.electronAPI.setWhisperModel(model);
                await checkModelStatus();
                showToast('Model selected');
            } catch (error) {
                console.error('Error saving whisper model:', error);
            }
        });
    }
    
    // Handle download model button
    if (downloadModelBtn) {
        downloadModelBtn.addEventListener('click', downloadModel);
    }
    
    // Auto-save API key on Enter or blur (when user clicks away)
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveApiKey();
                apiKeyInput.blur(); // Remove focus
            }
        });
        
        apiKeyInput.addEventListener('blur', () => {
            saveApiKey();
        });
    }
    
    // Auto-save microphone selection when changed
    if (micSelect) {
        micSelect.addEventListener('change', async () => {
            try {
                await window.electronAPI.setMicrophone(micSelect.value);
                showToast('Changes saved');
            } catch (error) {
                console.error('Error saving microphone:', error);
            }
        });
    }
    
    // Close window on ESC key (but not when capturing hotkey)
    document.addEventListener('keydown', (e) => {
        const hotkeyInput = document.getElementById('hotkey');
        if (e.key === 'Escape' && document.activeElement !== hotkeyInput) {
            window.electronAPI.closeSettings();
        }
    });
    
    setupTooltip();
    
    // Make external links open in default browser
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href) {
            e.preventDefault();
            window.electronAPI.openExternal(e.target.href);
        }
    });
});

