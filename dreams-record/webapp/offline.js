// Service worker registration and offline status handling

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}

// Check online status and update UI accordingly
function updateOnlineStatus() {
  const statusDisplay = document.getElementById('connection-status');
  if (!statusDisplay) return;
  
  if (navigator.onLine) {
    statusDisplay.textContent = 'Online';
    statusDisplay.className = 'online';
    statusDisplay.style.display = 'none'; // Hide when online
  } else {
    statusDisplay.textContent = 'Offline - Dreams will be saved locally';
    statusDisplay.className = 'offline';
    statusDisplay.style.display = 'block'; // Show when offline
  }
}

// Listen for online/offline events
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Register for periodic sync if available
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    // Register sync event to sync data when back online
    navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage({
      type: 'REGISTER_SYNC'
    });
  });
}
