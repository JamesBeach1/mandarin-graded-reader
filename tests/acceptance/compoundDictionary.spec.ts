import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { CompoundDictionaryService, BUILTIN_COMPOUND_LEXICON } from '../../src/services/compoundDictionary';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runCompoundDictionaryAcceptanceTests() {
  await feature('FT-COMP', 'Multi-Character Compound Word Resolution & Decomposition', async () => {
    const mockHanziMap = new Map<string, HanziItem>();
    mockHanziMap.set('燕', {
      character: '燕',
      pinyin: 'yàn',
      definition: 'swallow (bird)',
      hsk_level: '4',
      frequency_rank: '500',
      radical: '灬',
      radical_code: '86',
      stroke_count: '16',
      general_standard_num: ''
    });
    mockHanziMap.set('麦', {
      character: '麦',
      pinyin: 'mài',
      definition: 'wheat; barley; oats',
      hsk_level: '3',
      frequency_rank: '600',
      radical: '麦',
      radical_code: '199',
      stroke_count: '7',
      general_standard_num: ''
    });
    mockHanziMap.set('奶', {
      character: '奶',
      pinyin: 'nǎi',
      definition: 'milk',
      hsk_level: '2',
      frequency_rank: '400',
      radical: '女',
      radical_code: '38',
      stroke_count: '5',
      general_standard_num: ''
    });

    await scenario('Synchronously resolve high-frequency modern compounds from built-in conversational lexicon', async () => {
      await given('the modern drink compound "燕麦奶" (oat milk)', () => {
        expect(BUILTIN_COMPOUND_LEXICON['燕麦奶']).toBeDefined();
      });

      await then('lookupSync resolves the compound with accurate pinyin and definition', () => {
        const entry = CompoundDictionaryService.lookupSync('燕麦奶', mockHanziMap);
        expect(entry).toBeDefined();
        expect(entry?.word).toBe('燕麦奶');
        expect(entry?.pinyin).toBe('yàn mài nǎi');
        expect(entry?.definition).toBe('oat milk');
        expect(entry?.source).toBe('lexicon');
      });

      await and('constituent characters are decomposed into constituentChars', () => {
        const entry = CompoundDictionaryService.lookupSync('燕麦奶', mockHanziMap);
        expect(entry?.constituentChars?.length).toBe(3);
        expect(entry?.constituentChars?.[0].char).toBe('燕');
        expect(entry?.constituentChars?.[1].char).toBe('麦');
        expect(entry?.constituentChars?.[2].char).toBe('奶');
      });
    });

    await scenario('Synthesize base reading when all characters are known in hanziMap', async () => {
      const mockCustomMap = new Map<string, HanziItem>();
      mockCustomMap.set('红', {
        character: '红',
        pinyin: 'hóng',
        definition: 'red',
        hsk_level: '1',
        frequency_rank: '1',
        radical: '纟',
        radical_code: '',
        stroke_count: '6',
        general_standard_num: ''
      });
      mockCustomMap.set('星', {
        character: '星',
        pinyin: 'xīng',
        definition: 'star',
        hsk_level: '2',
        frequency_rank: '2',
        radical: '日',
        radical_code: '',
        stroke_count: '9',
        general_standard_num: ''
      });

      await when('lookupSync is called on unknown compound "红星"', () => {
        const entry = CompoundDictionaryService.lookupSync('红星', mockCustomMap);
        expect(entry).toBeDefined();
        expect(entry?.word).toBe('红星');
        expect(entry?.pinyin).toBe('hóng xīng');
        expect(entry?.source).toBe('synthesis');
      });
    });
  });
}
