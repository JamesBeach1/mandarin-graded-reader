/**
 * Reading Speed Analytics Engine (GTU-002)
 * Tracks real-time Characters Per Minute (CPM), session progression history, and HSK benchmarks.
 */

export interface ReadingSpeedRecord {
  timestamp: number;
  charactersRead: number;
  elapsedSeconds: number;
  cpm: number;
  storyTitle?: string;
  hskLevel?: string;
}

export interface ReadingBenchmark {
  tier: string;
  name: string;
  targetRange: string;
  color: string;
  description: string;
  isCurrentTier: boolean;
}

export class ReadingAnalytics {
  private static STORAGE_KEY = 'moyun_reading_speed_history';

  public static calculateCPM(charactersCount: number, elapsedSeconds: number): number {
    if (elapsedSeconds <= 0 || charactersCount <= 0) return 0;
    const minutes = elapsedSeconds / 60;
    return Math.round(charactersCount / minutes);
  }

  public static recordSession(
    charactersRead: number, 
    elapsedSeconds: number,
    storyTitle?: string,
    hskLevel?: string
  ): ReadingSpeedRecord {
    const cpm = this.calculateCPM(charactersRead, elapsedSeconds);
    const record: ReadingSpeedRecord = {
      timestamp: Date.now(),
      charactersRead,
      elapsedSeconds,
      cpm,
      storyTitle: storyTitle || 'Graded Reader Story',
      hskLevel: hskLevel || '1'
    };

    try {
      const history = this.getHistory();
      history.push(record);
      // Keep last 60 session records
      if (history.length > 60) history.shift();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      console.warn('Failed to persist reading speed history:', err);
    }

    return record;
  }

  public static getHistory(): ReadingSpeedRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public static getAverageCPM(): number {
    const history = this.getHistory();
    if (history.length === 0) return 0;
    const sum = history.reduce((acc, r) => acc + r.cpm, 0);
    return Math.round(sum / history.length);
  }

  public static getPeakCPM(): number {
    const history = this.getHistory();
    if (history.length === 0) return 0;
    return Math.max(...history.map(r => r.cpm));
  }

  public static getTotalCharactersRead(): number {
    const history = this.getHistory();
    return history.reduce((acc, r) => acc + r.charactersRead, 0);
  }

  public static getBenchmarks(currentCPM: number): ReadingBenchmark[] {
    return [
      {
        tier: 'HSK 1-2',
        name: 'Foundational Pacing',
        targetRange: '50 - 90 CPM',
        color: '#60a5fa',
        description: 'Careful word-by-word decoding with Pinyin assistance.',
        isCurrentTier: currentCPM > 0 && currentCPM < 95
      },
      {
        tier: 'HSK 3-4',
        name: 'Intermediate Agility',
        targetRange: '95 - 160 CPM',
        color: '#34d399',
        description: 'Synthesizing compound words; decreasing reliance on phonetic rubies.',
        isCurrentTier: currentCPM >= 95 && currentCPM < 170
      },
      {
        tier: 'HSK 5-6',
        name: 'Advanced Fluency',
        targetRange: '170 - 250 CPM',
        color: '#f59e0b',
        description: 'Broad grammatical parsing, rapid skim-reading and contextual inference.',
        isCurrentTier: currentCPM >= 170 && currentCPM < 260
      },
      {
        tier: 'Native',
        name: 'Native Literature Speed',
        targetRange: '260+ CPM',
        color: '#ec4899',
        description: 'Unconstrained reading speed matching native newspaper and novel readers.',
        isCurrentTier: currentCPM >= 260
      }
    ];
  }
}
