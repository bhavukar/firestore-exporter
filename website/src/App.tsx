/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
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
        lastLogin: { _type: 'Timestamp', seconds: 1779278850, iso: '2026-05-20T17:47:30Z' },
        preferences: {
          theme: 'dark',
          sceneType: 'ip', // Triggers event IP layout logic
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
        walletBalance: 0.00,
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
        title: 'NuPhy Air75 V2 Mechanical Keyboard',
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
        amenities: ['VIP Lounge', 'Parking Garage', 'Concessions', 'Merch Stands']
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
        sceneType: 'ip', // Triggers premium Event IP branding logic
        coordinates: { _type: 'GeoPoint', latitude: 51.5560, longitude: -0.2796 },
        eventBranding: {
          bannerColor: '#ffca28',
          logoUrl: 'https://github.com/bhavukar/firestore-exporter/raw/main/website/logo.svg',
          posterAsset: 'concert_wembley_poster.png'
        }
      }
    }
  ],
  messages: [
    {
      id: 'msg_001_welcome',
      data: {
        sender: 'Bhavuk Arora',
        body: 'Welcome to the Firestore Exporter emulator companion website!',
        sentAt: { _type: 'Timestamp', seconds: 1779282000, iso: '2026-05-20T18:00:00Z' },
        isSystemMessage: false,
        readStatus: {
          isRead: true,
          readAt: { _type: 'Timestamp', seconds: 1779282100, iso: '2026-05-20T18:01:40Z' }
        },
        recipientRef: { _type: 'DocumentReference', path: 'users/user_08f9a2' }
      }
    },
    {
      id: 'msg_002_release',
      data: {
        sender: 'System Admin',
        body: 'Firestore Exporter has been released for macOS (ARM64/x64), Windows (.exe), and Linux (.AppImage).',
        sentAt: { _type: 'Timestamp', seconds: 1779282200, iso: '2026-05-20T18:03:20Z' },
        isSystemMessage: true,
        readStatus: {
          isRead: false
        }
      }
    }
  ]
};

// --- SIMULATED COMPONENT FOR COLOR-CODED VALUES ---
const renderPrimitiveValue = (val: any) => {
  if (val === null) return <span className="text-primitive-null font-mono">null</span>;
  if (val === undefined) return <span className="text-neutral-500 font-mono">undefined</span>;
  
  if (typeof val === 'boolean') {
    return <span className="text-primitive-bool font-mono">{val ? 'true' : 'false'}</span>;
  }
  if (typeof val === 'number') {
    return <span className="text-primitive-num font-mono">{val}</span>;
  }
  if (typeof val === 'string') {
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
      return (
        <span className="custom-type-tag geopoint font-mono">
          📍 GeoPoint({val.latitude}°, {val.longitude}°)
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

// --- COLLAPSIBLE JSON TREE COMPONENT ---
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
      <span>{renderPrimitiveValue(value)}</span>
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

export default function App() {
  // App states
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

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const addToast = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Math.random().toString(),
      type,
      title,
      message
    };
    setSimToasts((prev) => [...prev, newToast]);
    
    // Auto purge toast after 4s
    setTimeout(() => {
      setSimToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setSimToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSimRefresh = () => {
    setSimRefreshing(true);
    addToast('Refreshing', 'Synchronizing collection index...', 'info');
    setTimeout(() => {
      setSimRefreshing(false);
      addToast('Sync Complete', 'Database index updated.', 'success');
    }, 600);
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSimConnecting(true);

    if (gatewayMode === 'local') {
      addToast('Connecting', `Pinging local emulator at ${localHost}...`, 'info');
      setTimeout(() => {
        setActiveSession({ mode: 'local', host: localHost, project: localProject });
        addToast('Connected Successfully', `Connected to local project '${localProject}'.`, 'success');
        setSimScreen('explorer');
        setSimConnecting(false);
      }, 600);
    } else {
      addToast('Connecting', 'Verifying Google Service Account...', 'info');
      setTimeout(() => {
        try {
          const keyObj = JSON.parse(liveConfig);
          const pId = keyObj.project_id || 'firestore-live-prod';
          setActiveSession({ mode: 'live', host: 'firestore.googleapis.com', project: pId });
          addToast('Access Granted', `Production connected to project '${pId}'.`, 'success');
          setSimScreen('explorer');
        } catch {
          addToast('Parsing Error', 'Invalid Service Account JSON key format.', 'error');
        } finally {
          setSimConnecting(false);
        }
      }, 850);
    }
  };

  const triggerCopyDocId = (docId: string) => {
    navigator.clipboard.writeText(docId);
    setCopySuccess(true);
    addToast('Copied ID', `Document path copied to clipboard!`, 'success');
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Perform simulated file backup export
  const handleSimExport = () => {
    const dataToExport = mockCollections[selectedCol] || [];
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(dataToExport, null, 2)
    )}`;
    
    // Create a virtual anchor to download in visitor's real browser!
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `firestore_export_${selectedCol}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    addToast('Database Exported', `Downloaded firestore_export_${selectedCol}.json Backup!`, 'success');
  };

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  // Get active mock document's data fields
  const activeColDocs = mockCollections[selectedCol] || [];
  const filteredDocs = activeColDocs.filter((d) => 
    d.id.toLowerCase().includes(docSearchQuery.toLowerCase())
  );
  const activeDoc = activeColDocs.find((d) => d.id === selectedDocId) || activeColDocs[0] || null;

  return (
    <>
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      <div className="container">
        {/* Navigation Bar */}
        <header>
          <div className="logo-container" onClick={() => setSimScreen('gateway')}>
            <svg className="logo-svg" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFCA28" d="M3.89 15.672 6.255.461A.542.542 0 0 1 7.27.288l2.543 4.771z"/>
              <path fill="#FF9100" d="m20.684 19.364-2.25-14a.54.54 0 0 0-.919-.295L3.316 19.365l7.856 4.427a1.621 1.621 0 0 0 1.588 0z"/>
              <path fill="#DD2C00" d="M14.67 24l-3.32-1.875 3.32-6.236z"/>
            </svg>
            <span className="logo-text">Firestore Exporter</span>
          </div>
          <a href="https://github.com/bhavukar/firestore-exporter" target="_blank" rel="noopener noreferrer" className="btn-github-nav">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub Project
          </a>
        </header>

        {/* Hero Section */}
        <section className="hero-section">
          <h1>Universal Firestore Explorer</h1>
          <p className="description">
            A focused desktop companion for local emulators and live Cloud Firestore projects. Inspect collections, browse nested fields, review complex schemas, and download clean JSON backups in one place.
          </p>

          {/* Download Platforms Cards Grid */}
          <div className="download-grid">
            
            {/* Apple macOS Card */}
            <div className="download-card" data-platform="mac">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.7-1.13 1.84-.99 2.94.1.08.2.12.3.12.86 0 1.97-.55 2.52-1.45z"/>
                </svg>
              </div>
              <div className="platform-name">macOS</div>
              <div className="file-extension">Macos-arm64.dmg</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/releases/Macos-arm64.dmg" className="btn-action-download">
                Download DMG
              </a>
            </div>

            {/* Microsoft Windows Card */}
            <div className="download-card" data-platform="windows">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M0 3.449L9.75 2.1v9.451H0V3.449zM0 12.45h9.75v9.45L0 20.551v-8.101zM11.25 1.899L24 0v11.55H11.25V1.899zM11.25 12.45H24v11.55l-12.75-1.9v-9.65z"/>
                </svg>
              </div>
              <div className="platform-name">Windows</div>
              <div className="file-extension">Windows.exe</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/releases/Windows.exe" className="btn-action-download">
                Download Setup EXE
              </a>
            </div>

            {/* Linux Card */}
            <div className="download-card" data-platform="linux">
              <div className="platform-icon-wrapper">
                <svg viewBox="0 0 24 24">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z"/>
                </svg>
              </div>
              <div className="platform-name">Linux</div>
              <div className="file-extension">Linux.AppImage</div>
              <a href="https://github.com/bhavukar/firestore-exporter/releases/download/releases/Linux.AppImage" className="btn-action-download">
                Download AppImage
              </a>
            </div>

          </div>
        </section>

        {/* ----------------------------------------------------
           INTERACTIVE DESKTOP APP SIMULATOR WINDOW
        ---------------------------------------------------- */}
        <section className="screenshot-showcase">
          <div className="simulator-window">
            
            {/* Window title bar / chrome */}
            <div className="sim-titlebar">
              <div className="sim-traffic-lights">
                <div className="sim-dot red" />
                <div className="sim-dot yellow" />
                <div className="sim-dot green" />
              </div>
              
              <div className="sim-title">
                {simScreen === 'gateway' 
                  ? 'Firestore Exporter — Connection Gateway' 
                  : `Firestore Exporter — ${activeSession.mode.toUpperCase()} [${activeSession.project}]`}
              </div>

              <div>
                {simScreen === 'explorer' ? (
                  <span className="sim-badge connected" style={{ cursor: 'pointer' }} onClick={() => setSimScreen('gateway')}>
                    <span style={{ color: '#ffb300', marginRight: '4px' }}>●</span> Connected (Change)
                  </span>
                ) : (
                  <span className="sim-badge">
                    Offline
                  </span>
                )}
              </div>
            </div>

            {/* SCREEN A: GATEWAY PANEL */}
            {simScreen === 'gateway' && (
              <div className="sim-gateway-screen">
                <div className="sim-gateway-card">
                  <div className="sim-gateway-logo">
                    <Database size={22} color="#ff9100" />
                    <span>Connect to Database</span>
                  </div>

                  <div className="sim-mobile-tabs" style={{ display: 'flex', marginBottom: '1.5rem', background: '#191414', padding: '0.3rem', borderRadius: '8px' }}>
                    <button 
                      type="button"
                      onClick={() => setGatewayMode('local')}
                      className={`sim-mobile-tab-btn ${gatewayMode === 'local' ? 'active' : ''}`}
                    >
                      Local Emulator
                    </button>
                    <button 
                      type="button"
                      onClick={() => setGatewayMode('live')}
                      className={`sim-mobile-tab-btn ${gatewayMode === 'live' ? 'active' : ''}`}
                    >
                      Live Production
                    </button>
                  </div>

                  <form onSubmit={handleConnect}>
                    {gatewayMode === 'local' ? (
                      <>
                        <div className="form-group">
                          <label>Emulator Host</label>
                          <input 
                            type="text" 
                            className="sim-input" 
                            value={localHost} 
                            onChange={(e) => setLocalHost(e.target.value)} 
                            placeholder="127.0.0.1:8080" 
                            required
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: '1.8rem' }}>
                          <label>Project ID</label>
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
                          <label>Google Service Account Key JSON</label>
                          <textarea 
                            className="sim-input" 
                            value={liveConfig} 
                            onChange={(e) => setLiveConfig(e.target.value)} 
                            placeholder='{"type": "service_account", "project_id": "...", ...}' 
                            style={{ minHeight: '90px', fontFamily: 'monospace', fontSize: '0.78rem', resize: 'vertical' }}
                            required
                          />
                        </div>
                        <div style={{
                          background: 'rgba(255, 145, 0, 0.04)',
                          border: '1px solid rgba(255, 145, 0, 0.12)',
                          padding: '0.8rem 1rem',
                          borderRadius: '8px',
                          marginBottom: '1.8rem',
                          fontSize: '0.75rem',
                          color: '#a69fa9',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '0.6rem',
                          lineHeight: 1.4
                        }}>
                          <Info size={14} color="#ff9100" style={{ flexShrink: 0, marginTop: '2px' }} />
                          <div>
                            <strong style={{ color: '#ffca28' }}>Local Sandbox Isolation:</strong> Service keys are processed entirely client-side on your local node.
                          </div>
                        </div>
                      </>
                    )}

                    <div className="sim-gateway-actions">
                      {activeSession && (
                        <button 
                          type="button" 
                          className="sim-btn sim-btn-secondary" 
                          onClick={() => setSimScreen('explorer')}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        type="submit" 
                        className="sim-btn sim-btn-primary"
                        disabled={simConnecting}
                      >
                        {simConnecting ? (
                          <><RefreshCw size={16} className="animate-spin" /> Connecting...</>
                        ) : 'Connect Gateway'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Mobile Tab Selector */}
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
                  Fields
                </button>
              </div>
            )}

            {/* SCREEN B: DATABASE EXPLORER PANEL */}
            {simScreen === 'explorer' && (
              <div className="sim-explorer-screen">
                
                {/* Panel 1: Collections List */}
                <div className={`sim-pane sim-col-collections ${activeMobileTab === 'collections' ? 'mobile-visible' : 'mobile-hidden'}`}>
                  <div className="sim-pane-header">
                    <span className="sim-pane-title">
                      <Layers size={13} style={{ color: 'var(--color-orange)' }} /> Collections
                    </span>
                    <button className="sim-icon-btn" onClick={handleSimRefresh} title="Sync indexes">
                      <RefreshCw size={13} className={simRefreshing ? 'animate-spin' : ''} />
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
                          <Database size={13} style={{ color: 'var(--color-orange)', opacity: 0.8 }} />
                          {colName}
                        </div>
                      ))}
                  </div>
                </div>

                {/* Panel 2: Document List */}
                <div className={`sim-pane sim-col-documents ${activeMobileTab === 'documents' ? 'mobile-visible' : 'mobile-hidden'}`}>
                  <div className="sim-pane-header">
                    <span className="sim-pane-title">
                      <FileCode size={13} style={{ color: 'var(--color-amber)' }} /> Documents
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#666', fontWeight: 600 }}>
                      {filteredDocs.length} items
                    </span>
                  </div>

                  <div className="search-box">
                    <div className="search-wrapper">
                      <Search size={12} className="search-icon-inside" />
                      <input 
                        type="text" 
                        className="sim-search-input" 
                        placeholder="Search document ID..." 
                        value={docSearchQuery}
                        onChange={(e) => setDocSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="sim-pane-content">
                    {filteredDocs.length === 0 ? (
                      <div className="sim-empty-state">
                        <Info size={22} />
                        <p>No documents matching search</p>
                      </div>
                    ) : (
                      filteredDocs.map((doc) => (
                        <div 
                          key={doc.id}
                          className={`sim-list-item ${selectedDocId === doc.id ? 'active' : ''}`}
                          onClick={() => setSelectedDocId(doc.id)}
                        >
                          <span style={{ fontSize: '11px', color: 'var(--color-orange)' }}>📄</span>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {doc.id}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel 3: Fields Tree view */}
                <div className={`sim-pane sim-col-fields ${activeMobileTab === 'fields' ? 'mobile-visible' : 'mobile-hidden'}`}>
                  <div className="sim-pane-header">
                    <span className="sim-pane-title">
                      🔑 fields
                    </span>
                    
                    <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                      <button 
                        className="sim-btn sim-btn-secondary" 
                        style={{
                          padding: '0.25rem 0.55rem', 
                          fontSize: '0.7rem', 
                          background: 'rgba(255,255,255,0.02)',
                          borderColor: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-muted)'
                        }}
                        onClick={() => triggerCopyDocId(`${selectedCol}/${selectedDocId}`)}
                      >
                        <Copy size={11} /> Copy Path
                      </button>

                      <button 
                        className="sim-btn sim-btn-primary" 
                        style={{
                          padding: '0.25rem 0.55rem', 
                          fontSize: '0.7rem', 
                          boxShadow: 'none',
                          background: 'var(--gradient-brand)'
                        }}
                        onClick={handleSimExport}
                      >
                        <Download size={11} /> Export JSON
                      </button>

                      {copySuccess && <div className="copy-tooltip">✓ Path Copied!</div>}
                    </div>
                  </div>

                  <div className="sim-pane-content sim-fields-workspace">
                    {activeDoc ? (
                      <div>
                        <div style={{ color: '#5c5464', marginBottom: '0.8rem', fontSize: '0.76rem', userSelect: 'none' }}>
                          // Path: {selectedCol}/{selectedDocId}
                        </div>
                        
                        <div style={{ color: '#d4d4d4', fontFamily: 'monospace' }}>
                          <span style={{ color: '#d4d4d4' }}>{'{'}</span>
                          <div style={{ marginTop: '0.2rem' }}>
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

                        {/* Event IP branding vs Event Title standard logic */}
                        {activeDoc.data && activeDoc.data.sceneType === 'ip' && (
                          <div className="event-ip-layout" style={{ marginTop: '1.5rem' }}>
                            <div className="event-ip-header" style={{ color: activeDoc.data.eventBranding?.bannerColor || '#ffca28' }}>
                              ★ Event IP Premium Active
                            </div>
                            <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                              {activeDoc.data.eventBranding?.logoUrl && (
                                <img 
                                  src={activeDoc.data.eventBranding.logoUrl} 
                                  alt="Event IP Logo" 
                                  style={{ width: '32px', height: '32px', objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,202,40,0.3))' }} 
                                />
                              )}
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{activeDoc.data.name || 'Wembley Event'}</div>
                                <div style={{ fontSize: '0.7rem', color: '#ffca28' }}>Premium Event Branding Activated</div>
                              </div>
                            </div>
                            <div style={{
                              background: 'rgba(0,0,0,0.3)',
                              padding: '0.5rem 0.8rem',
                              borderRadius: '6px',
                              fontSize: '0.72rem',
                              border: '1px dashed rgba(255,202,40,0.15)',
                              color: 'var(--text-muted)',
                              fontFamily: 'sans-serif'
                            }}>
                              Poster Asset: <code>{activeDoc.data.eventBranding?.posterAsset || 'default.png'}</code>
                            </div>
                          </div>
                        )}

                        {activeDoc.data && activeDoc.data.sceneType === 'venue' && (
                          <div className="event-venue-layout" style={{
                            marginTop: '1.5rem',
                            padding: '0.9rem',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                          }}>
                            <div style={{ fontWeight: 700, color: 'var(--color-orange)', fontSize: '0.76rem', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: '0.4rem', fontFamily: 'sans-serif' }}>
                              🏢 Standard Venue Layout
                            </div>
                            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>{activeDoc.data.name || 'Madison Square Garden'}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem', fontFamily: 'sans-serif' }}>
                              Capacity: {activeDoc.data.capacity?.toLocaleString() || '19,500'} spectators
                            </div>
                          </div>
                        )}

                        {/* User custom preference settings indicator */}
                        {activeDoc.data && activeDoc.data.preferences?.sceneType === 'ip' && (
                          <div style={{
                            marginTop: '1.2rem',
                            padding: '0.7rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 145, 0, 0.04)',
                            border: '1px solid rgba(255, 145, 0, 0.12)',
                            fontSize: '0.72rem',
                            color: 'var(--color-amber)',
                            fontFamily: 'sans-serif'
                          }}>
                            ⚙️ User Preference: <strong>Event IP Theme</strong> selected. UI adapts automatically.
                          </div>
                        )}
                        {activeDoc.data && activeDoc.data.preferences?.sceneType === 'venue' && (
                          <div style={{
                            marginTop: '1.2rem',
                            padding: '0.7rem',
                            borderRadius: '6px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.04)',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'sans-serif'
                          }}>
                            ⚙️ User Preference: <strong>Standard Venue Theme</strong> selected.
                          </div>
                        )}

                      </div>
                    ) : (
                      <div className="sim-empty-state">
                        <Database size={24} />
                        <p>Select a document to inspect fields</p>
                      </div>
                    )}
                  </div>

                  {/* Explorer footer status */}
                  <div style={{
                    height: '42px',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    background: '#0d0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0 1rem',
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--color-orange)', fontSize: '0.8rem' }}>●</span> 
                      Session: {activeSession.mode === 'local' ? `Emulator (${activeSession.host})` : `Live Firestore (${activeSession.project})`}
                    </span>
                    <span style={{ color: 'var(--color-amber)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setSimScreen('gateway')}>
                      <Server size={11} /> Switch Gateway
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* Simulated Live Toast notifications */}
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
           DETAILED FEATURES
        ---------------------------------------------------- */}
        <section className="features-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Engineered for Modern Firebase Workflows</h2>
            <p className="section-subtitle">
              A high-performance crawler and data-visualizer engineered specifically for Cloud Firestore collections.
            </p>
          </div>

          <div className="features-grid">
            
            <div className="feature-card">
              <div className="feature-icon-box">
                <Database size={20} />
              </div>
              <div>
                <h3 className="feature-title">Local Emulator & Production Gateway</h3>
                <p className="feature-desc">
                  Seamlessly bridge local developer emulation suites (running on port 8080/TCP) and production live Cloud databases in a single sandboxed client environment.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Layers size={20} />
              </div>
              <div>
                <h3 className="feature-title">Subcollection Deep Crawling</h3>
                <p className="feature-desc">
                  Our core crawling engine recursively parses multi-level nested collections. It maps document reference pathways and traverses deeply structured document hierarchies.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <FileCode size={20} />
              </div>
              <div>
                <h3 className="feature-title">Type-Safe Serialization</h3>
                <p className="feature-desc">
                  Native preservation for Firebase specific objects: Timestamps are converted into easily readable local dates, GeoPoints coordinates are listed visually, and References are hot-linked.
                </p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-box">
                <Server size={20} />
              </div>
              <div>
                <h3 className="feature-title">100% Client-Side Sandbox</h3>
                <p className="feature-desc">
                  Security is our priority. Google Service Account JSON configurations are analyzed entirely locally in your isolated container. Credentials are never shipped to a backend.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* ----------------------------------------------------
           DEVELOPER GUIDE / STEPPER
        ---------------------------------------------------- */}
        <section className="guide-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Use the Desktop App in 3 Steps</h2>
            <p className="section-subtitle">
              Download the app, connect a Firestore target, and export readable JSON backups from the desktop experience.
            </p>
          </div>

          <div className="guide-steps-container">
            
            <div className="guide-card">
              <span className="guide-num">01</span>
              <h3 className="guide-title"><Download size={16} color="var(--color-orange)" /> Download the desktop build</h3>
              <p className="guide-desc">
                Pick the build for macOS, Windows, or Linux and launch Firestore Exporter as a local desktop app.
              </p>
            </div>

            <div className="guide-card">
              <span className="guide-num">02</span>
              <h3 className="guide-title"><Server size={16} color="var(--color-orange)" /> Connect Firestore</h3>
              <p className="guide-desc">
                Start your local Firebase Emulator Suite or prepare your production Service Account JSON key. Point the gateway to your desired target.
              </p>
            </div>

            <div className="guide-card">
              <span className="guide-num">03</span>
              <h3 className="guide-title"><Download size={16} color="var(--color-orange)" /> Export Backups</h3>
              <p className="guide-desc">
                Scan through your data collections visually, filter document paths, and compile compressed, type-safe JSON file backups immediately.
              </p>
            </div>

          </div>
        </section>

        {/* ----------------------------------------------------
           TECHNICAL SPECS TABLE
        ---------------------------------------------------- */}
        <section className="specs-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Comparative Performance Sheet</h2>
            <p className="section-subtitle">
              Technical capability parameters across emulator and cloud database configurations.
            </p>
          </div>

          <div className="specs-table-wrapper">
            <table className="specs-table">
              <thead>
                <tr>
                  <th>Parameters</th>
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
                  <td>None (Open development mode)</td>
                  <td>Secure Google IAM Service Account JSON</td>
                </tr>
                <tr>
                  <td><strong>Crawling Speed</strong></td>
                  <td>Immediate (Local network loopback)</td>
                  <td>Adaptive paging (optimized batch throttling)</td>
                </tr>
                <tr>
                  <td><strong>Deep Nesting Subcollection</strong></td>
                  <td>Supported (unlimited levels)</td>
                  <td>Supported (recursively parsed safely)</td>
                </tr>
                <tr>
                  <td><strong>JSON Backups Generation</strong></td>
                  <td>One-click client download</td>
                  <td>One-click client download</td>
                </tr>
                <tr>
                  <td><strong>Access Sandbox Isolation</strong></td>
                  <td>100% Offline Local</td>
                  <td>100% Client-side sandbox</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ----------------------------------------------------
           COLLAPSIBLE FAQ ACCORDION
        ---------------------------------------------------- */}
        <section className="faq-section">
          <div className="section-title-wrapper">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Everything you need to know about credentials, security, and Firestore export behavior.
            </p>
          </div>

          <div className="faq-container">
            
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(0)}>
                <span>Is my Service Account Key secure?</span>
                <ChevronDown size={18} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  Yes, 100%. All credential parsing, validation, and database operations happen exclusively inside your own local client sandbox. We have zero backend server infrastructure to collect credentials, and the website works completely isolated on your host machine.
                </p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(1)}>
                <span>How does the deep crawling work?</span>
                <ChevronDown size={18} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  Cloud Firestore holds data in hierarchical document paths (collections containing documents which in turn contain subcollections). Firestore Exporter queries the collections at the root level, then recursively runs page queries down all active reference trees to build a unified nested JSON representation.
                </p>
              </div>
            </div>

            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
              <button className="faq-trigger" onClick={() => toggleFaq(2)}>
                <span>Can this run in automation workflows?</span>
                <ChevronDown size={18} className="faq-icon" />
              </button>
              <div className="faq-content">
                <p>
                  The current release is focused on the desktop app. Automation support is a good future product surface, but this page only describes what ships today.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer>
          <p>Built by Bhavuk for developers working with Firestore data.</p>
        </footer>
      </div>
    </>
  );
}
