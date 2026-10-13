import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import type { Flashcard } from '../../src/services/srsStore';

export function formatMockAnkiTSV(cards: Flashcard[]): string {
  if (cards.length === 0) return '';
  const lines = [
    '#separator:tab',
    '#html:true',
    '#tags column:6',
    '#columns:Character\tPinyin\tDefinition\tExampleSentence\tIntervalDays\tTags'
  ];
  cards.forEach(card => {
    const char = card.character.replace(/\t/g, ' ');
    const pinyin = card.pinyin.replace(/\t/g, ' ');
    const def = card.definition.replace(/\t/g, ' ');
    const sentence = (card.exampleSentence || '').replace(/\t/g, ' ');
    const interval = card.interval || 0;
    const tag = card.hsk_level ? `HSK_${card.hsk_level}` : 'MandarinReader';
    lines.push(`${char}\t${pinyin}\t${def}\t${sentence}\t${interval}\t${tag}`);
  });
  return lines.join('\n');
}

export function formatMockPlecoTSV(cards: Flashcard[]): string {
  if (cards.length === 0) return '';
  const lines = [
    '// Pleco Flashcard Export — Moyun (墨韵)',
    '// Format: Character<tab>Pinyin<tab>Definition',
    ''
  ];
  cards.forEach(card => {
    const char = card.character.replace(/\t/g, ' ').trim();
    const pinyin = card.pinyin.replace(/\t/g, ' ').trim();
    const def = card.definition.replace(/\t/g, ' ').trim();
    lines.push(`${char}\t${pinyin}\t${def}`);
  });
  return lines.join('\n');
}

export async function runAnkiExportAcceptanceTests() {
  await feature('FT-ANKI', 'Anki & Pleco Flashcard TSV Exporters (SRS-008)', async () => {
    const mockCards: Flashcard[] = [
      {
        character: '咖啡',
        pinyin: 'kā fēi',
        definition: 'coffee (beverage)',
        hsk_level: '2',
        interval: 4,
        easeFactor: 2.5,
        nextReviewDate: Date.now() + 100000,
        exampleSentence: '我想喝一杯热咖啡。'
      },
      {
        character: '电脑',
        pinyin: 'diàn nǎo',
        definition: 'computer\t(electronic device)', // has embedded tab!
        hsk_level: '1',
        interval: 10,
        easeFactor: 2.6,
        nextReviewDate: Date.now() + 200000
      }
    ];

    await scenario('Format Anki TSV with header metadata and tab character sanitization', async () => {
      let tsv = '';

      await given('flashcards with embedded tabs in definition', () => {
        expect(mockCards[1].definition).toContain('\t');
      });

      await when('formatMockAnkiTSV is generated', () => {
        tsv = formatMockAnkiTSV(mockCards);
      });

      await then('header directives are included at the top of file', () => {
        expect(tsv).toContain('#separator:tab');
        expect(tsv).toContain('#html:true');
        expect(tsv).toContain('#columns:Character\tPinyin\tDefinition');
      });

      await and('internal tabs inside fields are replaced with spaces to avoid column corruption', () => {
        const rows = tsv.split('\n').filter(r => !r.startsWith('#'));
        expect(rows.length).toBe(2);
        const cols1 = rows[0].split('\t');
        const cols2 = rows[1].split('\t');
        expect(cols1.length).toBe(6);
        expect(cols2.length).toBe(6);
        expect(cols2[2]).toBe('computer (electronic device)');
      });
    });

    await scenario('Format Pleco flashcard export format with comment headers', async () => {
      let plecoTsv = '';

      await when('formatMockPlecoTSV is generated', () => {
        plecoTsv = formatMockPlecoTSV(mockCards);
      });

      await then('Pleco header comments are present', () => {
        expect(plecoTsv).toContain('// Pleco Flashcard Export — Moyun (墨韵)');
      });

      await and('each flashcard row has exactly 3 tab-separated columns (Character, Pinyin, Definition)', () => {
        const rows = plecoTsv.split('\n').filter(r => r.trim() && !r.startsWith('//'));
        expect(rows.length).toBe(2);
        rows.forEach(row => {
          const cols = row.split('\t');
          expect(cols.length).toBe(3);
        });
        expect(rows[0]).toBe('咖啡\tkā fēi\tcoffee (beverage)');
      });
    });
  });
}
