import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Lesson } from '../types/Lesson';

export async function generateLesson(topic: string, hskLevel: string, apiKey: string): Promise<Lesson> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-3.1-flash-lite",
    generationConfig: { responseMimeType: "application/json" }
  });

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
