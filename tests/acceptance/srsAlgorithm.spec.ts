import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import {
  DEFAULT_SRS_SETTINGS,
  type SrsCustomizerSettings,
  type Flashcard
} from '../../src/services/srsStore';

/**
 * Pure SM-2 calculation simulating srsStore update logic for deterministic testing
 */
function calculateNextSm2(
  card: { interval: number; easeFactor: number },
  quality: number,
  settings: SrsCustomizerSettings = DEFAULT_SRS_SETTINGS
): { interval: number; easeFactor: number } {
  let { interval, easeFactor } = card;

  let qMapped = 3;
  if (quality === 1) qMapped = 0;
  else if (quality === 2) qMapped = 2;
  else if (quality === 3) qMapped = 4;
  else if (quality === 4) qMapped = 5;

  easeFactor = easeFactor + (0.1 - (5 - qMapped) * (0.08 + (5 - qMapped) * 0.02));
  if (easeFactor < settings.minEaseFactor) {
    easeFactor = settings.minEaseFactor;
  }

  if (qMapped < 3) {
    interval = settings.failureInterval; // failure lapse
  } else {
    if (interval === 0) {
      interval = settings.initialInterval;
    } else if (interval <= settings.initialInterval) {
      interval = settings.secondInterval;
    } else {
      let factor = easeFactor;
      if (quality === 2) {
        factor = Math.max(1.0, settings.hardIntervalFactor);
      } else if (quality === 4) {
        factor = easeFactor * settings.easyBonusMultiplier;
      }
      interval = Math.max(interval + 1, Math.round(interval * factor));
    }
  }

  return { interval, easeFactor: parseFloat(easeFactor.toFixed(3)) };
}

export async function runSrsAlgorithmAcceptanceTests() {
  await feature('FT-SRS', 'Spaced Repetition (SM-2) Interval Calculation & Customizer', async () => {
    await scenario('Calculate intervals sequentially for a newly learned card under default settings', async () => {
      let card = { interval: 0, easeFactor: 2.5 };

      await given('a brand new card with interval=0 and initial easeFactor=2.5', () => {
        expect(card.interval).toBe(0);
        expect(card.easeFactor).toBe(2.5);
      });

      await when('rated 3 ("Good") on first review', () => {
        card = calculateNextSm2(card, 3);
      });

      await then('interval becomes 1 day (initialInterval)', () => {
        expect(card.interval).toBe(DEFAULT_SRS_SETTINGS.initialInterval);
        expect(card.easeFactor).toBe(2.5); // qMapped=4 gives 2.5 + (0.1 - 1*(0.08+0.02)) = 2.5 + 0 = 2.5
      });

      await when('rated 3 ("Good") on second review', () => {
        card = calculateNextSm2(card, 3);
      });

      await then('interval advances to 4 days (secondInterval)', () => {
        expect(card.interval).toBe(DEFAULT_SRS_SETTINGS.secondInterval);
      });

      await when('rated 3 ("Good") on third review', () => {
        card = calculateNextSm2(card, 3);
      });

      await then('interval compounds by easeFactor (round(4 * 2.5) = 10 days)', () => {
        expect(card.interval).toBe(10);
      });

      await when('rated 1 ("Fail") on fourth review', () => {
        card = calculateNextSm2(card, 1);
      });

      await then('interval immediately lapses back to failureInterval (1 day)', () => {
        expect(card.interval).toBe(DEFAULT_SRS_SETTINGS.failureInterval);
      });
    });

    await scenario('Enforce minimum ease factor floor (minEaseFactor = 1.30)', async () => {
      let card = { interval: 10, easeFactor: 1.4 };

      await given('a card with low ease factor 1.40', () => {});

      await when('rated 1 ("Fail") multiple times consecutively', () => {
        card = calculateNextSm2(card, 1);
        card = calculateNextSm2(card, 1);
      });

      await then('easeFactor never falls below 1.30', () => {
        expect(card.easeFactor).toBeGreaterThanOrEqual(1.30);
        expect(card.easeFactor).toBe(1.30);
      });
    });

    await scenario('Apply easy bonus multiplier when rating is 4 ("Easy")', async () => {
      const standardCard = calculateNextSm2({ interval: 4, easeFactor: 2.5 }, 3);
      const easyCard = calculateNextSm2({ interval: 4, easeFactor: 2.5 }, 4);

      await then('the easy card interval is substantially higher than the good card', () => {
        expect(easyCard.interval).toBeGreaterThan(standardCard.interval);
        // Standard: round(4 * 2.5) = 10
        // Easy: round(4 * (2.6 * 1.3)) = round(4 * 3.38) = 14
        expect(standardCard.interval).toBe(10);
        expect(easyCard.interval).toBe(14);
      });
    });

    await scenario('Customizer settings alter progression intervals', async () => {
      const customSettings: SrsCustomizerSettings = {
        ...DEFAULT_SRS_SETTINGS,
        initialInterval: 2,
        secondInterval: 6
      };

      const step1 = calculateNextSm2({ interval: 0, easeFactor: 2.5 }, 3, customSettings);
      const step2 = calculateNextSm2(step1, 3, customSettings);

      await then('the initial and second intervals match customized settings', () => {
        expect(step1.interval).toBe(2);
        expect(step2.interval).toBe(6);
      });
    });
  });
}
