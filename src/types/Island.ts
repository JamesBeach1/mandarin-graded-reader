export interface LanguageIsland {
  id: string;
  title: string;
  chineseTitle?: string;
  icon: string;
  category: 'daily' | 'work' | 'social' | 'opinions' | 'travel' | 'media' | 'custom';
  description: string;
  colorTheme?: string;
  isCustom?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type IslandMasteryLevel = 0 | 1 | 2 | 3 | 4; // 0: New, 1: Struggling, 2: Familiar, 3: Fluent, 4: Automatic

export interface IslandSentence {
  id: string;
  islandId: string;
  english: string;
  chinese: string;
  pinyin: string;
  notes?: string;
  hskLevel?: number;
  masteryLevel: IslandMasteryLevel;
  timesReviewed: number;
  struggleCount: number;
  lastReviewedAt?: number;
  userAudioBlob?: Blob; // For shadowing audio recording comparison
  createdAt: number;
}

export interface DailyIslandRoutine {
  date: string; // YYYY-MM-DD
  floodingMinutes: number;
  shadowingMinutes: number;
  recallMinutes: number;
  recallSentencesCount: number;
}

export interface TranscriptVocabItem {
  chinese: string;
  pinyin: string;
  english: string;
  hskLevel?: number;
  frequencyRank?: number;
  contextSentence?: string;
}

export interface TranscriptAnalysisResult {
  title: string;
  rawTranscript: string;
  extractedSentences: {
    english: string;
    chinese: string;
    pinyin: string;
    notes?: string;
  }[];
  keyVocabulary: TranscriptVocabItem[];
  estimatedReadinessPercent: number;
  summary: string;
}
