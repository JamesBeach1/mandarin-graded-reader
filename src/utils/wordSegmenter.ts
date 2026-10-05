/**
 * Moyun (墨韵) High-Performance Chinese Word Segmenter
 * Groups Chinese characters into coherent semantic words using Intl.Segmenter,
 * Chengyu idioms, and the compound dictionary service.
 */

import type { HanziItem } from '../types/HanziItem';
import { getChengyu } from './chengyuDatabase';
import {
  CompoundDictionaryService,
  BUILTIN_COMPOUND_LEXICON,
  type CompoundWordEntry,
  type ConstituentCharacterInfo
} from '../services/compoundDictionary';

export interface WordToken {
  text: string;
  pinyin: string;
  definition: string;
  isHanzi: boolean;
  isNonChinese: boolean;
  isCompound: boolean;
  isChengyu?: boolean;
  hskLevel?: string;
  constituentChars?: ConstituentCharacterInfo[];
}

const isChineseChar = (char: string) => /[\u4E00-\u9FFF]/.test(char);

/**
 * Segments Chinese text into coherent linguistic words with Pinyin and definitions.
 * Synchronous and ultra-fast (0ms overhead using browser native Intl.Segmenter).
 */
export function segmentSentenceIntoTokens(
  sentenceText: string,
  hanziData: HanziItem[] = [],
  vocabData: HanziItem[] = [],
  overridesMap: Record<string, { pinyin: string; definition: string }> = {}
): WordToken[] {
  if (!sentenceText) return [];

  // Build quick map caches
  const hanziMap = new Map<string, HanziItem>();
  for (let i = 0; i < hanziData.length; i++) {
    const item = hanziData[i];
    if (item && item.character && !hanziMap.has(item.character)) {
      hanziMap.set(item.character, item);
    }
  }

  const vocabMap = new Map<string, HanziItem>();
  for (let i = 0; i < vocabData.length; i++) {
    const item = vocabData[i];
    if (item && item.character && !vocabMap.has(item.character)) {
      vocabMap.set(item.character, item);
    }
  }

  // Check Intl.Segmenter support
  if (typeof Intl === 'undefined' || !Intl.Segmenter) {
    return fallbackGreedySegment(sentenceText, hanziMap, vocabMap, overridesMap);
  }

  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  const rawSegments = Array.from(segmenter.segment(sentenceText));
  const tokens: WordToken[] = [];

  let i = 0;
  while (i < rawSegments.length) {
    // 1. Check for 4-character Chengyu spanning segment boundaries
    let combined4 = '';
    let lookahead = i;
    while (lookahead < rawSegments.length && combined4.length < 4) {
      const segText = rawSegments[lookahead].segment;
      if (Array.from(segText).every(isChineseChar)) {
        combined4 += segText;
      } else {
        break;
      }
      lookahead++;
    }

    if (combined4.length === 4) {
      const chengyu = getChengyu(combined4);
      if (chengyu) {
        tokens.push({
          text: chengyu.idiom,
          pinyin: chengyu.pinyin,
          definition: chengyu.figurativeMeaning,
          isHanzi: true,
          isNonChinese: false,
          isCompound: true,
          isChengyu: true,
          hskLevel: chengyu.hskLevel || '5',
          constituentChars: CompoundDictionaryService.decomposeCompound(chengyu.idiom, hanziMap)
        });
        i = lookahead;
        continue;
      }
    }

    const seg = rawSegments[i];
    const word = seg.segment;
    i++;

    const isChinese = Array.from(word).some(isChineseChar);

    if (!isChinese) {
      // Punctuation, whitespace, English or digits
      tokens.push({
        text: word,
        pinyin: '',
        definition: '',
        isHanzi: false,
        isNonChinese: true,
        isCompound: false
      });
      continue;
    }

    // Single character lookup
    if (word.length === 1) {
      const override = overridesMap[word];
      const charEntry = hanziMap.get(word);

      tokens.push({
        text: word,
        pinyin: override?.pinyin || charEntry?.pinyin || '',
        definition: override?.definition || charEntry?.definition || 'Definition not found',
        isHanzi: true,
        isNonChinese: false,
        isCompound: false,
        hskLevel: override ? 'Custom' : charEntry?.hsk_level || 'N/A'
      });
      continue;
    }

    // Multi-character compound word lookup
    const compound = CompoundDictionaryService.lookupSync(word, hanziMap, vocabMap, overridesMap);
    if (compound) {
      tokens.push({
        text: compound.word,
        pinyin: compound.pinyin,
        definition: compound.definition,
        isHanzi: true,
        isNonChinese: false,
        isCompound: true,
        hskLevel: compound.hskLevel,
        constituentChars: compound.constituentChars
      });
    } else {
      // Synthesize compound pinyin from constituent characters
      const chars = Array.from(word);
      const pinyin = chars.map(c => overridesMap[c]?.pinyin || hanziMap.get(c)?.pinyin || '').join(' ').trim();
      const def = chars.map(c => `${c} (${overridesMap[c]?.definition || hanziMap.get(c)?.definition || ''})`).join(' + ');

      tokens.push({
        text: word,
        pinyin,
        definition: def || 'Compound word',
        isHanzi: true,
        isNonChinese: false,
        isCompound: true,
        constituentChars: CompoundDictionaryService.decomposeCompound(word, hanziMap)
      });
    }
  }

  return tokens;
}

/**
 * Fallback greedy segmentation if Intl.Segmenter is unavailable
 */
function fallbackGreedySegment(
  text: string,
  hanziMap: Map<string, HanziItem>,
  vocabMap: Map<string, HanziItem>,
  overridesMap: Record<string, { pinyin: string; definition: string }>
): WordToken[] {
  const tokens: WordToken[] = [];
  const chars = Array.from(text);
  let idx = 0;

  while (idx < chars.length) {
    const char = chars[idx];
    if (!isChineseChar(char)) {
      tokens.push({
        text: char,
        pinyin: '',
        definition: '',
        isHanzi: false,
        isNonChinese: true,
        isCompound: false
      });
      idx++;
      continue;
    }

    // Try matches of length 4, 3, 2
    let matched = false;
    for (let len = 4; len >= 2; len--) {
      if (idx + len <= chars.length) {
        const candidate = chars.slice(idx, idx + len).join('');
        if (candidate.length === 4) {
          const cy = getChengyu(candidate);
          if (cy) {
            tokens.push({
              text: cy.idiom,
              pinyin: cy.pinyin,
              definition: cy.figurativeMeaning,
              isHanzi: true,
              isNonChinese: false,
              isCompound: true,
              isChengyu: true,
              hskLevel: cy.hskLevel || '5',
              constituentChars: CompoundDictionaryService.decomposeCompound(cy.idiom, hanziMap)
            });
            idx += len;
            matched = true;
            break;
          }
        }

        const compound = CompoundDictionaryService.lookupSync(candidate, hanziMap, vocabMap, overridesMap);
        if (compound) {
          tokens.push({
            text: compound.word,
            pinyin: compound.pinyin,
            definition: compound.definition,
            isHanzi: true,
            isNonChinese: false,
            isCompound: true,
            hskLevel: compound.hskLevel,
            constituentChars: compound.constituentChars
          });
          idx += len;
          matched = true;
          break;
        }
      }
    }

    if (!matched) {
      const override = overridesMap[char];
      const charEntry = hanziMap.get(char);
      tokens.push({
        text: char,
        pinyin: override?.pinyin || charEntry?.pinyin || '',
        definition: override?.definition || charEntry?.definition || 'Definition not found',
        isHanzi: true,
        isNonChinese: false,
        isCompound: false,
        hskLevel: override ? 'Custom' : charEntry?.hsk_level || 'N/A'
      });
      idx++;
    }
  }

  return tokens;
}
