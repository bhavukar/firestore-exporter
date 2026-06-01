import { getFirestore } from 'firebase-admin/firestore';

export interface SqlColumn {
  name: string;
  type: 'TEXT' | 'INTEGER' | 'REAL' | 'BOOLEAN' | 'TIMESTAMP' | 'JSON';
}

export interface SqlTableSchema {
  tableName: string;
  columns: SqlColumn[];
}

function inferType(value: any): SqlColumn['type'] {
  if (value === null || value === undefined) return 'TEXT';
  if (typeof value === 'boolean') return 'BOOLEAN';
  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INTEGER' : 'REAL';
  }
  if (typeof value === 'string') return 'TEXT';
  
  if (typeof value === 'object') {
    if (value._type === 'Timestamp' || (value.toDate && typeof value.toDate === 'function')) {
      return 'TIMESTAMP';
    }
    return 'JSON';
  }
  
  return 'TEXT';
}

export async function inferCollectionSchema(collectionId: string, limit: number = 100): Promise<SqlTableSchema> {
  const db = getFirestore();
  const snapshot = await db.collection(collectionId).limit(limit).get();
  
  const columnsMap = new Map<string, SqlColumn['type']>();
  
  // Implicit ID column
  columnsMap.set('id', 'TEXT');

  for (const doc of snapshot.docs) {
    const data = doc.data();
    for (const [key, value] of Object.entries(data)) {
      const type = inferType(value);
      // Upgrade type if necessary (e.g. integer to real if a float is found)
      if (!columnsMap.has(key)) {
        columnsMap.set(key, type);
      } else {
        const existing = columnsMap.get(key);
        if (existing === 'INTEGER' && type === 'REAL') {
          columnsMap.set(key, 'REAL');
        } else if (existing !== 'JSON' && type === 'JSON') {
          columnsMap.set(key, 'JSON');
        }
      }
    }
  }

  return {
    tableName: collectionId.replace(/[^a-zA-Z0-9_]/g, '_'),
    columns: Array.from(columnsMap.entries()).map(([name, type]) => ({ name, type }))
  };
}

export function generateSqlDDL(schema: SqlTableSchema): string {
  let ddl = `CREATE TABLE ${schema.tableName} (\n`;
  const cols = schema.columns.map(c => `  ${c.name} ${c.type}${c.name === 'id' ? ' PRIMARY KEY' : ''}`);
  ddl += cols.join(',\n');
  ddl += '\n);';
  return ddl;
}
