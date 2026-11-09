document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggleEnabled');
  const modifierKey = document.getElementById('modifierKey');
  const zoomSpeed = document.getElementById('zoomSpeed');
  const zoomSpeedVal = document.getElementById('zoomSpeedVal');
  const maxZoom = document.getElementById('maxZoom');
  const maxZoomVal = document.getElementById('maxZoomVal');

  // Load stored options
  chrome.storage.sync.get({
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 15
  }, (items) => {
    toggleEnabled.checked = items.enabled;
    modifierKey.value = items.modifierKey;
    zoomSpeed.value = items.zoomSpeed;
    zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    maxZoom.value = items.maxZoom;
    maxZoomVal.textContent = `${items.maxZoom}x`;
  });

  // Save handlers
  toggleEnabled.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggleEnabled.checked });
  });

  modifierKey.addEventListener('change', () => {
    chrome.storage.sync.set({ modifierKey: modifierKey.value });
  });

  zoomSpeed.addEventListener('input', () => {
    const val = Number(zoomSpeed.value);
    zoomSpeedVal.textContent = `${Math.round((val - 1) * 100)}%`;
    chrome.storage.sync.set({ zoomSpeed: val });
  });

  maxZoom.addEventListener('input', () => {
    const val = Number(maxZoom.value);
    maxZoomVal.textContent = `${val}x`;
    chrome.storage.sync.set({ maxZoom: val });
  });
});

