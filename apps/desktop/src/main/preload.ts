import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('firebaseAPI', {
  platform: process.platform,
  ping: () => ipcRenderer.invoke('ping'),
  connect: (host: string, projectId: string) => 
    ipcRenderer.invoke('connect-emulator', host, projectId),
  listCollections: () => 
    ipcRenderer.invoke('list-collections'),
  getCollectionDocuments: (collectionId: string) => 
    ipcRenderer.invoke('get-documents', collectionId),
  exportDatabase: (collectionId?: string, docId?: string) => 
    ipcRenderer.invoke('export-database', collectionId, docId),
  autoDetect: () => 
    ipcRenderer.invoke('auto-detect')
});

