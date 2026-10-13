import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import {
  parseModelMetadata,
  sortGeminiModels,
  extractSuggestedModelFromError,
  isTransientCapacityError,
  getDeprecatedModels,
  markModelAsDeprecated
} from '../../src/services/gemini';
import { StorageService, STORAGE_KEYS } from '../../src/services/storage';

export async function runGeminiEngineAcceptanceTests() {
  await feature('FT-GEMINI', 'Dynamic Gemini Model Discovery & Self-Healing Engine', async () => {
    // Ensure localStorage polyfill if run in bare Node
    if (typeof globalThis.localStorage === 'undefined') {
      const store = new Map<string, string>();
      (globalThis as any).localStorage = {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => store.set(k, String(v)),
        removeItem: (k: string) => store.delete(k),
        clear: () => store.clear()
      };
    }

    await scenario('Parse semantic version, model tier, and generation badge accurately', async () => {
      await given('raw Google model identifiers', () => {});

      await then('gemini-3.5-flash parses to version 3.5 and tier flash', () => {
        const parsed = parseModelMetadata('models/gemini-3.5-flash');
        expect(parsed.id).toBe('gemini-3.5-flash');
        expect(parsed.version).toBe(3.5);
        expect(parsed.tier).toBe('flash');
        expect(parsed.badge).toContain('v3.5');
        expect(parsed.isExperimental).toBeFalsy();
      });

      await and('gemini-2.5-flash-lite parses to version 2.5 and tier flash-lite', () => {
        const parsed = parseModelMetadata('gemini-2.5-flash-lite');
        expect(parsed.version).toBe(2.5);
        expect(parsed.tier).toBe('flash-lite');
      });

      await and('experimental models like argon or preview are flagged isExperimental=true', () => {
        const argon = parseModelMetadata('gemini-4-argon');
        expect(argon.isExperimental).toBe(true);
        expect(argon.badge).toContain('Preview');
      });
    });

    await scenario('Stable production models strictly precede experimental models in sorting order', async () => {
      let sorted: any[] = [];

      await given('a mixture of stable and experimental models across generations', () => {
        const models = [
          parseModelMetadata('gemini-4-argon'),        // v4.0 Experimental
          parseModelMetadata('gemini-2.5-flash'),      // v2.5 Stable
          parseModelMetadata('gemini-3.5-flash'),      // v3.5 Stable
          parseModelMetadata('gemini-3.5-flash-lite'), // v3.5 Stable Lite
          parseModelMetadata('gemini-2.5-pro')         // v2.5 Stable Pro
        ];
        sorted = sortGeminiModels(models);
      });

      await then('all stable models precede experimental argon model', () => {
        const argonIdx = sorted.findIndex(m => m.id === 'gemini-4-argon');
        const flash35Idx = sorted.findIndex(m => m.id === 'gemini-3.5-flash');
        const flash25Idx = sorted.findIndex(m => m.id === 'gemini-2.5-flash');
        expect(flash35Idx).toBe(0); // Top stable frontier
        expect(argonIdx).toBeGreaterThan(flash35Idx);
        expect(argonIdx).toBeGreaterThan(flash25Idx);
      });

      await and('generational order descends among stable models (3.5 > 2.5)', () => {
        expect(sorted[0].version).toBeGreaterThanOrEqual(sorted[1].version);
      });
    });

    await scenario('Extract replacement model recommendations from Google 404 deprecation error messages', async () => {
      await given('a Google 404 deprecation message suggesting a newer model', () => {});

      await then('extractSuggestedModelFromError parses the suggested model identifier', () => {
        const errorMsg = 'This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features...';
        const suggested = extractSuggestedModelFromError(errorMsg);
        expect(suggested).toBe('gemini-3.5-flash-lite');
      });

      await and('unrelated error messages return null', () => {
        expect(extractSuggestedModelFromError('Internal server error')).toBeNull();
      });
    });

    await scenario('Blacklist deprecated models in persistent storage and remove from cache', async () => {
      await given('model "gemini-deprecated-1.0"', () => {
        StorageService.removeItem(STORAGE_KEYS.DEPRECATED_GEMINI_MODELS);
      });

      await when('markModelAsDeprecated is called', () => {
        markModelAsDeprecated('models/gemini-deprecated-1.0');
      });

      await then('it is added to getDeprecatedModels Set', () => {
        const blacklist = getDeprecatedModels();
        expect(blacklist.has('gemini-deprecated-1.0')).toBeTruthy();
      });
    });

    await scenario('Fail fast on transient capacity / rate limit errors (503 / 429)', async () => {
      await then('HTTP 503 or 429 errors are identified as transient capacity spikes', () => {
        expect(isTransientCapacityError({ status: 503, message: 'High demand' })).toBeTruthy();
        expect(isTransientCapacityError({ status: 429, message: 'Resource exhausted' })).toBeTruthy();
        expect(isTransientCapacityError({ message: 'The model is overloaded. Please try again later.' })).toBeTruthy();
      });

      await and('standard semantic or syntax errors return false', () => {
        expect(isTransientCapacityError({ status: 400, message: 'Invalid argument' })).toBeFalsy();
      });
    });
  });
}
