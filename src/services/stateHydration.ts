import { getAllCards, addCard, updateCard } from './srsStore';
import { getSavedStories, saveStory } from './libraryStore';
import { getOverridesMap, saveOverride } from './dictionaryStore';

export interface StateHydrationBundle {
  version: number;
  timestamp: number;
  metadata: {
    client: string;
    totalCards: number;
    totalStories: number;
  };
  srsCards: any[];
  savedStories: any[];
  dictionaryOverrides: Record<string, { pinyin: string; definition: string }>;
  readingHeatmap: Record<string, number>;
  userPreferences: {
    themeId?: string;
    hskLevel?: string;
    showPinyin?: boolean;
    hidePinyinLevel?: number;
    ttsSpeed?: number;
  };
}

/**
 * Exports complete client-side data state into a standalone JSON file bundle
 */
export async function exportStateBundle(): Promise<void> {
  const cards = await getAllCards();
  const stories = await getSavedStories();
  const overrides = await getOverridesMap();
  
  let heatmap: Record<string, number> = {};
  try {
    const raw = localStorage.getItem('characters_read_heatmap');
    if (raw) heatmap = JSON.parse(raw);
  } catch {
    // ignore
  }

  const bundle: StateHydrationBundle = {
    version: 2,
    timestamp: Date.now(),
    metadata: {
      client: 'MandarinGradedReader-NextGen',
      totalCards: cards.length,
      totalStories: stories.length
    },
    srsCards: cards,
    savedStories: stories,
    dictionaryOverrides: overrides,
    readingHeatmap: heatmap,
    userPreferences: {
      themeId: localStorage.getItem('mgr_custom_theme_config') || undefined,
      hskLevel: localStorage.getItem('hsk_level') || undefined,
      showPinyin: localStorage.getItem('show_pinyin') !== 'false',
      hidePinyinLevel: Number(localStorage.getItem('hide_pinyin_level')) || 0,
      ttsSpeed: Number(localStorage.getItem('tts_speed')) || 1.0
    }
  };

  const jsonStr = JSON.stringify(bundle, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mandarin-reader-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Hydrates state bundle into client storage, merging newer records
 */
export async function importStateBundle(file: File): Promise<{ success: boolean; message: string }> {
  try {
    const text = await file.text();
    const bundle: StateHydrationBundle = JSON.parse(text);

    if (!bundle.version || !Array.isArray(bundle.srsCards)) {
      return { success: false, message: 'Invalid state bundle format' };
    }

    // Merge SRS Cards
    const existingCards = await getAllCards();
    const existingMap = new Map(existingCards.map(c => [c.character, c]));

    for (const card of bundle.srsCards) {
      if (card && card.character) {
        const existing = existingMap.get(card.character);
        if (!existing) {
          await addCard(card);
        } else if ((card.lastReviewed || 0) > (existing.lastReviewed || 0)) {
          await updateCard(card);
        }
      }
    }

    // Merge Stories
    if (Array.isArray(bundle.savedStories)) {
      for (const story of bundle.savedStories) {
        if (story && story.id && story.text) {
          await saveStory(story);
        }
      }
    }

    // Merge Overrides
    if (bundle.dictionaryOverrides) {
      for (const [char, val] of Object.entries(bundle.dictionaryOverrides)) {
        await saveOverride(char, val.pinyin, val.definition);
      }
    }

    // Merge Heatmap
    if (bundle.readingHeatmap) {
      let currentHeatmap: Record<string, number> = {};
      try {
        const raw = localStorage.getItem('characters_read_heatmap');
        if (raw) currentHeatmap = JSON.parse(raw);
      } catch {
        // ignore
      }

      for (const [date, count] of Object.entries(bundle.readingHeatmap)) {
        currentHeatmap[date] = Math.max(currentHeatmap[date] || 0, count);
      }
      localStorage.setItem('characters_read_heatmap', JSON.stringify(currentHeatmap));
    }

    return {
      success: true,
      message: `State hydrated successfully: ${bundle.srsCards.length} cards, ${bundle.savedStories?.length || 0} stories processed.`
    };
  } catch (err: any) {
    return { success: false, message: `Failed to import state bundle: ${err.message}` };
  }
}
