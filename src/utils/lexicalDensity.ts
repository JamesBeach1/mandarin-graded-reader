/**
 * Lexical Density & Text Difficulty Scorer
 * Evaluates Chinese texts for vocabulary richness, Type-Token Ratio (TTR), and HSK distribution.
 */

import type { HanziItem } from '../types/HanziItem';

export interface LexicalAnalysisReport {
  totalCharacters: number;
  uniqueCharacters: number;
  typeTokenRatio: number; // Unique / Total (0.0 to 1.0)
  lexicalDensityPercentage: number;
  hskDistribution: Record<string, number>; // "1": 40%, "2": 25%, etc.
  estimatedHSKLevel: number;
}

export function analyzeLexicalDensity(
  tokens: HanziItem[]
): LexicalAnalysisReport {
  const chineseTokens = tokens.filter(t => !t.isNonChinese);
  const totalCharacters = chineseTokens.reduce((acc, t) => acc + t.character.length, 0);

  const uniqueCharSet = new Set<string>();
  const hskCounts: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, 'Unknown': 0 };

  chineseTokens.forEach(token => {
    for (const char of token.character) {
      uniqueCharSet.add(char);
    }
    const level = token.hsk_level && hskCounts[token.hsk_level] !== undefined ? token.hsk_level : 'Unknown';
    hskCounts[level] = (hskCounts[level] || 0) + token.character.length;
  });

  const uniqueCharacters = uniqueCharSet.size;
  const typeTokenRatio = totalCharacters > 0 ? uniqueCharacters / totalCharacters : 0;
  const lexicalDensityPercentage = Math.round(typeTokenRatio * 100);

  // Compute percentages
  const hskDistribution: Record<string, number> = {};
  let weightedSum = 0;
  let weightedCount = 0;

  Object.keys(hskCounts).forEach(lvl => {
    const count = hskCounts[lvl];
    const pct = totalCharacters > 0 ? Math.round((count / totalCharacters) * 100) : 0;
    hskDistribution[lvl] = pct;

    const numLvl = parseInt(lvl, 10);
    if (!isNaN(numLvl)) {
      weightedSum += numLvl * count;
      weightedCount += count;
    }
  });

  const estimatedHSKLevel = weightedCount > 0 ? Math.round(weightedSum / weightedCount) : 1;

  return {
    totalCharacters,
    uniqueCharacters,
    typeTokenRatio: parseFloat(typeTokenRatio.toFixed(3)),
    lexicalDensityPercentage,
    hskDistribution,
    estimatedHSKLevel
  };
}
