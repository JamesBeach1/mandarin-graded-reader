import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { analyzeLexicalDensity, type LexicalAnalysisReport } from '../../src/utils/lexicalDensity';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runLexicalDensityAcceptanceTests() {
  await feature('FT-LEX', 'Lexical Density, Type-Token Ratio & HSK Difficulty Estimation', async () => {
    const makeToken = (char: string, hsk: string, isNonChinese = false): HanziItem => ({
      character: char,
      pinyin: 'py',
      definition: 'def',
      hsk_level: hsk,
      frequency_rank: '1',
      radical: '',
      radical_code: '',
      stroke_count: '1',
      general_standard_num: '',
      isNonChinese
    });

    await scenario('Calculate Type-Token Ratio (TTR) and character counts correctly', async () => {
      let report: LexicalAnalysisReport | null = null;

      await given('a list of 10 Chinese character tokens containing 5 unique characters', () => {
        const tokens: HanziItem[] = [
          makeToken('我', '1'),
          makeToken('你', '1'),
          makeToken('他', '1'),
          makeToken('好', '1'),
          makeToken('书', '1'),
          makeToken('我', '1'),
          makeToken('你', '1'),
          makeToken('他', '1'),
          makeToken('好', '1'),
          makeToken('书', '1')
        ];

        report = analyzeLexicalDensity(tokens);
      });

      await then('totalCharacters equals 10', () => {
        expect(report?.totalCharacters).toBe(10);
      });

      await and('uniqueCharacters equals 5', () => {
        expect(report?.uniqueCharacters).toBe(5);
      });

      await and('typeTokenRatio equals 0.5', () => {
        expect(report?.typeTokenRatio).toBe(0.5);
        expect(report?.lexicalDensityPercentage).toBe(50);
      });
    });

    await scenario('Compute weighted HSK distribution and difficulty level', async () => {
      let report: LexicalAnalysisReport | null = null;

      await given('a text with three HSK 1 characters and one HSK 5 character', () => {
        const tokens: HanziItem[] = [
          makeToken('你', '1'),
          makeToken('好', '1'),
          makeToken('吗', '1'),
          makeToken('骤', '5')
        ];
        report = analyzeLexicalDensity(tokens);
      });

      await then('the HSK distribution calculates percentages', () => {
        expect(report?.hskDistribution['1']).toBe(75);
        expect(report?.hskDistribution['5']).toBe(25);
      });

      await and('estimated HSK level rounds to the weighted average', () => {
        // (1*3 + 5*1) / 4 = 8 / 4 = 2
        expect(report?.estimatedHSKLevel).toBe(2);
      });
    });

    await scenario('Exclude non-Chinese tokens and punctuation from character counts', async () => {
      let report: LexicalAnalysisReport | null = null;

      await given('a mixture of Chinese and non-Chinese tokens', () => {
        const tokens: HanziItem[] = [
          makeToken('书', '1'),
          makeToken('，', '', true),
          makeToken(' ', '', true),
          makeToken('A', '', true)
        ];
        report = analyzeLexicalDensity(tokens);
      });

      await then('only the Chinese character is counted', () => {
        expect(report?.totalCharacters).toBe(1);
        expect(report?.uniqueCharacters).toBe(1);
        expect(report?.typeTokenRatio).toBe(1);
      });
    });
  });
}
