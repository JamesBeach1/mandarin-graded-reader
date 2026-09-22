export interface DictionaryOverride {
  character: string;
  pinyin: string;
  definition: string;
}

const DB_NAME = 'MandarinGradedReaderOverrides';
const DB_VERSION = 1;
const STORE_NAME = 'overrides';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'character' });
      }
    };
  });
}

export async function saveOverride(override: DictionaryOverride): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(override);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteOverride(character: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(character);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getOverridesMap(): Promise<Record<string, { pinyin: string; definition: string }>> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const list: DictionaryOverride[] = request.result || [];
      const map: Record<string, { pinyin: string; definition: string }> = {};
      list.forEach((item) => {
        map[item.character] = {
          pinyin: item.pinyin,
          definition: item.definition,
        };
      });
      resolve(map);
    };
  });
}
