import { feature, scenario, given, when, then, and, expect } from './bddRunner';
import { StorageService, STORAGE_KEYS } from '../../src/services/storage';

export async function runStorageServiceAcceptanceTests() {
  await feature('FT-STORAGE', 'Centralized StorageService & Type-Safe Persistence', async () => {
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

    await scenario('Safely handle uninitialized storage keys with default fallbacks', async () => {
      await given('an unset storage key', () => {
        StorageService.removeItem(STORAGE_KEYS.THEME);
      });

      await then('getItem returns provided default string', () => {
        const val = StorageService.getItem(STORAGE_KEYS.THEME, 'editorial-light');
        expect(val).toBe('editorial-light');
      });

      await and('getJson returns provided default object without parsing error', () => {
        const def = { custom: true };
        const val = StorageService.getJson(STORAGE_KEYS.COMPOUND_WORDS_CACHE, def);
        expect(val).toEqual(def);
      });
    });

    await scenario('Round-trip primitives and JSON objects with full fidelity', async () => {
      await given('a complex user settings configuration', () => {});

      await when('saved via StorageService.setJson and read via StorageService.getJson', () => {
        const payload = { pinyinMode: 'hover', theme: 'dark', hideLevel: 3 };
        StorageService.setJson(STORAGE_KEYS.PINYIN_DISPLAY_MODE, payload);
        const retrieved = StorageService.getJson(STORAGE_KEYS.PINYIN_DISPLAY_MODE, {});
        expect(retrieved).toEqual(payload);
      });

      await and('shorthand StorageService.set and StorageService.get work universally', () => {
        StorageService.set(STORAGE_KEYS.THEME, 'custom-night');
        expect(StorageService.getItem(STORAGE_KEYS.THEME)).toBe('custom-night');
      });
    });
  });
}
