const { app, BrowserWindow, session, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DEFAULT_URL = 'https://asoudani.dev';

let mainWindow = null;

// Arch Linux default dark theme
const DEFAULT_THEME = {
  name: 'Arch Dark',
  colors: {
    mode: 'dark',
    background: '#0d1117',
    dark_background: '#090d12',
    darker_background: '#05080c',
    lighter_background: '#161b22',
    foreground: '#e6edf3',
    dark_foreground: '#8b949e',
    accent: '#1793d1',
    muted: '#8b949e',
    selection: '#1f6feb44',
    red: '#f85149',
    green: '#3fb950',
    yellow: '#d29922',
    blue: '#58a6ff'
  }
};

// Optional theme detection (Omarchy colors.toml or Pywal colors.json)
const HOME_DIR = process.env.HOME || '';
const OMARCHY_THEME_PATH = path.join(HOME_DIR, '.local/state/omarchy/current/theme/colors.toml');
const WAL_THEME_PATH = path.join(HOME_DIR, '.cache/wal/colors.json');

function parseColorsToml(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');
    const colors = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('[')) continue;
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\s*=\s*["']?([^"']+)["']?$/);
      if (match) {
        colors[match[1]] = match[2];
      }
    }
    return colors;
  } catch (err) {
    return null;
  }
}

function parseWalColors(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data || !data.colors) return null;
    return {
      mode: 'dark',
      background: data.special?.background || '#0d1117',
      dark_background: data.special?.background || '#090d12',
      darker_background: data.colors.color0 || '#05080c',
      lighter_background: data.colors.color8 || '#161b22',
      foreground: data.special?.foreground || '#e6edf3',
      dark_foreground: data.colors.color7 || '#8b949e',
      accent: data.colors.color4 || '#1793d1',
      muted: data.colors.color8 || '#8b949e',
      selection: data.colors.color1 || '#1f6feb44',
      red: data.colors.color1 || '#f85149',
      green: data.colors.color2 || '#3fb950',
      yellow: data.colors.color3 || '#d29922',
      blue: data.colors.color4 || '#58a6ff'
    };
  } catch (err) {
    return null;
  }
}

function getThemeData() {
  const omarchyColors = parseColorsToml(OMARCHY_THEME_PATH);
  if (omarchyColors) {
    return { name: 'System Theme', colors: omarchyColors };
  }
  const walColors = parseWalColors(WAL_THEME_PATH);
  if (walColors) {
    return { name: 'Wal Theme', colors: walColors };
  }
  return DEFAULT_THEME;
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      // Look for a URL passed in command line arguments
      const urlArg = commandLine.slice(2).find(arg => !arg.startsWith('-') && !arg.endsWith('.js'));
      if (urlArg) {
        mainWindow.webContents.send('load-url', urlArg);
      }
    }
  });

  app.whenReady().then(() => {
    // Strip security headers that prevent iframe/webview embedding
    const filter = { urls: ['*://*/*'] };
    session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
      const responseHeaders = { ...details.responseHeaders };
      delete responseHeaders['x-frame-options'];
      delete responseHeaders['X-Frame-Options'];
      delete responseHeaders['content-security-policy'];
      delete responseHeaders['Content-Security-Policy'];
      delete responseHeaders['frame-options'];
      delete responseHeaders['Frame-Options'];
      callback({ cancel: false, responseHeaders });
    });

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });
}

function createWindow() {
  // Determine initial URL from CLI args or default to https://asoudani.dev
  let initialUrl = DEFAULT_URL;
  const args = process.argv.slice(2);
  const targetUrl = args.find(arg => !arg.startsWith('-') && !arg.endsWith('.js') && (arg.startsWith('http://') || arg.startsWith('https://') || arg.startsWith('localhost') || arg.startsWith('127.0.0.1')));
  if (targetUrl) {
    initialUrl = targetUrl.startsWith('http') ? targetUrl : 'http://' + targetUrl;
  }

  const iconPath = path.join(__dirname, '../assets/arch-responsive-tester.svg');

  mainWindow = new BrowserWindow({
    width: 1540,
    height: 960,
    minWidth: 900,
    minHeight: 600,
    title: 'Arch Responsive Tester',
    backgroundColor: '#0d1117',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
      webSecurity: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'), {
    query: { url: initialUrl }
  });

  mainWindow.setMenuBarVisibility(false);

  // Watch for theme file changes if present
  try {
    if (fs.existsSync(OMARCHY_THEME_PATH)) {
      fs.watchFile(OMARCHY_THEME_PATH, { interval: 1000 }, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('theme-changed', getThemeData());
        }
      });
    }
  } catch (err) {}

  try {
    if (fs.existsSync(WAL_THEME_PATH)) {
      fs.watchFile(WAL_THEME_PATH, { interval: 1000 }, () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('theme-changed', getThemeData());
        }
      });
    }
  } catch (err) {}

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('get-theme', () => {
  return getThemeData();
});

ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
