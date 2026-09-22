/**
 * Dynamic Vocabulary Extraction Utility
 * Extracts target vocabulary from ingested literature that exceeds the learner's known HSK level.
 */

import type { HanziItem } from '../types/HanziItem';

export interface ExtractedVocabItem {
  character: string;
  pinyin: string;
  definition: string;
  hsk_level: string;
  occurrenceCount: number;
}

export function extractTargetVocabulary(
  tokens: HanziItem[],
  userKnownHskLevel = 2
): ExtractedVocabItem[] {
  const vocabMap = new Map<string, ExtractedVocabItem>();

  tokens.forEach(token => {
    if (token.isNonChinese || !token.character) return;

    const tokenLevel = parseInt(token.hsk_level, 10);
    const isExceeding = isNaN(tokenLevel) || tokenLevel > userKnownHskLevel;

    if (isExceeding) {
      const existing = vocabMap.get(token.character);
      if (existing) {
        existing.occurrenceCount += 1;
      } else {
        vocabMap.set(token.character, {
          character: token.character,
          pinyin: token.pinyin || 'Unknown',
          definition: token.definition || 'Definition not found',
          hsk_level: token.hsk_level || 'Custom',
          occurrenceCount: 1
        });
      }
    }
  });

  // Sort by occurrence frequency descending
  return Array.from(vocabMap.values()).sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}
