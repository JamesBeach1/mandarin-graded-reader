import type { HanziItem } from '../types/HanziItem';
import { getChengyu } from './chengyuDatabase';
import { CompoundDictionaryService } from '../services/compoundDictionary';

const hanziMapCache = new WeakMap<HanziItem[], Map<string, HanziItem>>();
const vocabMapCache = new WeakMap<HanziItem[], Map<string, HanziItem>>();

function getMapForArray(arr: HanziItem[], cache: WeakMap<HanziItem[], Map<string, HanziItem>>): Map<string, HanziItem> {
  let map = cache.get(arr);
  if (!map) {
    map = new Map();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      if (item && item.character && !map.has(item.character)) {
        map.set(item.character, item);
      }
    }
    cache.set(arr, map);
  }
  return map;
}

export function tokenizeStory(
  text: string,
  hanziData: HanziItem[],
  vocabData: HanziItem[],
  customOverrides?: Record<string, { pinyin: string; definition: string }>
): HanziItem[] {
  const isChinese = (char: string) => /[\u4E00-\u9FFF]/.test(char);
  const hanziMap = getMapForArray(hanziData, hanziMapCache);
  const vocabMap = getMapForArray(vocabData, vocabMapCache);

  // Check if Intl.Segmenter is supported
  if (typeof Intl === 'undefined' || !Intl.Segmenter) {
    const result: HanziItem[] = [];
    text.split('').forEach((char) => {
      if (isChinese(char)) {
        if (customOverrides && customOverrides[char]) {
          result.push({
            frequency_rank: '',
            character: char,
            pinyin: customOverrides[char].pinyin,
            definition: customOverrides[char].definition,
            radical: '',
            radical_code: '',
            stroke_count: '',
            hsk_level: 'Custom',
            general_standard_num: '',
            isNonChinese: false,
          });
        } else {
          const entry = hanziMap.get(char);
          result.push(
            entry
              ? { ...entry, isNonChinese: false }
              : {
                  frequency_rank: '',
                  character: char,
                  pinyin: 'Unknown',
                  definition: 'Definition not found',
                  radical: '',
                  radical_code: '',
                  stroke_count: '',
                  hsk_level: 'N/A',
                  general_standard_num: '',
                  isNonChinese: false,
                }
          );
        }
      } else {
        result.push({
          frequency_rank: '',
          character: char,
          pinyin: '',
          definition: '',
          radical: '',
          radical_code: '',
          stroke_count: '',
          hsk_level: '',
          general_standard_num: '',
          isNonChinese: true,
        });
      }
    });
    return result;
  }

  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  const rawSegments = Array.from(segmenter.segment(text));
  const result: HanziItem[] = [];

  // Group raw segments, checking for 4-character Chengyu compounds across segment boundaries
  let segIdx = 0;
  while (segIdx < rawSegments.length) {
    // Check if 4 characters starting at this position match a known Chengyu
    let combined4 = '';
    let lookahead = segIdx;
    while (lookahead < rawSegments.length && combined4.length < 4) {
      if (isChinese(rawSegments[lookahead].segment)) {
        combined4 += rawSegments[lookahead].segment;
      } else {
        break;
      }
      lookahead++;
    }

    if (combined4.length === 4) {
      const chengyu = getChengyu(combined4);
      if (chengyu) {
        result.push({
          frequency_rank: '',
          character: chengyu.idiom,
          pinyin: chengyu.pinyin,
          definition: chengyu.figurativeMeaning,
          radical: '',
          radical_code: '',
          stroke_count: '4',
          hsk_level: chengyu.hskLevel || '5',
          general_standard_num: '',
          isNonChinese: false,
          isChengyu: true,
          chengyuLiteral: chengyu.literalTranslation,
          chengyuAllusion: chengyu.allusion
        });
        segIdx = lookahead;
        continue;
      }
    }

    const seg = rawSegments[segIdx];
    const word = seg.segment;
    segIdx++;

    if (isChinese(word)) {
      // 0. Check custom overrides first
      if (customOverrides && customOverrides[word]) {
        result.push({
          frequency_rank: '',
          character: word,
          pinyin: customOverrides[word].pinyin,
          definition: customOverrides[word].definition,
          radical: '',
          radical_code: '',
          stroke_count: '',
          hsk_level: 'Custom',
          general_standard_num: '',
          isNonChinese: false,
        });
      } else {
        // 0.5 Check if word itself is a known Chengyu
        const chengyu = getChengyu(word);
        if (chengyu) {
          result.push({
            frequency_rank: '',
            character: chengyu.idiom,
            pinyin: chengyu.pinyin,
            definition: chengyu.figurativeMeaning,
            radical: '',
            radical_code: '',
            stroke_count: '4',
            hsk_level: chengyu.hskLevel || '5',
            general_standard_num: '',
            isNonChinese: false,
            isChengyu: true,
            chengyuLiteral: chengyu.literalTranslation,
            chengyuAllusion: chengyu.allusion
          });
          continue;
        }

        // 1. Check if word itself exists in vocabData
        let foundWord = vocabMap.get(word);

        // If not in vocabData, check if it's in single-character DB
        if (!foundWord && word.length === 1) {
          foundWord = hanziMap.get(word);
        }

        if (foundWord) {
          result.push({
            ...foundWord,
            isNonChinese: false,
            isCompound: word.length > 1,
            constituentChars: word.length > 1 ? CompoundDictionaryService.decomposeCompound(word, hanziMap) : undefined
          });
        } else {
          // 1.5 Check multi-character compound lexicon and cache
          const compound = word.length > 1 ? CompoundDictionaryService.lookupSync(word, hanziMap, vocabMap, customOverrides) : null;
          if (compound) {
            result.push({
              frequency_rank: '',
              character: compound.word,
              pinyin: compound.pinyin,
              definition: compound.definition,
              radical: '',
              radical_code: '',
              stroke_count: String(compound.word.length),
              hsk_level: compound.hskLevel || 'Custom',
              general_standard_num: '',
              isNonChinese: false,
              isCompound: true,
              constituentChars: compound.constituentChars
            });
          } else {
            // 2. Fall back to character-by-character tokenization
            word.split('').forEach((char) => {
            if (isChinese(char)) {
              if (customOverrides && customOverrides[char]) {
                result.push({
                  frequency_rank: '',
                  character: char,
                  pinyin: customOverrides[char].pinyin,
                  definition: customOverrides[char].definition,
                  radical: '',
                  radical_code: '',
                  stroke_count: '',
                  hsk_level: 'Custom',
                  general_standard_num: '',
                  isNonChinese: false,
                });
              } else {
                const charEntry = hanziMap.get(char);
                if (charEntry) {
                  result.push({
                    ...charEntry,
                    isNonChinese: false,
                  });
                } else {
                  result.push({
                    frequency_rank: '',
                    character: char,
                    pinyin: 'Unknown',
                    definition: 'Definition not found',
                    radical: '',
                    radical_code: '',
                    stroke_count: '',
                    hsk_level: 'N/A',
                    general_standard_num: '',
                    isNonChinese: false,
                  });
                }
              }
            } else {
              result.push({
                frequency_rank: '',
                character: char,
                pinyin: '',
                definition: '',
                radical: '',
                radical_code: '',
                stroke_count: '',
                hsk_level: '',
                general_standard_num: '',
                isNonChinese: true,
              });
            }
          });
          }
        }
      }
    } else {
      // Punctuation, spacing, etc.
      result.push({
        frequency_rank: '',
        character: word,
        pinyin: '',
        definition: '',
        radical: '',
        radical_code: '',
        stroke_count: '',
        hsk_level: '',
        general_standard_num: '',
        isNonChinese: true,
      });
    }
  }

  return result;
}
