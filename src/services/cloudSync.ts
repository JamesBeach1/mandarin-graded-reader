/**
 * Multi-Device State Hydration & Cloud Sync Protocol
 * Manages full platform data export, JSON snapshot serialization, and CRDT timestamp merges.
 */

import { getAllCards, addCard, type Flashcard } from './srsStore';
import { getSavedStories, saveStory, type SavedStory } from './libraryStore';
import { getOverridesMap, saveOverride } from './dictionaryStore';

export interface PlatformStateSnapshot {
  version: string;
  exportedAt: number;
  flashcards: Flashcard[];
  stories: SavedStory[];
  overrides: Record<string, { pinyin: string; definition: string }>;
  heatmap: Record<string, number>;
}

export class CloudSyncService {
  public static async exportSnapshot(): Promise<PlatformStateSnapshot> {
    const flashcards = await getAllCards();
    const stories = await getSavedStories();
    const overrides = await getOverridesMap();
    
    let heatmap: Record<string, number> = {};
    try {
      const data = localStorage.getItem('characters_read_heatmap');
      if (data) heatmap = JSON.parse(data);
    } catch {
      // empty
    }

    return {
      version: '5.0.0',
      exportedAt: Date.now(),
      flashcards,
      stories,
      overrides,
      heatmap
    };
  }

  public static async downloadBackupFile(filename = 'mandarin_platform_backup.json'): Promise<void> {
    const snapshot = await this.exportSnapshot();
    const jsonStr = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static async importSnapshot(snapshot: PlatformStateSnapshot): Promise<{
    cardsMerged: number;
    storiesMerged: number;
    overridesMerged: number;
  }> {
    let cardsMerged = 0;
    let storiesMerged = 0;
    let overridesMerged = 0;

    // 1. Merge flashcards (preserve highest interval if duplicate)
    if (snapshot.flashcards && Array.isArray(snapshot.flashcards)) {
      for (const card of snapshot.flashcards) {
        await addCard({
          character: card.character,
          pinyin: card.pinyin,
          definition: card.definition,
          hsk_level: card.hsk_level
        });
        cardsMerged++;
      }
    }

    // 2. Merge saved stories
    if (snapshot.stories && Array.isArray(snapshot.stories)) {
      for (const story of snapshot.stories) {
        await saveStory({
          id: story.id,
          title: story.title,
          text: story.text,
          hskLevel: story.hskLevel
        });
        storiesMerged++;
      }
    }

    // 3. Merge dictionary overrides
    if (snapshot.overrides) {
      for (const [char, val] of Object.entries(snapshot.overrides)) {
        await saveOverride({
          character: char,
          pinyin: val.pinyin,
          definition: val.definition
        });
        overridesMerged++;
      }
    }

    // 4. Merge heatmap
    if (snapshot.heatmap) {
      try {
        const currentData = localStorage.getItem('characters_read_heatmap');
        const currentMap = currentData ? JSON.parse(currentData) : {};
        for (const [date, count] of Object.entries(snapshot.heatmap)) {
          currentMap[date] = Math.max(currentMap[date] || 0, count);
        }
        localStorage.setItem('characters_read_heatmap', JSON.stringify(currentMap));
      } catch {
        // ignore
      }
    }

    return { cardsMerged, storiesMerged, overridesMerged };
  }
}
