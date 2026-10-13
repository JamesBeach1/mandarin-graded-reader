import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { getChengyu, scanChengyu, CHENGYU_DICTIONARY } from '../../src/utils/chengyuDatabase';

export async function runChengyuDatabaseAcceptanceTests() {
  await feature('FT-CHENGYU', 'Chengyu (成语) Four-Character Idiom Knowledge Base', async () => {
    await scenario('Retrieve exact Chengyu with literal translation and historical allusion', async () => {
      await given('the famous Chengyu "守株待兔"', () => {});

      await then('it returns literal translation, figurative meaning, and allusion', () => {
        const item = getChengyu('守株待兔');
        expect(item).toBeDefined();
        expect(item?.pinyin).toBe('shǒu zhū dài tù');
        expect(item?.literalTranslation).toContain('tree stump');
        expect(item?.figurativeMeaning).toContain('effort');
        expect(item?.allusion).toContain('韩非子');
      });

      await and('unknown strings return undefined', () => {
        expect(getChengyu('随意文字') === undefined).toBeTruthy();
      });
    });

    await scenario('Scan continuous story text for embedded 4-character idioms', async () => {
      let matches: any[] = [];

      await given('a text containing multiple idioms "做事不能半途而废，也不能画蛇添足"', () => {});

      await when('scanChengyu inspects the text', () => {
        matches = scanChengyu('做事不能半途而废，也不能画蛇添足');
      });

      await then('both idioms are accurately detected with their string positions', () => {
        expect(matches.length).toBe(2);
        expect(matches[0].idiom).toBe('半途而废');
        expect(matches[1].idiom).toBe('画蛇添足');
        expect(matches[0].index).toBeLessThan(matches[1].index);
      });
    });

    await scenario('Catalog contains rich curated idiom set across HSK levels', async () => {
      await then('the dictionary contains key classic idioms', () => {
        const idioms = Object.keys(CHENGYU_DICTIONARY);
        expect(idioms.length).toBeGreaterThanOrEqual(15);
        expect(idioms).toContain('井底之蛙');
        expect(idioms).toContain('盲人摸象');
        expect(idioms).toContain('马到成功');
      });
    });
  });
}
