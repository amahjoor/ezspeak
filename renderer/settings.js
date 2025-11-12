// Key mapping from keyboard events to uiohook key names
const keyToUiohook = {
    // Function keys
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'F13': 'F13', 'F14': 'F14', 'F15': 'F15', 'F16': 'F16', 'F17': 'F17',
    'F18': 'F18', 'F19': 'F19', 'F20': 'F20', 'F21': 'F21', 'F22': 'F22',
    'F23': 'F23', 'F24': 'F24',

    // Modifier keys
    'ControlLeft': 'Ctrl', 'ControlRight': 'CtrlRight',
    'AltLeft': 'Alt', 'AltRight': 'AltRight',
    'ShiftLeft': 'Shift', 'ShiftRight': 'ShiftRight',
    'MetaLeft': 'Meta', 'MetaRight': 'MetaRight',

    // Letters
    'KeyA': 'A', 'KeyB': 'B', 'KeyC': 'C', 'KeyD': 'D', 'KeyE': 'E',
    'KeyF': 'F', 'KeyG': 'G', 'KeyH': 'H', 'KeyI': 'I', 'KeyJ': 'J',
    'KeyK': 'K', 'KeyL': 'L', 'KeyM': 'M', 'KeyN': 'N', 'KeyO': 'O',
    'KeyP': 'P', 'KeyQ': 'Q', 'KeyR': 'R', 'KeyS': 'S', 'KeyT': 'T',
    'KeyU': 'U', 'KeyV': 'V', 'KeyW': 'W', 'KeyX': 'X', 'KeyY': 'Y',
    'KeyZ': 'Z',

    // Numbers
    'Digit0': '0', 'Digit1': '1', 'Digit2': '2', 'Digit3': '3', 'Digit4': '4',
    'Digit5': '5', 'Digit6': '6', 'Digit7': '7', 'Digit8': '8', 'Digit9': '9',

    // Symbols and punctuation
    'Space': 'Space', 'Enter': 'Enter', 'Escape': 'Escape',
    'Tab': 'Tab', 'CapsLock': 'CapsLock',
    'Backspace': 'Backspace', 'Delete': 'Delete',
    'Insert': 'Insert', 'Home': 'Home', 'End': 'End',
    'PageUp': 'PageUp', 'PageDown': 'PageDown',
    'ArrowUp': 'ArrowUp', 'ArrowDown': 'ArrowDown',
    'ArrowLeft': 'ArrowLeft', 'ArrowRight': 'ArrowRight',
    'Backquote': 'Backquote', 'Minus': 'Minus', 'Equal': 'Equal',
    'BracketLeft': 'BracketLeft', 'BracketRight': 'BracketRight',
    'Backslash': 'Backslash', 'Semicolon': 'Semicolon',
    'Quote': 'Quote', 'Comma': 'Comma', 'Period': 'Period',
    'Slash': 'Slash', 'PrintScreen': 'PrintScreen',
    'ScrollLock': 'ScrollLock', 'NumLock': 'NumLock',

    // Numpad
    'Numpad0': 'Numpad0', 'Numpad1': 'Numpad1', 'Numpad2': 'Numpad2',
    'Numpad3': 'Numpad3', 'Numpad4': 'Numpad4', 'Numpad5': 'Numpad5',
    'Numpad6': 'Numpad6', 'Numpad7': 'Numpad7', 'Numpad8': 'Numpad8',
    'Numpad9': 'Numpad9', 'NumpadAdd': 'NumpadAdd', 'NumpadSubtract': 'NumpadSubtract',
    'NumpadMultiply': 'NumpadMultiply', 'NumpadDivide': 'NumpadDivide',
    'NumpadDecimal': 'NumpadDecimal', 'NumpadEnter': 'NumpadEnter',
    'NumpadArrowUp': 'NumpadArrowUp', 'NumpadArrowDown': 'NumpadArrowDown',
    'NumpadArrowLeft': 'NumpadArrowLeft', 'NumpadArrowRight': 'NumpadArrowRight',
    'NumpadHome': 'NumpadHome', 'NumpadEnd': 'NumpadEnd',
    'NumpadPageUp': 'NumpadPageUp', 'NumpadPageDown': 'NumpadPageDown',
    'NumpadInsert': 'NumpadInsert', 'NumpadDelete': 'NumpadDelete'
};

// Display friendly names for keys (macOS-friendly)
const keyDisplayNames = {
    // Function keys
    'F1': 'F1', 'F2': 'F2', 'F3': 'F3', 'F4': 'F4', 'F5': 'F5', 'F6': 'F6',
    'F7': 'F7', 'F8': 'F8', 'F9': 'F9', 'F10': 'F10', 'F11': 'F11', 'F12': 'F12',
    'F13': 'F13', 'F14': 'F14', 'F15': 'F15', 'F16': 'F16', 'F17': 'F17',
    'F18': 'F18', 'F19': 'F19', 'F20': 'F20', 'F21': 'F21', 'F22': 'F22',
    'F23': 'F23', 'F24': 'F24',

    // Modifier keys (macOS terminology)
    'Ctrl': 'Ctrl',
    'CtrlRight': 'Right Ctrl',
    'Alt': 'Alt',
    'AltRight': 'Right Alt',
    'Shift': 'Shift',
    'ShiftRight': 'Right Shift',
    'Meta': 'Left Command',  // macOS Command key
    'MetaRight': 'Right Command',

    // Letters
    'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G', 'H': 'H',
    'I': 'I', 'J': 'J', 'K': 'K', 'L': 'L', 'M': 'M', 'N': 'N', 'O': 'O', 'P': 'P',
    'Q': 'Q', 'R': 'R', 'S': 'S', 'T': 'T', 'U': 'U', 'V': 'V', 'W': 'W', 'X': 'X',
    'Y': 'Y', 'Z': 'Z',

    // Numbers
    '0': '0', '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7',
    '8': '8', '9': '9',

    // Symbols and punctuation
    'Space': 'Space',
    'Enter': 'Enter',
    'Escape': 'Esc',
    'Tab': 'Tab',
    'CapsLock': 'Caps Lock',
    'Backspace': 'Backspace',
    'Delete': 'Delete',
    'Insert': 'Insert',
    'Home': 'Home',
    'End': 'End',
    'PageUp': 'Page Up',
    'PageDown': 'Page Down',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Backquote': '`',
    'Minus': '-',
    'Equal': '=',
    'BracketLeft': '[',
    'BracketRight': ']',
    'Backslash': '\\',
    'Semicolon': ';',
    'Quote': "'",
    'Comma': ',',
    'Period': '.',
    'Slash': '/',
    'PrintScreen': 'Print Screen',
    'ScrollLock': 'Scroll Lock',
    'NumLock': 'Num Lock',

    // Numpad
    'Numpad0': 'Num 0', 'Numpad1': 'Num 1', 'Numpad2': 'Num 2', 'Numpad3': 'Num 3',
    'Numpad4': 'Num 4', 'Numpad5': 'Num 5', 'Numpad6': 'Num 6', 'Numpad7': 'Num 7',
    'Numpad8': 'Num 8', 'Numpad9': 'Num 9', 'NumpadAdd': 'Num +', 'NumpadSubtract': 'Num -',
    'NumpadMultiply': 'Num *', 'NumpadDivide': 'Num ÷', 'NumpadDecimal': 'Num .', 'NumpadEnter': 'Num Enter',
    'NumpadArrowUp': 'Num ↑', 'NumpadArrowDown': 'Num ↓', 'NumpadArrowLeft': 'Num ←', 'NumpadArrowRight': 'Num →',
    'NumpadHome': 'Num Home', 'NumpadEnd': 'Num End', 'NumpadPageUp': 'Num Page Up', 'NumpadPageDown': 'Num Page Down',
    'NumpadInsert': 'Num Insert', 'NumpadDelete': 'Num Delete'
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
    
    // Make external links open in default browser
    document.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.href) {
            e.preventDefault();
            window.electronAPI.openExternal(e.target.href);
        }
    });
});

