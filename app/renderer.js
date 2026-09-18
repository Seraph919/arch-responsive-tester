// State management
const state = {
  currentUrl: 'https://asoudani.dev',
  views: {
    phone: true,
    tablet: true,
    desktop: true
  },
  dimensions: {
    phone: { width: 390, height: 844, rotated: false, baseWidth: 390, baseHeight: 844 },
    tablet: { width: 820, height: 1180, rotated: false, baseWidth: 820, baseHeight: 1180 },
    desktop: { width: 1440, height: 900, rotated: false, baseWidth: 1440, baseHeight: 900 }
  },
  zoomMode: 'fit', // 'fit', '0.5', '0.67', '0.75', '1.0', '1.25'
  syncScroll: true,
  autoRefreshInterval: 0, // 0 = off, 3, 5, 10, 30
  autoRefreshTimer: null,
  isSyncingScroll: false
};

// Device User-Agents
const USER_AGENTS = {
  phone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  tablet: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  desktop: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
};

// DOM Elements
const elements = {
  urlInput: document.getElementById('url-input'),
  btnGo: document.getElementById('btn-go'),
  btnClear: document.getElementById('btn-clear'),
  btnPresets: document.getElementById('btn-presets'),
  presetsMenu: document.getElementById('presets-menu'),
  btnRefreshAll: document.getElementById('btn-refresh-all'),
  btnBack: document.getElementById('btn-back'),
  btnForward: document.getElementById('btn-forward'),
  btnSyncScroll: document.getElementById('btn-sync-scroll'),
  selectViewPreset: document.getElementById('select-view-preset'),
  selectAutoRefresh: document.getElementById('select-auto-refresh'),
  selectZoom: document.getElementById('select-zoom'),
  themeTag: document.getElementById('theme-tag'),
  statusText: document.getElementById('status-text'),
  activeCount: document.getElementById('active-count'),
  scaleInfo: document.getElementById('scale-info'),
  viewportCanvas: document.getElementById('viewport-canvas'),
  emptyState: document.getElementById('empty-state'),

  // Device Cards & Webviews
  cards: {
    phone: document.getElementById('card-phone'),
    tablet: document.getElementById('card-tablet'),
    desktop: document.getElementById('card-desktop')
  },
  webviews: {
    phone: document.getElementById('wv-phone'),
    tablet: document.getElementById('wv-tablet'),
    desktop: document.getElementById('wv-desktop')
  },
  toggles: {
    phone: document.getElementById('toggle-phone'),
    tablet: document.getElementById('toggle-tablet'),
    desktop: document.getElementById('toggle-desktop')
  },
  scales: {
    phone: document.getElementById('scale-phone'),
    tablet: document.getElementById('scale-tablet'),
    desktop: document.getElementById('scale-desktop')
  },
  screens: {
    phone: document.getElementById('screen-phone'),
    tablet: document.getElementById('screen-tablet'),
    desktop: document.getElementById('screen-desktop')
  },
  pills: {
    phone: document.getElementById('pill-phone'),
    tablet: document.getElementById('pill-tablet'),
    desktop: document.getElementById('pill-desktop')
  },
  loaders: {
    phone: document.getElementById('loader-phone'),
    tablet: document.getElementById('loader-tablet'),
    desktop: document.getElementById('loader-desktop')
  }
};

// Apply Omarchy Theme
function applyTheme(themeData) {
  if (!themeData || !themeData.colors) return;
  const c = themeData.colors;
  const root = document.documentElement;

  if (c.background) root.style.setProperty('--theme-bg', c.background);
  if (c.dark_background) root.style.setProperty('--theme-dark-bg', c.dark_background);
  if (c.darker_background) root.style.setProperty('--theme-darker-bg', c.darker_background);
  if (c.lighter_background) root.style.setProperty('--theme-light-bg', c.lighter_background);
  if (c.foreground) root.style.setProperty('--theme-fg', c.foreground);
  if (c.muted || c.dark_foreground) root.style.setProperty('--theme-muted', c.muted || c.dark_foreground);
  if (c.accent) root.style.setProperty('--theme-accent', c.accent);
  if (c.selection) root.style.setProperty('--theme-selection', c.selection);
  if (c.red) root.style.setProperty('--theme-red', c.red);
  if (c.green) root.style.setProperty('--theme-green', c.green);
  if (c.yellow) root.style.setProperty('--theme-yellow', c.yellow);
  if (c.blue) root.style.setProperty('--theme-blue', c.blue);

  if (themeData.name && elements.themeTag) {
    elements.themeTag.textContent = themeData.name;
  }
}

// Normalize URL (handles localhost ports, domains without protocol)
function normalizeUrl(raw) {
  let url = (raw || '').trim();
  if (!url) return 'https://omarchy.org';

  // If user enters just a port, e.g. "3000" or "5173"
  if (/^\d{2,5}$/.test(url)) {
    return `http://localhost:${url}`;
  }

  // If localhost or ip
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(url)) {
    return `http://${url}`;
  }

  // If missing protocol
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
}

// Load website into all active webviews
function navigateTo(targetUrl) {
  const finalUrl = normalizeUrl(targetUrl);
  state.currentUrl = finalUrl;
  elements.urlInput.value = finalUrl;

  let loadedCount = 0;
  for (const device of ['phone', 'tablet', 'desktop']) {
    const wv = elements.webviews[device];
    if (wv && state.views[device]) {
      try {
        elements.loaders[device].classList.add('active');
        if (typeof wv.loadURL === 'function') {
          wv.loadURL(finalUrl).catch((err) => {
            if (err && err.code !== 'ERR_ABORTED' && err.errno !== -3) {
              console.warn(`[${device}] Navigation error:`, err);
            }
          });
        } else {
          wv.src = finalUrl;
        }
        loadedCount++;
      } catch (err) {
        console.error(`Error loading ${device} webview:`, err);
      }
    }
  }

  elements.statusText.textContent = `Navigated to ${finalUrl}`;
  saveHistory(finalUrl);
}

// Refresh active views
function refreshAll() {
  const btnIcon = elements.btnRefreshAll.querySelector('.btn-icon');
  if (btnIcon) btnIcon.classList.add('spinning');

  let refreshed = 0;
  for (const device of ['phone', 'tablet', 'desktop']) {
    const wv = elements.webviews[device];
    if (wv && state.views[device]) {
      elements.loaders[device].classList.add('active');
      wv.reload();
      refreshed++;
    }
  }

  setTimeout(() => {
    if (btnIcon) btnIcon.classList.remove('spinning');
  }, 1000);

  elements.statusText.textContent = `Refreshed ${refreshed} views`;
}

function refreshDevice(device) {
  const wv = elements.webviews[device];
  if (wv) {
    elements.loaders[device].classList.add('active');
    wv.reload();
    elements.statusText.textContent = `Refreshed ${device} view`;
  }
}

// Update views visibility
function updateViewVisibility() {
  let count = 0;
  for (const device of ['phone', 'tablet', 'desktop']) {
    const isVisible = state.views[device];
    elements.cards[device].classList.toggle('hidden', !isVisible);
    elements.toggles[device].classList.toggle('active', isVisible);
    if (isVisible) {
      count++;
      // If was hidden and now visible, load URL if empty
      const wv = elements.webviews[device];
      if (wv && (!wv.src || wv.src === 'about:blank' || wv.src !== state.currentUrl)) {
        wv.src = state.currentUrl;
      }
    }
  }

  elements.activeCount.textContent = `${count} ${count === 1 ? 'view' : 'views'} active`;
  elements.emptyState.hidden = count > 0;

  // Sync preset dropdown to match selection if possible
  syncViewPresetDropdown();

  // Re-calculate scaling
  calculateScale();
}

function syncViewPresetDropdown() {
  const { phone, tablet, desktop } = state.views;
  if (phone && tablet && desktop) elements.selectViewPreset.value = 'all';
  else if (phone && desktop && !tablet) elements.selectViewPreset.value = 'phone-desktop';
  else if (phone && tablet && !desktop) elements.selectViewPreset.value = 'phone-tablet';
  else if (tablet && desktop && !phone) elements.selectViewPreset.value = 'tablet-desktop';
  else if (phone && !tablet && !desktop) elements.selectViewPreset.value = 'phone';
  else if (tablet && !phone && !desktop) elements.selectViewPreset.value = 'tablet';
  else if (desktop && !phone && !tablet) elements.selectViewPreset.value = 'desktop';
}

function applyViewPreset(preset) {
  switch (preset) {
    case 'all':
      state.views = { phone: true, tablet: true, desktop: true };
      break;
    case 'phone-desktop':
      state.views = { phone: true, tablet: false, desktop: true };
      break;
    case 'phone-tablet':
      state.views = { phone: true, tablet: true, desktop: false };
      break;
    case 'tablet-desktop':
      state.views = { phone: false, tablet: true, desktop: true };
      break;
    case 'phone':
      state.views = { phone: true, tablet: false, desktop: false };
      break;
    case 'tablet':
      state.views = { phone: false, tablet: true, desktop: false };
      break;
    case 'desktop':
      state.views = { phone: false, tablet: false, desktop: true };
      break;
  }
  updateViewVisibility();
}

// Device Dimensions & Rotation
function setDeviceDimensions(device, width, height) {
  const d = state.dimensions[device];
  d.baseWidth = width;
  d.baseHeight = height;
  d.width = d.rotated ? height : width;
  d.height = d.rotated ? width : height;

  updateDeviceScreenSize(device);
  calculateScale();
}

function rotateDevice(device) {
  const d = state.dimensions[device];
  d.rotated = !d.rotated;
  const temp = d.width;
  d.width = d.height;
  d.height = temp;

  updateDeviceScreenSize(device);
  calculateScale();
  elements.statusText.textContent = `${device} rotated to ${d.rotated ? 'Landscape' : 'Portrait'} (${d.width}×${d.height})`;
}

function updateDeviceScreenSize(device) {
  const d = state.dimensions[device];
  const screen = elements.screens[device];
  screen.style.width = `${d.width}px`;
  screen.style.height = `${d.height}px`;
  elements.pills[device].textContent = `${d.width} × ${d.height} px`;
}

// Dynamic Auto-Fit Scaling
function calculateScale() {
  const canvas = elements.viewportCanvas;
  const canvasWidth = canvas.clientWidth - 64;
  const canvasHeight = canvas.clientHeight - 80;

  let scale = 1.0;
  const visibleDevices = Object.keys(state.views).filter(k => state.views[k]);
  if (visibleDevices.length === 0) return;

  if (state.zoomMode === 'fit') {
    let totalWidth = 0;
    let maxHeight = 0;
    for (const d of visibleDevices) {
      totalWidth += state.dimensions[d].width + 36;
      if (state.dimensions[d].height > maxHeight) maxHeight = state.dimensions[d].height;
    }
    totalWidth += (visibleDevices.length - 1) * 28;

    const scaleX = canvasWidth / totalWidth;
    const scaleY = canvasHeight / (maxHeight + 84);
    scale = Math.min(scaleX, scaleY, 1.0);

    // If single device like a phone, let it display at natural 100% or scale down if height exceeds
    if (visibleDevices.length === 1) {
      scale = Math.min(1.0, Math.max(0.4, scaleY));
    } else {
      scale = Math.max(scale, 0.35);
    }

    elements.scaleInfo.textContent = `Scale: Fit (${Math.round(scale * 100)}%)`;
  } else {
    scale = parseFloat(state.zoomMode) || 1.0;
    elements.scaleInfo.textContent = `Scale: ${Math.round(scale * 100)}%`;
  }

  // Apply scale to wrapper and adjust card bounds
  for (const device of ['phone', 'tablet', 'desktop']) {
    if (state.views[device]) {
      const d = state.dimensions[device];
      elements.scales[device].style.transform = `scale(${scale})`;
      elements.cards[device].style.width = `${Math.round(d.width * scale) + 36}px`;
      elements.cards[device].style.height = `${Math.round(d.height * scale) + 84}px`;
    }
  }
}

// Synchronized Scrolling
function setupSyncScroll(webview, sourceDevice) {
  webview.addEventListener('dom-ready', () => {
    // Inject scroll listener into webview
    webview.executeJavaScript(`
      (() => {
        window.__omarchyScrollListener = true;
        window.addEventListener('scroll', () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
          console.log('__OMARCHY_SCROLL__:' + ratio);
        }, { passive: true });
      })();
    `);
  });

  webview.addEventListener('console-message', (e) => {
    if (!state.syncScroll || state.isSyncingScroll) return;
    if (e.message && e.message.startsWith('__OMARCHY_SCROLL__:')) {
      const ratio = parseFloat(e.message.split(':')[1]);
      if (!isNaN(ratio)) {
        broadcastScroll(ratio, sourceDevice);
      }
    }
  });
}

function broadcastScroll(ratio, sourceDevice) {
  state.isSyncingScroll = true;
  for (const device of ['phone', 'tablet', 'desktop']) {
    if (device !== sourceDevice && state.views[device]) {
      const targetWv = elements.webviews[device];
      if (targetWv) {
        targetWv.executeJavaScript(`
          (() => {
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
              window.scrollTo({ top: ${ratio} * maxScroll, behavior: 'auto' });
            }
          })();
        `);
      }
    }
  }
  setTimeout(() => {
    state.isSyncingScroll = false;
  }, 100);
}

// Auto-Refresh
function setAutoRefresh(seconds) {
  state.autoRefreshInterval = seconds;
  if (state.autoRefreshTimer) {
    clearInterval(state.autoRefreshTimer);
    state.autoRefreshTimer = null;
  }

  if (seconds > 0) {
    state.autoRefreshTimer = setInterval(() => {
      refreshAll();
    }, seconds * 1000);
    elements.statusText.textContent = `Auto-refresh active: every ${seconds}s`;
  } else {
    elements.statusText.textContent = 'Auto-refresh off';
  }
}

// Save & Load History
function saveHistory(url) {
  try {
    let history = JSON.parse(localStorage.getItem('arch_tester_history') || '[]');
    history = [url, ...history.filter(u => u !== url)].slice(0, 15);
    localStorage.setItem('arch_tester_history', JSON.stringify(history));
  } catch (e) {}
}

// Initial Setup
function initialize() {
  const bridge = window.testerBridge || window.omarchyBridge;

  // 1. Initial theme load & watcher
  if (bridge) {
    bridge.getThemeData().then(applyTheme);
    bridge.onThemeChanged(applyTheme);
    bridge.onLoadUrl((url) => {
      navigateTo(url);
    });
  }

  // 2. Setup webviews
  for (const device of ['phone', 'tablet', 'desktop']) {
    const wv = elements.webviews[device];
    wv.addEventListener('dom-ready', () => {
      try { wv.setUserAgent(USER_AGENTS[device]); } catch (e) {}
    });

    wv.addEventListener('did-start-loading', () => {
      elements.loaders[device].classList.add('active');
    });

    wv.addEventListener('did-stop-loading', () => {
      elements.loaders[device].classList.remove('active');
    });

    wv.addEventListener('did-fail-load', (e) => {
      elements.loaders[device].classList.remove('active');
      if (e.errorCode !== -3) { // Ignore aborted loads
        elements.statusText.textContent = `${device} load error: ${e.errorDescription}`;
      }
    });

    // Per-device refresh buttons
    const btnRef = document.getElementById(`btn-refresh-${device}`);
    if (btnRef) btnRef.addEventListener('click', () => refreshDevice(device));

    // Per-device external browser button
    const btnExt = document.getElementById(`btn-external-${device}`);
    if (btnExt) {
      btnExt.addEventListener('click', () => {
        const url = wv.getURL() || state.currentUrl;
        if (bridge) bridge.openExternal(url);
      });
    }

    // Per-device DevTools
    const btnDev = document.getElementById(`btn-devtools-${device}`);
    if (btnDev) {
      btnDev.addEventListener('click', () => {
        if (wv.isDevToolsOpened()) wv.closeDevTools();
        else wv.openDevTools();
      });
    }

    // Synchronized scroll listener
    setupSyncScroll(wv, device);
  }

  // Rotate buttons
  document.getElementById('btn-rotate-phone').addEventListener('click', () => rotateDevice('phone'));
  document.getElementById('btn-rotate-tablet').addEventListener('click', () => rotateDevice('tablet'));

  // Device model select
  document.getElementById('select-phone-model').addEventListener('change', (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    setDeviceDimensions('phone', w, h);
  });
  document.getElementById('select-tablet-model').addEventListener('change', (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    setDeviceDimensions('tablet', w, h);
  });
  document.getElementById('select-desktop-model').addEventListener('change', (e) => {
    const [w, h] = e.target.value.split('x').map(Number);
    setDeviceDimensions('desktop', w, h);
  });

  // Toggle buttons
  for (const device of ['phone', 'tablet', 'desktop']) {
    elements.toggles[device].addEventListener('click', () => {
      state.views[device] = !state.views[device];
      updateViewVisibility();
    });
  }

  // Empty state buttons
  document.getElementById('empty-btn-all').addEventListener('click', () => applyViewPreset('all'));
  document.getElementById('empty-btn-phone').addEventListener('click', () => applyViewPreset('phone'));
  document.getElementById('empty-btn-desktop').addEventListener('click', () => applyViewPreset('desktop'));

  // Presets & View selector
  elements.selectViewPreset.addEventListener('change', (e) => {
    applyViewPreset(e.target.value);
  });

  // Auto-Refresh selector
  elements.selectAutoRefresh.addEventListener('change', (e) => {
    setAutoRefresh(parseInt(e.target.value, 10));
  });

  // Zoom selector
  elements.selectZoom.addEventListener('change', (e) => {
    state.zoomMode = e.target.value;
    calculateScale();
  });

  // Sync scroll toggle
  elements.btnSyncScroll.addEventListener('click', () => {
    state.syncScroll = !state.syncScroll;
    elements.btnSyncScroll.classList.toggle('active', state.syncScroll);
    elements.statusText.textContent = `Sync Scroll: ${state.syncScroll ? 'ON' : 'OFF'}`;
  });

  // Omnibox & URL navigation
  elements.btnGo.addEventListener('click', () => {
    navigateTo(elements.urlInput.value);
  });

  elements.urlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      navigateTo(elements.urlInput.value);
    }
  });

  elements.btnClear.addEventListener('click', () => {
    elements.urlInput.value = '';
    elements.urlInput.focus();
  });

  elements.btnRefreshAll.addEventListener('click', refreshAll);

  // Back / Forward
  elements.btnBack.addEventListener('click', () => {
    for (const d of ['phone', 'tablet', 'desktop']) {
      const wv = elements.webviews[d];
      if (wv && state.views[d] && wv.canGoBack()) wv.goBack();
    }
  });

  elements.btnForward.addEventListener('click', () => {
    for (const d of ['phone', 'tablet', 'desktop']) {
      const wv = elements.webviews[d];
      if (wv && state.views[d] && wv.canGoForward()) wv.goForward();
    }
  });

  // Presets popover menu
  elements.btnPresets.addEventListener('click', (e) => {
    e.stopPropagation();
    elements.presetsMenu.classList.toggle('visible');
  });

  const btnClosePresets = document.getElementById('btn-presets-close');
  if (btnClosePresets) {
    btnClosePresets.addEventListener('click', (e) => {
      e.stopPropagation();
      elements.presetsMenu.classList.remove('visible');
    });
  }

  document.addEventListener('click', (e) => {
    if (!elements.presetsMenu.contains(e.target) && e.target !== elements.btnPresets && !elements.btnPresets.contains(e.target)) {
      elements.presetsMenu.classList.remove('visible');
    }
  });

  document.querySelectorAll('.preset-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.dataset.url;
      elements.presetsMenu.classList.remove('visible');
      navigateTo(url);
    });
  });

  // Global Keyboard shortcuts
  window.addEventListener('keydown', (e) => {
    // Ctrl+R or F5: Refresh All
    if ((e.ctrlKey && e.key.toLowerCase() === 'r') || e.key === 'F5') {
      e.preventDefault();
      refreshAll();
    }
    // Ctrl+L: Focus URL Input
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      elements.urlInput.focus();
      elements.urlInput.select();
    }
  });

  // Window resize handler for scaling
  window.addEventListener('resize', calculateScale);

  // Initial load
  navigateTo(state.currentUrl);
  updateViewVisibility();
}

window.addEventListener('DOMContentLoaded', initialize);
