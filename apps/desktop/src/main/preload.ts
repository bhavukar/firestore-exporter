import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('firebaseAPI', {
  platform: process.platform,
  ping: () => ipcRenderer.invoke('ping'),
  connect: (host: string, projectId: string, liveConfig?: string) => 
    ipcRenderer.invoke('connect-emulator', host, projectId, liveConfig),
  listCollections: () => 
    ipcRenderer.invoke('list-collections'),
  getCollectionDocuments: (collectionId: string, limitNum: number = 50, queries: any[] = [], sorts: any[] = []) => 
    ipcRenderer.invoke('get-documents', collectionId, limitNum, queries, sorts),
  exportDatabase: (collectionId?: string, docId?: string) => 
    ipcRenderer.invoke('export-database', collectionId, docId),
  inferSchema: (collectionId: string) => 
    ipcRenderer.invoke('infer-schema', collectionId),
  generateSql: (schema: any) => 
    ipcRenderer.invoke('generate-sql', schema),
  autoDetect: () => 
    ipcRenderer.invoke('auto-detect')
});

