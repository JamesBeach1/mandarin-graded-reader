/**
 * Peer-to-Peer Story Sharing (GTU-005)
 * Standardized portable Moyun story package (.moyun.json)
 * Supports export to file, clipboard exchange, URL hash sharing, and file import.
 */

import type { HanziItem } from '../types/HanziItem';

export interface MoyunStoryPackage {
  format: 'moyun-story-v1';
  exportedAt: string;
  story: {
    id: string;
    title: string;
    hskLevel: string;
    text: string;
    tokens?: HanziItem[];
    author?: string;
  };
  metadata: {
    characterCount: number;
    estimatedReadTimeMinutes: number;
    appVersion: string;
  };
}

export class StoryShareService {
  public static readonly CURRENT_FORMAT = 'moyun-story-v1';

  /**
   * Bundles a story into a verified MoyunStoryPackage
   */
  public static createPackage(
    title: string,
    text: string,
    hskLevel: string,
    tokens?: HanziItem[]
  ): MoyunStoryPackage {
    const charCount = text.replace(/[\s，。！？、“”《》：；]/g, '').length;
    // Standard adult reading speed for graded L2 is ~100-150 CPM
    const estMinutes = Math.max(1, Math.round(charCount / 120));

    return {
      format: this.CURRENT_FORMAT,
      exportedAt: new Date().toISOString(),
      story: {
        id: `story_shared_${Date.now()}`,
        title: title || 'Graded Story',
        hskLevel: hskLevel || '1',
        text: text.trim(),
        tokens: tokens && tokens.length > 0 ? tokens : undefined,
        author: 'Moyun Reader Community'
      },
      metadata: {
        characterCount: charCount,
        estimatedReadTimeMinutes: estMinutes,
        appVersion: '2.0.0'
      }
    };
  }

  /**
   * Triggers client-side browser file download for .moyun.json
   */
  public static downloadStoryFile(storyPkg: MoyunStoryPackage): void {
    const filename = `${storyPkg.story.title.replace(/[\/\\?%*:|"<>]/g, '_').trim() || 'story'}.moyun.json`;
    const jsonStr = JSON.stringify(storyPkg, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Validates and parses imported JSON story content
   */
  public static parseStoryPackage(rawJson: string): MoyunStoryPackage {
    let parsed: any;
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      throw new Error('Invalid JSON format. Please select a valid .moyun.json file.');
    }

    // Support both strict Moyun packages and legacy raw story objects
    if (parsed.format === this.CURRENT_FORMAT && parsed.story) {
      if (!parsed.story.title || !parsed.story.text) {
        throw new Error('Moyun package is missing mandatory "title" or "text" fields.');
      }
      return parsed as MoyunStoryPackage;
    }

    // Fallback: Legacy or raw exported story object { title, text, hskLevel }
    if (parsed.text && typeof parsed.text === 'string') {
      return this.createPackage(
        parsed.title || 'Imported Story',
        parsed.text,
        String(parsed.hskLevel || '1'),
        parsed.tokens
      );
    }

    throw new Error('Unrecognized story structure. The file must contain story text and title.');
  }

  /**
   * Generates a portable shareable deep-link URL hash containing compressed base64 story data
   */
  public static generateShareUrl(pkg: MoyunStoryPackage): string {
    const compactPayload = {
      t: pkg.story.title,
      h: pkg.story.hskLevel,
      c: pkg.story.text
    };
    try {
      const json = JSON.stringify(compactPayload);
      const encoded = btoa(encodeURIComponent(json));
      const baseUrl = window.location.origin + window.location.pathname;
      return `${baseUrl}#import=${encoded}`;
    } catch {
      return window.location.href;
    }
  }

  /**
   * Attempts to parse a story from the current URL hash (#import=...)
   */
  public static parseUrlHashPayload(): MoyunStoryPackage | null {
    if (typeof window === 'undefined' || !window.location.hash) return null;
    try {
      const hash = window.location.hash;
      const match = hash.match(/#import=([^&]+)/);
      if (!match || !match[1]) return null;

      const decoded = decodeURIComponent(atob(match[1]));
      const data = JSON.parse(decoded);
      if (data.t && data.c) {
        return this.createPackage(data.t, data.c, data.h || '1');
      }
      return null;
    } catch (e) {
      console.warn('Failed to parse story from URL hash:', e);
      return null;
    }
  }
}
