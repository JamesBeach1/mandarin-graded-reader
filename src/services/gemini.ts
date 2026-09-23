import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lesson } from '../types/Lesson';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export interface GeminiModelOption {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export const AVAILABLE_GEMINI_MODELS: GeminiModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash (Recommended)',
    badge: 'Ultra Fast (~0.8s)',
    description: 'Current production workhorse model with high speed and exceptional Mandarin accuracy.'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    badge: 'Fastest (~0.5s)',
    description: 'Ultra-low latency model optimized for instant generation and minimal quota usage.'
  },
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash',
    badge: 'Frontier Flash (~1s)',
    description: 'Frontier Gemini 3 model optimized for speed and complex language nuance.'
  },
  {
    id: 'gemini-3.5-flash',
    name: 'Gemini 3.5 Flash',
    badge: 'High Fluency (~1.2s)',
    description: 'Gemini 3 series flash model with refined prose and stylistic fidelity.'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    badge: 'Lightweight (~0.6s)',
    description: 'Compact Gemini 3 generation model for fast responsive tutoring.'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    badge: 'Deep Reasoning (~3-5s)',
    description: 'State-of-the-art reasoning for advanced linguistic structure and cultural analysis.'
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash (Legacy)',
    badge: 'Legacy',
    description: 'Prior generation flash model (kept for accounts with legacy access).'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash (Legacy)',
    badge: 'Legacy',
    description: 'Classic Gemini 1.5 workhorse model.'
  }
];

/**
 * Dynamically queries the Google Generative Language API using the user's API key
 * to determine the exact model IDs currently active and available to that key.
 */
export async function fetchAvailableGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey || !apiKey.trim()) return [];
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey.trim())}`);
    if (!res.ok) {
      const errJson = await res.json().catch(() => null);
      const errMsg = errJson?.error?.message || `HTTP ${res.status} ${res.statusText}`;
      throw new Error(errMsg);
    }
    const data = await res.json();
    if (Array.isArray(data.models)) {
      return data.models
        .filter((m: any) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
        .map((m: any) => (m.name || '').replace(/^models\//, ''))
        .filter((id: string) => id.startsWith('gemini-'));
    }
  } catch (err) {
    console.warn('[Gemini] Querying models endpoint failed:', err);
    throw err;
  }
  return [];
}

/**
 * Generate raw text using Gemini with multi-tier automatic fallback across generations.
 */
export async function generateGeminiText(
  apiKey: string,
  prompt: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    preferredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  const uniqueModels = Array.from(new Set(modelsToTry)).filter(Boolean);

  let lastError: any = null;
  for (const m of uniqueModels) {
    try {
      const model = genAI.getGenerativeModel({ model: m });
      const request = await model.generateContent(prompt);
      const text = request.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model "${m}" failed:`, err?.message || err);
    }
  }

  throw lastError || new Error('Failed to generate content with Gemini');
}

export async function generateLesson(
  topic: string, 
  hskLevel: string, 
  apiKey: string,
  preferredModel: string = DEFAULT_GEMINI_MODEL
): Promise<Lesson> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelsToTry = [
    preferredModel,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ];
  const uniqueModels = Array.from(new Set(modelsToTry)).filter(Boolean);

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

  const result = await model.generateContent(prompt);
  const responseText = result.response.text().trim();
  
  try {
    let cleanText = responseText;
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    }
    const parsed = JSON.parse(cleanText) as Lesson;
    if (!parsed.title || !parsed.exercises || !Array.isArray(parsed.exercises)) {
      throw new Error("Invalid lesson JSON structure");
    }
    return parsed;
  } catch (err) {
    console.error("Failed to parse lesson JSON from Gemini:", responseText);
    throw err;
  }
}
