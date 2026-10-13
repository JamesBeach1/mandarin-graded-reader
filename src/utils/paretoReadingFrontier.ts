/**
 * Pareto Reading Frontier Engine (NONLLM-003)
 *
 * Algorithmic High-Yield Vocabulary Analyzer.
 * Identifies the top 5-10 unknown characters in any text that unlock the
 * maximum mathematical jump in text comprehension percentage.
 * Operates purely in-memory in sub-10ms with zero LLM requests.
 */

import type { HanziItem } from '../types/HanziItem';

export interface ParetoCandidate {
  character: string;
  occurrenceCount: number;
  textFrequencyPercent: number;
  globalRank: number;
  hskLevel: string;
  pinyin: string;
  definition: string;
  cumulativeCoverageGain: number; // Percentage comprehension gained including this word
}

export interface ParetoFrontierReport {
  totalChineseCharacters: number;
  uniqueChineseCharacters: number;
  baselineKnownCount: number;
  baselineComprehensionPercent: number;
  frontierCandidates: ParetoCandidate[];
  projectedComprehensionPercent: number;
  comprehensionJumpPercent: number;
  insightSummary: string;
}

export const ParetoReadingFrontierEngine = {
  /**
   * Analyze an array of story tokens against the user's known level or known words set.
   *
   * @param tokens Story HanziItems
   * @param userHskLevel The learner's current HSK mastery level (1 to 6)
   * @param knownCharacters Optional set of explicitly mastered characters from SRS
   * @param topCount Number of Pareto targets to surface (default 5)
   */
  calculateFrontier(
    tokens: HanziItem[],
    userHskLevel: number = 2,
    knownCharacters?: Set<string>,
    topCount: number = 5
  ): ParetoFrontierReport {
    let totalChinese = 0;
    const charCounts = new Map<string, { count: number; token: HanziItem }>();

    for (const t of tokens) {
      if (t.isNonChinese || !t.character) continue;
      // Loop individual characters in case token is a compound
      for (const ch of t.character) {
        if (/[\u4E00-\u9FFF]/.test(ch)) {
          totalChinese++;
          const existing = charCounts.get(ch);
          if (existing) {
            existing.count++;
          } else {
            charCounts.set(ch, { count: 1, token: t });
          }
        }
      }
    }

    if (totalChinese === 0) {
      return {
        totalChineseCharacters: 0,
        uniqueChineseCharacters: 0,
        baselineKnownCount: 0,
        baselineComprehensionPercent: 100,
        frontierCandidates: [],
        projectedComprehensionPercent: 100,
        comprehensionJumpPercent: 0,
        insightSummary: 'No Chinese text detected.'
      };
    }

    // Determine which characters are currently considered known
    let knownCharOccurrences = 0;
    const unknownCandidates: Array<{
      character: string;
      count: number;
      token: HanziItem;
      rank: number;
      hsk: number;
    }> = [];

    charCounts.forEach(({ count, token }, ch) => {
      const hskNum = parseInt(token.hsk_level, 10);
      const isKnownBySrs = knownCharacters ? knownCharacters.has(ch) : false;
      const isKnownByHsk = !isNaN(hskNum) && hskNum <= userHskLevel;

      if (isKnownBySrs || isKnownByHsk) {
        knownCharOccurrences += count;
      } else {
        const rank = token.frequency_rank ? parseInt(token.frequency_rank, 10) : 99999;
        unknownCandidates.push({
          character: ch,
          count,
          token,
          rank: isNaN(rank) ? 99999 : rank,
          hsk: isNaN(hskNum) ? 7 : hskNum
        });
      }
    });

    const baselineComprehension = (knownCharOccurrences / totalChinese) * 100;

    // Pareto Sorting:
    // Primary criterion: Occurrence count in THIS text descending (highest direct impact)
    // Secondary criterion: Global frequency rank ascending (easier, more broadly applicable character)
    unknownCandidates.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.rank - b.rank;
    });

    const topCandidates = unknownCandidates.slice(0, topCount);
    let runningGainedOccurrences = 0;

    const frontierCandidates: ParetoCandidate[] = topCandidates.map(c => {
      runningGainedOccurrences += c.count;
      const gainPercent = (runningGainedOccurrences / totalChinese) * 100;
      return {
        character: c.character,
        occurrenceCount: c.count,
        textFrequencyPercent: parseFloat(((c.count / totalChinese) * 100).toFixed(1)),
        globalRank: c.rank,
        hskLevel: c.token.hsk_level || 'Unknown',
        pinyin: c.token.pinyin || '',
        definition: c.token.definition || '',
        cumulativeCoverageGain: parseFloat((baselineComprehension + gainPercent).toFixed(1))
      };
    });

    const totalGainPercent = (runningGainedOccurrences / totalChinese) * 100;
    const projectedPercent = Math.min(100, baselineComprehension + totalGainPercent);
    const jump = projectedPercent - baselineComprehension;

    const insight = frontierCandidates.length > 0
      ? `By learning just ${frontierCandidates.length} high-frequency character${frontierCandidates.length > 1 ? 's' : ''} (${frontierCandidates.map(c => c.character).join('、')}), your comprehension of this text jumps from ${baselineComprehension.toFixed(1)}% to ${projectedPercent.toFixed(1)}% (+${jump.toFixed(1)}%).`
      : `Your current vocabulary covers 100% of this text at HSK ${userHskLevel} benchmark.`;

    return {
      totalChineseCharacters: totalChinese,
      uniqueChineseCharacters: charCounts.size,
      baselineKnownCount: knownCharOccurrences,
      baselineComprehensionPercent: parseFloat(baselineComprehension.toFixed(1)),
      frontierCandidates,
      projectedComprehensionPercent: parseFloat(projectedPercent.toFixed(1)),
      comprehensionJumpPercent: parseFloat(jump.toFixed(1)),
      insightSummary: insight
    };
  }
};
