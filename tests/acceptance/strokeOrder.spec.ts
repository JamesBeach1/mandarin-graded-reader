import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { StrokeOrderService, STROKE_ORDER_RULES, BASIC_CHINESE_STROKES } from '../../src/utils/strokeOrderData';

export async function runStrokeOrderAcceptanceTests() {
  await feature('FT-STROKE', 'Rice-Grid Calligraphic Stroke Rules & Catalog (AIM-010)', async () => {
    await scenario('Catalog the 7 classical Chinese stroke order rules with bilingual guidance', async () => {
      await given('the stroke order rules registry', () => {});

      await then('all 7 core rules are cataloged', () => {
        const rules = StrokeOrderService.getRules();
        expect(rules.length).toBe(7);
        const ruleNames = rules.map(r => r.rule);
        expect(ruleNames).toContain('先横后竖');
        expect(ruleNames).toContain('先撇后捺');
        expect(ruleNames).toContain('从上到下');
        expect(ruleNames).toContain('从左到右');
        expect(ruleNames).toContain('从外到内');
        expect(ruleNames).toContain('先里头后封口');
        expect(ruleNames).toContain('先中间后两边');
      });

      await and('each rule has descriptive examples and pinyin', () => {
        const first = STROKE_ORDER_RULES[0];
        expect(first.example).toContain('十');
        expect(first.pinyin.length).toBeGreaterThan(0);
      });
    });

    await scenario('Catalog basic single stroke glyphs with names and direction vectors', async () => {
      await then('fundamental strokes (横, 竖, 撇, 点, 捺) are present', () => {
        const catalog = StrokeOrderService.getStrokeCatalog();
        expect(catalog.length).toBeGreaterThanOrEqual(10);
        const names = catalog.map(s => s.name);
        expect(names).toContain('横');
        expect(names).toContain('竖');
        expect(names).toContain('撇');
        expect(names).toContain('点');
        expect(names).toContain('捺');
      });
    });
  });
}
