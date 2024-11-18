document.addEventListener('DOMContentLoaded', () => {
    const remoteVideo = document.getElementById('remoteVideo');
    const viewerFullscreen = document.getElementById('viewerFullscreen');
    const viewerVolume = document.getElementById('viewerVolume');
    const viewerStatus = document.getElementById('viewerStatus');
    const viewerResolution = document.getElementById('viewerResolution');
    const viewerTime = document.getElementById('viewerTime');
    const statusDot = document.querySelector('.status-dot');
    const signalBars = document.querySelectorAll('.bar');

    let connectionStartTime = null;
    let timeUpdateInterval = null;
    let qualityCheckInterval = null;

    function updateViewerTime() {
        if (!connectionStartTime) return;
        
        const elapsed = new Date().getTime() - connectionStartTime;
        const seconds = Math.floor((elapsed / 1000) % 60);
        const minutes = Math.floor((elapsed / (1000 * 60)) % 60);
        const hours = Math.floor(elapsed / (1000 * 60 * 60));

        viewerTime.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function updateQualityIndicators() {
        if (!remoteVideo.srcObject) return;

        const videoTrack = remoteVideo.srcObject.getVideoTracks()[0];
        if (!videoTrack) return;

        const settings = videoTrack.getSettings();
        
        // Calculate quality score (0-4)
        let qualityScore = 0;
        
        if (settings.width >= 1280) qualityScore++;
        if (settings.height >= 720) qualityScore++;
        if (settings.frameRate >= 30) qualityScore++;
        if (videoTrack.enabled && videoTrack.readyState === 'live') qualityScore++;

        signalBars.forEach((bar, index) => {
            bar.classList.toggle('active', index < qualityScore);
        });

        viewerResolution.textContent = `${settings.width}x${settings.height}`;
    }

    // Toggle fullscreen
    viewerFullscreen.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (remoteVideo.requestFullscreen) {
                remoteVideo.requestFullscreen();
            } else if (remoteVideo.webkitRequestFullscreen) {
                remoteVideo.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    });

    // Volume control
    viewerVolume.addEventListener('input', (e) => {
        remoteVideo.volume = e.target.value / 100;
    });

    // Initialize connection status
    connectionStartTime = new Date().getTime();
    timeUpdateInterval = setInterval(updateViewerTime, 1000);
    qualityCheckInterval = setInterval(updateQualityIndicators, 2000);
});