// Microphone device enumeration and selection

async function loadMicrophones() {
    try {
        // Request permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        
        const micSelect = document.getElementById('microphone');
        if (!micSelect) return;
        
        // Get saved microphone or current selection
        let savedMic = null;
        try {
            savedMic = await window.electronAPI.getMicrophone();
        } catch (e) {
            savedMic = micSelect.value;
        }
        
        // Clear existing options
        micSelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = 'default';
        defaultOption.textContent = 'System Default Microphone';
        micSelect.appendChild(defaultOption);
        
        // Add other microphones
        audioInputs.forEach((device, index) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Microphone ${index + 1}`;
            micSelect.appendChild(option);
        });
        
        // Restore saved selection if it still exists
        if (savedMic && Array.from(micSelect.options).some(opt => opt.value === savedMic)) {
            micSelect.value = savedMic;
        }
        
    } catch (error) {
        console.error('Error loading microphones:', error);
    }
}

// Auto-load on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadMicrophones);
} else {
    loadMicrophones();
}

// Setup auto-refresh on device changes only (not on focus/click — rebuilding
// options while the native macOS dropdown is open closes it immediately)
document.addEventListener('DOMContentLoaded', () => {
    // Auto-refresh when devices are plugged/unplugged
    if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
        navigator.mediaDevices.addEventListener('devicechange', () => {
            console.log('Device change detected, refreshing microphones...');
            loadMicrophones();
        });
    }
});

