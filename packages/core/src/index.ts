export * from './sql';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

let firestoreInstance: admin.firestore.Firestore | null = null;

/**
 * Initialize and connect to the Firestore Database (Emulator or Live Production).
 */
export async function connectToEmulator(host: string, projectId: string, liveConfig?: string): Promise<boolean> {
  try {
    // Clean up active apps for clean reconnection
    if (admin.apps.length > 0) {
      await Promise.all(admin.apps.map(app => app?.delete().catch(() => {})));
    }

    if (liveConfig && liveConfig.trim().length > 0) {
      // Live Production Mode via Service Account Key
      delete process.env.FIRESTORE_EMULATOR_HOST;
      const serviceAccount = JSON.parse(liveConfig);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      // Local Emulator Mode
      const formattedHost = host.trim().replace(/^https?:\/\//, '');
      process.env.FIRESTORE_EMULATOR_HOST = formattedHost;

      admin.initializeApp({
        projectId: projectId.trim() || 'demo-project'
      });
    }

    firestoreInstance = admin.firestore();

    // Verify connection by attempting to list root collections (fast, dry query)
    await firestoreInstance.listCollections();
    return true;
  } catch (error) {
    firestoreInstance = null;
    throw error;
  }
}

/**
 * Ensures a valid Firestore connection exists.
 */
function getFirestore(): admin.firestore.Firestore {
  if (!firestoreInstance) {
    throw new Error('Firestore Emulator is not connected. Connect first.');
  }
  return firestoreInstance;
}

/**
 * Lists all root collection IDs.
 */
export async function listRootCollections(): Promise<string[]> {
  const db = getFirestore();
  const collections = await db.listCollections();
  return collections.map(col => col.id);
}

/**
 * Resolves Firestore data types (Timestamps, Geopoints, DocumentReferences) into standard JSON.
 */
function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) return data;

  // Handle Timestamp
  if (data instanceof admin.firestore.Timestamp) {
    return {
      _type: 'Timestamp',
      iso: data.toDate().toISOString(),
      seconds: data.seconds,
      nanoseconds: data.nanoseconds
    };
  }

  // Handle GeoPoint
  if (data instanceof admin.firestore.GeoPoint) {
    return {
      _type: 'GeoPoint',
      latitude: data.latitude,
      longitude: data.longitude
    };
  }

  // Handle DocumentReference
  if (data instanceof admin.firestore.DocumentReference) {
    return {
      _type: 'DocumentReference',
      path: data.path
    };
  }

  // Handle Array
  if (Array.isArray(data)) {
    return data.map(item => serializeFirestoreData(item));
  }

  // Handle Nested Object
  if (typeof data === 'object') {
    const serialized: Record<string, any> = {};
    for (const key of Object.keys(data)) {
      serialized[key] = serializeFirestoreData(data[key]);
    }
    return serialized;
  }

  return data;
}

export interface FirestoreDocument {
  id: string;
  path: string;
  data: Record<string, any>;
  createTime?: string;
  updateTime?: string;
}

export interface QueryConfig {
  field: string;
  operator: '==' | '<' | '<=' | '>' | '>=' | 'starts-with';
  value: any;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Fetches the first N documents of a collection, optionally filtering and sorting.
 */
export async function getCollectionDocuments(
  collectionId: string, 
  limitNum: number = 50,
  queries: QueryConfig[] = [],
  sorts: SortConfig[] = []
): Promise<FirestoreDocument[]> {
  const db = getFirestore();
  let query: admin.firestore.Query = db.collection(collectionId);

  // Apply Where clauses
  for (const q of queries) {
    if (q.operator === 'starts-with') {
      // Native range query conversion for prefix matching
      query = query.where(q.field, '>=', q.value).where(q.field, '<', q.value + '\uf8ff');
    } else {
      query = query.where(q.field, q.operator, q.value);
    }
  }

  // Apply OrderBy clauses
  for (const s of sorts) {
    query = query.orderBy(s.field, s.direction);
  }

  const snapshot = await query.limit(limitNum).get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    path: doc.ref.path,
    data: serializeFirestoreData(doc.data()),
    createTime: doc.createTime?.toDate().toISOString(),
    updateTime: doc.updateTime?.toDate().toISOString()
  }));
}

export interface CollectionExportNode {
  [docId: string]: {
    _path: string;
    _data: Record<string, any>;
    _subcollections?: Record<string, CollectionExportNode>;
  };
}

export interface DbExportStructure {
  exportedAt: string;
  projectId: string;
  emulatorHost: string;
  collections: Record<string, CollectionExportNode>;
}

/**
 * Recursively fetches a document reference and all of its nested subcollections.
 */
async function recursiveExportDocument(docRef: admin.firestore.DocumentSnapshot): Promise<any> {
  const data = serializeFirestoreData(docRef.data() || {});
  const subcollections = await docRef.ref.listCollections();
  
  const docNode: any = {
    _path: docRef.ref.path,
    _data: data
  };

  if (subcollections.length > 0) {
    docNode._subcollections = {};
    for (const subcol of subcollections) {
      const subcolDocs = await subcol.get();
      const subcolNode: CollectionExportNode = {};
      
      for (const subDoc of subcolDocs.docs) {
        subcolNode[subDoc.id] = await recursiveExportDocument(subDoc);
      }
      
      docNode._subcollections[subcol.id] = subcolNode;
    }
  }

  return docNode;
}

/**
 * Recursively crawls Firestore collections and builds an export object.
 */
export async function exportDatabase(collectionId?: string, docId?: string): Promise<DbExportStructure> {
  const db = getFirestore();
  const exportStructure: DbExportStructure = {
    exportedAt: new Date().toISOString(),
    projectId: admin.app().options.projectId || 'unknown',
    emulatorHost: process.env.FIRESTORE_EMULATOR_HOST || 'unknown',
    collections: {}
  };

  if (collectionId && docId) {
    // Export single document
    const docRef = await db.collection(collectionId).doc(docId).get();
    if (!docRef.exists) {
      throw new Error(`Document '${collectionId}/${docId}' does not exist.`);
    }
    const docNode = await recursiveExportDocument(docRef);
    exportStructure.collections[collectionId] = {
      [docId]: docNode
    };
  } else if (collectionId) {
    // Export single collection
    const colRef = db.collection(collectionId);
    const docs = await colRef.get();
    const colNode: CollectionExportNode = {};
    
    for (const doc of docs.docs) {
      colNode[doc.id] = await recursiveExportDocument(doc);
    }
    exportStructure.collections[collectionId] = colNode;
  } else {
    // Export entire database
    const rootCollections = await db.listCollections();
    for (const col of rootCollections) {
      const docs = await col.get();
      const colNode: CollectionExportNode = {};
      
      for (const doc of docs.docs) {
        colNode[doc.id] = await recursiveExportDocument(doc);
      }
      exportStructure.collections[col.id] = colNode;
    }
  }

  return exportStructure;
}

/**
 * Writes the exported structure to a JSON file on disk.
 */
export async function writeExportToFile(filePath: string, exportData: DbExportStructure): Promise<void> {
  const formattedJson = JSON.stringify(exportData, null, 2);
  await fs.promises.writeFile(filePath, formattedJson, 'utf8');
}
