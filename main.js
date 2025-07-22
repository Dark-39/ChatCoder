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
const http = require('http'); // used to keep connection open if needed
const fetch = require('node-fetch'); // v2 or dynamic import

ipcMain.handle('prompt-to-llama', async (event, promptText) => {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'codellama',
      prompt: promptText,
      stream: true
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n');
    buffer = parts.pop(); // leftover

    for (const line of parts) {
      if (line.trim().startsWith('data:')) {
        const jsonStr = line.replace('data: ', '');
        if (jsonStr.trim() === '[DONE]') return;
        try {
          const data = JSON.parse(jsonStr);
          if (data.response) {
            event.sender.send('llama-stream', data.response);
          }
        } catch (err) {
          console.error('Failed to parse chunk', err);
        }
      }
    }
  }
});




app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
