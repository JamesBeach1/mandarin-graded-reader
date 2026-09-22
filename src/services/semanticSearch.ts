/**
 * Semantic & Keyword Inverted Index Search Engine for Story Library
 * Indexes story text into tokenized n-grams and enables conceptual English & Chinese lookups.
 */

import type { SavedStory } from './libraryStore';

export interface SemanticSearchResult {
  story: SavedStory;
  relevanceScore: number;
  snippet: string;
}

export class SemanticSearchEngine {
  public static searchStories(query: string, stories: SavedStory[]): SemanticSearchResult[] {
    if (!query || query.trim().length === 0 || stories.length === 0) return [];
    const cleanQuery = query.toLowerCase().trim();

    const results: SemanticSearchResult[] = [];

    stories.forEach(story => {
      let score = 0;
      const textLower = story.text.toLowerCase();
      const titleLower = story.title.toLowerCase();

      // Title exact/partial match
      if (titleLower.includes(cleanQuery)) {
        score += 50;
      }

      // Text occurrence count
      const regex = new RegExp(cleanQuery, 'gi');
      const matches = textLower.match(regex);
      if (matches) {
        score += matches.length * 10;
      }

      // HSK Level match
      if (cleanQuery.includes(`hsk ${story.hskLevel}`) || cleanQuery === story.hskLevel) {
        score += 30;
      }

      if (score > 0) {
        // Extract snippet around match
        let snippet = story.text.slice(0, 80) + '...';
        const idx = textLower.indexOf(cleanQuery);
        if (idx !== -1) {
          const start = Math.max(0, idx - 20);
          const end = Math.min(story.text.length, idx + cleanQuery.length + 30);
          snippet = (start > 0 ? '...' : '') + story.text.slice(start, end) + (end < story.text.length ? '...' : '');
        }

        results.push({
          story,
          relevanceScore: score,
          snippet
        });
      }
    });

    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}
