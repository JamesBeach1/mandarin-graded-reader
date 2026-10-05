/**
 * Moyun (墨韵) Centralized Storage Service
 * Type-safe, centralized interface for localStorage keys, defaults, and safe JSON serialization.
 */

export const STORAGE_KEYS = {
  // Authentication & API Credentials
  GEMINI_API_KEY: 'gemini_api_key',
  GEMINI_MODEL: 'gemini_model',
  DISCOVERED_GEMINI_MODELS: 'discovered_gemini_models',
  DEPRECATED_GEMINI_MODELS: 'deprecated_gemini_models',
  AZURE_SPEECH_KEY: 'azure_speech_key',
  AZURE_SPEECH_REGION: 'azure_speech_region',

  // Audio & TTS Preferences
  SELECTED_TTS_ENGINE: 'selected_tts_engine',
  SELECTED_AZURE_VOICE: 'selected_azure_voice',
  SELECTED_SYSTEM_VOICE: 'selected_system_voice',
  REGIONAL_ACCENT: 'moyun_regional_accent',
  HOVER_AUDIO: 'moyun_hover_audio',

  // Reading & Typography Preferences
  THEME: 'moyun_theme',
  SCRIPT_PREFERENCE: 'moyun_script_preference',
  PHONETIC_NOTATION: 'moyun_phonetic_notation',
  PINYIN_DISPLAY_MODE: 'moyun_pinyin_display_mode',
  HIDE_PINYIN_LEVEL: 'hide_pinyin_level',
  TONE_COLOR_MODE: 'moyun_tone_color_mode',
  WORD_GROUPING_MODE: 'moyun_word_grouping_mode',
  COMPOUND_WORDS_CACHE: 'moyun_compound_words_cache',

  // Analytics & History
  CHARACTERS_HEATMAP: 'characters_read_heatmap',
  READING_SPEED_HISTORY: 'reading_speed_history',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

export class StorageService {
  /**
   * Safely retrieve a string from localStorage with fallback.
   */
  static getItem(key: StorageKey, defaultValue: string = ''): string {
    try {
      return localStorage.getItem(key) ?? defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * Safely set a string in localStorage.
   */
  static setItem(key: StorageKey, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.warn(`[StorageService] Failed to set item for key "${key}":`, err);
    }
  }

  /**
   * Safely remove an item from localStorage.
   */
  static removeItem(key: StorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.warn(`[StorageService] Failed to remove item for key "${key}":`, err);
    }
  }

  /**
   * Safely retrieve and parse JSON with fallback.
   */
  static getJson<T>(key: StorageKey, defaultValue: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[StorageService] Failed to parse JSON for key "${key}":`, err);
      return defaultValue;
    }
  }

  /**
   * Safely serialize and store JSON.
   */
  static setJson<T>(key: StorageKey, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.warn(`[StorageService] Failed to serialize JSON for key "${key}":`, err);
    }
  }

  /**
   * Universal shorthand getter supporting JSON or strings with fallback.
   */
  static get<T = any>(key: StorageKey, defaultValue: T): T {
    return this.getJson<T>(key, defaultValue);
  }

  /**
   * Universal shorthand setter supporting JSON objects or primitives.
   */
  static set<T = any>(key: StorageKey, value: T): void {
    if (typeof value === 'string') {
      this.setItem(key, value);
    } else {
      this.setJson(key, value);
    }
  }
}
