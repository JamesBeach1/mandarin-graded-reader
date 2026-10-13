import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { AdaptiveEngine, type RemedialConcept } from '../../src/services/adaptiveEngine';

export async function runAdaptiveEngineAcceptanceTests() {
  await feature('FT-IRT', 'Adaptive Item Response Theory (IRT) Confidence & Remedial Generator', async () => {
    await scenario('Calculate response confidence factoring latency and attempts', async () => {
      await given('a fast and correct answer (2 seconds vs 8 seconds baseline on attempt 1)', () => {});

      await then('confidence reflects high mastery (>= 90)', () => {
        const conf = AdaptiveEngine.calculateConfidence(true, 2, 8, 1);
        expect(conf).toBeGreaterThanOrEqual(90);
        expect(conf).toBeLessThanOrEqual(100);
      });

      await and('a slow correct answer (12 seconds) lowers confidence score', () => {
        const confFast = AdaptiveEngine.calculateConfidence(true, 2, 8, 1);
        const confSlow = AdaptiveEngine.calculateConfidence(true, 12, 8, 1);
        expect(confSlow).toBeLessThan(confFast);
      });

      await and('an incorrect answer drops confidence down to minimum floor', () => {
        const confFail1 = AdaptiveEngine.calculateConfidence(false, 5, 8, 1);
        const confFail2 = AdaptiveEngine.calculateConfidence(false, 5, 8, 2);
        expect(confFail1).toBeLessThanOrEqual(40);
        expect(confFail2).toBeLessThan(confFail1);
      });
    });

    await scenario('Synthesize instant client-side tone confusion remedial exercise', async () => {
      let exercise: any = null;

      await given('a tone confusion error between 买 and 卖', () => {
        const remedial: RemedialConcept = {
          concept: '买 (mǎi) vs 卖 (mài)',
          errorType: 'tone_confusion',
          details: 'Distinguish 3rd dipping tone from 4th falling tone.'
        };
        exercise = AdaptiveEngine.generateRemedialExercise(remedial);
      });

      await then('it creates a minimal_pair_triage exercise', () => {
        expect(exercise).toBeDefined();
        expect(exercise.type).toBe('minimal_pair_triage');
        expect(exercise.isRemedial).toBe(true);
        expect(exercise.payload.contrastCategory).toBe('tone');
        expect(exercise.payload.options.length).toBe(2);
      });
    });

    await scenario('Synthesize instant orthographic stroke order remedial drill', async () => {
      let exercise: any = null;

      await given('a character confusion error on "已"', () => {
        const remedial: RemedialConcept = {
          concept: '已 vs 己',
          errorType: 'character_confusion'
        };
        exercise = AdaptiveEngine.generateRemedialExercise(remedial);
      });

      await then('it creates a stroke_order_quiz exercise', () => {
        expect(exercise).toBeDefined();
        expect(exercise.type).toBe('stroke_order_quiz');
        expect(exercise.isRemedial).toBe(true);
        expect(exercise.payload.character).toBe('已');
      });
    });

    await scenario('Synthesize syntax error recovery sentence builder with distractors', async () => {
      let exercise: any = null;

      await given('a syntax word order error', () => {
        const remedial: RemedialConcept = {
          concept: 'Word order in polite requests',
          errorType: 'syntax_error',
          details: '请出示护照'
        };
        exercise = AdaptiveEngine.generateRemedialExercise(remedial);
      });

      await then('it creates a sentence_builder_distractors exercise', () => {
        expect(exercise).toBeDefined();
        expect(exercise.type).toBe('sentence_builder_distractors');
        expect(exercise.isRemedial).toBe(true);
        expect(exercise.payload.validChips.length).toBeGreaterThan(0);
        expect(exercise.payload.distractorChips.length).toBeGreaterThan(0);
      });
    });
  });
}
