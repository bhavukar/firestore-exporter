/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
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
  Info,
  Server,
  Play,
  Filter,
  Shield,
  Table,
  Cpu,
  Plus,
  Lock
} from 'lucide-react';

// --- MOCK DATABASE DATA FOR SIMULATION ---
interface MockDoc {
  id: string;
  data: Record<string, any>;
}

const mockCollections: Record<string, MockDoc[]> = {
  users: [
    {
      id: 'user_08f9a2',
      data: {
        displayName: 'Bhavuk Arora',
        email: 'bhavuk@example.com',
        isAdmin: true,
        createdAt: { _type: 'Timestamp', seconds: 1779278502, iso: '2026-05-20T17:42:00Z' },
        location: { _type: 'GeoPoint', latitude: 28.6139, longitude: 77.2090 },
        walletBalance: 450.75,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        lastLogin: { _type: 'Timestamp', seconds: 1779278850, iso: '2026-05-20T17:47:30Z' },
        preferences: {
          theme: 'dark',
          sceneType: 'ip',
          notificationsEnabled: true
        }
      }
    },
    {
      id: 'user_15b7c8',
      data: {
        displayName: 'Sarah Connor',
        email: 'sarah.c@sky.net',
        isAdmin: false,
        createdAt: { _type: 'Timestamp', seconds: 1779192100, iso: '2026-05-19T17:42:00Z' },
        location: { _type: 'GeoPoint', latitude: 34.0522, longitude: -118.2437 },
        walletBalance: 1250.00,
        profileImage: 'gs://firestore-exporter-backups/avatars/user_15b7c8.png',
        preferences: {
          theme: 'light',
          sceneType: 'venue'
        }
      }
    },
    {
      id: 'user_92e4d1',
      data: {
        displayName: 'John Doe',
        email: 'john.doe@gmail.com',
        isAdmin: false,
        createdAt: { _type: 'Timestamp', seconds: 1779010000, iso: '2026-05-17T15:30:00Z' },
        location: { _type: 'GeoPoint', latitude: 40.7128, longitude: -74.0060 },
        walletBalance: 85.20,
        lastLogin: null
      }
    }
  ],
  orders: [
    {
      id: 'ord_987452',
      data: {
        orderId: 'ord_987452',
        amount: 129.99,
        status: 'completed',
        itemsCount: 3,
        userIdRef: { _type: 'DocumentReference', path: 'users/user_08f9a2' },
        shippedAt: { _type: 'Timestamp', seconds: 1779192100, iso: '2026-05-19T17:42:00Z' },
        shippingAddress: {
          city: 'Delhi',
          country: 'India',
          zip: '110001'
        }
      }
    },
    {
      id: 'ord_234859',
      data: {
        orderId: 'ord_234859',
        amount: 45.50,
        status: 'pending',
        itemsCount: 1,
        userIdRef: { _type: 'DocumentReference', path: 'users/user_15b7c8' },
        shippingAddress: {
          city: 'Los Angeles',
          country: 'USA',
          zip: '90001'
        }
      }
    }
  ],
  products: [
    {
      id: 'prod_macbook',
      data: {
        title: 'MacBook Pro M3 Max',
        category: 'electronics',
        price: 3499.00,
        inStock: true,
        stockCount: 14,
        features: ['16-core CPU', '40-core GPU', '128GB Unified Memory'],
        dimensions: {
          width: 35.57,
          height: 24.81,
          depth: 1.68
        }
      }
    },
    {
      id: 'prod_keyboard',
      data: {
        title: 'NuPhy Air75 V2 Keyboard',
        category: 'electronics',
        price: 119.99,
        inStock: true,
        stockCount: 45,
        rating: 4.8
      }
    }
  ],
  venues: [
    {
      id: 'venue_msg_garden',
      data: {
        name: 'Madison Square Garden',
        city: 'New York',
        country: 'USA',
        capacity: 19500,
        active: true,
        sceneType: 'venue',
        coordinates: { _type: 'GeoPoint', latitude: 40.7505, longitude: -73.9934 },
        amenities: ['VIP Lounge', 'Parking Garage', 'Concessions']
      }
    },
    {
      id: 'venue_wembley',
      data: {
        name: 'Wembley Stadium',
        city: 'London',
        country: 'UK',
        capacity: 90000,
        active: true,
        sceneType: 'ip',
        coordinates: { _type: 'GeoPoint', latitude: 51.5560, longitude: -0.2796 },
        eventBranding: {
          bannerColor: '#fbbf24',
          logoUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=100',
          posterAsset: 'concert_wembley_poster.png'
        }
      }
    }
  ]
};

// --- SIMULATED COMPONENT FOR COLOR-CODED VALUES WITH RICH PREVIEWS ---
const RenderPrimitiveValue = ({ val }: { val: any }) => {
  const [showPopover, setShowPopover] = useState(false);

  if (val === null) return <span className="text-primitive-null font-mono">null</span>;
  if (val === undefined) return <span className="text-neutral-500 font-mono">undefined</span>;
  
  if (typeof val === 'boolean') {
    return <span className="text-primitive-bool font-mono">{val ? 'true' : 'false'}</span>;
  }
  if (typeof val === 'number') {
    return <span className="text-primitive-num font-mono">{val}</span>;
  }
  if (typeof val === 'string') {
    const isUrl = val.startsWith('http://') || val.startsWith('https://');
    const isGsPath = val.startsWith('gs://');

    if (isUrl || isGsPath) {
      const displayUrl = isGsPath ? val : val.substring(0, 30) + '...';
      return (
        <span 
          className="rich-preview-link font-mono"
          onMouseEnter={() => setShowPopover(true)}
          onMouseLeave={() => setShowPopover(false)}
          onClick={() => window.open(isGsPath ? 'https://console.firebase.google.com' : val, '_blank')}
          style={{ position: 'relative' }}
        >
          "{displayUrl}"
          {showPopover && (
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%) translateY(-10px)',
              background: '#0d0d12',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '8px',
              padding: '0.4rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.8)',
              zIndex: 100,
              width: '120px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none'
            }}>
              <img 
                src={isGsPath ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150' : val} 
                alt="Popover Thumbnail"
                className="sim-image-preview-box"
                style={{ marginTop: 0 }}
              />
              <div style={{ fontSize: '9px', color: '#ffb93f', marginTop: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                {isGsPath ? 'Storage Preview' : 'Image Preview'}
              </div>
            </div>
          )}
        </span>
      );
    }
    return <span className="text-primitive-str font-mono">"{val}"</span>;
  }

  // Handle serialized Firestore types
  if (val && typeof val === 'object' && val._type) {
    if (val._type === 'Timestamp') {
      return (
        <span className="custom-type-tag timestamp font-mono" title={`Seconds: ${val.seconds}`}>
          🕒 Timestamp({new Date(val.iso).toLocaleDateString()} {new Date(val.iso).toLocaleTimeString()})
        </span>
      );
    }
    if (val._type === 'GeoPoint') {
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${val.latitude},${val.longitude}`;
      return (
        <span className="custom-type-tag geopoint font-mono">
          📍 <a href={mapsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#c586c0', textDecoration: 'underline' }}>
            GeoPoint({val.latitude}°, {val.longitude}°)
          </a>
        </span>
      );
    }
    if (val._type === 'DocumentReference') {
      return (
        <span className="custom-type-tag reference font-mono">
          🔗 Ref({val.path})
        </span>
      );
    }
  }

  return <span className="text-neutral-300 font-mono">{JSON.stringify(val)}</span>;
};

// --- COLLAPSIBLE JSON TREE NODE ---
interface JSONNodeProps {
  name: string;
  value: any;
  isLast?: boolean;
}

const JSONNode: React.FC<JSONNodeProps> = ({ name, value, isLast = true }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !value._type;
  const isArray = Array.isArray(value);

  if (isObject || isArray) {
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;

    return (
      <div style={{ paddingLeft: '1.2rem', userSelect: 'text' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.1rem 0', userSelect: 'none' }}>
          {!isEmpty && (
            <button 
              onClick={() => setCollapsed(!collapsed)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#8b8595',
                cursor: 'pointer',
                marginRight: '0.2rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
          
          <span style={{ color: '#9cdcfe', marginRight: '0.3rem' }}>{name}:</span>
          <span style={{ color: '#6a9955', fontSize: '0.72rem' }}>
            {isArray ? `Array[${value.length}]` : `Object{${keys.length}}`}
          </span>

          {collapsed && <span style={{ color: '#888', marginLeft: '0.3rem' }}>...</span>}
        </div>

        {!collapsed && !isEmpty && (
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.08)', marginLeft: '0.4rem', paddingLeft: '0.6rem' }}>
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
    <div style={{ paddingLeft: '1.8rem', padding: '0.1rem 0', display: 'flex', alignItems: 'flex-start', userSelect: 'text' }}>
      <span style={{ color: '#9cdcfe', marginRight: '0.3rem' }}>{name}:</span>
      <RenderPrimitiveValue val={value} />
      {!isLast && <span style={{ color: '#888', marginLeft: '0.1rem' }}>,</span>}
    </div>
  );
};

// --- SIMULATED TOAST DATA ---
interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

// --- QUERY CONFIG STATE ---
interface QueryChainConfig {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export default function App() {
  // Global Antigravity branding toggle
  const [antigravityActive, setAntigravityActive] = useState(false);

  // App Simulator states
  const [simScreen, setSimScreen] = useState<'gateway' | 'explorer'>('explorer');
  const [gatewayMode, setGatewayMode] = useState<'local' | 'live'>('local');
  const [activeMobileTab, setActiveMobileTab] = useState<'collections' | 'documents' | 'fields'>('collections');
  const [simConnecting, setSimConnecting] = useState(false);
  
  // Connection states
  const [localHost, setLocalHost] = useState('127.0.0.1:8080');
  const [localProject, setLocalProject] = useState('demo-project');
  const [liveConfig, setLiveConfig] = useState('{\n  "type": "service_account",\n  "project_id": "firestore-live-prod",\n  "private_key_id": "8a9f2bc4e",\n  "client_email": "crawler-engine@live.iam.gserviceaccount.com"\n}');
  
  // Active session context
  const [activeSession, setActiveSession] = useState<{ mode: 'local'|'live', host: string, project: string }>({
    mode: 'local', host: '127.0.0.1:8080', project: 'demo-project'
  });
  
  // Explorer simulated states
  const [selectedCol, setSelectedCol] = useState<string>('users');
  const [selectedDocId, setSelectedDocId] = useState<string>('user_08f9a2');
  const [colSearchQuery, setColSearchQuery] = useState('');
  const [docSearchQuery, setDocSearchQuery] = useState('');
  const [simToasts, setSimToasts] = useState<Toast[]>([]);
  const [copySuccess, setCopySuccess] = useState(false);
  const [simRefreshing, setSimRefreshing] = useState(false);
  
  // Workspace tabs
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<'tree' | 'table' | 'json' | 'script'>('tree');
  
  // Custom query chain GUI state
  const [queryChains, setQueryChains] = useState<QueryChainConfig[]>([]);
  const [selectedField, setSelectedField] = useState('walletBalance');
  const [selectedOperator, setSelectedOperator] = useState('>');
  const [queryValue, setQueryValue] = useState('100');
  
  // Custom Monaco Scripting Shell state
  const [scriptEnabled, setScriptEnabled] = useState(false);
  const [scriptText, setScriptText] = useState(`// Write inline JS to map, filter or clean the fetched array\nfunction transform(docs) {\n  return docs.filter(d => d.data.walletBalance > 100);\n}`);
  const [scriptStatus, setScriptStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');

  // SQL Schema blueprint modal state
  const [showSqlModal, setShowSqlModal] = useState(false);
  
  // Master Read-Only protection state
  const [readOnlyMode, setReadOnlyMode] = useState(false);
  
  // Collapsible FAQs state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Sync safety read-only toggles with connection types
  useEffect(() => {
    if (activeSession.mode === 'live') {
      setReadOnlyMode(true);
    } else {
      setReadOnlyMode(false);
    }
  }, [activeSession.mode]);

  // Adjust prefilled scripting text based on active collection
  useEffect(() => {
    if (selectedCol === 'users') {
      setScriptText(`// Monaco Scripting Shell\n// Filter users with wallet balance greater than 100\nfunction transform(docs) {\n  return docs.filter(d => d.data.walletBalance > 100);\n}`);
      setSelectedField('walletBalance');
    } else if (selectedCol === 'orders') {
      setScriptText(`// Monaco Scripting Shell\n// Map orders to clean nested shipping addresses\nfunction transform(docs) {\n  return docs.filter(d => d.data.status === "completed");\n}`);
      setSelectedField('amount');
    } else if (selectedCol === 'products') {
      setScriptText(`// Monaco Scripting Shell\n// Keep only products in stock\nfunction transform(docs) {\n  return docs.filter(d => d.data.inStock === true);\n}`);
      setSelectedField('price');
    } else {
      setScriptText(`// Monaco Scripting Shell\n// Filter active venues\nfunction transform(docs) {\n  return docs.filter(d => d.data.active === true);\n}`);
      setSelectedField('capacity');
    }
    setQueryChains([]);
  }, [selectedCol]);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Math.random().toString(),
      type,
      title,
      message
    };
    setSimToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setSimToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setSimToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSimRefresh = () => {
    setSimRefreshing(true);
    addToast('Sync Indexing', 'Synchronizing indexes from Firestore database...', 'info');
    setTimeout(() => {
      setSimRefreshing(false);
      addToast('Synchronization Completed', 'Database keys and collections matches.', 'success');
    }, 600);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimConnecting(true);

    if (gatewayMode === 'local') {
      addToast('TCP Connection Request', `Pinging local emulator on host ${localHost}...`, 'info');
      setTimeout(() => {
        setActiveSession({ mode: 'local', host: localHost, project: localProject });
        addToast('Emulator Connected', `Connected to local sandbox '${localProject}' successfully.`, 'success');
        setSimScreen('explorer');
        setSimConnecting(false);
      }, 700);
    } else {
      addToast('IAM Authentication', 'Validating Google Service Account certificates...', 'info');
      setTimeout(() => {
        try {
          const keyObj = JSON.parse(liveConfig);
          const pId = keyObj.project_id || 'firestore-live-prod';
          setActiveSession({ mode: 'live', host: 'firestore.googleapis.com', project: pId });
          addToast('Live Prod Verified', `Production security access granted to '${pId}'.`, 'success');
          setSimScreen('explorer');
        } catch {
          addToast('Parsing Refused', 'Invalid Service Account JSON credentials format.', 'error');
        } finally {
          setSimConnecting(false);
        }
      }, 900);
    }
  };

  const triggerCopyDocId = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopySuccess(true);
    addToast('Path Copied', `Document path '${path}' copied to clipboard.`, 'success');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Perform simulated file backup export
  const handleSimExport = () => {
    if (readOnlyMode && activeSession.mode === 'live') {
      addToast('Protected State', 'Compiling production JSON backup bundle (Read-Only Mode)...', 'info');
    } else {
      addToast('Compiling Export', 'Traversing collection nodes and mapping nested references...', 'info');
    }
    
    setTimeout(() => {
      const dataToExport = getProcessedDocs();
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dataToExport, null, 2)
      )}`;
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute('download', `firestore_backup_${selectedCol}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast('Backup Downloaded', `Successfully exported ${dataToExport.length} documents.`, 'success');
    }, 500);
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // --- QUERY GUI CLAUSE OPERATIONS ---
  const handleAddQueryChain = () => {
    const newChain: QueryChainConfig = {
      id: Math.random().toString(),
      field: selectedField,
      operator: selectedOperator,
      value: queryValue
    };
    setQueryChains([...queryChains, newChain]);
    addToast('Clause Added', `Visual where(${selectedField}, "${selectedOperator}", ${queryValue}) chained.`, 'info');
  };

  const handleRemoveQueryChain = (id: string) => {
    setQueryChains(queryChains.filter(q => q.id !== id));
  };

  // --- DYNAMIC PROCESSOR: COMBINES CLAUSES + SCRIPTING SHELL FOR REAL EXPLORATION ---
  const getProcessedDocs = (): MockDoc[] => {
    let docs = mockCollections[selectedCol] || [];

    // 1. Process standard search query
    if (docSearchQuery.trim().length > 0) {
      docs = docs.filter(d => d.id.toLowerCase().includes(docSearchQuery.toLowerCase()));
    }

    // 2. Process chained Query chains
    for (const q of queryChains) {
      docs = docs.filter(d => {
        const val = d.data[q.field];
        if (val === undefined || val === null) return false;

        const compareVal = isNaN(Number(q.value)) ? q.value : Number(q.value);
        const actualVal = typeof val === 'object' && val._type === 'Timestamp' ? new Date(val.iso).getTime() : val;
        
        switch (q.operator) {
          case '==':
            return actualVal === compareVal;
          case '>':
            return Number(actualVal) > Number(compareVal);
          case '<':
            return Number(actualVal) < Number(compareVal);
          case '>=':
            return Number(actualVal) >= Number(compareVal);
          case '<=':
            return Number(actualVal) <= Number(compareVal);
          case 'starts-with':
            // Native ranges starts-with emulation
            return actualVal.toString().toLowerCase().startsWith(q.value.toString().toLowerCase());
          default:
            return true;
        }
      });
    }

    // 3. Process Monaco Scripting Shell transformation
    if (scriptEnabled) {
      try {
        // Simple client-side JS parser/eval emulator
        const cleanCode = scriptText.substring(scriptText.indexOf('{') + 1, scriptText.lastIndexOf('}'));
        const fn = new Function('docs', cleanCode);
        const result = fn(docs);
        if (Array.isArray(result)) {
          return result;
        }
      } catch (e) {
        // Fail silently or fallback
      }
    }

    return docs;
  };

  const handleExecuteScript = () => {
    setScriptStatus('running');
    addToast('Executing Script', 'Compiling inline JavaScript transformation shell...', 'info');
    setTimeout(() => {
      try {
        const cleanCode = scriptText.substring(scriptText.indexOf('{') + 1, scriptText.lastIndexOf('}'));
        const fn = new Function('docs', cleanCode);
        const result = fn(mockCollections[selectedCol] || []);
        if (Array.isArray(result)) {
          setScriptStatus('success');
          addToast('Shell Map Complete', `Successfully transformed dataset locally.`, 'success');
        } else {
          throw new Error('Script must return an array of document nodes.');
        }
      } catch (err: any) {
        setScriptStatus('error');
        addToast('Compilation Refused', err.message, 'error');
      }
    }, 550);
  };

  // --- SQL DDL SCHEMA INFERENCE GENERATION ---
  const generateInferredSql = () => {
    const columns: Record<string, string> = { id: 'VARCHAR(255) PRIMARY KEY' };
    const docs = mockCollections[selectedCol] || [];
    
    docs.forEach(doc => {
      Object.keys(doc.data).forEach(key => {
        const val = doc.data[key];
        if (val === null || val === undefined) return;
        
        if (typeof val === 'boolean') {
          columns[key] = 'BOOLEAN';
        } else if (typeof val === 'number') {
          columns[key] = Number.isInteger(val) ? 'INTEGER' : 'REAL';
        } else if (typeof val === 'string') {
          columns[key] = 'VARCHAR(255)';
        } else if (typeof val === 'object') {
          if (val._type === 'Timestamp') {
            columns[key] = 'TIMESTAMP';
          } else if (val._type === 'GeoPoint') {
            columns['latitude'] = 'REAL';
            columns['longitude'] = 'REAL';
          } else if (val._type === 'DocumentReference') {
            columns[key] = 'VARCHAR(512)';
          } else {
            columns[key] = 'JSON';
          }
        }
      });
    });

    const ddlLines = Object.keys(columns).map(col => `  ${col.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)} ${columns[col]}`);
    return `CREATE TABLE ${selectedCol} (\n${ddlLines.join(',\n')}\n);`;
  };

  const getInferredSchemaList = () => {
    const list: { key: string; valType: string; sqlType: string }[] = [{ key: 'id', valType: 'string', sqlType: 'VARCHAR(255) PK' }];
    const docs = mockCollections[selectedCol] || [];
    const keysHandled = new Set(['id']);

    docs.forEach(doc => {
      Object.keys(doc.data).forEach(key => {
        if (keysHandled.has(key)) return;
        const val = doc.data[key];
        if (val === null || val === undefined) return;
        keysHandled.add(key);

        let valType: string = typeof val;
        let sqlType = 'VARCHAR(255)';
        
        if (valType === 'object' && val._type) {
          valType = val._type;
          if (val._type === 'Timestamp') sqlType = 'TIMESTAMP';
          else if (val._type === 'GeoPoint') { sqlType = 'REAL (lat, lng)'; valType = 'GeoPoint'; }
          else if (val._type === 'DocumentReference') sqlType = 'VARCHAR(512)';
        } else {
          if (valType === 'boolean') sqlType = 'BOOLEAN';
          else if (valType === 'number') sqlType = Number.isInteger(val) ? 'INTEGER' : 'REAL';
          else if (valType === 'object') sqlType = 'JSON';
        }

        list.push({ key, valType, sqlType });
      });
    });

    return list;
  };

  const processedDocsList = getProcessedDocs();
  const activeDoc = processedDocsList.find((d) => d.id === selectedDocId) || processedDocsList[0] || null;

  // Render Table Spreadsheet columns
  const getTableColumns = () => {
    const columns = new Set<string>();
    const docs = mockCollections[selectedCol] || [];
    docs.forEach(d => {
      Object.keys(d.data).forEach(k => columns.add(k));
    });
    return Array.from(columns);
  };

  const tableColumns = getTableColumns();

  return (
    <div className={antigravityActive ? 'antigravity-active' : ''}>
      <div className="container">
        {/* Modern Header */}
        <header>
          <div className="logo-container" onClick={() => setSimScreen('gateway')}>
            <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFCA28" d="M3.89 15.672 6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771z"/>
              <path fill="#FF9100" d="m20.684 19.364-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0z"/>
              <path fill="#DD2C00" d="M14.67 24l-3.32-1.875 3.32-6.236z"/>
            </svg>
            <span className="logo-text">
              Firestore Exporter
              <span className="engine-badge">AG-Engine</span>
            </span>
          </div>
          <div className="nav-actions">
            <button 
              className={`antigravity-toggle ${antigravityActive ? 'active' : ''}`}
              onClick={() => {
                setAntigravityActive(!antigravityActive);
                addToast(
                  antigravityActive ? 'Standard Grid Activated' : 'Antigravity Grid Active', 
                  antigravityActive ? 'Accents stabilized to standard desktop grid.' : 'Enabling floating micro-gravity mesh gradients.', 
                  'info'
                );
              }}
            >
              <Cpu size={14} className={antigravityActive ? 'animate-spin' : ''} />
              Antigravity Mode
            </button>
            <a href="https://github.com/bhavukar/firestore-exporter" target="_blank" rel="noopener noreferrer" className="btn-github-nav">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              GitHub Project
            </a>
          </div>
        </header>

        {/* Hero Area */}
        <section className="hero-section">
          <h1>Universal Firestore Visualizer</h1>
          <p className="description">
            A developer-focused desktop companion for local Firebase emulators and live cloud production databases. Chained visual queries, Monaco Map/Reduce scripting, schema blueprints, and virtualized spreadsheet layouts—all entirely offline and secure.
          </p>

          {/* Installer Downloads */}
          <div className="download-grid">
            <div className="download-card">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.2.12.3.12.86 0 1.97-.55 2.52-1.45z"/>
                </svg>
              </div>
              <div className="platform-name">macOS Client</div>
              <div className="file-extension">Apple Silicon / Intel .dmg</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/v1.0.1/Firestore-Exporter-1.0.1-arm64.dmg" className="btn-action-download">
                Download installer DMG
              </a>
            </div>

            <div className="download-card">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.101zM11.25 1.899L24 0v11.55H11.25V1.899zM11.25 12.45H24v11.55l-12.75-1.9v-9.65z"/>
                </svg>
              </div>
              <div className="platform-name">Windows Client</div>
              <div className="file-extension">Windows x64 / ARM64 .exe</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/v1.0.1/Firestore-Exporter-Setup-1.0.1.exe" className="btn-action-download">
                Download Setup EXE
              </a>
            </div>

            <div className="download-card">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2a10 10 0 0 0-10 10c0 5.52 4.48 10 10 10s10-4.48 10-10A10 10 0 0 0 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <div className="platform-name">Linux Client</div>
              <div className="file-extension">Linux x64 .AppImage</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/v1.0.1/Firestore-Exporter-1.0.1.AppImage" className="btn-action-download">
                Download AppImage
              </a>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
           HIGH FIDELITY INTERACTIVE DESKTOP SIMULATOR
        ---------------------------------------------------- */}
        <section className={`screenshot-showcase ${antigravityActive ? 'float-effect' : ''}`}>
          <div className={`simulator-window ${activeSession.mode === 'live' ? 'live-mode' : ''}`}>
            
            {/* SQL Blueprint Schema Migration Modal */}
            {showSqlModal && (
              <div className="sim-modal-overlay">
                <div className="sim-modal-card">
                  <div className="sim-modal-header">
                    <span className="sim-modal-title">
                      <Cpu size={16} color="var(--color-orange)" />
                      SQL Blueprint: `{selectedCol}`
                    </span>
                    <button className="sim-toast-close" onClick={() => setShowSqlModal(false)}>×</button>
                  </div>
                  <div className="sim-modal-content">
                    <p className="sim-modal-body-p">
                      Firestore Exporter scanned the first 100 documents of collection <strong>`{selectedCol}`</strong>, inferred all data types, and generated a corresponding relational SQL table structure.
                    </p>
                    <div className="sim-sql-grid">
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Type Inference Mapping</div>
                        <div className="sim-sql-table-box">
                          <table className="sim-sql-table">
                            <thead>
                              <tr>
                                <th>Field Key</th>
                                <th>Firestore Type</th>
                                <th>SQL Data Type</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getInferredSchemaList().map(item => (
                                <tr key={item.key}>
                                  <td><code>{item.key}</code></td>
                                  <td><span style={{ color: '#4ec9b0' }}>{item.valType}</span></td>
                                  <td><span style={{ color: '#ffb93f' }}>{item.sqlType}</span></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>CREATE TABLE DDL Script</div>
                        <div className="sim-sql-code-box">
                          {generateInferredSql()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="sim-modal-footer">
                    <button className="sim-btn sim-btn-secondary" onClick={() => setShowSqlModal(false)}>Close</button>
                    <button 
                      className="sim-btn sim-btn-primary" 
                      onClick={() => {
                        navigator.clipboard.writeText(generateInferredSql());
                        addToast('SQL Blueprint Copied', 'SQL CREATE TABLE script copied to clipboard.', 'success');
                      }}
                    >
                      <Copy size={13} />
                      Copy DDL Script
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Window Chrome / Title Bar */}
            <div className="sim-titlebar">
              <div className="sim-traffic-lights">
                <div className="sim-dot red" />
                <div className="sim-dot yellow" />
                <div className="sim-dot green" />
              </div>
              
              <div className="sim-title">
                {simScreen === 'gateway' 
                  ? 'Firestore Exporter — Gateway Connection Portal' 
                  : `Firestore Exporter — ${activeSession.mode.toUpperCase()} MODE [${activeSession.project}]`}
              </div>

              <div>
                {simScreen === 'explorer' ? (
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {activeSession.mode === 'live' && (
                      <span className="sim-badge production">
                        <Lock size={10} /> PRODUCTION ACCENT ACTIVE
                      </span>
                    )}
                    <span className="sim-badge connected" style={{ cursor: 'pointer' }} onClick={() => setSimScreen('gateway')}>
                      <Server size={11} style={{ marginRight: '2px' }} /> Change Gateway
                    </span>
                  </div>
                ) : (
                  <span className="sim-badge">Disconnected</span>
                )}
              </div>
            </div>

            {/* GATEWAY GATE SECTION (SCREEN A) */}
            {simScreen === 'gateway' && (
              <div className="sim-gateway-screen">
                <div className="sim-gateway-card">
                  <div className="sim-gateway-logo">
                    <Database size={20} color="var(--color-orange)" />
                    <span>Establish Target Connection</span>
                  </div>

                  <div className="sim-gateway-tabs">
                    <button 
                      type="button"
                      onClick={() => setGatewayMode('local')}
                      className={`sim-gateway-tab-btn ${gatewayMode === 'local' ? 'active' : ''}`}
                    >
                      Local Emulator
                    </button>
                    <button 
                      type="button"
                      onClick={() => setGatewayMode('live')}
                      className={`sim-gateway-tab-btn ${gatewayMode === 'live' ? 'active' : ''}`}
                    >
                      Live Production
                    </button>
                  </div>

                  <form onSubmit={handleConnect}>
                    {gatewayMode === 'local' ? (
                      <>
                        <div className="form-group">
                          <label>Emulator Host Port</label>
                          <input 
                            type="text" 
                            className="sim-input" 
                            value={localHost} 
                            onChange={(e) => setLocalHost(e.target.value)} 
                            placeholder="127.0.0.1:8080" 
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                          <label>Emulator Sandbox Project ID</label>
                          <input 
                            type="text" 
                            className="sim-input" 
                            value={localProject} 
                            onChange={(e) => setLocalProject(e.target.value)} 
                            placeholder="demo-project" 
                            required
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="form-group">
                          <label>Google Cloud Service Account JSON Key</label>
                          <textarea 
                            className="sim-input" 
                            value={liveConfig} 
                            onChange={(e) => setLiveConfig(e.target.value)} 
                            placeholder='{"type": "service_account", "project_id": "...", ...}' 
                            style={{ minHeight: '85px', fontFamily: 'monospace', fontSize: '0.75rem', resize: 'none' }}
                            required
                          />
                        </div>
                        <div style={{
                          background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          padding: '0.7rem 0.9rem',
                          borderRadius: '8px',
                          marginBottom: '1.5rem',
                          fontSize: '0.74rem',
                          color: '#fca3a3',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                          lineHeight: 1.4
                        }}>
                          <Shield size={14} className="text-red-400" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ color: '#fff' }}>Production Safety Protocol:</strong> Connecting to live servers sets accents to crimson warning color and enables strict **Read-Only Mode**.
                          </div>
                        </div>
                      </>
                    )}

                    <div className="sim-gateway-actions">
                      <button 
                        type="button" 
                        className="sim-btn sim-btn-secondary" 
                        onClick={() => setSimScreen('explorer')}
                        style={{ flex: 1 }}
                      >
                        Back
                      </button>
                      <button 
                        type="submit" 
                        className="sim-btn sim-btn-primary"
                        disabled={simConnecting}
                        style={{ flex: 2 }}
                      >
                        {simConnecting ? (
                          <><RefreshCw size={14} className="animate-spin" /> Pinging host...</>
                        ) : 'Verify & Connect'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MOBILE SCREEN PANE SELECTORS */}
            {simScreen === 'explorer' && (
              <div className="sim-mobile-tabs">
                <button 
                  onClick={() => setActiveMobileTab('collections')}
                  className={`sim-mobile-tab-btn ${activeMobileTab === 'collections' ? 'active' : ''}`}
                >
                  Collections
                </button>
                <button 
                  onClick={() => setActiveMobileTab('documents')}
                  className={`sim-mobile-tab-btn ${activeMobileTab === 'documents' ? 'active' : ''}`}
                >
                  Documents
                </button>
                <button 
                  onClick={() => setActiveMobileTab('fields')}
                  className={`sim-mobile-tab-btn ${activeMobileTab === 'fields' ? 'active' : ''}`}
                >
                  Document Workspace
                </button>
              </div>
            )}

            {/* MAIN DATABASE EXPLORER WORKSPACE (SCREEN B) */}
            {simScreen === 'explorer' && (
              <div className="sim-explorer-screen">
                
                {/* 1. ADVANCED ROW PANEL: VISUAL QUERY GUI CHAIN BUILDER */}
                <div className="sim-query-builder">
                  <div className="sim-query-builder-title">
                    <Filter size={12} color="var(--color-orange)" />
                    Visual Query GUI Chain Builder
                  </div>
                  <div className="sim-query-row">
                    <span style={{ color: 'var(--text-muted)' }}>where(</span>
                    <select 
                      className="sim-select" 
                      value={selectedField}
                      onChange={(e) => setSelectedField(e.target.value)}
                    >
                      {selectedCol === 'users' && (
                        <>
                          <option value="walletBalance">walletBalance</option>
                          <option value="displayName">displayName</option>
                          <option value="isAdmin">isAdmin</option>
                        </>
                      )}
                      {selectedCol === 'orders' && (
                        <>
                          <option value="amount">amount</option>
                          <option value="status">status</option>
                          <option value="itemsCount">itemsCount</option>
                        </>
                      )}
                      {selectedCol === 'products' && (
                        <>
                          <option value="price">price</option>
                          <option value="title">title</option>
                          <option value="stockCount">stockCount</option>
                        </>
                      )}
                      {selectedCol === 'venues' && (
                        <>
                          <option value="capacity">capacity</option>
                          <option value="name">name</option>
                          <option value="active">active</option>
                        </>
                      )}
                    </select>

                    <select 
                      className="sim-select"
                      value={selectedOperator}
                      onChange={(e) => setSelectedOperator(e.target.value)}
                    >
                      <option value="==">==</option>
                      <option value=">">&gt;</option>
                      <option value="<">&lt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="<=">&lt;=</option>
                      <option value="starts-with">starts-with</option>
                    </select>

                    <input 
                      type="text" 
                      className="sim-query-input"
                      value={queryValue}
                      onChange={(e) => setQueryValue(e.target.value)}
                      placeholder="value"
                    />
                    <span style={{ color: 'var(--text-muted)', marginRight: '0.4rem' }}>)</span>

                    <button className="sim-btn-query-action" onClick={handleAddQueryChain}>
                      <Plus size={11} style={{ marginRight: '2px' }} /> Chain Clause
                    </button>
                    
                    {/* Display query pills */}
                    {queryChains.map((q) => (
                      <span key={q.id} className="sim-query-pill">
                        <code>{q.field} {q.operator} {q.value}</code>
                        <span className="sim-query-pill-close" onClick={() => handleRemoveQueryChain(q.id)}>×</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 2. MASTER PRODUCTION SAFETY SHEETS ACCENTS WARNING BANNER */}
                {activeSession.mode === 'live' && (
                  <div className="sim-safety-banner">
                    <Shield size={13} style={{ color: '#ef4444' }} />
                    <span>WARNING: Live Cloud Database Connected. Master Read-Only Safe Shield Toggle is LOCKED [ON] to prevent accidental writes.</span>
                  </div>
                )}

                {/* 3. EXPLORER TRIPLE PANES SECTIONS */}
                <div className="sim-explorer-workspace">
                  
                  {/* Pane 1: Collections list */}
                  <div className={`sim-pane sim-col-collections ${activeMobileTab === 'collections' ? 'mobile-visible' : 'mobile-hidden'}`}>
                    <div className="sim-pane-header">
                      <span className="sim-pane-title">
                        <Layers size={12} style={{ color: 'var(--color-orange)' }} /> Collections
                      </span>
                      <button className="sim-icon-btn" onClick={handleSimRefresh} title="Sync indices">
                        <RefreshCw size={12} className={simRefreshing ? 'animate-spin' : ''} />
                      </button>
                    </div>
                    
                    <div className="search-box">
                      <div className="search-wrapper">
                        <Search size={12} className="search-icon-inside" />
                        <input 
                          type="text" 
                          className="sim-search-input" 
                          placeholder="Filter collections..." 
                          value={colSearchQuery}
                          onChange={(e) => setColSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="sim-pane-content">
                      {Object.keys(mockCollections)
                        .filter((colName) => colName.toLowerCase().includes(colSearchQuery.toLowerCase()))
                        .map((colName) => (
                          <div 
                            key={colName} 
                            className={`sim-list-item ${selectedCol === colName ? 'active' : ''}`}
                            onClick={() => {
                              setSelectedCol(colName);
                              const firstDoc = mockCollections[colName]?.[0]?.id || '';
                              setSelectedDocId(firstDoc);
                            }}
                          >
                            <Database size={12} style={{ color: 'var(--color-orange)', opacity: 0.8 }} />
                            {colName}
                          </div>
                        ))}
                    </div>

                    {/* SQL Blueprint trigger inside pane footer */}
                    <div style={{ padding: '0.6rem 0.8rem', borderTop: '1px solid rgba(255,255,255,0.04)', background: '#0b0b10' }}>
                      <button 
                        className="sim-btn sim-btn-secondary" 
                        style={{ width: '100%', fontSize: '11px', padding: '0.45rem', gap: '3px', background: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.15)', color: 'var(--color-amber)' }}
                        onClick={() => setShowSqlModal(true)}
                      >
                        <Cpu size={12} />
                        SQL Blueprint Modal
                      </button>
                    </div>
                  </div>

                  {/* Pane 2: Document references */}
                  <div className={`sim-pane sim-col-documents ${activeMobileTab === 'documents' ? 'mobile-visible' : 'mobile-hidden'}`}>
                    <div className="sim-pane-header">
                      <span className="sim-pane-title">
                        <FileCode size={12} style={{ color: 'var(--color-amber)' }} /> Documents
                      </span>
                      <span style={{ fontSize: '10px', color: '#555', fontWeight: 600 }}>
                        {processedDocsList.length} items
                      </span>
                    </div>

                    <div className="search-box">
                      <div className="search-wrapper">
                        <Search size={12} className="search-icon-inside" />
                        <input 
                          type="text" 
                          className="sim-search-input" 
                          placeholder="Search doc ID..." 
                          value={docSearchQuery}
                          onChange={(e) => setDocSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="sim-pane-content">
                      {processedDocsList.length === 0 ? (
                        <div className="sim-empty-state">
                          <Info size={18} />
                          <p>No documents found matching search</p>
                        </div>
                      ) : (
                        processedDocsList.map((doc) => (
                          <div 
                            key={doc.id}
                            className={`sim-list-item ${selectedDocId === doc.id ? 'active' : ''}`}
                            onClick={() => setSelectedDocId(doc.id)}
                          >
                            <span style={{ fontSize: '10px', color: 'var(--color-orange)' }}>📄</span>
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {doc.id}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Pane 3: Simulated Tabbed Output Workspace */}
                  <div className={`sim-pane sim-col-fields ${activeMobileTab === 'fields' ? 'mobile-visible' : 'mobile-hidden'}`}>
                    <div className="sim-pane-header" style={{ padding: '0 0.5rem' }}>
                      
                      {/* Workspace tabs: Tree, Table Spreadsheet, Scripting Shell */}
                      <div className="sim-tab-header-row">
                        <button 
                          className={`sim-workspace-tab-btn ${activeWorkspaceTab === 'tree' ? 'active' : ''}`}
                          onClick={() => setActiveWorkspaceTab('tree')}
                        >
                          <ChevronRight size={12} /> Collapsible Tree
                        </button>
                        <button 
                          className={`sim-workspace-tab-btn ${activeWorkspaceTab === 'table' ? 'active' : ''}`}
                          onClick={() => setActiveWorkspaceTab('table')}
                        >
                          <Table size={12} /> Spreadsheet Layout
                        </button>
                        <button 
                          className={`sim-workspace-tab-btn ${activeWorkspaceTab === 'script' ? 'active' : ''}`}
                          onClick={() => setActiveWorkspaceTab('script')}
                        >
                          <Cpu size={12} /> Monaco Scripting
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '0.4rem', position: 'relative' }}>
                        {activeDoc && (
                          <button 
                            className="sim-btn sim-btn-secondary" 
                            style={{ padding: '0.2rem 0.5rem', fontSize: '10px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}
                            onClick={() => triggerCopyDocId(`${selectedCol}/${selectedDocId}`)}
                          >
                            <Copy size={10} /> Copy Path
                          </button>
                        )}
                        <button 
                          className="sim-btn sim-btn-primary" 
                          style={{ padding: '0.2rem 0.5rem', fontSize: '10px', boxShadow: 'none', background: 'var(--gradient-brand)' }}
                          onClick={handleSimExport}
                        >
                          <Download size={10} /> Backup JSON
                        </button>
                        {copySuccess && <div className="copy-tooltip">✓ Path Copied!</div>}
                      </div>
                    </div>

                    {/* PANE TAB CONTENT A: JSON COLLAPSIBLE TREE VIEW */}
                    {activeWorkspaceTab === 'tree' && (
                      <div className="sim-pane-content sim-fields-workspace">
                        {activeDoc ? (
                          <div>
                            <div style={{ color: '#5c5464', marginBottom: '0.6rem', fontSize: '11px', userSelect: 'none' }}>
                              // Inferred document schema path: {selectedCol}/{selectedDocId}
                            </div>
                            
                            <div style={{ color: '#d4d4d4', fontFamily: 'monospace' }}>
                              <span>{'{'}</span>
                              <div style={{ marginTop: '0.1rem' }}>
                                {Object.keys(activeDoc.data).map((fieldName, idx, arr) => (
                                  <JSONNode 
                                    key={fieldName}
                                    name={fieldName}
                                    value={activeDoc.data[fieldName]}
                                    isLast={idx === arr.length - 1}
                                  />
                                ))}
                              </div>
                              <span>{'}'}</span>
                            </div>

                            {/* Event IP layout display branding validation */}
                            {activeDoc.data && activeDoc.data.sceneType === 'ip' && (
                              <div className="event-ip-layout" style={{ marginTop: '1.2rem' }}>
                                <div className="event-ip-header" style={{ color: activeDoc.data.eventBranding?.bannerColor || '#fbbf24' }}>
                                  ★ Event IP Premium Active
                                </div>
                                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                                  {activeDoc.data.eventBranding?.logoUrl && (
                                    <img 
                                      src={activeDoc.data.eventBranding.logoUrl} 
                                      alt="Event IP Logo" 
                                      style={{ width: '28px', height: '28px', borderRadius: '4px', objectFit: 'cover' }} 
                                    />
                                  )}
                                  <div>
                                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '11px' }}>{activeDoc.data.name || 'Wembley Event'}</div>
                                    <div style={{ fontSize: '9px', color: '#fbbf24' }}>Event IP layout correctly resolved</div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {activeDoc.data && activeDoc.data.sceneType === 'venue' && (
                              <div className="event-venue-layout" style={{ marginTop: '1.2rem' }}>
                                <div style={{ fontWeight: 700, color: 'var(--color-orange)', fontSize: '10px', textTransform: 'uppercase', marginBottom: '0.3rem', fontFamily: 'sans-serif' }}>
                                  🏢 Standard Venue Layout
                                </div>
                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '11px' }}>{activeDoc.data.name}</div>
                                <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                                  Capacity: {activeDoc.data.capacity?.toLocaleString()} specs
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="sim-empty-state">
                            <Database size={20} />
                            <p>Select a document to inspect fields</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* PANE TAB CONTENT B: INTERACTIVE SPREADSHEET TABLE GRID VIEW */}
                    {activeWorkspaceTab === 'table' && (
                      <div className="sim-pane-content sim-table-workspace">
                        <table className="sim-spreadsheet">
                          <thead>
                            <tr>
                              <th>Document ID</th>
                              {tableColumns.map(col => (
                                <th key={col}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {processedDocsList.map(doc => (
                              <tr key={doc.id} style={{ background: doc.id === selectedDocId ? 'rgba(251, 191, 36, 0.05)' : '' }}>
                                <td style={{ fontWeight: 'bold', color: 'var(--color-amber)' }}>{doc.id}</td>
                                {tableColumns.map(col => {
                                  const cellVal = doc.data[col];
                                  return (
                                    <td key={col}>
                                      {cellVal === undefined ? (
                                        <span className="text-neutral-600">-</span>
                                      ) : typeof cellVal === 'object' && cellVal._type === 'Timestamp' ? (
                                        <span style={{ color: '#4ec9b0' }}>Timestamp</span>
                                      ) : typeof cellVal === 'object' && cellVal._type === 'GeoPoint' ? (
                                        <span style={{ color: '#c586c0' }}>GeoPoint</span>
                                      ) : cellVal === null ? (
                                        <span className="text-primitive-null">null</span>
                                      ) : (
                                        cellVal.toString()
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* PANE TAB CONTENT C: MONACO JS SCRIPTING SHELL PANEL */}
                    {activeWorkspaceTab === 'script' && (
                      <div className="sim-pane-content sim-script-shell-workspace">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--color-amber)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Cpu size={13} />
                            Monaco Scripting Shell (Client-Side)
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Enable map/filter:</span>
                            <input 
                              type="checkbox" 
                              checked={scriptEnabled} 
                              onChange={(e) => {
                                setScriptEnabled(e.target.checked);
                                addToast(
                                  e.target.checked ? 'Scripting Enabled' : 'Scripting Bypassed', 
                                  e.target.checked ? 'Inline JS transformation hooked to fetching engine.' : 'JSON payload rendering original dataset.', 
                                  'info'
                                );
                              }}
                              style={{ accentColor: 'var(--color-orange)', cursor: 'pointer' }}
                            />
                          </div>
                        </div>
                        <p style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                          Write a custom JavaScript transformation function to filter, clean, or map the raw collection JSON array locally in your client before it renders in the table grid.
                        </p>
                        <textarea 
                          className="sim-code-editor-mock"
                          value={scriptText}
                          onChange={(e) => setScriptText(e.target.value)}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '10px', color: '#777' }}>
                            Status: <strong style={{ 
                              color: scriptStatus === 'success' ? '#10b981' : scriptStatus === 'error' ? '#ef4444' : scriptStatus === 'running' ? '#ff9100' : '#555' 
                            }}>
                              {scriptStatus.toUpperCase()}
                            </strong>
                          </span>
                          <button 
                            className="sim-btn sim-btn-primary" 
                            style={{ padding: '0.4rem 0.9rem', fontSize: '11px' }}
                            onClick={handleExecuteScript}
                          >
                            <Play size={10} style={{ marginRight: '2px' }} />
                            Run map-reduce script
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Bottom Status bar */}
                    <div className="sim-footer">
                      <span className="sim-footer-mode-pill">
                        <span style={{ color: activeSession.mode === 'live' ? '#ef4444' : '#fbbf24', fontSize: '10px' }}>●</span> 
                        {activeSession.mode === 'local' ? `Emulator connected (${activeSession.host})` : `Live production (${activeSession.project})`}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }} onClick={() => setSimScreen('gateway')}>
                        <Server size={10} /> Switch connection
                      </span>
                    </div>

                  </div>

                </div>

              </div>
            )}

            {/* Mock Toast Container */}
            <div className="sim-toast-container">
              {simToasts.map((toast) => (
                <div key={toast.id} className={`sim-toast ${toast.type}`}>
                  <div className="sim-toast-content">
                    <div className="sim-toast-title">{toast.title}</div>
                    <div className="sim-toast-desc">{toast.message}</div>
                  </div>
                  <button className="sim-toast-close" onClick={() => removeToast(toast.id)}>×</button>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ----------------------------------------------------
           PREMIUM DETAILED FEATURES
        ---------------------------------------------------- */}
        <section className="features-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Engineered for Advanced Database Workflows</h2>
            <p className="section-subtitle">
              A robust desktop crawler and type-safe transformer built directly for Cloud Firestore emulators and live clusters.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <Database size={18} />
              </div>
              <div>
                <h3 className="feature-title">Dual Connection Portals</h3>
                <p className="feature-desc">
                  Seamlessly toggle between a local sandbox emulator (auto-pinging 8080/TCP) and secure live cloud instances using sandboxed Google IAM key processing.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Filter size={18} />
              </div>
              <div>
                <h3 className="feature-title">Query Builder GUI Chain</h3>
                <p className="feature-desc">
                  Construct complex layered `where` and `orderBy` clauses visually. Supports a native prefix validator that converts `starts-with` filters into range queries automatically.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="feature-title">Monaco Scripting Shell</h3>
                <p className="feature-desc">
                  Write custom inline JavaScript map-reduce scripts to transform, clean, format, or map fetched documents locally before rendering, with instant validation logs.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Table size={18} />
              </div>
              <div>
                <h3 className="feature-title">Spreadsheet Virtual Grid</h3>
                <p className="feature-desc">
                  Explore millions of documents inside a highly responsive virtualized infinite spreadsheet. Automatically infers headers from document columns with reordering and column hiding.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Shield size={18} />
              </div>
              <div>
                <h3 className="feature-title">Active Safety Shield</h3>
                <p className="feature-desc">
                  Protect database states. Accents automatically transition to flashing warning red when connecting to live servers, locked alongside a master read-only protection shield.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileCode size={18} />
              </div>
              <div>
                <h3 className="feature-title">SQL Migration Blueprint</h3>
                <p className="feature-desc">
                  Auto-scan collections to infer schema fields, datatypes (timestamps, geopoints, points), and generate relational `CREATE TABLE` and `INSERT` DDL queries instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ----------------------------------------------------
           STEPPER GUIDE
        ---------------------------------------------------- */}
        <section className="guide-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Developer Integration in 3 Steps</h2>
            <p className="section-subtitle">
              Configure, query, and migrate your Firestore collections directly inside a beautiful native environment.
            </p>
          </div>

          <div className="guide-steps-container">
            <div className="guide-card">
              <span className="guide-num">01</span>
              <h3 className="guide-title">
                <Download size={14} color="var(--color-orange)" />
                Download Native Client
              </h3>
              <p className="guide-desc">
                Select the lightweight native package installer matching your host OS (macOS .dmg, Windows .exe, or Linux .AppImage).
              </p>
            </div>

            <div className="guide-card">
              <span className="guide-num">02</span>
              <h3 className="guide-title">
                <Server size={14} color="var(--color-orange)" />
                Connect Target Gateway
              </h3>
              <p className="guide-desc">
                Spin up your local emulator suite or provide your production IAM Service Account key. Verify credentials safely on local memory sandbox.
              </p>
            </div>

            <div className="guide-card">
              <span className="guide-num">03</span>
              <h3 className="guide-title">
                <Cpu size={14} color="var(--color-orange)" />
                Execute Query & Scripts
              </h3>
              <p className="guide-desc">
                Visual chain where clauses, write map-reduce cleaning scripts in JavaScript, review SQL migrations, and compile offline backups.
              </p>
            </div>
          </div>
        </section>

        {/* Technical sheet */}
        <section className="specs-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Technical Performance Sheet</h2>
            <p className="section-subtitle">
              Comprehensive specifications across emulator sandbox and live cloud environments.
            </p>
          </div>

          <div className="specs-table-wrapper">
            <table className="specs-table">
              <thead>
                <tr>
                  <th>Capability Parameters</th>
                  <th>Local Emulator Suite</th>
                  <th>Cloud Production / Staging</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Connection Port</strong></td>
                  <td>Dynamic (Typically TCP 8080)</td>
                  <td>SSL/TLS secure endpoint (443)</td>
                </tr>
                <tr>
                  <td><strong>Authentication Method</strong></td>
                  <td>None (Open development sandbox)</td>
                  <td>Secure Google IAM Service Account JSON key</td>
                </tr>
                <tr>
                  <td><strong>Scripting Map/Reduce</strong></td>
                  <td>Supported (Monaco client-side engine)</td>
                  <td>Supported (Monaco client-side engine)</td>
                </tr>
                <tr>
                  <td><strong>Live Safety Protection</strong></td>
                  <td>Bypassed (Read-write sandbox)</td>
                  <td>Locked ON (Accent red alert safety warning)</td>
                </tr>
                <tr>
                  <td><strong>SQL Schema Inference</strong></td>
                  <td>Inferred from local collection nodes</td>
                  <td>Adaptive paging batch scans inferred</td>
                </tr>
                <tr>
                  <td><strong>Subcollection Deep Crawl</strong></td>
                  <td>Immediate (Local network loopback)</td>
                  <td>Safe recursive crawling page batches</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Collapsible FAQ Section */}
        <section className="faq-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Understanding security, performance, credential storage, and SQL schemas.
            </p>
          </div>

          <div className="faq-container">
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(0)}>
                <span>Is my Google IAM Service Account key secure?</span>
                <ChevronDown size={16} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  Absolutely. Firestore Exporter is a completely local desktop app. When providing Service Account keys, they are processed exclusively inside your machine's offline Electron sandbox context. Credentials are never transferred to a backend or external servers.
                </p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(1)}>
                <span>How does the Monaco scripting shell map transformed data?</span>
                <ChevronDown size={16} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  When fetching documents, the core engine pipes the original collection JSON payload array through a sandboxed JavaScript function block. Toggling "Enable Scripting" triggers this local map-reduce function, updating both the hierarchical Tree view and spreadsheet grid before anything renders on the dashboard.
                </p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(2)}>
                <span>Does the SQL blueprint generator migrate databases instantly?</span>
                <ChevronDown size={16} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  The SQL Blueprint engine automatically translates unstructured Firestore documents into rigid columns and data types (booleans, timestamps, real/integers, geopoints). Clicking "SQL Blueprint" generates a perfect relational `CREATE TABLE` and batch `INSERT INTO` queries ready to be copied for rapid migrations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer>
          <p>Built by <strong>Bhavuk Arora</strong>. Firestore Exporter is a developer utility under standard Apache 2.0 open-source licensing.</p>
        </footer>
      </div>
    </div>
  );
}
