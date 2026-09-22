/**
 * Anki Flashcard Export Utility
 * Converts local IndexedDB flashcards into Anki-compatible tab-delimited text (.tsv / .txt)
 */

import { getAllCards, type Flashcard } from './srsStore';

export class AnkiExportService {
  /**
   * Generates formatted TSV text for Anki import:
   * Field 1: Character Glyph
   * Field 2: Pinyin (Pronunciation)
   * Field 3: English Translation
   * Field 4: HSK Level Tag
   * Field 5: Interval / EaseFactor metadata
   */
  public static async exportToAnkiTSV(): Promise<string> {
    const cards = await getAllCards();
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

  /**
   * Triggers client-side browser file download of Anki TSV file
   */
  public static async downloadAnkiDeck(filename = 'mandarin_graded_reader_deck.txt'): Promise<void> {
    const tsvContent = await this.exportToAnkiTSV();
    if (!tsvContent) {
      alert('No flashcards found to export.');
      return;
    }

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Generates tab-delimited text formatted for Pleco flashcard and user dictionary import (SRS-008):
   * Field 1: Simplified Character
   * Field 2: Pinyin with diacritics
   * Field 3: English Definition
   */
  public static async exportToPlecoTSV(): Promise<string> {
    const cards = await getAllCards();
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

  /**
   * Triggers client-side browser file download of Pleco TSV file (SRS-008)
   */
  public static async downloadPlecoDeck(filename = 'moyun_pleco_flashcards.txt'): Promise<void> {
    const content = await this.exportToPlecoTSV();
    if (!content) {
      alert('No flashcards found to export.');
      return;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
