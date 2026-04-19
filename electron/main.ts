// electron/main.ts
import { app, BrowserWindow, session, ipcMain, dialog } from 'electron';
import * as path from 'path';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
    // Configure session with properly configured Content Security Policy
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': [
                    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: https: http: file:;" +
                    "img-src 'self' data: https: http: file:;" +
                    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:;" +
                    "style-src 'self' 'unsafe-inline' https: http:;" +
                    "connect-src 'self' ws: wss: http: https:"
                ]
            }
        });
    });

    // Setup webPreferences for the main window
    mainWindow = new BrowserWindow({
        width: 1280, 
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
            webSecurity: true,
            webviewTag: true, // Enable webview tag
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // Load the appropriate URL
    if (process.env.NODE_ENV === 'development') {
        try {
            await mainWindow.loadURL('http://localhost:3000');
            mainWindow.webContents.openDevTools();
        } catch {
            try {
                await mainWindow.loadURL('http://localhost:3001');
                mainWindow.webContents.openDevTools();
            } catch (error) {
                console.error('Failed to connect to development server:', error);
            }
        }
    } else {
        await mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

// Handle folder selection
ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null;
    
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory'],
        title: 'Select Artifacts Directory',
        buttonLabel: 'Select Folder'
    });
    
    if (result.canceled) {
        return null;
    }
    return result.filePaths[0];
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});