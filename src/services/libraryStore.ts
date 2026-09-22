export interface SavedStory {
  id: string;
  title: string;
  text: string;
  hskLevel: string;
  timestamp: number;
}

const DB_NAME = 'MandarinGradedReaderLibrary';
const DB_VERSION = 1;
const STORE_NAME = 'stories';

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
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveStory(story: Omit<SavedStory, 'id' | 'timestamp'> & { id?: string }): Promise<SavedStory> {
  const db = await openDB();
  const savedStory: SavedStory = {
    id: story.id || `story_${Date.now()}`,
    title: story.title || `Graded Story - HSK ${story.hskLevel}`,
    text: story.text,
    hskLevel: story.hskLevel,
    timestamp: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(savedStory);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(savedStory);
  });
}

export async function deleteStory(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getSavedStories(): Promise<SavedStory[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const stories: SavedStory[] = request.result || [];
      // Sort stories by date descending
      stories.sort((a, b) => b.timestamp - a.timestamp);
      resolve(stories);
    };
  });
}
