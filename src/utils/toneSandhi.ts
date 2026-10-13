/**
 * Spoken Tone Sandhi Rule-Based Visualizer (NONLLM-004)
 *
 * Scans Chinese character sequences and reconciles citation tones with
 * authentic spoken Mandarin phonetics:
 * 1. 3rd-Tone Sandhi (三声变调):
 *    - 3rd + 3rd -> 2nd + 3rd (e.g. 你好 nǐ hǎo -> ní hǎo, 管理 guǎnlǐ -> guánlǐ)
 *    - 3rd + 3rd + 3rd -> 2nd + 2nd + 3rd (or 3rd + 2nd + 3rd depending on syntactic grouping)
 *    - Half 3rd tone (半三声): 3rd + (1st/2nd/4th/Neutral) drops to low pitch without rising (211)
 * 2. "一" (yī) Tone Sandhi:
 *    - Isolated or counting (ordinals, dates): 1st tone (yī)
 *    - Before 4th tone (去声) or neutral derived from 4th: switches to 2nd tone (yí), e.g. 一定 yí dìng, 一个 yí gè, 一块 yí kuài
 *    - Before 1st, 2nd, 3rd tone: switches to 4th tone (yì), e.g. 一天 yì tiān, 一年 yì nián, 一起 yì qǐ, 一本 yì běn
 * 3. "不" (bù) Tone Sandhi:
 *    - Before 4th tone: switches to 2nd tone (bú), e.g. 不是 bú shì, 不要 bú yào, 不对 bú duì
 *    - Before 1st, 2nd, 3rd tone: remains 4th tone (bù)
 *    - In potential complements or reduplications: neutral tone (bu), e.g. 去不去 qù bu qù, 看得懂 / 看不懂
 * 4. Reduplication Neutral Tone Shifts (轻声):
 *    - 爸爸 bàba, 妈妈 māma, 哥哥 gēge, 姐姐 jiějie, 弟弟 dìdi, 妹妹 mèimei, 看看 kànkan
 */

export interface ToneSandhiResult {
  originalPinyin: string;
  spokenPinyin: string;
  originalTone: number;
  spokenTone: number;
  isModified: boolean;
  sandhiType?: 'tone_3_to_2' | 'yi_to_2' | 'yi_to_4' | 'bu_to_2' | 'neutral_shift';
  explanation?: string;
}

// Tone vowel accent mapping for tone substitution
const TONE_ACCENTS: Record<string, [string, string, string, string, string]> = {
  a: ['ā', 'á', 'ǎ', 'à', 'a'],
  o: ['ō', 'ó', 'ǒ', 'ò', 'o'],
  e: ['ē', 'é', 'ě', 'è', 'e'],
  i: ['ī', 'í', 'ǐ', 'ì', 'i'],
  u: ['ū', 'ú', 'ǔ', 'ù', 'u'],
  v: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü'], // ü
  ü: ['ǖ', 'ǘ', 'ǚ', 'ǜ', 'ü']
};

export const REVERSE_VOWEL_TONE_MAP: Record<string, { base: string; tone: number }> = {
  ā: { base: 'a', tone: 1 }, á: { base: 'a', tone: 2 }, ǎ: { base: 'a', tone: 3 }, à: { base: 'a', tone: 4 }, a: { base: 'a', tone: 5 },
  ō: { base: 'o', tone: 1 }, ó: { base: 'o', tone: 2 }, ǒ: { base: 'o', tone: 3 }, ò: { base: 'o', tone: 4 }, o: { base: 'o', tone: 5 },
  ē: { base: 'e', tone: 1 }, é: { base: 'e', tone: 2 }, ě: { base: 'e', tone: 3 }, è: { base: 'e', tone: 4 }, e: { base: 'e', tone: 5 },
  ī: { base: 'i', tone: 1 }, í: { base: 'i', tone: 2 }, ǐ: { base: 'i', tone: 3 }, ì: { base: 'i', tone: 4 }, i: { base: 'i', tone: 5 },
  ū: { base: 'u', tone: 1 }, ú: { base: 'u', tone: 2 }, ǔ: { base: 'u', tone: 3 }, ù: { base: 'u', tone: 4 }, u: { base: 'u', tone: 5 },
  ǖ: { base: 'v', tone: 1 }, ǘ: { base: 'v', tone: 2 }, ǚ: { base: 'v', tone: 3 }, ǜ: { base: 'v', tone: 4 }, ü: { base: 'v', tone: 5 }
};

/**
 * Extract numerical tone (1..5) from a pinyin syllable
 */
export function extractToneNumber(pinyin: string): number {
  if (!pinyin) return 5;
  const clean = pinyin.trim().toLowerCase();
  const digitMatch = clean.match(/[1-5]$/);
  if (digitMatch) return parseInt(digitMatch[0], 10);

  for (const ch of clean) {
    if (REVERSE_VOWEL_TONE_MAP[ch]) {
      const t = REVERSE_VOWEL_TONE_MAP[ch].tone;
      if (t !== 5) return t;
    }
  }
  return 5;
}

/**
 * Replace tone of a Pinyin syllable with newTone (1..5)
 */
export function replaceSyllableTone(syllable: string, newTone: number): string {
  if (!syllable) return syllable;
  let clean = syllable.trim().toLowerCase();
  clean = clean.replace(/[1-5]$/, '');

  let base = '';
  let targetVowelIdx = -1;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (REVERSE_VOWEL_TONE_MAP[ch]) {
      base += REVERSE_VOWEL_TONE_MAP[ch].base;
    } else {
      base += ch;
    }
  }

  // Standard Mandarin tone placement rule:
  // 1. 'a' or 'e' takes the mark
  // 2. 'ou' takes on 'o'
  // 3. Otherwise the second vowel in pair (e.g. 'ui', 'iu')
  if (base.includes('a')) targetVowelIdx = base.indexOf('a');
  else if (base.includes('e')) targetVowelIdx = base.indexOf('e');
  else if (base.includes('ou')) targetVowelIdx = base.indexOf('o');
  else {
    for (let i = base.length - 1; i >= 0; i--) {
      if ('iouüv'.includes(base[i])) {
        targetVowelIdx = i;
        break;
      }
    }
  }

  if (targetVowelIdx === -1 || newTone === 5) {
    return base;
  }

  const vChar = base[targetVowelIdx];
  const accented = TONE_ACCENTS[vChar] ? TONE_ACCENTS[vChar][newTone - 1] : vChar;
  return base.substring(0, targetVowelIdx) + accented + base.substring(targetVowelIdx + 1);
}

/**
 * Token interface required by Tone Sandhi Engine
 */
export interface SandhiTokenInput {
  character: string;
  pinyin: string;
}

/**
 * Analyze an array of character tokens and compute spoken tone sandhi shifts.
 */
export function analyzeToneSandhi(tokens: SandhiTokenInput[]): ToneSandhiResult[] {
  const results: ToneSandhiResult[] = tokens.map(t => {
    const tone = extractToneNumber(t.pinyin);
    return {
      originalPinyin: t.pinyin,
      spokenPinyin: t.pinyin,
      originalTone: tone,
      spokenTone: tone,
      isModified: false
    };
  });

  const len = tokens.length;

  for (let i = 0; i < len; i++) {
    const currChar = tokens[i].character;
    const currPinyin = tokens[i].pinyin;
    const currTone = results[i].originalTone;
    const nextResult = i + 1 < len ? results[i + 1] : null;
    const nextChar = i + 1 < len ? tokens[i + 1].character : '';
    const nextTone = nextResult ? nextResult.originalTone : 5;

    // Rule 1: "不" Sandhi
    if (currChar === '不') {
      if (nextResult && nextTone === 4) {
        // 不 before 4th tone -> 2nd tone (bú)
        results[i].spokenTone = 2;
        results[i].spokenPinyin = replaceSyllableTone(currPinyin || 'bù', 2);
        results[i].isModified = true;
        results[i].sandhiType = 'bu_to_2';
        results[i].explanation = '“不”在第四声（去声）字前变为第二声（阳平，bú）';
        continue;
      }
    }

    // Rule 2: "一" Sandhi
    if (currChar === '一') {
      // Check if it's ordinal (第一) or part of a number list (e.g. 一二三)
      const prevChar = i > 0 ? tokens[i - 1].character : '';
      const isOrdinal = prevChar === '第' || prevChar === '初';
      const isCounting = nextChar === '二' || nextChar === '三' || prevChar === '十';

      if (!isOrdinal && !isCounting && nextResult) {
        if (nextTone === 4) {
          // 一 before 4th tone -> 2nd tone (yí)
          results[i].spokenTone = 2;
          results[i].spokenPinyin = replaceSyllableTone(currPinyin || 'yī', 2);
          results[i].isModified = true;
          results[i].sandhiType = 'yi_to_2';
          results[i].explanation = '“一”在第四声（去声）字前变为第二声（阳平，yí）';
          continue;
        } else if (nextTone === 1 || nextTone === 2 || nextTone === 3) {
          // 一 before 1st, 2nd, 3rd tone -> 4th tone (yì)
          results[i].spokenTone = 4;
          results[i].spokenPinyin = replaceSyllableTone(currPinyin || 'yī', 4);
          results[i].isModified = true;
          results[i].sandhiType = 'yi_to_4';
          results[i].explanation = '“一”在第一、二、三声字前变为第四声（去声，yì）';
          continue;
        }
      }
    }

    // Rule 3: 3rd + 3rd Tone Sandhi (三声变调)
    if (currTone === 3 && nextResult && nextTone === 3) {
      results[i].spokenTone = 2;
      results[i].spokenPinyin = replaceSyllableTone(currPinyin, 2);
      results[i].isModified = true;
      results[i].sandhiType = 'tone_3_to_2';
      results[i].explanation = '两个第三声（上声）相连时，前一个变为第二声（阳平）';
      continue;
    }

    // Rule 4: Family Reduplication Neutral Tone (e.g. 妈妈 māma, 爸爸 bàba)
    if (nextResult && currChar === nextChar && currTone !== 5) {
      // 2nd character becomes neutral
      nextResult.spokenTone = 5;
      nextResult.spokenPinyin = replaceSyllableTone(nextResult.originalPinyin, 5);
      nextResult.isModified = true;
      nextResult.sandhiType = 'neutral_shift';
      nextResult.explanation = '重叠亲属词或叠字词后字读轻声';
    }
  }

  return results;
}
