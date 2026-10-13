import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { SemanticSearchEngine, type SemanticSearchResult } from '../../src/services/semanticSearch';
import type { SavedStory } from '../../src/services/libraryStore';

export async function runSemanticSearchAcceptanceTests() {
  await feature('FT-SEARCH', 'Semantic Inverted-Index Story Library Search', async () => {
    const sampleStories: SavedStory[] = [
      {
        id: 's1',
        title: '北京之旅',
        hskLevel: '2',
        text: '去年夏天我去了一趟北京，参观了故宫和长城。北京烤鸭非常好吃。',
        createdAt: 1000
      },
      {
        id: 's2',
        title: '学做中国菜',
        hskLevel: '1',
        text: '我喜欢做菜。今天我和朋友一起学做西红柿炒鸡蛋，非常简单美味。',
        createdAt: 2000
      },
      {
        id: 's3',
        title: '我的猫',
        hskLevel: '1',
        text: '我有一只白色的猫，它每天都在窗台上睡觉。',
        createdAt: 3000
      }
    ];

    await scenario('Rank stories higher when query matches the title', async () => {
      let results: SemanticSearchResult[] = [];

      await given('stories where one has "北京" in the title and another has "北京" only in text', () => {});

      await when('SemanticSearchEngine.searchStories searches for "北京"', () => {
        results = SemanticSearchEngine.searchStories('北京', sampleStories);
      });

      await then('the story with "北京" in the title is the top result with highest score', () => {
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].story.id).toBe('s1');
        expect(results[0].relevanceScore).toBeGreaterThanOrEqual(50);
      });

      await and('results provide an extracted snippet with context', () => {
        expect(results[0].snippet).toContain('北京');
      });
    });

    await scenario('Match stories by HSK level search keyword', async () => {
      let results: SemanticSearchResult[] = [];

      await when('searching for "hsk 2"', () => {
        results = SemanticSearchEngine.searchStories('hsk 2', sampleStories);
      });

      await then('HSK 2 stories are identified', () => {
        expect(results.some(r => r.story.hskLevel === '2')).toBeTruthy();
      });
    });

    await scenario('Return empty results on blank query or no matches', async () => {
      await then('empty query returns an empty list', () => {
        expect(SemanticSearchEngine.searchStories('', sampleStories).length).toBe(0);
        expect(SemanticSearchEngine.searchStories('   ', sampleStories).length).toBe(0);
      });

      await and('unmatched keyword returns empty list', () => {
        expect(SemanticSearchEngine.searchStories('火星空间站XYZ', sampleStories).length).toBe(0);
      });
    });
  });
}
