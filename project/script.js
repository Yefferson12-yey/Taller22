document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const localVideo = document.getElementById('localVideo');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const volumeSlider = document.getElementById('volumeSlider');
    const qualitySelector = document.getElementById('qualitySelector');
    const streamStatus = document.getElementById('streamStatus');
    const streamQuality = document.getElementById('streamQuality');
    const streamFps = document.getElementById('streamFps');
    const resolution = document.getElementById('resolution');
    const streamTime = document.getElementById('streamTime');
    const connectionStatus = document.getElementById('connectionStatus');
    const statusDot = document.querySelector('.status-dot');

    let mediaStream = null;
    let streamStartTime = null;
    let timeUpdateInterval = null;
    let qualityCheckInterval = null;

    const videoQualities = {
        high: { width: 1920, height: 1080, frameRate: 30 },
        medium: { width: 1280, height: 720, frameRate: 30 },
        low: { width: 854, height: 480, frameRate: 24 }
    };

    // Update stream time
    function updateStreamTime() {
        if (!streamStartTime) return;
        
        const elapsed = new Date().getTime() - streamStartTime;
        const seconds = Math.floor((elapsed / 1000) % 60);
        const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));

        streamTime.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Update quality indicators
    function updateQualityIndicators() {
        if (!mediaStream) return;

        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        // Calculate quality score (0-4)
        let qualityScore = 0;
        
        // Check resolution
        if (settings.width >= 1280) qualityScore++;
        if (settings.height >= 720) qualityScore++;
        
        // Check frame rate
        if (settings.frameRate >= 30) qualityScore++;
        
        // Check if camera is active and working
        if (videoTrack.enabled && videoTrack.readyState === 'live') qualityScore++;

        // Update quality text
        const qualities = ['Baja', 'Regular', 'Buena', 'Muy Buena', 'Excelente'];
        streamQuality.textContent = qualities[qualityScore];

        // Update FPS and resolution
        streamFps.textContent = Math.round(settings.frameRate || 0);
        resolution.textContent = `${settings.width}x${settings.height}`;
    }

    // Start streaming with selected quality
    async function startStream() {
        const quality = videoQualities[qualitySelector.value];
        
        try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: quality.width },
                    height: { ideal: quality.height },
                    frameRate: { ideal: quality.frameRate }
                },
                audio: true
            });

            localVideo.srcObject = mediaStream;
            
            // Update UI
            startButton.disabled = true;
            stopButton.disabled = false;
            streamStatus.textContent = 'Transmitiendo';
            connectionStatus.textContent = 'Conectado';
            statusDot.classList.add('connected');

            // Start time tracking
            streamStartTime = new Date().getTime();
            timeUpdateInterval = setInterval(updateStreamTime, 1000);
            qualityCheckInterval = setInterval(updateQualityIndicators, 2000);

            // Initial quality check
            updateQualityIndicators();

        } catch (error) {
            console.error('Error accessing media devices:', error);
            alert('No se pudo acceder a la cámara y/o micrófono. Por favor, verifique los permisos.');
        }
    }

    // Stop streaming
    function stopStream() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            localVideo.srcObject = null;
            mediaStream = null;
        }

        // Reset UI
        startButton.disabled = false;
        stopButton.disabled = true;
        streamStatus.textContent = 'Inactivo';
        streamQuality.textContent = '-';
        streamFps.textContent = '0';
        resolution.textContent = '-';
        connectionStatus.textContent = 'Desconectado';
        statusDot.classList.remove('connected');

        // Stop intervals
        clearInterval(timeUpdateInterval);
        clearInterval(qualityCheckInterval);
        streamStartTime = null;
        streamTime.textContent = '00:00:00';
    }

    // Toggle fullscreen
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            if (localVideo.requestFullscreen) {
                localVideo.requestFullscreen();
            } else if (localVideo.webkitRequestFullscreen) {
                localVideo.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    // Event listeners
    startButton.addEventListener('click', startStream);
    stopButton.addEventListener('click', stopStream);
    fullscreenButton.addEventListener('click', toggleFullscreen);
    volumeSlider.addEventListener('input', (e) => {
        localVideo.volume = e.target.value / 100;
    });
    qualitySelector.addEventListener('change', () => {
        if (mediaStream) {
            stopStream();
            startStream();
        }
    });
});