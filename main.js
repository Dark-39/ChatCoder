const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // 👉 Load from Vite dev server (not local file)
  win.loadURL('http://localhost:5173');

  // Optional: Open DevTools so you can see logs in Electron window
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

const { ipcMain } = require('electron');
const fetch = require('node-fetch'); // if not installed: npm install node-fetch

ipcMain.handle('prompt-to-llama', async (event, promptText) => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'codellama',
        prompt: promptText,
        stream: false
      }),
    });

    const data = await response.json();
    return data.response || '(No response)';
  } catch (err) {
    console.error('Error talking to LLaMA:', err);
    return 'Error communicating with Code LLaMA.';
  }
});


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
