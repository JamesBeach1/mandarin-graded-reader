import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { findGrammarPatterns, type GrammarPatternMatch } from '../../src/utils/grammarHighlighter';

export async function runGrammarHighlighterAcceptanceTests() {
  await feature('FT-GRAM', 'Chinese Grammar Pattern Rule Engine & Highlighter', async () => {
    await scenario('Identify locational framework patterns (在...里/中/上)', async () => {
      let matches: GrammarPatternMatch[] = [];

      await given('a sentence "我们在房间里看书"', () => {});

      await when('findGrammarPatterns parses the sentence', () => {
        matches = findGrammarPatterns('我们在房间里看书');
      });

      await then('it should identify the locational framework', () => {
        const found = matches.find(m => m.patternName.includes('Locational Framework'));
        expect(found).toBeDefined();
        expect(found?.matchedText).toBe('在房间里');
        expect(found?.hskLevel).toBe(1);
      });
    });

    await scenario('Identify causal construction patterns (因为...所以...)', async () => {
      let matches: GrammarPatternMatch[] = [];

      await given('a sentence "因为今天下雨所以我们不去公园"', () => {});

      await when('findGrammarPatterns analyzes the text', () => {
        matches = findGrammarPatterns('因为今天下雨所以我们不去公园');
      });

      await then('it should recognize the causal pattern', () => {
        const found = matches.find(m => m.patternName.includes('Causal Construction'));
        expect(found).toBeDefined();
        expect(found?.hskLevel).toBe(2);
        expect(found?.matchedText).toBe('因为今天下雨所以');
      });
    });

    await scenario('Ensure matches are sorted in text starting index order', async () => {
      let matches: GrammarPatternMatch[] = [];

      await given('a sentence with two sequential grammar structures', () => {
        // "虽然下雨但是可以去" contains 虽然...但是... and 可以...
        matches = findGrammarPatterns('虽然下雨但是可以去图书馆');
      });

      await then('matches must be ordered with ascending startIndex', () => {
        expect(matches.length).toBeGreaterThan(1);
        for (let i = 0; i < matches.length - 1; i++) {
          expect(matches[i].startIndex <= matches[i + 1].startIndex).toBeTruthy();
        }
      });
    });
  });
}
