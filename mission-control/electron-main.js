const { app, BrowserWindow, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let apiServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400, height: 900, minWidth: 1000, minHeight: 700,
    title: 'Mission Control', backgroundColor: '#0a0a0f',
    webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: false },
    titleBarStyle: 'hiddenInset', trafficLightPosition: { x: 16, y: 16 },
    vibrancy: 'under-window', visualEffectState: 'active',
  });
  
  mainWindow.loadURL('http://localhost:3001');
  if (process.argv.includes('--dev')) mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => { mainWindow = null; });
}

function createTray() {
  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('Mission Control');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Open', click: () => { if (mainWindow) { mainWindow.show(); mainWindow.focus(); } } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
  tray.on('click', () => { if (mainWindow) { mainWindow.isVisible() ? mainWindow.focus() : mainWindow.show(); } });
}

app.whenReady().then(() => {
  const { server, PORT } = require('./server-wrapper.js');
  apiServer = server;
  server.listen(PORT, () => console.log(`API server on port ${PORT}`));
  createTray();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('before-quit', () => { if (apiServer) apiServer.close(); });
