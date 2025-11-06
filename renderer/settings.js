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
        
        const apiKeyInput = document.getElementById('apiKey');
        const hotkeyInput = document.getElementById('hotkey');
        const subtitle = document.getElementById('subtitle');
        
        if (apiKeyInput) {
            apiKeyInput.value = apiKey || '';
        }
        
        const displayName = keyDisplayNames[hotkey] || hotkey;
        
        if (hotkeyInput) {
            hotkeyInput.value = displayName;
        }
        
        if (subtitle) {
            subtitle.textContent = `Press ${displayName} to toggle, or hold to record`;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
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
                
                // Update subtitle
                const subtitle = document.getElementById('subtitle');
                if (subtitle) {
                    subtitle.textContent = `Press ${displayName} to toggle, or hold to record`;
                }
                
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
    
    // Setup window controls
    setupWindowControls();
    
    // Setup hotkey capture
    setupHotkeyCapture();
    
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
});

