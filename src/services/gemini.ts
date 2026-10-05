import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lesson } from '../types/Lesson';
import { StorageService, STORAGE_KEYS } from './storage';

export interface ParsedGeminiModel {
  id: string;
  name: string;
  version: number;
  tier: 'flash' | 'flash-lite' | 'pro' | 'ultra' | 'standard';
  badge: string;
  description: string;
  isRecommended?: boolean;
}

// Backwards-compatible alias for existing imports
export type GeminiModelOption = ParsedGeminiModel;

/**
 * Modern non-hardcoded baseline models as initial candidates prior to live API probe.
 * Kept modern and evaluated dynamically against the deprecation blacklist.
 */
export const BASELINE_CANDIDATE_IDS = [
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

const TIER_ORDER: Record<ParsedGeminiModel['tier'], number> = {
  flash: 4,
  'flash-lite': 3,
  pro: 2,
  ultra: 1,
  standard: 0
};

/**
 * Extracts semantic version, tier, and generates dynamic labels and badges.
 */
export function parseModelMetadata(rawId: string, displayName?: string, description?: string): ParsedGeminiModel {
  const cleanId = (rawId || '').replace(/^models\//, '').trim();

  // Extract semantic version (e.g. "gemini-3.5-flash" -> 3.5, "gemini-2.5-pro" -> 2.5)
  const versionMatch = cleanId.match(/gemini-(\d+(?:\.\d+)?)/i);
  const version = versionMatch ? parseFloat(versionMatch[1]) : 1.0;

  // Extract model tier
  let tier: ParsedGeminiModel['tier'] = 'standard';
  if (cleanId.includes('-flash-lite')) {
    tier = 'flash-lite';
  } else if (cleanId.includes('-flash')) {
    tier = 'flash';
  } else if (cleanId.includes('-pro')) {
    tier = 'pro';
  } else if (cleanId.includes('-ultra')) {
    tier = 'ultra';
  }

  // Format clean human-friendly name
  let name = displayName || '';
  if (!name || name === cleanId) {
    const tierName = tier === 'flash-lite' ? 'Flash Lite' : tier.charAt(0).toUpperCase() + tier.slice(1);
    name = `Gemini ${version.toFixed(1)} ${tierName}`;
  }

  // Generate dynamic generation badge
  let badge = `Gen ${version.toFixed(1)}`;
  if (tier === 'flash-lite') {
    badge = `Ultra Fast (v${version.toFixed(1)})`;
  } else if (tier === 'flash') {
    badge = version >= 3.0 ? `Frontier Flash (v${version.toFixed(1)})` : `Workhorse (v${version.toFixed(1)})`;
  } else if (tier === 'pro') {
    badge = `Deep Reasoning (v${version.toFixed(1)})`;
  }

  return {
    id: cleanId,
    name,
    version,
    tier,
    badge,
    description: description || `Gemini ${version.toFixed(1)} ${tier} generative language model.`
  };
}

/**
 * Sorts Gemini models strictly in descending generational order (v3.8 > v3.5 > v3.1 > v2.5 > v1.5),
 * with Flash preferred over Flash Lite over Pro as tie-breakers.
 */
export function sortGeminiModels(models: ParsedGeminiModel[]): ParsedGeminiModel[] {
  return [...models].sort((a, b) => {
    // 1. Descending Generation / Version
    if (b.version !== a.version) {
      return b.version - a.version;
    }
    // 2. Descending Tier Rank (flash > flash-lite > pro > ultra > standard)
    const tierDiff = (TIER_ORDER[b.tier] || 0) - (TIER_ORDER[a.tier] || 0);
    if (tierDiff !== 0) {
      return tierDiff;
    }
    // 3. Alphabetical tie-breaker
    return a.id.localeCompare(b.id);
  });
}

/**
 * Retrieves the persistent blacklist of deprecated/offline models.
 */
export function getDeprecatedModels(): Set<string> {
  const list = StorageService.getJson<string[]>(STORAGE_KEYS.DEPRECATED_GEMINI_MODELS, []);
  return new Set(list.map(s => s.toLowerCase().trim()));
}

/**
 * Blacklists a deprecated model permanently to prevent repeated 404s.
 */
export function markModelAsDeprecated(modelId: string): void {
  const clean = (modelId || '').replace(/^models\//, '').toLowerCase().trim();
  if (!clean) return;

  const current = getDeprecatedModels();
  current.add(clean);
  StorageService.setJson(STORAGE_KEYS.DEPRECATED_GEMINI_MODELS, Array.from(current));

  // Also remove from cached discovered models
  const discovered = StorageService.getJson<ParsedGeminiModel[]>(STORAGE_KEYS.DISCOVERED_GEMINI_MODELS, []);
  const updatedDiscovered = discovered.filter(m => m.id.toLowerCase() !== clean);
  StorageService.setJson(STORAGE_KEYS.DISCOVERED_GEMINI_MODELS, updatedDiscovered);

  console.warn(`[Gemini Deprecation] Model "${clean}" marked as deprecated and blacklisted.`);
}

/**
 * Extracts Google's suggested replacement model directly from their 404 deprecation error message.
 * Example:
 * "This model models/gemini-2.5-flash-lite is no longer available to new users. Please update your code to use models/gemini-3.5-flash-lite for the latest features..."
 */
export function extractSuggestedModelFromError(errorMessage: string): string | null {
  if (!errorMessage || typeof errorMessage !== 'string') return null;

  // Pattern: "use models/gemini-..." or "use gemini-..."
  const useMatch = errorMessage.match(/use\s+(?:models\/)?(gemini-[\w.-]+)/i);
  if (useMatch && useMatch[1]) {
    return useMatch[1].replace(/^models\//, '').trim();
  }

  // Fallback pattern: second occurrence of "models/(gemini-...)"
  const allMatches = Array.from(errorMessage.matchAll(/models\/(gemini-[\w.-]+)/gi));
  if (allMatches.length > 1 && allMatches[1][1]) {
    return allMatches[1][1].replace(/^models\//, '').trim();
  }

  return null;
}

/**
 * Detects if an error is due to a 404 / deprecation / discontinuation status.
 */
export function isModelDeprecatedOrUnavailableError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error?.error?.code;
  const msg = (error.message || error?.error?.message || '').toLowerCase();

  return (
    status === 404 ||
    status === 'NOT_FOUND' ||
    msg.includes('no longer available') ||
    msg.includes('is deprecated') ||
    msg.includes('not found') ||
    msg.includes('not available to new users') ||
    msg.includes('update your code to use')
  );
}

/**
 * Returns available models from cached discovery or baseline fallback,
 * strictly filtered against deprecated models and sorted in descending generation order.
 */
export function getDiscoveredOrBaselineModels(): ParsedGeminiModel[] {
  const deprecated = getDeprecatedModels();
  const cachedDiscovered = StorageService.getJson<ParsedGeminiModel[]>(STORAGE_KEYS.DISCOVERED_GEMINI_MODELS, []);

  // Filter out any deprecated models from discovered
  const activeDiscovered = cachedDiscovered.filter(m => !deprecated.has(m.id.toLowerCase()));

  if (activeDiscovered.length > 0) {
    const sorted = sortGeminiModels(activeDiscovered);
    if (sorted[0]) sorted[0].isRecommended = true;
    return sorted;
  }

  // Fallback to baseline candidates, filtering out any marked as deprecated
  const validBaselines = BASELINE_CANDIDATE_IDS
    .filter(id => !deprecated.has(id.toLowerCase()))
    .map(id => parseModelMetadata(id));

  const sortedBaselines = sortGeminiModels(validBaselines);
  if (sortedBaselines[0]) sortedBaselines[0].isRecommended = true;
  return sortedBaselines;
}

/**
 * Dynamically resolves the best active Gemini model without hardcoding.
 */
export function getPreferredGeminiModel(): string {
  const deprecated = getDeprecatedModels();
  const stored = StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL);

  // If user has a valid stored model that is not deprecated, use it
  if (stored && !deprecated.has(stored.toLowerCase().trim())) {
    return stored.trim();
  }

  // Otherwise, select the top dynamically available model
  const available = getDiscoveredOrBaselineModels();
  const best = available.length > 0 ? available[0].id : 'gemini-3.5-flash';

  // Automatically persist the healthy model
  StorageService.setItem(STORAGE_KEYS.GEMINI_MODEL, best);
  return best;
}

// Backwards-compatible export
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash';
export const AVAILABLE_GEMINI_MODELS: ParsedGeminiModel[] = getDiscoveredOrBaselineModels();

/**
 * Dynamically queries the Google Generative Language API using the user's API key
 * to determine the exact model IDs currently active and available to that key.
 * Automatically parses metadata, filters deprecated/incompatible models, sorts in descending generation order,
 * and caches into storage.
 */
export async function fetchAvailableGeminiModels(apiKey: string): Promise<ParsedGeminiModel[]> {
  if (!apiKey || !apiKey.trim()) return [];

  const deprecated = getDeprecatedModels();
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(errMsg);
    }
    const data = await res.json();
    if (Array.isArray(data.models)) {
      const validModels: ParsedGeminiModel[] = data.models
        .filter((m: any) => {
          const id = (m.name || '').replace(/^models\//, '');
          if (!id.startsWith('gemini-')) return false;
          // Filter out deprecated models
          if (deprecated.has(id.toLowerCase())) return false;
          // Filter out embedding, vision-only, aqa, or non-generateContent models
          if (id.includes('embedding') || id.includes('aqa') || id.includes('imagen')) return false;
          const methods = m.supportedGenerationMethods;
          return Array.isArray(methods) && methods.includes('generateContent');
        })
        .map((m: any) => parseModelMetadata(m.name, m.displayName, m.description));

      const sorted = sortGeminiModels(validModels);
      if (sorted[0]) {
        sorted[0].isRecommended = true;
      }

      // Cache discovered models in storage
      if (sorted.length > 0) {
        StorageService.setJson(STORAGE_KEYS.DISCOVERED_GEMINI_MODELS, sorted);
      }

      return sorted;
    }
  } catch (err) {
    console.warn('[Gemini] Querying models endpoint failed:', err);
    throw err;
  }
  return [];
}

/**
 * Generate raw text using Gemini with dynamic discovery, automatic 404/deprecation healing,
 * and smart Google recommendation adoption.
 */
export async function generateGeminiText(
  apiKey: string,
  prompt: string,
  preferredModel?: string
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const activePreferred = preferredModel || getPreferredGeminiModel();
  const availableModels = getDiscoveredOrBaselineModels().map(m => m.id);
  const deprecated = getDeprecatedModels();

  // Build candidate queue, eliminating duplicates & known deprecated models
  const candidateQueue: string[] = [
    activePreferred,
    ...availableModels
  ].filter((id, idx, arr) => Boolean(id) && !deprecated.has(id.toLowerCase()) && arr.indexOf(id) === idx);

  let lastError: any = null;

  for (let i = 0; i < candidateQueue.length; i++) {
    const modelId = candidateQueue[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const request = await model.generateContent(prompt);
      const text = request.response.text();
      if (text && text.trim().length > 0) {
        // If we healed to a different model than what was originally stored, persist it!
        if (modelId !== StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL)) {
          console.info(`[Gemini Self-Healing] Successfully healed and updated preferred model to "${modelId}".`);
          StorageService.setItem(STORAGE_KEYS.GEMINI_MODEL, modelId);
        }
        return text;
      }
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini] Attempt with model "${modelId}" failed:`, errMsg);

      if (isModelDeprecatedOrUnavailableError(err)) {
        markModelAsDeprecated(modelId);

        // Check if Google provided a replacement suggestion in the error message
        const suggested = extractSuggestedModelFromError(errMsg);
        if (suggested && !candidateQueue.includes(suggested) && !deprecated.has(suggested.toLowerCase())) {
          console.info(`[Gemini Self-Healing] Google suggested replacement "${suggested}". Inserting into front of queue.`);
          candidateQueue.splice(i + 1, 0, suggested);
        }
      }
    }
  }

  throw lastError || new Error('Failed to generate content with Gemini across all active models.');
}

/**
 * Generate structured lesson using Gemini with self-healing fallback across active models.
 */
export async function generateLesson(
  topic: string, 
  hskLevel: string, 
  apiKey: string,
  preferredModel?: string
): Promise<Lesson> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const activePreferred = preferredModel || getPreferredGeminiModel();
  const availableModels = getDiscoveredOrBaselineModels().map(m => m.id);
  const deprecated = getDeprecatedModels();

  const candidateQueue: string[] = [
    activePreferred,
    ...availableModels
  ].filter((id, idx, arr) => Boolean(id) && !deprecated.has(id.toLowerCase()) && arr.indexOf(id) === idx);

  const prompt = `You are a professional Chinese language tutor. Generate a structured Chinese lesson in JSON format about the topic "${topic}" matching HSK Level ${hskLevel}.
  
  The output MUST strictly match this JSON schema:
  {
    "title": "String",
    "topic": "String",
    "hskLevel": "String",
    "themeTag": "String (must be one of: 'food', 'travel', 'business', 'daily_life', 'school', 'shopping', 'transport')",
    "exercises": [
      {
        "type": "vocab_intro",
        "title": "String",
        "instructions": "String",
        "payload": {
          "words": [
            { "character": "String", "pinyin": "String", "definition": "String" }
          ]
        }
      },
      {
        "type": "multiple_choice",
        "title": "String",
        "instructions": "String",
        "payload": {
          "question": "String",
          "options": ["String", "String", "String", "String"],
          "correctAnswer": "String (must match one of the options exactly)",
          "explanation": "String (optional explanation)"
        }
      },
      {
        "type": "sentence_builder",
        "title": "String",
        "instructions": "String",
        "payload": {
          "targetSentence": "String (Chinese characters only)",
          "englishTranslation": "String",
          "wordBank": ["String", "String"],
          "correctAnswer": "String (the full Chinese targetSentence)"
        }
      },
      {
        "type": "dialogue_reading",
        "title": "String",
        "instructions": "String",
        "payload": {
          "dialogue": [
            { "speaker": "String", "text": "String (Chinese)", "pinyin": "String", "translation": "String" }
          ]
        }
      }
    ]
  }

  Generate EXACTLY 4 exercises in this order:
  1. "vocab_intro" (introduce 3 relevant vocabulary words for HSK ${hskLevel})
  2. "multiple_choice" (quiz the user on the vocabulary introduced)
  3. "sentence_builder" (construct a relevant sentence from the topic)
  4. "dialogue_reading" (a short 4-line dialogue incorporating the vocabulary and topic)

  All Chinese characters must be Simplified Chinese.
  Ensure pinyin contains proper tone marks.
  Do not wrap the JSON output in markdown formatting blocks. Return only raw valid JSON.`;

  let lastError: any = null;

  for (let i = 0; i < candidateQueue.length; i++) {
    const modelId = candidateQueue[i];
    try {
      const model = genAI.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();

      let cleanText = responseText;
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      }
      const parsed = JSON.parse(cleanText) as Lesson;
      if (!parsed.title || !parsed.exercises || !Array.isArray(parsed.exercises)) {
        throw new Error("Invalid lesson JSON structure");
      }

      if (modelId !== StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL)) {
        console.info(`[Gemini Self-Healing] Successfully healed and updated preferred model to "${modelId}".`);
        StorageService.setItem(STORAGE_KEYS.GEMINI_MODEL, modelId);
      }
      return parsed;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini] Lesson generation with model "${modelId}" failed:`, errMsg);

      if (isModelDeprecatedOrUnavailableError(err)) {
        markModelAsDeprecated(modelId);

        const suggested = extractSuggestedModelFromError(errMsg);
        if (suggested && !candidateQueue.includes(suggested) && !deprecated.has(suggested.toLowerCase())) {
          console.info(`[Gemini Self-Healing] Google suggested replacement "${suggested}". Inserting into front of queue.`);
          candidateQueue.splice(i + 1, 0, suggested);
        }
      }
    }
  }

  throw lastError || new Error("Failed to generate structured lesson with Gemini across all active models.");
}
