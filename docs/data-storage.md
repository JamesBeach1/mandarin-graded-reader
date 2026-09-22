# Data Persistence, Storage Contracts & SM-2 Algorithm

This document describes all static databases, IndexedDB object stores, LocalStorage key registries, multi-device state hydration schemas, and the SuperMemo-2 (SM-2) spaced repetition algorithm implemented in the application.

---

## 1. Storage Architecture Overview

```
Client Storage Architecture
├── 1. Static CSV Databases (Precached via Workbox)
│   ├── /public/hanziDB.csv (10,000+ character corpus)
│   └── /public/vocabDB.csv (Compound vocabulary corpus)
├── 2. Browser IndexedDB (Read/Write Persistent Stores)
│   ├── MandarinGradedReaderSRS (Store: flashcards, Key: character)
│   ├── MandarinGradedReaderLibrary (Store: stories, Key: id)
│   ├── MandarinGradedReaderOverrides (Store: overrides, Key: character)
│   ├── MandarinAudioCache (Store: audio_blobs, Key: sha256_hash)
│   └── MandarinAudioPitchCache (Store: pitch_curves, Key: char_key)
├── 3. Browser LocalStorage (Synchronous Key-Value Registry)
│   ├── gemini_api_key (User Google Gemini API Key)
│   ├── azure_speech_key & azure_speech_region (Azure TTS credentials)
│   ├── mgr_custom_theme_config (Theme ID & custom hex overrides)
│   ├── characters_read_heatmap (Record<string, number>)
│   └── reading_speed_history (Array of ReadingSpeedRecord)
└── 4. Multi-Device State Hydration (.json) & Anki Export (.tsv)
```

---

## 2. IndexedDB Stores & Schemas

### 2.1 Spaced Repetition Store (`MandarinGradedReaderSRS`)
- **Store Name:** `flashcards`
- **Key Path:** `character` (string)
- **Record Contract (`Flashcard`):**
```typescript
export interface Flashcard {
  character: string;        // Primary key (e.g. "猫")
  pinyin: string;           // Tone marked Pinyin
  definition: string;       // English meaning
  nextReviewDate: number;   // Timestamp in ms
  interval: number;         // Current interval in days
  easeFactor: number;       // Multiplier (defaults to 2.5)
  hsk_level?: string;       // HSK level string
  lastReviewed?: number;    // Timestamp in ms
}
```

### 2.2 Story Library Store (`MandarinGradedReaderLibrary`)
- **Store Name:** `stories`
- **Key Path:** `id` (string uuid)
- **Record Contract (`SavedStory`):**
```typescript
export interface SavedStory {
  id: string;
  title: string;
  text: string;
  hskLevel: string;
  timestamp: number;
}
```

### 2.3 Audio Blobs Cache Store (`MandarinAudioCache`)
- **Store Name:** `audio_blobs`
- **Key Path:** `hash` (SHA-256 string)
- **Record Contract:** `{ hash: string, blob: Blob, timestamp: number, lastAccessed: number }`
- **Eviction:** LRU pruning caps cache at 300 items.

### 2.4 Pitch Curve Store (`MandarinAudioPitchCache`)
- **Store Name:** `pitch_curves`
- **Key Path:** `key` (string: `${char}_${tone}`)
- **Record Contract:** `{ key: string, pitchValues: number[], sampleRate: number, timestamp: number }`

---

## 3. SuperMemo-2 (SM-2) Spaced Repetition Algorithm

When grading a review card with response quality $q \in \{1, 2, 3, 4\}$ (Fail, Hard, Good, Easy):

1. **Repetition Failure ($q < 2$):**
   $$I' = 1 \text{ day}$$
2. **Repetition Success ($q \ge 2$):**
   $$I' = \begin{cases} 
   1 \text{ day} & \text{if } I = 0 \\ 
   6 \text{ days} & \text{if } I = 1 \\ 
   \text{round}(I \cdot EF) & \text{if } I > 1 
   \end{cases}$$
3. **Ease Factor (EF) Adjustment:**
   $$EF' = EF + (0.1 - (5 - q) \cdot (0.08 + (5 - q) \cdot 0.02))$$
   $$\text{Subject to } EF' \ge 1.3$$
4. **Next Review Timestamp:**
   $$\text{nextReviewDate} = \text{Date.now}() + I' \cdot 86,400,000 \text{ ms}$$

---

## 4. Multi-Device State Hydration Schema (`src/services/stateHydration.ts`)

For exporting and importing data bundles across browsers:
```typescript
export interface StateHydrationBundle {
  version: number;
  timestamp: number;
  metadata: {
    client: string;
    totalCards: number;
    totalStories: number;
  };
  srsCards: Flashcard[];
  savedStories: SavedStory[];
  dictionaryOverrides: Record<string, { pinyin: string; definition: string }>;
  readingHeatmap: Record<string, number>;
  userPreferences: {
    themeId?: string;
    hskLevel?: string;
    showPinyin?: boolean;
    hidePinyinLevel?: number;
    ttsSpeed?: number;
  };
}
```

---

## 5. Anki TSV Flashcard Export Contract (`src/services/ankiExport.ts`)

Exports local flashcards into an Anki-compatible tab-delimited text deck:
- **Header:**
  ```tsv
  #separator:tab
  #html:true
  #tags column:5
  #columns:Character	Pinyin	Definition	IntervalDays	Tags
  ```
- **Row format:**
  ```tsv
  朋友	péngyou	friend	6	HSK_1
  咖啡	kāfēi	coffee	1	HSK_2
  ```
