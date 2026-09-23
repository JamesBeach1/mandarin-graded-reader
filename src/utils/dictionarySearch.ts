import type { HanziItem } from '../types/HanziItem';

export interface SearchMatch {
  item: HanziItem;
  score: number;
}

/**
 * Strips tone diacritics from pinyin to allow toneless search (e.g. "gou" matches "gǒu").
 */
export function stripDiacritics(str: string): string {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

/**
 * Searches and ranks dictionary entries by relevance:
 * 1. Exact Hanzi match
 * 2. Exact toneless Pinyin match
 * 3. Hanzi starts with query
 * 4. Toneless Pinyin starts with query
 * 5. Hanzi contains query
 * 6. Toneless Pinyin contains query
 * 7. Definition exact word match (word boundary)
 * 8. Definition contains query substring
 */
export function searchDictionary(
  query: string,
  hanziData: HanziItem[],
  vocabData: HanziItem[],
  overridesMap: Record<string, { pinyin: string; definition: string }> = {},
  limit: number = 25
): HanziItem[] {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.toLowerCase().trim();
  const tonelessQuery = stripDiacritics(cleanQuery);
  const scored: SearchMatch[] = [];

  const evaluateItem = (item: HanziItem) => {
    const char = item.character || '';
    const pinyin = (overridesMap[char]?.pinyin || item.pinyin || '').toLowerCase();
    const tonelessPinyin = stripDiacritics(pinyin);
    const def = (overridesMap[char]?.definition || item.definition || '').toLowerCase();

    // 1. Exact Hanzi match
    if (char === cleanQuery) {
      scored.push({ item, score: 1 });
      return;
    }
    // 2. Exact toneless Pinyin match (e.g. "gou" matches "gǒu")
    if (tonelessPinyin === tonelessQuery) {
      scored.push({ item, score: 2 });
      return;
    }
    // 3. Hanzi starts with query
    if (char.startsWith(cleanQuery)) {
      scored.push({ item, score: 3 });
      return;
    }
    // 4. Toneless Pinyin starts with query (e.g. "ni" matches "nǐhǎo")
    if (tonelessPinyin.startsWith(tonelessQuery)) {
      scored.push({ item, score: 4 });
      return;
    }
    // 5. Hanzi contains query
    if (char.includes(cleanQuery)) {
      scored.push({ item, score: 5 });
      return;
    }
    // 6. Toneless Pinyin contains query
    if (tonelessPinyin.includes(tonelessQuery)) {
      scored.push({ item, score: 6 });
      return;
    }
    // 7. Definition exact word match
    const wordRegex = new RegExp(`\\b${cleanQuery}\\b`, 'i');
    if (wordRegex.test(def)) {
      scored.push({ item, score: 7 });
      return;
    }
    // 8. Definition contains query substring
    if (def.includes(cleanQuery)) {
      scored.push({ item, score: 8 });
      return;
    }
  };

  for (const item of vocabData) {
    evaluateItem(item);
  }
  for (const item of hanziData) {
    evaluateItem(item);
  }

  scored.sort((a, b) => a.score - b.score);

  const seenChars = new Set<string>();
  const results: HanziItem[] = [];

  for (const match of scored) {
    if (!seenChars.has(match.item.character)) {
      seenChars.add(match.item.character);
      results.push(match.item);
      if (results.length >= limit) break;
    }
  }

  return results;
}
