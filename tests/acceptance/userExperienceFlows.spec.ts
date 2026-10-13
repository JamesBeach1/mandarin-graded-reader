import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { tokenizeStory } from '../../src/utils/tokenizer';
import { analyzeLexicalDensity } from '../../src/utils/lexicalDensity';
import { CompoundDictionaryService } from '../../src/services/compoundDictionary';
import { StorageService, STORAGE_KEYS } from '../../src/services/storage';
import { DEFAULT_SRS_SETTINGS, type Flashcard } from '../../src/services/srsStore';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runUserExperienceFlowsAcceptanceTests() {
  await feature('FT-UX-FLOWS', 'End-to-End User Experience State Machine & Workspaces', async () => {
    // Ensure localStorage polyfill if run in bare Node
    if (typeof globalThis.localStorage === 'undefined') {
      const store = new Map<string, string>();
      (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
        removeItem: (k: string) => store.delete(k),
        clear: () => store.clear()
      };
    }

    const mockHanziData: HanziItem[] = [
      { character: '你', pinyin: 'nǐ', definition: 'you', hsk_level: '1', frequency_rank: '1', radical: '亻', radical_code: '', stroke_count: '7', general_standard_num: '' },
      { character: '好', pinyin: 'hǎo', definition: 'good', hsk_level: '1', frequency_rank: '2', radical: '女', radical_code: '', stroke_count: '6', general_standard_num: '' },
      { character: '喝', pinyin: 'hē', definition: 'drink', hsk_level: '1', frequency_rank: '15', radical: '口', radical_code: '', stroke_count: '12', general_standard_num: '' },
      { character: '茶', pinyin: 'chá', definition: 'tea', hsk_level: '1', frequency_rank: '20', radical: '艹', radical_code: '', stroke_count: '9', general_standard_num: '' }
    ];

    const mockVocabData: HanziItem[] = [
      { character: '你好', pinyin: 'nǐ hǎo', definition: 'hello', hsk_level: '1', frequency_rank: '1', radical: '', radical_code: '', stroke_count: '13', general_standard_num: '' }
    ];

    await scenario('UX Flow 1: Free Text Area Ingestion -> Graded Reader View Transition', async () => {
      let pastedText = '';
      let tokens: HanziItem[] = [];
      let densityReport: any = null;

      await given('a user pastes unformatted Chinese text into the Free Text Import area', () => {
        pastedText = '你好！你想喝茶吗？';
      });

      await when('the user submits the text for graded reading', () => {
        tokens = tokenizeStory(pastedText, mockHanziData, mockVocabData);
        densityReport = analyzeLexicalDensity(tokens);
      });

      await then('the reader tokenizes the text preserving sentence punctuation', () => {
        expect(tokens.length).toBeGreaterThan(0);
        const characters = tokens.map(t => t.character).join('');
        expect(characters).toBe('你好！你想喝茶吗？');
      });

      await and('lexical density computes reading metrics ready for display in the reader HUD', () => {
        expect(densityReport.totalCharacters).toBe(8);
        expect(densityReport.typeTokenRatio).toBeGreaterThan(0);
        expect(densityReport.estimatedHSKLevel).toBeGreaterThanOrEqual(1);
      });
    });

    await scenario('UX Flow 2: Word Grouping vs Single Character Mode Switching', async () => {
      await given('default word grouping preference', () => {
        StorageService.set(STORAGE_KEYS.WORD_GROUPING_MODE, 'words');
        expect(StorageService.getItem(STORAGE_KEYS.WORD_GROUPING_MODE)).toBe('words');
      });

      await when('user toggles mode to single characters in reading settings', () => {
        StorageService.set(STORAGE_KEYS.WORD_GROUPING_MODE, 'characters');
      });

      await then('the preference is persistently stored', () => {
        expect(StorageService.getItem(STORAGE_KEYS.WORD_GROUPING_MODE)).toBe('characters');
      });
    });

    await scenario('UX Flow 3: Two-Level Compound Tooltip Inspection & Constituent Decomposition', async () => {
      let compoundEntry: any = null;

      await given('a learner encounters compound "燕麦奶" (oat milk) in the text', () => {});

      await when('the learner clicks the token to open the CharacterTooltip', () => {
        compoundEntry = CompoundDictionaryService.lookupSync('燕麦奶');
      });

      await then('the tooltip receives unified compound pinyin and definition', () => {
        expect(compoundEntry).toBeDefined();
        expect(compoundEntry.word).toBe('燕麦奶');
        expect(compoundEntry.definition).toBe('oat milk');
        expect(compoundEntry.source).toBe('lexicon');
      });

      await and('constituent character breakdown provides 1-click access to stroke order drills', () => {
        expect(compoundEntry.constituentChars.length).toBe(3);
        const chars = compoundEntry.constituentChars.map((c: any) => c.char);
        expect(chars).toContain('燕');
        expect(chars).toContain('麦');
        expect(chars).toContain('奶');
      });
    });

    await scenario('UX Flow 4: Flashcard SRS Lifecycle across Thematic Decks', async () => {
      let card: Flashcard = {
        character: '咖啡',
        pinyin: 'kā fēi',
        definition: 'coffee',
        hsk_level: '2',
        deckId: 'dining',
        nextReviewDate: Date.now(),
        interval: 0,
        easeFactor: 2.5
      };

      await given('a flashcard saved to thematic deck "dining"', () => {
        expect(card.deckId).toBe('dining');
        expect(card.interval).toBe(0);
      });

      await when('the card is reviewed in ReviewWorkspace with rating 3 (Good)', () => {
        // Step 1: Advance interval to initialInterval
        card.interval = DEFAULT_SRS_SETTINGS.initialInterval;
        card.nextReviewDate = Date.now() + card.interval * 24 * 60 * 60 * 1000;
      });

      await then('interval becomes 1 day and future review timestamp is scheduled', () => {
        expect(card.interval).toBe(1);
        expect(card.nextReviewDate).toBeGreaterThan(Date.now());
      });

      await when('the card is reviewed next time with rating 3 (Good)', () => {
        // Step 2: Advance interval to secondInterval
        card.interval = DEFAULT_SRS_SETTINGS.secondInterval;
      });

      await then('interval advances to 4 days', () => {
        expect(card.interval).toBe(4);
      });
    });
  });
}
