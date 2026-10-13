import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { checkPolyphone, checkHomophone } from '../../src/utils/homophoneDetector';

export async function runHomophoneDetectorAcceptanceTests() {
  await feature('FT-HOMO', 'Contextual Polyphone (多音字) & Confusable Homophone Warning', async () => {
    await scenario('Retrieve polyphone entries with all distinct pronunciations and examples', async () => {
      await given('polyphonic characters: "得", "行", "重"', () => {});

      await then('"得" provides readings de, děi, dé', () => {
        const poly = checkPolyphone('得');
        expect(poly).toBeDefined();
        expect(poly?.readings.length).toBe(3);
        const pinyins = poly?.readings.map(r => r.pinyin);
        expect(pinyins).toContain('de');
        expect(pinyins).toContain('děi');
        expect(pinyins).toContain('dé');
      });

      await and('"行" provides readings xíng and háng', () => {
        const poly = checkPolyphone('行');
        expect(poly).toBeDefined();
        const pinyins = poly?.readings.map(r => r.pinyin);
        expect(pinyins).toContain('xíng');
        expect(pinyins).toContain('háng');
      });

      await and('non-polyphone character returns null', () => {
        expect(checkPolyphone('猫')).toBeNull();
      });
    });

    await scenario('Identify confusable homophone pairs with pedagogical warnings', async () => {
      await given('frequently confused characters "在" and "再"', () => {});

      await then('"在" warns about confusion with "再"', () => {
        const homophone = checkHomophone('在');
        expect(homophone).toBeDefined();
        expect(homophone?.warning).toContain('再');
        const confusableChars = homophone?.confusables.map(c => c.char);
        expect(confusableChars).toContain('再');
      });

      await and('"座" warns about confusion with verb "坐"', () => {
        const homophone = checkHomophone('座');
        expect(homophone).toBeDefined();
        expect(homophone?.warning).toContain('坐');
      });

      await and('characters without known confusable homophones return null', () => {
        expect(checkHomophone('我')).toBeNull();
      });
    });
  });
}
