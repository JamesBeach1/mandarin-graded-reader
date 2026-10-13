import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { tokenizeStory } from '../../src/utils/tokenizer';
import type { HanziItem } from '../../src/types/HanziItem';

export async function runTokenizerAcceptanceTests() {
  await feature('FT-TOK', 'Tokenization, Word Segmentation & Compound Lookups', async () => {
    const mockHanziData: HanziItem[] = [
      {
        character: '你',
        pinyin: 'nǐ',
        definition: 'you (singular)',
        hsk_level: '1',
        frequency_rank: '1',
        radical: '亻',
        radical_code: '9',
        stroke_count: '7',
        general_standard_num: '0812'
      },
      {
        character: '好',
        pinyin: 'hǎo',
        definition: 'good / well',
        hsk_level: '1',
        frequency_rank: '2',
        radical: '女',
        radical_code: '38',
        stroke_count: '6',
        general_standard_num: '0420'
      },
      {
        character: '书',
        pinyin: 'shū',
        definition: 'book',
        hsk_level: '1',
        frequency_rank: '10',
        radical: '乛',
        radical_code: '5',
        stroke_count: '4',
        general_standard_num: '0100'
      }
    ];

    const mockVocabData: HanziItem[] = [
      {
        character: '你好',
        pinyin: 'nǐ hǎo',
        definition: 'hello; hi',
        hsk_level: '1',
        frequency_rank: '1',
        radical: '',
        radical_code: '',
        stroke_count: '13',
        general_standard_num: ''
      }
    ];

    await scenario('Group multi-character compounds into single semantic tokens', async () => {
      let tokens: HanziItem[] = [];

      await given('a Chinese sentence "你好" and dictionary databases', () => {
        expect(mockHanziData.length).toBeGreaterThan(0);
      });

      await when('tokenizeStory processes the sentence', () => {
        tokens = tokenizeStory('你好', mockHanziData, mockVocabData);
      });

      await then('it should group "你好" into a single compound token', () => {
        expect(tokens.length).toBe(1);
        expect(tokens[0].character).toBe('你好');
        expect(tokens[0].isNonChinese).toBeFalsy();
      });

      await and('it should attach the correct compound pinyin and definition', () => {
        expect(tokens[0].pinyin).toBe('nǐ hǎo');
        expect(tokens[0].definition).toBe('hello; hi');
      });
    });

    await scenario('Preserve non-Chinese characters, spaces, and punctuation with nonChinese flags', async () => {
      let tokens: HanziItem[] = [];

      await given('a mixed sentence "你好, world! 123"', () => {});

      await when('tokenizeStory parses the mixed sentence', () => {
        tokens = tokenizeStory('你好, world! 123', mockHanziData, mockVocabData);
      });

      await then('Chinese tokens must have isNonChinese=false', () => {
        const chineseToken = tokens.find(t => t.character === '你好');
        expect(chineseToken).toBeDefined();
        expect(chineseToken?.isNonChinese).toBeFalsy();
      });

      await and('non-Chinese tokens must have isNonChinese=true', () => {
        const nonChineseTokens = tokens.filter(t => t.isNonChinese);
        expect(nonChineseTokens.length).toBeGreaterThan(0);
        const characters = tokens.map(t => t.character).join('');
        expect(characters).toBe('你好, world! 123');
      });
    });

    await scenario('Coalesce 4-character Chengyu compounds across segment boundaries', async () => {
      let tokens: HanziItem[] = [];

      await given('a text containing the idiom "守株待兔"', () => {});

      await when('tokenizeStory processes the text', () => {
        tokens = tokenizeStory('他守株待兔。', mockHanziData, mockVocabData);
      });

      await then('it should recognize "守株待兔" as a unified 4-character token', () => {
        const chengyuToken = tokens.find(t => t.character === '守株待兔');
        expect(chengyuToken).toBeDefined();
        expect(chengyuToken?.hsk_level).toBe('5');
        expect(chengyuToken?.pinyin).toBe('shǒu zhū dài tù');
      });
    });

    await scenario('Custom overrides supersede standard dictionary definitions', async () => {
      let tokens: HanziItem[] = [];
      const overrides = {
        '书': { pinyin: 'shū-custom', definition: 'custom book meaning' }
      };

      await given('a custom override for character "书"', () => {
        expect(overrides['书'].pinyin).toBe('shū-custom');
      });

      await when('tokenizeStory processes "读书" with overrides', () => {
        tokens = tokenizeStory('书', mockHanziData, mockVocabData, overrides);
      });

      await then('the token reflects the custom override values', () => {
        expect(tokens[0].character).toBe('书');
        expect(tokens[0].pinyin).toBe('shū-custom');
        expect(tokens[0].definition).toBe('custom book meaning');
        expect(tokens[0].hsk_level).toBe('Custom');
      });
    });
  });
}
