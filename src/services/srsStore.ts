export interface Flashcard {
  character: string;
  pinyin: string;
  definition: string;
  nextReviewDate: number; // timestamp in ms
  interval: number; // in days
  easeFactor: number; // multiplier, defaults to 2.5
  hsk_level?: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleTranslation?: string;
  deckId?: string; // SRS-004: e.g. "default", "business", "dining", "travel"
}

export interface ThematicDeck {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const DEFAULT_THEMATIC_DECKS: ThematicDeck[] = [
  { id: 'all', name: 'All Cards', description: 'Complete library of vocabulary and characters' },
  { id: 'default', name: 'General & Stories', description: 'Cards saved from reader and daily study', icon: '📖' },
  { id: 'dining', name: 'Dining & Food', description: 'Culinary terms, ingredients, ordering dishes', icon: '🥟' },
  { id: 'travel', name: 'Travel & Transit', description: 'Airports, stations, navigation, hotel check-in', icon: '✈️' },
  { id: 'business', name: 'Business & Finance', description: 'Workplace idioms, meetings, commerce', icon: '💼' }
];

// SRS-010: User-Tweakable SRS Intervals (SM-2 Customizer)
export interface SrsCustomizerSettings {
  initialInterval: number;     // Step 1: Default 1 day
  secondInterval: number;      // Step 2: Default 4 days
  minEaseFactor: number;       // Default 1.3
  initialEaseFactor: number;   // Default 2.5
  easyBonusMultiplier: number; // Default 1.3x
  hardIntervalFactor: number;  // Default 1.2x
  failureInterval: number;     // Default 1 day
}

export const DEFAULT_SRS_SETTINGS: SrsCustomizerSettings = {
  initialInterval: 1,
  secondInterval: 4,
  minEaseFactor: 1.3,
  initialEaseFactor: 2.5,
  easyBonusMultiplier: 1.3,
  hardIntervalFactor: 1.2,
  failureInterval: 1,
};

const SRS_SETTINGS_KEY = 'moyun_srs_customizer_settings';

export function getSrsSettings(): SrsCustomizerSettings {
  try {
    const raw = localStorage.getItem(SRS_SETTINGS_KEY);
    if (!raw) return DEFAULT_SRS_SETTINGS;
    return { ...DEFAULT_SRS_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SRS_SETTINGS;
  }
}

export function saveSrsSettings(settings: SrsCustomizerSettings): void {
  try {
    localStorage.setItem(SRS_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save SRS customizer settings', e);
  }
}

const DECKS_STORAGE_KEY = 'moyun_custom_srs_decks';

export function getCustomDecks(): ThematicDeck[] {
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    if (!raw) return DEFAULT_THEMATIC_DECKS;
    const custom = JSON.parse(raw);
    return custom;
  } catch {
    return DEFAULT_THEMATIC_DECKS;
  }
}

export function saveCustomDecks(decks: ThematicDeck[]): void {
  localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
}

const DB_NAME = 'MandarinGradedReaderSRS';
const DB_VERSION = 1;
const STORE_NAME = 'flashcards';

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

export async function getCard(character: string): Promise<Flashcard | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(character);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

export async function addCard(item: {
  character: string;
  pinyin: string;
  definition: string;
  hsk_level?: string;
  exampleSentence?: string;
  examplePinyin?: string;
  exampleTranslation?: string;
  deckId?: string;
}): Promise<void> {
  const db = await openDB();
  const existing = await getCard(item.character);
  const settings = getSrsSettings();
  const card: Flashcard = {
    character: item.character,
    pinyin: item.pinyin,
    definition: item.definition,
    hsk_level: item.hsk_level,
    exampleSentence: item.exampleSentence ?? existing?.exampleSentence,
    examplePinyin: item.examplePinyin ?? existing?.examplePinyin,
    exampleTranslation: item.exampleTranslation ?? existing?.exampleTranslation,
    deckId: item.deckId ?? existing?.deckId ?? 'default',
    nextReviewDate: existing?.nextReviewDate ?? Date.now(),
    interval: existing?.interval ?? 0,
    easeFactor: existing?.easeFactor ?? settings.initialEaseFactor,
  };
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(card);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function deleteCard(character: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(character);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export async function getDueCards(deckId?: string): Promise<Flashcard[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const now = Date.now();
      let cards: Flashcard[] = request.result || [];
      if (deckId && deckId !== 'all') {
        cards = cards.filter((c) => (c.deckId || 'default') === deckId);
      }
      resolve(cards.filter((card) => card.nextReviewDate <= now));
    };
  });
}

export async function getAllCards(deckId?: string): Promise<Flashcard[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      let cards: Flashcard[] = request.result || [];
      if (deckId && deckId !== 'all') {
        cards = cards.filter((c) => (c.deckId || 'default') === deckId);
      }
      resolve(cards);
    };
  });
}

export async function updateCard(character: string, quality: number): Promise<void> {
  const card = await getCard(character);
  if (!card) return;

  const settings = getSrsSettings();
  let { interval, easeFactor } = card;

  // quality is 1 (Fail), 2 (Hard), 3 (Good), 4 (Easy)
  // Map to SM-2 equivalent quality (0-5 scale):
  // 1 -> 0 (Fail)
  // 2 -> 2 (Hard)
  // 3 -> 4 (Good)
  // 4 -> 5 (Easy)
  let qMapped = 3;
  if (quality === 1) qMapped = 0;
  else if (quality === 2) qMapped = 2;
  else if (quality === 3) qMapped = 4;
  else if (quality === 4) qMapped = 5;

  easeFactor = easeFactor + (0.1 - (5 - qMapped) * (0.08 + (5 - qMapped) * 0.02));
  if (easeFactor < settings.minEaseFactor) {
    easeFactor = settings.minEaseFactor;
  }

  if (qMapped < 3) {
    interval = settings.failureInterval; // failure lapse
  } else {
    if (interval === 0) {
      interval = settings.initialInterval;
    } else if (interval <= settings.initialInterval) {
      interval = settings.secondInterval;
    } else {
      let factor = easeFactor;
      if (quality === 2) {
        // Hard factor
        factor = Math.max(1.0, settings.hardIntervalFactor);
      } else if (quality === 4) {
        // Easy bonus multiplier
        factor = easeFactor * settings.easyBonusMultiplier;
      }
      interval = Math.max(interval + 1, Math.round(interval * factor));
    }
  }

  card.interval = interval;
  card.easeFactor = easeFactor;
  card.nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(card);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}
