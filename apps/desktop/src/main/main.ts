import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import * as net from 'net';
import { 
  connectToEmulator, 
  listRootCollections, 
  getCollectionDocuments, 
  exportDatabase, 
  writeExportToFile 
} from '@firestore-exporter/core';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const isMac = process.platform === 'darwin';
  const isWindows = process.platform === 'win32';

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 900,
    minHeight: 650,
    titleBarStyle: (isMac || isWindows) ? 'hidden' : 'default', // Frameless on Mac/Win, default framed on Linux
    ...(isWindows ? {
      titleBarOverlay: {
        color: '#18181c', // Matches our dark Slate Fluent header color
        symbolColor: '#c5c5c7',
        height: 38
      }
    } : {}),
    backgroundColor: '#1c1c22', // Slate dark Mica base background
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });


  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5273');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// --- IPC HANDLERS ---

// Ping for connection verification
ipcMain.handle('ping', () => 'pong');

// Connect to the Firestore Emulator
ipcMain.handle('connect-emulator', async (_, host: string, projectId: string) => {
  try {
    const success = await connectToEmulator(host, projectId);
    return { success };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// List all root collections
ipcMain.handle('list-collections', async () => {
  try {
    const collections = await listRootCollections();
    return { success: true, collections };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Get document data for a collection
ipcMain.handle('get-documents', async (_, collectionId: string) => {
  try {
    const documents = await getCollectionDocuments(collectionId);
    return { success: true, documents };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

function pingLocalPort(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const socket = new net.Socket();
      socket.setTimeout(200); // 200ms timeout
      
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.connect(port, '127.0.0.1');
    } catch (error) {
      resolve(false);
    }
  });
}

// Auto-detect a running Firestore emulator
ipcMain.handle('auto-detect', async () => {
  const commonPorts = [8080, 8085, 8081, 8082, 9000, 3000];
  
  for (const port of commonPorts) {
    const active = await pingLocalPort(port);
    if (active) {
      return { success: true, host: `127.0.0.1:${port}` };
    }
  }
  
  return { success: false, error: 'No active emulator ports found (scanned 8080, 8085, 8081, 8082).' };
});

// Export Database via Native OS Save Dialog
ipcMain.handle('export-database', async (_, collectionId?: string, docId?: string) => {
  if (!mainWindow) {
    return { success: false, error: 'Main window is not available.' };
  }

  try {
    let defaultFilename = 'firestore-export.json';
    if (collectionId && docId) {
      defaultFilename = `export-${collectionId}-${docId}.json`;
    } else if (collectionId) {
      defaultFilename = `export-collection-${collectionId}.json`;
    }

    // Trigger Electron's native save dialog
    const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Firestore Data',
      defaultPath: path.join(app.getPath('downloads'), defaultFilename),
      filters: [
        { name: 'JSON Files', extensions: ['json'] }
      ],
      buttonLabel: 'Export'
    });

    if (canceled || !filePath) {
      return { success: false, cancelled: true };
    }

    // Crawl database structure recursively
    const exportData = await exportDatabase(collectionId, docId);
    
    // Write JSON file to disk
    await writeExportToFile(filePath, exportData);

    return { success: true, path: filePath };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});
