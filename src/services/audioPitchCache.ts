/**
 * Audio Pitch Cache (IndexedDB)
 * Stores computed pitch contours (F0 sequences) for reference words to prevent recomputation.
 */

const DB_NAME = 'MandarinGradedReaderPitchCache';
const DB_VERSION = 1;
const STORE_NAME = 'pitch_curves';

export interface CachedPitchCurve {
  character: string;   // e.g. "妈"
  toneNumber: number;  // 1, 2, 3, 4, or 5
  pinyin: string;      // e.g. "mā"
  curve: number[];     // Normalized F0 sequence (0.0 to 1.0)
  timestamp: number;
}

function openPitchDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported.'));
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

export async function getCachedPitchCurve(character: string): Promise<number[] | null> {
  try {
    const db = await openPitchDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(character);
      req.onsuccess = () => {
        const item = req.result as CachedPitchCurve | undefined;
        resolve(item ? item.curve : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedPitchCurve(character: string, pinyin: string, toneNumber: number, curve: number[]): Promise<void> {
  try {
    const db = await openPitchDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        character,
        pinyin,
        toneNumber,
        curve,
        timestamp: Date.now()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Non-critical cache failure
  }
}
