import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { extractTargetVocabulary, type ExtractedVocabItem } from '../../src/utils/vocabExtractor';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runVocabExtractorAcceptanceTests() {
  await feature('FT-VOCAB', 'Target Vocabulary Extraction Above User Threshold', async () => {
    const makeToken = (char: string, hsk: string, isNonChinese = false): HanziItem => ({
      character: char,
      pinyin: `${char}_py`,
      definition: `${char}_def`,
      hsk_level: hsk,
      frequency_rank: '1',
      radical: '',
      radical_code: '',
      stroke_count: '1',
      general_standard_num: '',
      isNonChinese
    });

    await scenario('Filter out vocabulary within the user known HSK level', async () => {
      let results: ExtractedVocabItem[] = [];

      await given('tokens with HSK 1, 2, 4, and 5 and userKnownHskLevel = 2', () => {
        const tokens: HanziItem[] = [
          makeToken('你', '1'),
          makeToken('好', '2'),
          makeToken('复杂', '4'),
          makeToken('哲学', '5')
        ];
        results = extractTargetVocabulary(tokens, 2);
      });

      await then('only HSK 4 and HSK 5 tokens are extracted', () => {
        expect(results.length).toBe(2);
        const chars = results.map(r => r.character);
        expect(chars).toContain('复杂');
        expect(chars).toContain('哲学');
        expect(chars.includes('你')).toBeFalsy();
        expect(chars.includes('好')).toBeFalsy();
      });
    });

    await scenario('Aggregate duplicate occurrences and sort by frequency descending', async () => {
      let results: ExtractedVocabItem[] = [];

      await given('tokens where "科学" occurs 3 times and "艺术" occurs 1 time', () => {
        const tokens: HanziItem[] = [
          makeToken('科学', '4'),
          makeToken('科学', '4'),
          makeToken('科学', '4'),
          makeToken('艺术', '4')
        ];
        results = extractTargetVocabulary(tokens, 2);
      });

      await then('the higher frequency word is ranked first', () => {
        expect(results.length).toBe(2);
        expect(results[0].character).toBe('科学');
        expect(results[0].occurrenceCount).toBe(3);
        expect(results[1].character).toBe('艺术');
        expect(results[1].occurrenceCount).toBe(1);
      });
    });

    await scenario('Ignore punctuation and non-Chinese tokens', async () => {
      let results: ExtractedVocabItem[] = [];

      await given('non-Chinese tokens in the list', () => {
        const tokens: HanziItem[] = [
          makeToken('！', '', true),
          makeToken('test', '', true)
        ];
        results = extractTargetVocabulary(tokens, 2);
      });

      await then('extracted vocabulary list is completely empty', () => {
        expect(results.length).toBe(0);
      });
    });
  });
}
