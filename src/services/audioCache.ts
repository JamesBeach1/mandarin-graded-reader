/**
 * IndexedDB Audio Cache with SHA-256 Keying & LRU Eviction Policy
 * Stores synthesized Azure Neural TTS audio buffers for instantaneous offline playback.
 */

const DB_NAME = 'MandarinGradedReaderAudioCache';
const DB_VERSION = 1;
const STORE_NAME = 'audio_blobs';
const MAX_CACHE_ITEMS = 300; // LRU cap to prevent storage quota exhaustion

export interface CachedAudioEntry {
  hash: string;       // SHA-256 digest of input SSML / text
  text: string;       // Original source text
  audioBlob: Blob;    // Decoded MP3 / WAV audio blob
  timestamp: number;  // Last accessed epoch ms for LRU ordering
  voice: string;      // Neural voice tag (e.g. 'zh-CN-Xiaoxiao')
}

export async function hashString(input: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback hash for environments without crypto.subtle
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `fallback_${Math.abs(hash)}`;
}

function openAudioDB(): Promise<IDBDatabase> {
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
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'hash' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

export async function getCachedAudio(hash: string): Promise<Blob | null> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(hash);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const entry = req.result as CachedAudioEntry | undefined;
        if (entry) {
          // Update timestamp for LRU touch
          entry.timestamp = Date.now();
          store.put(entry);
          resolve(entry.audioBlob);
        } else {
          resolve(null);
        }
      };
    });
  } catch (err) {
    console.warn('Audio cache retrieval error:', err);
    return null;
  }
}

export async function setCachedAudio(hash: string, text: string, audioBlob: Blob, voice: string): Promise<void> {
  try {
    const db = await openAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const entry: CachedAudioEntry = {
        hash,
        text,
        audioBlob,
        timestamp: Date.now(),
        voice
      };
      
      store.put(entry);
      
      tx.oncomplete = () => {
        evictLRUCache(db);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Audio cache storage error:', err);
  }
}

async function evictLRUCache(db: IDBDatabase): Promise<void> {
  try {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const countReq = store.count();
    
    countReq.onsuccess = () => {
      if (countReq.result > MAX_CACHE_ITEMS) {
        const index = store.index('timestamp');
        const cursorReq = index.openCursor();
        let itemsToDelete = countReq.result - MAX_CACHE_ITEMS;
        
        cursorReq.onsuccess = () => {
          const cursor = cursorReq.result;
          if (cursor && itemsToDelete > 0) {
            cursor.delete();
            itemsToDelete--;
            cursor.continue();
          }
        };
      }
    };
  } catch {
    // Non-critical LRU eviction sweep
  }
}
