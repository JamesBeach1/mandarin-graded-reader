import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import {
  toTraditional,
  toSimplified,
  convertScript,
  hasTraditionalVariant,
  getTraditionalVariant
} from '../../src/utils/scriptConverter';

export async function runScriptConverterAcceptanceTests() {
  await feature('FT-TRC-001', 'Simplified ⇄ Traditional Script Conversion', async () => {
    await scenario('Convert Simplified Chinese text to Traditional Chinese accurately', async () => {
      let output = '';

      await given('a Simplified sentence "这门语言非常有趣，我想学好它"', () => {});

      await when('toTraditional is called', () => {
        output = toTraditional('这门语言非常有趣，我想学好它');
      });

      await then('all characters with traditional glyphs are converted', () => {
        expect(output).toContain('這');
        expect(output).toContain('門');
        expect(output).toContain('語');
        expect(output).toContain('言');
        expect(output).toContain('學');
        expect(output).toBe('這門語言非常有趣，我想學好它');
      });
    });

    await scenario('Convert Traditional Chinese text back to Simplified Chinese accurately', async () => {
      let output = '';

      await given('a Traditional Chinese sentence "這是繁體中文測試"', () => {});

      await when('toSimplified is called', () => {
        output = toSimplified('這是繁體中文測試');
      });

      await then('all traditional glyphs convert back to Simplified form', () => {
        expect(output).toBe('这是繁体中文测试');
      });
    });

    await scenario('Detect characters with distinct traditional variants', async () => {
      await given('characters "国", "书", "人", "天"', () => {});

      await then('hasTraditionalVariant accurately identifies variant existence', () => {
        expect(hasTraditionalVariant('国')).toBeTruthy();
        expect(hasTraditionalVariant('书')).toBeTruthy();
        expect(hasTraditionalVariant('人')).toBeFalsy();
        expect(hasTraditionalVariant('天')).toBeFalsy();
      });

      await and('getTraditionalVariant returns the exact traditional glyph', () => {
        expect(getTraditionalVariant('国')).toBe('國');
        expect(getTraditionalVariant('书')).toBe('書');
        expect(getTraditionalVariant('人')).toBeNull();
      });
    });

    await scenario('Universal convertScript respects script mode parameter', async () => {
      const text = '国家图书';

      await when('convertScript is called with "traditional"', () => {
        const trad = convertScript(text, 'traditional');
        expect(trad).toBe('國家圖書');
      });

      await and('convertScript is called with "simplified"', () => {
        const simp = convertScript('國家圖書', 'simplified');
        expect(simp).toBe('国家图书');
      });
    });
  });
}
