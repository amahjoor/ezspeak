// Microphone device enumeration and selection

async function loadMicrophones() {
    try {
        console.log('🔍 Loading available microphones...');
        
        // Request permission first
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        
        // Now enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        
        console.log(`Found ${audioInputs.length} microphones`);
        
        const micSelect = document.getElementById('microphone');
        if (!micSelect) return;
        
        // Clear existing options
        micSelect.innerHTML = '';
        
        // Add microphones
        audioInputs.forEach(device => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.textContent = device.label || `Microphone ${audioInputs.indexOf(device) + 1}`;
            
            // Highlight the Yeti if found
            if (device.label && device.label.toLowerCase().includes('yeti')) {
                option.textContent += ' ⭐ (Recommended)';
            }
            
            micSelect.appendChild(option);
        });
        
        // Try to select Yeti by default if available
        const yetiOption = Array.from(micSelect.options).find(opt => 
            opt.textContent.toLowerCase().includes('yeti')
        );
        
        if (yetiOption) {
            micSelect.value = yetiOption.value;
            console.log('✨ Auto-selected Yeti Classic microphone');
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

// Refresh button
document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refreshMics');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', loadMicrophones);
    }
});

