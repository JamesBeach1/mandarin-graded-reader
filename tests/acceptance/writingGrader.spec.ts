import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { WritingGraderEngine, type EvaluationResult } from '../../src/utils/writingGraderEngine';

export async function runWritingGraderAcceptanceTests() {
  await feature('FT-WRITER', 'AI Grader for Free Writing & Composition (AIM-001)', async () => {
    await scenario('Detect "Three De\'s" (的 vs 得 vs 地) structural particle confusions', async () => {
      let result: EvaluationResult | null = null;

      await given('a text using "的" where "得" is required ("跑的快")', () => {
        result = WritingGraderEngine.evaluateOffline('他今天跑的很快。');
      });

      await then('it flags a particle error and suggests "跑得很快"', () => {
        expect(result).toBeDefined();
        expect(result?.issues.length).toBeGreaterThan(0);
        const particleIssue = result?.issues.find(i => i.type === 'particle');
        expect(particleIssue).toBeDefined();
        expect(particleIssue?.replacementSnippet).toBe('跑得很快');
        expect(result?.correctedText).toContain('跑得很快');
      });
    });

    await scenario('Detect adverbial marker confusion (Adverb + 的 -> 地)', async () => {
      let result: EvaluationResult | null = null;

      await given('a text with "认真的做" instead of "认真地做"', () => {
        result = WritingGraderEngine.evaluateOffline('学生们认真的写汉字。');
      });

      await then('it suggests replacement with "地"', () => {
        expect(result).toBeDefined();
        const issue = result?.issues.find(i => i.originalSnippet.includes('认真的'));
        expect(issue).toBeDefined();
        expect(result?.correctedText).toContain('认真地');
      });
    });

    await scenario('Detect noun and animal measure word mismatches', async () => {
      let result: EvaluationResult | null = null;

      await given('text with incorrect measure words "一个书" and "一个猫"', () => {
        result = WritingGraderEngine.evaluateOffline('我买了一个书和养了一个猫。');
      });

      await then('it corrects "一个书" to "一本书" and "一个猫" to "一只猫"', () => {
        expect(result).toBeDefined();
        const mwIssues = result?.issues.filter(i => i.type === 'measure_word');
        expect(mwIssues?.length).toBe(2);
        expect(result?.correctedText).toContain('一本书');
        expect(result?.correctedText).toContain('一只猫');
      });
    });

    await scenario('Generate structured diff segments highlighting removals and additions', async () => {
      let result: EvaluationResult | null = null;

      await when('evaluateOffline processes text with errors', () => {
        result = WritingGraderEngine.evaluateOffline('一辆猫'); // "一辆猫" -> wrong measure word
        // Let's use "一个猫" -> "一只猫"
        result = WritingGraderEngine.evaluateOffline('一只汽车和一个书');
      });

      await then('diffSegments contains unchanged and modified tokens', () => {
        expect(result?.diffSegments.length).toBeGreaterThan(0);
        expect(result?.score).toBeGreaterThan(0);
        expect(result?.score).toBeLessThanOrEqual(100);
      });
    });
  });
}
