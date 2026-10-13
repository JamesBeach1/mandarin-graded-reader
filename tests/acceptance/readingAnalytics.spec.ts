import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { ReadingAnalytics } from '../../src/services/readingAnalytics';

export async function runReadingAnalyticsAcceptanceTests() {
  await feature('FT-CPM', 'Reading Speed Analytics & Characters Per Minute (CPM)', async () => {
    await scenario('Calculate CPM accurately from character counts and elapsed seconds', async () => {
      await given('300 characters read in 120 seconds (2 minutes)', () => {});

      await then('calculateCPM yields exactly 150 CPM', () => {
        const cpm = ReadingAnalytics.calculateCPM(300, 120);
        expect(cpm).toBe(150);
      });

      await and('zero characters or zero seconds returns 0 CPM without dividing by zero', () => {
        expect(ReadingAnalytics.calculateCPM(0, 60)).toBe(0);
        expect(ReadingAnalytics.calculateCPM(100, 0)).toBe(0);
      });
    });

    await scenario('Map current CPM to pedagogical HSK reading benchmarks', async () => {
      await given('a beginner reader pacing at 70 CPM', () => {});

      await then('HSK 1-2 Foundational Pacing is marked as active tier', () => {
        const benchmarks = ReadingAnalytics.getBenchmarks(70);
        const foundational = benchmarks.find(b => b.tier === 'HSK 1-2');
        expect(foundational).toBeDefined();
        expect(foundational?.isCurrentTier).toBe(true);
      });

      await and('intermediate reader at 150 CPM marks HSK 3-4 Fluent Comprehension', () => {
        const benchmarks = ReadingAnalytics.getBenchmarks(150);
        const intermediate = benchmarks.find(b => b.tier === 'HSK 3-4');
        expect(intermediate).toBeDefined();
        expect(intermediate?.isCurrentTier).toBe(true);
      });
    });
  });
}
