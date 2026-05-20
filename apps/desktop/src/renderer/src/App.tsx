import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Input, 
  ToastContainer, 
  Toast 
} from '@firestore-exporter/ui';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Database, 
  Layers, 
  FileCode, 
  ChevronRight, 
  ChevronDown, 
  Copy, 
  Check, 
  Cpu, 
  AlertCircle,
  LogOut,
  Sparkles
} from 'lucide-react';

// Declare global types for Electron secure bridge
interface WindowFirebaseAPI {
  platform: 'win32' | 'darwin' | 'linux';
  ping: () => Promise<string>;
  connect: (host: string, projectId: string) => Promise<{ success: boolean; error?: string }>;
  listCollections: () => Promise<{ success: boolean; collections?: string[]; error?: string }>;
  getCollectionDocuments: (collectionId: string) => Promise<{ success: boolean; documents?: any[]; error?: string }>;
  exportDatabase: (collectionId?: string, docId?: string) => Promise<{ success: boolean; path?: string; cancelled?: boolean; error?: string }>;
  autoDetect: () => Promise<{ success: boolean; host?: string; error?: string }>;
}

declare global {
  interface Window {
    firebaseAPI: WindowFirebaseAPI;
  }
}

// --- COLOR-CODED RENDER FOR INDIVIDUAL VALUES (Fluent/VS Code styled) ---
const renderPrimitiveValue = (val: any) => {
  if (val === null) return <span className="text-[#569cd6] font-mono select-all">null</span>;
  if (val === undefined) return <span className="text-[#727278] font-mono select-all">undefined</span>;
  
  if (typeof val === 'boolean') {
    return <span className="text-[#569cd6] font-semibold font-mono select-all">{val ? 'true' : 'false'}</span>;
  }
  if (typeof val === 'number') {
    return <span className="text-[#b5cea8] font-mono select-all">{val}</span>;
  }
  if (typeof val === 'string') {
    return <span className="text-[#ce9178] font-mono select-all">"{val}"</span>;
  }

  // Handle serialized Firestore types
  if (val && typeof val === 'object' && val._type) {
    if (val._type === 'Timestamp') {
      return (
        <span className="text-[#4ec9b0] font-mono flex items-center gap-1.5 text-[10px] bg-[#1a1a20] border border-white/5 px-2 py-0.5 rounded" title={`Seconds: ${val.seconds}`}>
          🕒 Timestamp({new Date(val.iso).toLocaleString()})
        </span>
      );
    }
    if (val._type === 'GeoPoint') {
      return (
        <span className="text-[#c586c0] font-mono text-[10px] bg-[#1a1a20] border border-white/5 px-2 py-0.5 rounded">
          📍 GeoPoint({val.latitude}°, {val.longitude}°)
        </span>
      );
    }
    if (val._type === 'DocumentReference') {
      return (
        <span className="text-[#ce9178] font-mono text-[10px] bg-[#1a1a20] border border-white/5 px-2 py-0.5 rounded select-all">
          🔗 Ref({val.path})
        </span>
      );
    }
  }

  return <span className="text-[#d4d4d4] font-mono select-all">{JSON.stringify(val)}</span>;
};

// --- CUSTOM INTERACTIVE COLLAPSIBLE JSON TREE VIEW ---
interface JSONNodeProps {
  name: string;
  value: any;
  isLast?: boolean;
}

const JSONNode: React.FC<JSONNodeProps> = ({ name, value, isLast = true }) => {
  const [collapsed, setCollapsed] = useState(true);

  const isObject = value !== null && typeof value === 'object' && !value._type;
  const isArray = Array.isArray(value);

  if (isObject || isArray) {
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;

    return (
      <div className="text-xs pl-4 select-text">
        <div className="flex items-center py-0.5 select-none">
          {!isEmpty && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              className="p-0.5 hover:bg-white/5 text-neutral-500 hover:text-white rounded mr-1 transition-colors"
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          
          <span className="text-[#9cdcfe] font-sans mr-1.5">{name}:</span>
          <span className="text-neutral-500 font-sans text-[10px]">
            {isArray ? `Array[${value.length}]` : `Object{${keys.length}}`}
          </span>

          {collapsed && <span className="text-neutral-600 ml-1.5 font-sans text-[10px]">...</span>}
        </div>

        {!collapsed && !isEmpty && (
          <div className="border-l border-white/5 ml-2 pl-2 mt-0.5 space-y-0.5">
            {keys.map((key, index) => (
              <JSONNode 
                key={key} 
                name={key} 
                value={value[key]} 
                isLast={index === keys.length - 1} 
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-xs pl-6 py-0.5 flex items-start select-text">
      <span className="text-[#9cdcfe] font-sans mr-1.5">{name}:</span>
      <span>{renderPrimitiveValue(value)}</span>
      {!isLast && <span className="text-neutral-500 ml-0.5">,</span>}
    </div>
  );
};

export default function App() {
  const [screen, setScreen] = useState<'gateway' | 'explorer'>('gateway');
  const [gatewayMode, setGatewayMode] = useState<'local' | 'live'>('local');
  const [host, setHost] = useState('127.0.0.1:8080');
  const [projectId, setProjectId] = useState('demo-project');
  const [liveConfig, setLiveConfig] = useState('');
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  
  const [activeSession, setActiveSession] = useState<{ mode: 'local'|'live', host: string, project: string }>({
    mode: 'local', host: '127.0.0.1:8080', project: 'demo-project'
  });
  
  // States
  const [connecting, setConnecting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [collections, setCollections] = useState<string[]>([]);
  const [filteredCollections, setFilteredCollections] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Get active platform from IPC bridge ('win32', 'darwin', 'linux')
  const platform = window.firebaseAPI?.platform || 'win32';

  // Load last used project credentials from localStorage
  useEffect(() => {
    const savedHost = localStorage.getItem('last-host');
    const savedProjectId = localStorage.getItem('last-project-id');
    if (savedHost) setHost(savedHost);
    if (savedProjectId) setProjectId(savedProjectId);
  }, []);

  // Filter collections list based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCollections(collections);
    } else {
      setFilteredCollections(
        collections.filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
  }, [searchQuery, collections]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString();
    const newToast: Toast = {
      id,
      type,
      title,
      message
    };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // NATIVE PORT PING DISCOVERY
  const handleAutoDetect = async () => {
    setDetecting(true);
    addToast('Auto-Detecting', 'Scanning active TCP ports...', 'info');

    try {
      const res = await window.firebaseAPI.autoDetect();
      if (res.success && res.host) {
        setHost(res.host);
        addToast('Emulator Discovered', `Connected automatically to ${res.host}`, 'success');
      } else {
        addToast('No Emulator Found', res.error || 'Check if your emulator is active.', 'error');
      }
    } catch (err: any) {
      addToast('Detection Failed', err.message || 'Error occurred while scanning ports.', 'error');
    } finally {
      setDetecting(false);
    }
  };

  // EMULATOR CORE CONNECTION
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gatewayMode === 'local' && !host.trim()) {
      addToast('Missing Fields', 'Emulator host cannot be empty.', 'error');
      return;
    }
    if (gatewayMode === 'live' && !liveConfig.trim()) {
      addToast('Missing Fields', 'Service Account JSON cannot be empty.', 'error');
      return;
    }

    setConnecting(true);
    if (gatewayMode === 'local') {
      addToast('Connecting', `Pinging Firestore emulator at ${host}...`, 'info');
    } else {
      addToast('Connecting', 'Initializing Firebase Admin SDK...', 'info');
    }

    try {
      let res;
      let activeProj = projectId;
      let activeHost = host;
      
      if (gatewayMode === 'local') {
        res = await window.firebaseAPI.connect(host, projectId);
      } else {
        const configObj = JSON.parse(liveConfig);
        activeProj = configObj.project_id || 'live-project';
        activeHost = 'firestore.googleapis.com';
        res = await window.firebaseAPI.connect('', activeProj, liveConfig);
      }
      
      if (res.success) {
        if (gatewayMode === 'local') {
          localStorage.setItem('last-host', host);
          localStorage.setItem('last-project-id', projectId);
        }

        setActiveSession({ mode: gatewayMode, host: activeHost, project: activeProj });
        addToast('Connected', `Session established for project '${activeProj}'.`, 'success');
        
        // Fetch root collections
        const colRes = await window.firebaseAPI.listCollections();
        if (colRes.success && colRes.collections) {
          setCollections(colRes.collections);
          setScreen('explorer');
        } else {
          addToast('Read Error', colRes.error || 'Failed to list collections', 'error');
        }
      } else {
        addToast('Connection Failed', res.error || 'Unable to connect to database', 'error');
      }
    } catch (err: any) {
      addToast('Error', err.message || 'Unexpected connection error', 'error');
    } finally {
      setConnecting(false);
    }
  };

  // REFRESH COLLECTIONS
  const handleRefreshCollections = async () => {
    addToast('Refreshing', 'Updating database collection listings...', 'info');
    try {
      const colRes = await window.firebaseAPI.listCollections();
      if (colRes.success && colRes.collections) {
        setCollections(colRes.collections);
        addToast('Refreshed', 'Collections synchronized.', 'success');
      } else {
        addToast('Refresh Failed', colRes.error || 'Could not update collection list.', 'error');
      }
    } catch (err: any) {
      addToast('Refresh Error', err.message || 'Error communicating with main process.', 'error');
    }
  };

  // FETCH COLLECTION DOCUMENTS
  const handleSelectCollection = async (colId: string) => {
    setSelectedCollection(colId);
    setSelectedDocument(null);
    setLoadingDocs(true);

    try {
      const docRes = await window.firebaseAPI.getCollectionDocuments(colId);
      if (docRes.success && docRes.documents) {
        setDocuments(docRes.documents);
      } else {
        addToast('Fetch Documents Failed', docRes.error || 'Could not fetch documents.', 'error');
      }
    } catch (err: any) {
      addToast('Fetch Error', err.message || 'Could not list collection items.', 'error');
    } finally {
      setLoadingDocs(false);
    }
  };

  // EXPORT PROCESS (ENTIRE DB, COLLECTION, DOCUMENT)
  const handleExport = async (scope: 'db' | 'collection' | 'document') => {
    let colId: string | undefined = undefined;
    let docId: string | undefined = undefined;

    if (scope === 'collection') {
      if (!selectedCollection) return;
      colId = selectedCollection;
    } else if (scope === 'document') {
      if (!selectedCollection || !selectedDocument) return;
      colId = selectedCollection;
      docId = selectedDocument.id;
    }

    addToast('Export Initiated', 'Awaiting native file save approval...', 'info');

    try {
      const res = await window.firebaseAPI.exportDatabase(colId, docId);
      
      if (res.success && res.path) {
        addToast('Export Succeeded', `JSON file exported to: ${res.path}`, 'success');
      } else if (res.cancelled) {
        addToast('Export Cancelled', 'File saving was cancelled.', 'info');
      } else {
        addToast('Export Failed', res.error || 'Disk permission or file write error.', 'error');
      }
    } catch (err: any) {
      addToast('Export Error', err.message || 'Failed to complete crawler export.', 'error');
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedDocId(id);
    setTimeout(() => setCopiedDocId(null), 1500);
    addToast('Copied', `Document ID copied to clipboard.`, 'success');
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#1c1c22] text-[#f3f3f5] overflow-hidden select-none">
      
      {/* Dynamic Platform-Aware Title Bar Header */}
      {platform !== 'linux' && (
        <header 
          className={`h-[38px] shrink-0 bg-[#18181c] border-b border-white/[0.04] flex items-center justify-between drag-region ${
            platform === 'darwin' ? 'pl-20 pr-4' : 'pl-4 pr-[138px]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database size={14} className="text-[#60cdff]" />
            <span className="text-[11px] font-medium tracking-wide text-neutral-300">
              Firestore Exporter
            </span>
          </div>
          
          {screen === 'explorer' && (
            <div className="flex items-center gap-3 text-[10px] bg-white/[0.04] px-3 py-0.5 rounded-full border border-white/[0.03]">
              <span className="flex items-center gap-1.5 text-[#60cdff]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#60cdff] shadow-[0_0_8px_rgba(96,205,255,0.8)]" />
                Active
              </span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-300 font-mono text-[9px]">{host}</span>
              <span className="text-neutral-600">|</span>
              <span className="text-neutral-400 text-[9px]">{projectId}</span>
            </div>
          )}
        </header>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 overflow-hidden relative">
        {screen === 'gateway' ? (
          // --- SCREEN A: THE GATEWAY (NATIVE CONNECTION WINDOW) ---
          <div className="h-full w-full flex items-center justify-center bg-radial-dark p-8 relative">
            
            {/* Elegant glass blur circles in the background */}
            <div className="absolute top-1/4 left-1/4 h-[250px] w-[250px] rounded-full bg-[#0078d4]/8 blur-[90px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 h-[200px] w-[200px] rounded-full bg-indigo-500/8 blur-[70px] pointer-events-none" />
            
            <div className="w-full max-w-sm relative z-10">
              <Card className="border border-white/[0.06] bg-[#202026]/90 backdrop-blur-2xl p-7 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 mb-5 select-none">
                  <div className="p-2 rounded-lg bg-[#0078d4]/10 border border-[#0078d4]/20">
                    <Database size={20} className="text-[#60cdff]" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold tracking-tight text-white">
                      Connect to Firestore
                    </h1>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Target local Firebase Emulator Suite instances
                    </p>
                  </div>
                </div>

                <div className="flex bg-[#16161c] border border-white/5 rounded-md p-1 mb-5">
                  <button
                    type="button"
                    onClick={() => setGatewayMode('local')}
                    className={`flex-1 text-[11px] font-semibold py-1.5 rounded transition-all ${
                      gatewayMode === 'local' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    Local Emulator
                  </button>
                  <button
                    type="button"
                    onClick={() => setGatewayMode('live')}
                    className={`flex-1 text-[11px] font-semibold py-1.5 rounded transition-all ${
                      gatewayMode === 'live' ? 'bg-[#0078d4] text-white shadow-sm' : 'text-neutral-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    Live Production
                  </button>
                </div>

                <form onSubmit={handleConnect} className="space-y-4">
                  {gatewayMode === 'local' ? (
                    <>
                      <Input
                        label="Emulator Host Address"
                        value={host}
                        onChange={(e) => setHost(e.target.value)}
                        placeholder="e.g. 127.0.0.1:8080"
                        disabled={connecting || detecting}
                        id="host-input"
                      />

                      <Input
                        label="Project ID"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        placeholder="e.g. demo-project"
                        disabled={connecting || detecting}
                        id="project-input"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col gap-1.5 mb-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Service Account Key (JSON)</label>
                        </div>
                        <textarea
                          value={liveConfig}
                          onChange={(e) => setLiveConfig(e.target.value)}
                          placeholder='{"type": "service_account", "project_id": "...", "private_key": "..."}'
                          disabled={connecting}
                          className="w-full h-[120px] bg-[#111115] border border-[#2d2d30] hover:border-[#3e3e42] focus:border-[#60cdff] focus:ring-1 focus:ring-[#60cdff]/30 text-white text-[11px] font-mono rounded-md p-3 outline-none transition-all resize-none shadow-inner placeholder-neutral-700"
                        />
                      </div>
                      <div className="bg-[#27c93f]/10 border border-[#27c93f]/20 p-2.5 rounded-md flex items-start gap-2 mb-2">
                        <AlertCircle size={13} className="text-[#27c93f] mt-[1px] shrink-0" />
                        <p className="text-[10px] text-neutral-300 leading-snug">
                          <strong className="text-[#27c93f]">Privacy First:</strong> Service accounts are processed locally in Node.js. Keys are never transmitted or stored on any external servers.
                        </p>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-2 pt-2">
                    {gatewayMode === 'live' && (
                      <button 
                        type="button" 
                        onClick={() => setShowHelpDialog(true)}
                        className="text-[11px] text-[#60cdff] hover:text-white transition-colors mb-1 underline underline-offset-2 decoration-[#60cdff]/30"
                      >
                        How do I get my Service Account Key?
                      </button>
                    )}
                    <Button 
                      type="submit" 
                      variant="primary"
                      disabled={connecting || detecting}
                      className="w-full text-center"
                    >
                      {connecting ? (
                        <>
                          <RefreshCw className="animate-spin text-white" size={13} /> Connecting...
                        </>
                      ) : (
                        'Connect Database'
                      )}
                    </Button>

                    {gatewayMode === 'local' && (
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAutoDetect}
                        disabled={connecting || detecting}
                        className="w-full py-1.5 text-[11px]"
                      >
                        {detecting ? (
                          <>
                            <Cpu className="animate-spin text-[#60cdff]" size={13} /> Scanning active ports...
                          </>
                        ) : (
                          <>
                            <Cpu size={13} className="text-[#60cdff]" /> Auto-Detect Emulator Port
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </form>

                <div className="mt-6 border-t border-white/[0.04] pt-3.5 flex justify-between text-[9px] font-medium text-neutral-500 select-none">
                  <span>Engine: Firebase Admin Core</span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={9} className="text-[#60cdff]" />
                    Fluent UI Design
                  </span>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          // --- SCREEN B: THE EXPLORER (THREE-PANE WORKSPACE) ---
          <div className="h-full w-full flex overflow-hidden">
            
            {/* Left Sidebar Pane: Collections */}
            <div className="w-[260px] shrink-0 border-r border-white/5 bg-[#202026] flex flex-col">
              
              {/* Search Bar */}
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Filter collections..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#2a2a32] border border-white/5 rounded-[4px] px-2.5 py-1.5 pl-8 font-sans text-xs text-white outline-none focus:border-b-2 focus:border-b-[#60cdff] focus:bg-[#1f1f24] transition-all placeholder-neutral-500"
                  />
                  <Search size={12} className="absolute left-2.5 top-2 text-neutral-500" />
                </div>
              </div>

              {/* Collections Navigation */}
              <div className="flex-1 overflow-y-auto p-2">
                <div className="flex items-center justify-between px-2 py-1 mb-1.5 select-none">
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                    Collections ({filteredCollections.length})
                  </span>
                  <button 
                    onClick={handleRefreshCollections} 
                    className="p-1 hover:bg-white/5 text-neutral-400 hover:text-white rounded transition-colors"
                    title="Sync schema"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>

                {filteredCollections.length === 0 ? (
                  <div className="p-5 text-center border border-dashed border-white/5 rounded-lg m-1.5 bg-white/[0.01]">
                    <AlertCircle size={15} className="mx-auto text-neutral-500 mb-1.5" />
                    <p className="text-[10px] text-neutral-500 leading-relaxed">
                      No active collections found.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {filteredCollections.map((col) => {
                      const isActive = selectedCollection === col;
                      return (
                        <button
                          key={col}
                          onClick={() => handleSelectCollection(col)}
                          className={`w-full text-left font-sans text-xs px-2.5 py-2 rounded-[4px] flex items-center gap-2 relative transition-all duration-150 ${
                            isActive 
                              ? 'bg-white/[0.04] text-white font-medium border border-white/5' 
                              : 'bg-transparent text-neutral-400 hover:text-white hover:bg-white/[0.02]'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[#60cdff]" />
                          )}
                          <Layers size={12} className={isActive ? 'text-[#60cdff]' : 'text-neutral-500'} />
                          <span className="truncate flex-1 pl-1">{col}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sidebar Action Footer */}
              <div className="p-3 border-t border-white/5 bg-[#1b1b20] flex flex-col gap-2">
                <Button 
                  onClick={() => handleExport('db')} 
                  variant="primary"
                  size="sm"
                  className="w-full text-[11px] py-1.5"
                >
                  <Download size={12} /> Export Database JSON
                </Button>
                
                <button 
                  onClick={() => {
                    setScreen('gateway');
                    setSelectedCollection(null);
                    setDocuments([]);
                    setSelectedDocument(null);
                  }}
                  className="w-full text-center font-sans text-[10px] font-semibold text-neutral-400 hover:text-red-400 py-1.5 hover:bg-red-500/5 rounded-[4px] transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut size={11} />
                  Disconnect Session
                </button>
              </div>
            </div>

            {/* Middle Panel: Documents List */}
            <div className="w-[300px] shrink-0 border-r border-white/5 bg-[#16161c] flex flex-col">
              <div className="h-[44px] shrink-0 border-b border-white/5 px-3 flex items-center justify-between bg-[#202026]/40 select-none">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                  Documents ({documents.length})
                </span>
                {selectedCollection && (
                  <button 
                    onClick={() => handleExport('collection')}
                    className="p-1.5 bg-[#2d2d30] border border-[#3e3e42] hover:bg-[#353538] text-[#f3f3f5] rounded-[4px] flex items-center gap-1 px-2.5 py-1 text-[10px] font-sans font-medium transition-all shadow-sm"
                  >
                    <Download size={11} className="text-[#60cdff]" /> Export Collection
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-2.5">
                {!selectedCollection ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none opacity-30">
                    <Database size={20} className="text-neutral-500 mb-1.5" />
                    <p className="text-[9px] uppercase font-semibold tracking-wider text-neutral-400">
                      Select Collection
                    </p>
                  </div>
                ) : loadingDocs ? (
                  <div className="p-6 text-center text-xs text-neutral-400 flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin text-[#60cdff]" size={12} /> Synchronizing...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="p-5 text-center border border-dashed border-white/5 rounded-lg m-1.5 bg-white/[0.01]">
                    <p className="text-[10px] text-neutral-500">
                      No documents present.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {documents.map((doc) => {
                      const isActive = selectedDocument?.id === doc.id;
                      return (
                        <button
                          key={doc.id}
                          onClick={() => setSelectedDocument(doc)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-150 relative ${
                            isActive
                              ? 'bg-[#202026] text-white border-[#60cdff]/30 shadow-md'
                              : 'bg-white/[0.01] hover:bg-white/[0.02] text-neutral-300 border-white/[0.03] hover:border-white/10 shadow-sm'
                          }`}
                        >
                          {isActive && (
                            <div className="absolute left-0 top-2 bottom-2 w-[2.5px] rounded-full bg-[#60cdff]" />
                          )}
                          <div className="flex items-center justify-between mb-1 select-none pl-1">
                            <span className="font-medium text-xs text-neutral-100 truncate mr-2 block select-all font-mono">
                              {doc.id}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyId(doc.id);
                              }}
                              className="text-neutral-500 hover:text-white p-0.5 rounded transition-colors"
                              title="Copy Document ID"
                            >
                              {copiedDocId === doc.id ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                            </button>
                          </div>
                          <span className="text-[9px] text-neutral-500 block truncate font-mono select-all pl-1">
                            {doc.path}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Pane: Document Previewer */}
            <div className="flex-1 bg-[#121216] flex flex-col overflow-hidden">
              <div className="h-[44px] shrink-0 border-b border-white/5 px-4 flex items-center justify-between bg-[#202026]/40 select-none">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
                  Document Analyzer
                </span>
                {selectedDocument && (
                  <button 
                    onClick={() => handleExport('document')}
                    className="bg-[#0078d4] hover:bg-[#106ebe] text-white rounded-[4px] flex items-center gap-1.5 px-3 py-1 text-[10px] font-sans font-medium transition-all shadow-sm active:scale-[0.98]"
                  >
                    <Download size={11} /> Export Document
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-auto p-5 bg-[#0f0f12] select-text">
                {!selectedDocument ? (
                  <div className="h-full flex flex-col items-center justify-center text-center select-none opacity-20">
                    <FileCode size={22} className="text-neutral-500 mb-1.5" />
                    <p className="text-[9px] uppercase font-semibold tracking-wider text-neutral-400">
                      Select Document
                    </p>
                  </div>
                ) : (
                  <div className="border border-white/[0.03] bg-[#1c1c22]/30 p-5 rounded-xl shadow-xl relative overflow-hidden backdrop-blur-sm">
                    
                    {/* Document Header */}
                    <div className="border-b border-white/[0.04] pb-3 mb-4 flex items-center justify-between text-xs font-sans select-none">
                      <div>
                        <span className="text-neutral-500 uppercase text-[8px] font-semibold tracking-wider block">Document Path</span>
                        <span className="text-neutral-200 font-semibold font-mono text-[10px]">{selectedDocument.path}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-neutral-500 uppercase text-[8px] font-semibold tracking-wider block">Last Synced</span>
                        <span className="text-[#60cdff] font-semibold text-[9px]">
                          {selectedDocument.updateTime ? new Date(selectedDocument.updateTime).toLocaleTimeString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Collapsible JSON Viewer */}
                    <div className="space-y-0.5 mt-2 font-mono">
                      <div className="text-[#727278] text-xs">{'{'}</div>
                      
                      {Object.keys(selectedDocument.data).length === 0 ? (
                        <div className="pl-4 text-neutral-500 italic text-[11px] font-sans">
                          // empty document fields
                        </div>
                      ) : (
                        Object.keys(selectedDocument.data).map((key, idx, arr) => (
                           <JSONNode
                            key={key}
                            name={key}
                            value={selectedDocument.data[key]}
                            isLast={idx === arr.length - 1}
                          />
                        ))
                      )}

                      <div className="text-[#727278] text-xs">{'}'}</div>
                    </div>

                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Help Dialog Modal */}
      {showHelpDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#1c1c22] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-[#60cdff]" />
              <h2 className="text-sm font-semibold text-white">How to get your Service Account Key</h2>
            </div>
            <div className="space-y-3 text-xs text-neutral-300 mb-6 font-sans">
              <p>1. Open the Firebase Console and select your project.</p>
              <p>2. Click the gear icon (⚙️) next to "Project Overview" and select <strong className="text-white font-medium">Project settings</strong>.</p>
              <p>3. Navigate to the <strong className="text-white font-medium">Service accounts</strong> tab at the top.</p>
              <p>4. Ensure "Firebase Admin SDK" is selected and click the <strong className="text-white font-medium">Generate new private key</strong> button.</p>
              <p>5. Open the downloaded <code>.json</code> file, copy all of its text, and paste it here.</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowHelpDialog(false)}>
                Cancel
              </Button>
              <Button type="button" variant="primary" onClick={() => {
                setShowHelpDialog(false);
                window.open('https://console.firebase.google.com/', '_blank');
              }}>
                Open Firebase Console
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Modern Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
