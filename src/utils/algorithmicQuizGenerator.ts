/**
 * Algorithmic Cloze & Jigsaw Quiz Generator (NONLLM-005)
 *
 * Synthesizes interactive cloze challenges and auditory sentence jigsaw exercises
 * from any text passage using client-side segmentation and static lexical databases.
 * Runs in-memory with zero LLM costs and zero network latency.
 */

import type { HanziItem } from '../types/HanziItem';

export interface AlgorithmicClozeQuestion {
  id: string;
  sentenceWithBlank: string;
  targetWord: string;
  targetPinyin: string;
  targetDefinition: string;
  hskLevel: string;
  options: string[]; // 4 choices (1 correct + 3 smart distractors)
  correctOptionIndex: number;
  explanation: string;
}

export interface AlgorithmicJigsawSentence {
  id: string;
  originalSentence: string;
  pinyin: string;
  translation: string;
  scrambledChips: string[];
  correctOrder: string[];
}

export const AlgorithmicQuizGenerator = {
  /**
   * Generates smart cloze questions from an array of story tokens.
   */
  generateClozeQuestions(
    tokens: HanziItem[],
    targetCount: number = 5,
    userHskLevel: number = 2
  ): AlgorithmicClozeQuestion[] {
    const questions: AlgorithmicClozeQuestion[] = [];
    const fullText = tokens.map(t => t.character).join('');

    // Split text into coherent sentences using CJK punctuation
    const rawSentences = fullText.split(/([。！？\n]+)/).filter(s => s.trim().length > 0);
    const sentences: string[] = [];
    for (let i = 0; i < rawSentences.length; i += 2) {
      const body = rawSentences[i];
      const punct = rawSentences[i + 1] || '。';
      if (body.trim()) sentences.push(body + punct);
    }

    if (sentences.length === 0) return [];

    // Candidate tokens: Chinese compounds or single characters with length > 0
    const chineseTokens = tokens.filter(t => !t.isNonChinese && /[\u4E00-\u9FFF]/.test(t.character));
    if (chineseTokens.length === 0) return [];

    // Distinct target vocabulary pool
    const uniqueTargets = new Map<string, HanziItem>();
    chineseTokens.forEach(t => {
      if (!uniqueTargets.has(t.character) && t.character.length >= 1) {
        uniqueTargets.set(t.character, t);
      }
    });

    const targetList = Array.from(uniqueTargets.values()).sort((a, b) => {
      // Prioritize words close to or slightly above user HSK level
      const hskA = parseInt(a.hsk_level, 10) || 1;
      const hskB = parseInt(b.hsk_level, 10) || 1;
      return Math.abs(hskA - userHskLevel) - Math.abs(hskB - userHskLevel);
    });

    // Generate questions for top candidates that appear in sentences
    for (const target of targetList) {
      if (questions.length >= targetCount) break;

      // Find first sentence containing this word
      const hostSentence = sentences.find(s => s.includes(target.character));
      if (!hostSentence) continue;

      // Pick 3 smart distractors with matching character length and similar frequency
      const sameLengthPool = Array.from(uniqueTargets.values()).filter(
        t => t.character !== target.character && t.character.length === target.character.length
      );

      // Fallback pools if uniqueTargets doesn't have enough matches
      const fallbackPool1 = ['但是', '虽然', '因为', '所以', '如果', '已经', '开始', '知道', '觉得', '喜欢'];
      const fallbackPoolSingle = ['在', '有', '和', '中', '大', '小', '看', '说', '想', '去', '来', '做'];

      const distractors: string[] = [];
      const used = new Set<string>([target.character]);

      // Draw from story's own vocabulary first
      for (const item of sameLengthPool) {
        if (distractors.length >= 3) break;
        if (!used.has(item.character)) {
          distractors.push(item.character);
          used.add(item.character);
        }
      }

      // Fill remaining from general pool
      const backup = target.character.length === 1 ? fallbackPoolSingle : fallbackPool1;
      for (const w of backup) {
        if (distractors.length >= 3) break;
        if (!used.has(w)) {
          distractors.push(w);
          used.add(w);
        }
      }

      if (distractors.length < 3) continue;

      // Shuffle options
      const options = [target.character, ...distractors.slice(0, 3)].sort(() => 0.5 - Math.random());
      const correctIdx = options.indexOf(target.character);

      // Blank out target in sentence
      const sentenceWithBlank = hostSentence.replace(target.character, '【 ___ 】');

      questions.push({
        id: `cloze_${questions.length + 1}_${target.character}`,
        sentenceWithBlank,
        targetWord: target.character,
        targetPinyin: target.pinyin,
        targetDefinition: target.definition,
        hskLevel: target.hsk_level || '1',
        options,
        correctOptionIndex: correctIdx,
        explanation: `“${target.character}” (${target.pinyin}) means "${target.definition}". It fits grammatically into the sentence: "${hostSentence}".`
      });
    }

    return questions;
  },

  /**
   * Generates auditory / sentence jigsaw puzzles from story sentences.
   */
  generateJigsawSentences(
    text: string,
    targetCount: number = 3
  ): AlgorithmicJigsawSentence[] {
    const rawSentences = text.split(/([。！？\n]+)/).filter(s => s.trim().length > 0);
    const sentences: string[] = [];
    for (let i = 0; i < rawSentences.length; i += 2) {
      const body = rawSentences[i].trim();
      const punct = rawSentences[i + 1] || '。';
      // Pick sentences with pedagogical length between 6 and 22 characters
      if (body.length >= 6 && body.length <= 22) {
        sentences.push(body + punct);
      }
    }

    const segmenter = typeof Intl !== 'undefined' && Intl.Segmenter
      ? new Intl.Segmenter('zh-CN', { granularity: 'word' })
      : null;

    const jigsaws: AlgorithmicJigsawSentence[] = [];

    for (let i = 0; i < Math.min(sentences.length, targetCount); i++) {
      const full = sentences[i];
      let chunks: string[] = [];

      if (segmenter) {
        chunks = Array.from(segmenter.segment(full))
          .map(s => s.segment)
          .filter(s => s.trim().length > 0 && !/^[。！？，、]$/.test(s));
      } else {
        // Fallback: 2-character chunker
        for (let j = 0; j < full.length; j += 2) {
          chunks.push(full.slice(j, j + 2));
        }
      }

      if (chunks.length < 3) continue;

      const scrambled = [...chunks].sort(() => 0.5 - Math.random());
      // Guarantee it's not identical to answer if possible
      if (scrambled.join('') === chunks.join('') && scrambled.length > 1) {
        const temp = scrambled[0];
        scrambled[0] = scrambled[1];
        scrambled[1] = temp;
      }

      jigsaws.push({
        id: `jigsaw_${i + 1}`,
        originalSentence: full,
        pinyin: '',
        translation: '',
        scrambledChips: scrambled,
        correctOrder: chunks
      });
    }

    return jigsaws;
  }
};
