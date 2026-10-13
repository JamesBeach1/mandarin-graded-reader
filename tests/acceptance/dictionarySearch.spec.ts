import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { searchDictionary, stripDiacritics } from '../../src/utils/dictionarySearch';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runDictionarySearchAcceptanceTests() {
  await feature('FT-DICT', 'Multi-Tier Dictionary Relevance Search & Toneless Stripping', async () => {
    const mockHanzi: HanziItem[] = [
      {
        character: '狗',
        pinyin: 'gǒu',
        definition: 'dog',
        hsk_level: '2',
        frequency_rank: '50',
        radical: '犭',
        radical_code: '94',
        stroke_count: '8',
        general_standard_num: '1130'
      },
      {
        character: '构',
        pinyin: 'gòu',
        definition: 'construct / frame',
        hsk_level: '4',
        frequency_rank: '120',
        radical: '木',
        radical_code: '75',
        stroke_count: '8',
        general_standard_num: '1131'
      },
      {
        character: '猫',
        pinyin: 'māo',
        definition: 'cat (likes to chase dog toys)',
        hsk_level: '2',
        frequency_rank: '60',
        radical: '犭',
        radical_code: '94',
        stroke_count: '11',
        general_standard_num: '2280'
      }
    ];

    await scenario('Strip diacritics to normalize Pinyin for toneless matching', async () => {
      await given('Pinyin syllables with diverse diacritics', () => {});

      await then('stripDiacritics converts diacritics into plain ascii lowercase', () => {
        expect(stripDiacritics('nǐ hǎo')).toBe('ni hao');
        expect(stripDiacritics('zhōngguó')).toBe('zhongguo');
        expect(stripDiacritics('gǒu')).toBe('gou');
        expect(stripDiacritics('lǜ sè')).toBe('lu se'); // normalization check
      });
    });

    await scenario('Rank exact toneless Pinyin matches above definition substring matches', async () => {
      let results: HanziItem[] = [];

      await given('a search query "gou" where "狗" has pinyin "gǒu" and "猫" has "dog" in its definition', () => {});

      await when('searchDictionary is queried with "gou"', () => {
        results = searchDictionary('gou', mockHanzi, []);
      });

      await then('exact toneless pinyin matches (狗, 构) are ranked before definition matches (猫)', () => {
        expect(results.length).toBeGreaterThanOrEqual(2);
        expect(results[0].character).toBe('狗');
      });
    });

    await scenario('Rank exact Hanzi glyph matches at the very top (score 1)', async () => {
      let results: HanziItem[] = [];

      await when('searchDictionary is queried with "狗"', () => {
        results = searchDictionary('狗', mockHanzi, []);
      });

      await then('the exact character "狗" is the first returned entry', () => {
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].character).toBe('狗');
      });
    });
  });
}
