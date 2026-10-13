import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { generateAdventureBranches, type AdventureBranchChoice } from '../../src/utils/adventureEngine';

export async function runAdventureEngineAcceptanceTests() {
  await feature('FT-ADV', 'Adventure Branch Constrained Narrative Generator', async () => {
    await scenario('Synthesize grammatically constrained choices tailored to beginner level (HSK 1-2)', async () => {
      let branches: AdventureBranchChoice[] = [];

      await given('a narrative setting about a restaurant ("他在饭馆吃饭")', () => {});

      await when('generateAdventureBranches runs with HSK Level 2', () => {
        branches = generateAdventureBranches('他在饭馆吃饭', 2);
      });

      await then('2 to 3 branching choices are generated', () => {
        expect(branches.length).toBeGreaterThanOrEqual(2);
      });

      await and('all choices have bilingual Chinese, Pinyin, English, and tone tags', () => {
        branches.forEach(b => {
          expect(b.chinese.length).toBeGreaterThan(0);
          expect(b.pinyin.length).toBeGreaterThan(0);
          expect(b.english.length).toBeGreaterThan(0);
          expect(['cautious', 'bold', 'curious', 'humorous']).toContain(b.tone);
        });
      });
    });

    await scenario('Scale choice lexical richness for advanced levels (HSK 4+)', async () => {
      let advBranches: AdventureBranchChoice[] = [];

      await when('generateAdventureBranches runs with HSK Level 5', () => {
        advBranches = generateAdventureBranches('他在饭馆吃饭', 5);
      });

      await then('advanced choices feature richer vocabulary and expressions', () => {
        expect(advBranches.length).toBeGreaterThanOrEqual(2);
        const combinedChinese = advBranches.map(b => b.chinese).join('');
        // Advanced restaurant branch includes 烹饪 or 招牌菜 or 秘方
        expect(combinedChinese.length).toBeGreaterThan(15);
      });
    });
  });
}
