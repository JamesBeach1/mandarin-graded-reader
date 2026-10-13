import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { SynonymLadderService } from '../../src/utils/synonymLadder';

export async function runSynonymLadderAcceptanceTests() {
  await feature('FT-SYN', 'In-Memory Synonym Ladder & Real-Time Simplifier', async () => {
    await scenario('Simplify advanced vocabulary downwards to elementary level (HSK 1)', async () => {
      let result = { scaledText: '', substitutions: [] as any[] };

      await given('a sentence containing HSK 6 word "甚是" and HSK 5 word "购置"', () => {});

      await when('scaleTextDifficulty is called with targetHsk = 1', () => {
        result = SynonymLadderService.scaleTextDifficulty('他甚是喜欢购置新书', 1);
      });

      await then('"甚是" simplifies to HSK 1 "很"', () => {
        expect(result.scaledText).toContain('很');
      });

      await and('"购置" simplifies to HSK 1 "买"', () => {
        expect(result.scaledText).toContain('买');
      });

      await and('substitutions array records every substitution event', () => {
        expect(result.substitutions.length).toBeGreaterThanOrEqual(2);
      });
    });

    await scenario('Enrich elementary vocabulary upwards to intermediate level (HSK 4)', async () => {
      let result = { scaledText: '', substitutions: [] as any[] };

      await given('a simple sentence "我很开心"', () => {});

      await when('scaleTextDifficulty is called with targetHsk = 4', () => {
        result = SynonymLadderService.scaleTextDifficulty('我很开心', 4);
      });

      await then('"很" enriches to "十分"', () => {
        expect(result.scaledText).toContain('十分');
        expect(result.scaledText.includes('我很开心')).toBeFalsy();
      });
    });

    await scenario('Retrieve synonym ladders for specific vocabulary words', async () => {
      await given('vocabulary word "买"', () => {});

      await then('getLadderForWord returns the buy ladder with all tiers', () => {
        const ladder = SynonymLadderService.getLadderForWord('买');
        expect(ladder).toBeDefined();
        expect(ladder?.id).toBe('buy');
        const words = ladder?.tiers.map(t => t.word);
        expect(words).toContain('买');
        expect(words).toContain('购买');
        expect(words).toContain('购置');
      });

      await and('unknown words return null', () => {
        expect(SynonymLadderService.getLadderForWord('不存在的单词XYZ')).toBeNull();
      });
    });
  });
}
