/**
 * Tone Colorizer Utility (TRC-003)
 * Maps Mandarin tones (1 to 5) to distinct, high-contrast editorial visual mnemonics:
 * - Tone 1: High Flat (55) -> Coral Red (#e06c75)
 * - Tone 2: Rising (35)    -> Grass Green (#98c379)
 * - Tone 3: Dipping (214)  -> Golden Amber (#e5c07b)
 * - Tone 4: Falling (51)   -> Azure Blue (#61afef)
 * - Tone 5: Neutral        -> Muted Slate (#9ca3af)
 */

export type ToneColorMode = 'off' | 'pinyin' | 'both';

export const TONE_COLORS: Record<number, string> = {
  1: '#e06c75', // Tone 1: Red / Coral
  2: '#98c379', // Tone 2: Green
  3: '#e5c07b', // Tone 3: Golden Amber
  4: '#61afef', // Tone 4: Azure Blue
  5: '#9ca3af'  // Tone 5: Neutral Gray
};

export const TONE_NAMES: Record<number, string> = {
  1: '1st Tone (High Flat 阴平)',
  2: '2nd Tone (Rising 阳平)',
  3: '3rd Tone (Dipping 上声)',
  4: '4th Tone (Falling 去声)',
  5: 'Neutral Tone (轻声)'
};

/**
 * Extracts the tone number (1..5) from a Pinyin syllable.
 */
export function getToneNumber(pinyin: string): number {
  if (!pinyin || typeof pinyin !== 'string') return 5;
  const clean = pinyin.trim().toLowerCase();

  // Check numeric tone ending (e.g. hao3, ma5)
  const numMatch = clean.match(/[1-5]$/);
  if (numMatch) {
    return parseInt(numMatch[0], 10);
  }

  // Check 1st Tone diacritics (ā, ē, ī, ō, ū, ǖ)
  if (/[āēīōūǖ]/.test(clean)) return 1;

  // Check 2nd Tone diacritics (á, é, í, ó, ú, ǘ)
  if (/[áéíóúǘ]/.test(clean)) return 2;

  // Check 3rd Tone diacritics (ǎ, ě, ǐ, ǒ, ǔ, ǚ)
  if (/[ǎěǐǒǔǚ]/.test(clean)) return 3;

  // Check 4th Tone diacritics (à, è, ì, ò, ù, ǜ)
  if (/[àèìòùǜ]/.test(clean)) return 4;

  // No diacritics = neutral tone (5)
  return 5;
}

/**
 * Returns the hex color string for a given Pinyin syllable.
 */
export function getToneColor(pinyin: string): string {
  const tone = getToneNumber(pinyin);
  return TONE_COLORS[tone] || TONE_COLORS[5];
}
