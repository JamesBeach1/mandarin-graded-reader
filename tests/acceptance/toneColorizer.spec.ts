import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { getToneNumber, getToneColor, TONE_COLORS, TONE_NAMES } from '../../src/utils/toneColorizer';

export async function runToneColorizerAcceptanceTests() {
  await feature('FT-TRC-003', '5-Tone Visual Colorizer & Diacritic Extraction', async () => {
    await scenario('Extract tone numbers from diacritics', async () => {
      await given('syllables with standard Pinyin diacritic tone marks', () => {});

      await then('1st tone vowels map to 1', () => {
        expect(getToneNumber('mā')).toBe(1);
        expect(getToneNumber('tiān')).toBe(1);
        expect(getToneNumber('chū')).toBe(1);
      });

      await and('2nd tone vowels map to 2', () => {
        expect(getToneNumber('má')).toBe(2);
        expect(getToneNumber('hóng')).toBe(2);
        expect(getToneNumber('yán')).toBe(2);
      });

      await and('3rd tone vowels map to 3', () => {
        expect(getToneNumber('mǎ')).toBe(3);
        expect(getToneNumber('nǐ')).toBe(3);
        expect(getToneNumber('hǎo')).toBe(3);
      });

      await and('4th tone vowels map to 4', () => {
        expect(getToneNumber('mà')).toBe(4);
        expect(getToneNumber('kàn')).toBe(4);
        expect(getToneNumber('shì')).toBe(4);
      });

      await and('syllables without diacritics default to tone 5 (neutral)', () => {
        expect(getToneNumber('ma')).toBe(5);
        expect(getToneNumber('de')).toBe(5);
      });
    });

    await scenario('Extract tone numbers from trailing numeric digits', async () => {
      await given('numeric tone strings: hao3, ma5, yi1, shi4, ren2', () => {});

      await then('getToneNumber extracts the numeric tone value directly', () => {
        expect(getToneNumber('hao3')).toBe(3);
        expect(getToneNumber('ma5')).toBe(5);
        expect(getToneNumber('yi1')).toBe(1);
        expect(getToneNumber('shi4')).toBe(4);
        expect(getToneNumber('ren2')).toBe(2);
      });
    });

    await scenario('Map tone numbers to distinct editorial hex color values', async () => {
      await then('each tone maps to its high-contrast color code', () => {
        expect(getToneColor('mā')).toBe(TONE_COLORS[1]); // Coral Red
        expect(getToneColor('má')).toBe(TONE_COLORS[2]); // Grass Green
        expect(getToneColor('mǎ')).toBe(TONE_COLORS[3]); // Golden Amber
        expect(getToneColor('mà')).toBe(TONE_COLORS[4]); // Azure Blue
        expect(getToneColor('ma')).toBe(TONE_COLORS[5]);  // Muted Slate
      });

      await and('all tone names have descriptive bilingual metadata', () => {
        expect(TONE_NAMES[1]).toContain('阴平');
        expect(TONE_NAMES[2]).toContain('阳平');
        expect(TONE_NAMES[3]).toContain('上声');
        expect(TONE_NAMES[4]).toContain('去声');
        expect(TONE_NAMES[5]).toContain('轻声');
      });
    });
  });
}
