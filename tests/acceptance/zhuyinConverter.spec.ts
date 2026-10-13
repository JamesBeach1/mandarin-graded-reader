import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { pinyinToZhuyin, pinyinSyllableToZhuyin } from '../../src/utils/zhuyinConverter';

export async function runZhuyinConverterAcceptanceTests() {
  await feature('FT-TRC-002', 'Zhuyin / Bopomofo (注音符号) Phonetic Conversion', async () => {
    await scenario('Convert individual Pinyin syllables with 5 tones to Bopomofo', async () => {
      await given('Pinyin syllables covering tones 1 through 5: mā, má, mǎ, mà, ma', () => {});

      await then('Tone 1 returns unmarked syllable root', () => {
        expect(pinyinSyllableToZhuyin('mā')).toBe('ㄇㄚ');
      });

      await and('Tone 2 returns rising tone mark ˊ', () => {
        expect(pinyinSyllableToZhuyin('má')).toBe('ㄇㄚˊ');
      });

      await and('Tone 3 returns dipping tone mark ˇ', () => {
        expect(pinyinSyllableToZhuyin('mǎ')).toBe('ㄇㄚˇ');
      });

      await and('Tone 4 returns falling tone mark ˋ', () => {
        expect(pinyinSyllableToZhuyin('mà')).toBe('ㄇㄚˋ');
      });

      await and('Tone 5 (neutral tone) prefixes dot mark ˙', () => {
        expect(pinyinSyllableToZhuyin('ma')).toBe('˙ㄇㄚ');
      });
    });

    await scenario('Convert multi-syllable phrases with spacing and punctuation', async () => {
      let result = '';

      await given('a Pinyin sentence "nǐ hǎo, péngyou!"', () => {});

      await when('pinyinToZhuyin is executed', () => {
        result = pinyinToZhuyin('nǐ hǎo, péngyou!');
      });

      await then('all syllables convert to Zhuyin while punctuation is preserved', () => {
        expect(result).toBe('ㄋㄧˇ ㄏㄠˇ, ㄆㄥˊㄧㄡ˙!');
      });
    });

    await scenario('Gracefully handles edge cases and empty inputs', async () => {
      await then('empty or non-string inputs return empty strings', () => {
        expect(pinyinToZhuyin('')).toBe('');
        expect(pinyinToZhuyin(null as any)).toBe('');
      });

      await and('unknown foreign tokens are preserved without crashing', () => {
        expect(pinyinToZhuyin('hello 123')).toBe('hello 123');
      });
    });
  });
}
