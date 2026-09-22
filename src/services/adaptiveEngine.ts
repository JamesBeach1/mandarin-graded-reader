/**
 * Adaptive Lesson & Item Response Theory (IRT) Engine
 * - Calculates dynamic confidence scores based on speed, error severity, and repetition
 * - Synthesizes instantaneous, zero-latency remedial micro-lessons tailored to specific errors
 * - Modulates difficulty progression (accelerating mastery or reinforcing fundamentals)
 */

import type { OdysseyExercise, MinimalPairTriagePayload, StrokeOrderQuizPayload, SentenceBuilderDistractorPayload } from '../types/Course';

export type ErrorType = 'tone_confusion' | 'character_confusion' | 'syntax_error' | 'acoustic_slip';

export interface RemedialConcept {
  concept: string;          // e.g. "买 (mǎi) vs 卖 (mài)" or "3rd tone sandhi" or "已 vs 己"
  errorType: ErrorType;
  details?: string;
}

export class AdaptiveEngine {
  /**
   * Calculates Item Response Theory (IRT) response confidence (0 - 100)
   * Factors in response latency against expected baseline and attempt count.
   */
  public static calculateConfidence(
    isCorrect: boolean,
    responseTimeSeconds: number,
    baselineExpectedSeconds: number = 8,
    attemptCount: number = 1
  ): number {
    if (!isCorrect) {
      return Math.max(10, 40 - (attemptCount - 1) * 15);
    }

    // Faster than baseline = high automaticity (mastery)
    const speedBonus = Math.max(-20, Math.min(20, (baselineExpectedSeconds - responseTimeSeconds) * 4));
    const attemptPenalty = (attemptCount - 1) * 20;

    return Math.min(100, Math.max(50, Math.round(85 + speedBonus - attemptPenalty)));
  }

  /**
   * Synthesizes an instantaneous client-side remedial micro-lesson
   * Pre-pended immediately to the active queue without network latency.
   */
  public static generateRemedialExercise(
    remedial: RemedialConcept
  ): OdysseyExercise {
    const id = `remedial-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    switch (remedial.errorType) {
      case 'tone_confusion': {
        const payload: MinimalPairTriagePayload = {
          promptAudioText: remedial.concept.includes('买') ? '买' : (remedial.concept.split(' ')[0] || '你'),
          contrastCategory: 'tone',
          explanation: `Remedial Focus: Pay close attention to the pitch contour. ${remedial.details || 'Distinguish 3rd dipping tone from 4th falling tone.'}`,
          timeLimitSeconds: 10,
          options: [
            {
              text: '买 (mǎi) - 3rd Tone',
              pinyin: 'mǎi',
              meaning: 'To Buy (low dipping tone)',
              isCorrect: true
            },
            {
              text: '卖 (mài) - 4th Tone',
              pinyin: 'mài',
              meaning: 'To Sell (sharp falling tone)',
              isCorrect: false
            }
          ]
        };

        return {
          id,
          type: 'minimal_pair_triage',
          title: '⚡ Remedial Reinforcement: Tone Triage',
          instructions: 'Quick drill: You hesitated on tonal contrast. Pinpoint the correct tone below.',
          payload,
          isRemedial: true,
          targetConcept: remedial.concept
        };
      }

      case 'character_confusion': {
        const char = remedial.concept.length > 0 ? remedial.concept[0] : '已';
        const payload: StrokeOrderQuizPayload = {
          character: char,
          pinyin: 'yǐ',
          definition: 'already (closed corner)',
          radical: '己',
          strokeCount: 3
        };

        return {
          id,
          type: 'stroke_order_quiz',
          title: '⚡ Remedial Focus: Orthographic Precision',
          instructions: `Carefully inspect and draw ${char}. Distinguish it from look-alike glyphs (己 / 已 / 巳).`,
          payload,
          isRemedial: true,
          targetConcept: remedial.concept
        };
      }

      case 'syntax_error':
      default: {
        const payload: SentenceBuilderDistractorPayload = {
          targetSentence: remedial.details || '请出示护照',
          englishTranslation: 'Please show your passport',
          pinyin: 'qǐng chū shì hù zhào',
          validChips: ['请', '出示', '护照'],
          distractorChips: ['着', '在'],
          explanation: 'Target structure: Polite imperative (请) + transitive verb (出示) + noun (护照).'
        };

        return {
          id,
          type: 'sentence_builder_distractors',
          title: '⚡ Remedial Drill: Syntax Recovery',
          instructions: 'Re-assemble this core sentence structure without distractors.',
          payload,
          isRemedial: true,
          targetConcept: remedial.concept
        };
      }
    }
  }
}
