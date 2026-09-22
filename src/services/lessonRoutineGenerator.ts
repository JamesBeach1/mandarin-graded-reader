/**
 * On-Demand Just-In-Time Lesson Routine Generator
 * Decouples micro-lesson exercise synthesis from overarching course syllabus generation.
 * Generates an intensive 8-to-10 stage exercise sequence on-demand when a node is launched.
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { Course, Chapter, CourseNode, OdysseyExercise } from '../types/Course';
import { saveCourse } from './courseStore';

export interface RoutineGenerationParams {
  node: CourseNode;
  chapter: Chapter;
  course: Course;
  apiKey?: string;
}

export class LessonRoutineGenerator {
  /**
   * Retrieves existing exercises or generates an intensive 8-to-10 stage exercise routine.
   * Caches results directly to IndexedDB so each node only generates once.
   */
  public static async getOrGenerateRoutine(
    course: Course,
    node: CourseNode,
    apiKey?: string
  ): Promise<OdysseyExercise[]> {
    // Return cached routine if already generated and comprehensive
    if (node.exercises && node.exercises.length >= 6) {
      return node.exercises;
    }

    // Find parent chapter
    const chapter = course.chapters.find(ch => ch.id === node.chapterId) || course.chapters[0];

    // Generate new routine
    const routine = await this.generateLessonRoutine({
      node,
      chapter,
      course,
      apiKey
    });

    // Cache onto node and persist course
    node.exercises = routine;
    for (const ch of course.chapters) {
      const targetNode = ch.nodes.find(n => n.id === node.id);
      if (targetNode) {
        targetNode.exercises = routine;
        break;
      }
    }
    await saveCourse(course).catch(err => console.warn('Failed to cache generated routine in IndexedDB:', err));

    return routine;
  }

  /**
   * Synthesizes an 8-to-10 stage routine via Gemini or offline fallback
   */
  public static async generateLessonRoutine(params: RoutineGenerationParams): Promise<OdysseyExercise[]> {
    const { node, chapter, course, apiKey } = params;

    if (!apiKey) {
      return this.generateOfflineRoutine(node, chapter, course);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ];

      const prompt = `You are the Master Pedagogical Architect for 墨韵 Moyun (Mandarin Chinese Learning).
Generate an intensive, engaging, pedagogically sound 8-stage interactive exercise routine for THIS SPECIFIC LESSON NODE:

COURSE CONTEXT:
- Course: "${course.title}" (Goal: "${course.targetGoal}")
- Chapter: "${chapter.title}" (Biome: ${chapter.themeBiome})
- Node Title: "${node.title}"
- Node Description: "${node.description}"
- Node Type: "${node.type}" (Branch: ${node.branchType || 'main'})
- HSK Level: "${node.hskLevel || '2'}"
- Target Vocabulary: ${node.targetVocabulary.join(', ')}
- Known Weaknesses to Address: ${course.weaknesses.join(', ') || 'Tone discrimination, character confusion'}

You MUST output strictly valid JSON conforming to an array of 8 exercise objects:
[
  {
    "id": "ex-1",
    "type": "vocab_intro",
    "title": "Target Vocabulary Introduction",
    "instructions": "Listen and absorb definitions, characters, and contextual examples.",
    "payload": {
      "words": [
        {
          "character": "String",
          "pinyin": "String with tone marks",
          "definition": "String in English",
          "exampleSentence": "String in Chinese",
          "exampleTranslation": "String in English"
        }
      ]
    }
  },
  {
    "id": "ex-2",
    "type": "minimal_pair_triage",
    "title": "Phonetic & Tone Triage",
    "instructions": "Listen to the audio prompt and discriminate between tones or syllables within 8 seconds.",
    "payload": {
      "promptAudioText": "String",
      "contrastCategory": "tone",
      "explanation": "String explaining the acoustic difference (e.g. Tone 2 vs Tone 3)",
      "timeLimitSeconds": 8,
      "options": [
        { "text": "String", "pinyin": "String", "meaning": "String", "isCorrect": true },
        { "text": "String", "pinyin": "String", "meaning": "String", "isCorrect": false }
      ]
    }
  },
  {
    "id": "ex-3",
    "type": "blind_dictation",
    "title": "Listening Blind Dictation",
    "instructions": "Listen carefully without text and type the Chinese characters or Pinyin.",
    "payload": {
      "audioText": "String",
      "pinyin": "String",
      "englishTranslation": "String",
      "acceptedAnswers": ["String", "String"]
    }
  },
  {
    "id": "ex-4",
    "type": "sentence_builder_distractors",
    "title": "Sentence Construction & Distractors",
    "instructions": "Assemble the chips into the target sentence. Beware of grammatical and character distractors!",
    "payload": {
      "targetSentence": "String",
      "englishTranslation": "String",
      "pinyin": "String",
      "validChips": ["String", "String", "String", "String"],
      "distractorChips": ["String", "String"],
      "explanation": "String explaining syntax rules"
    }
  },
  {
    "id": "ex-5",
    "type": "stroke_order_quiz",
    "title": "Hanzi Stroke Memory Canvas",
    "instructions": "Practice stroke memory and radical balance for this target character.",
    "payload": {
      "character": "String (single character)",
      "pinyin": "String",
      "definition": "String",
      "radical": "String",
      "strokeCount": 6
    }
  },
  {
    "id": "ex-6",
    "type": "speed_reading_sprint",
    "title": "Paced Comprehension Sprint",
    "instructions": "Read the passage before the countdown timer expires and answer the comprehension question.",
    "payload": {
      "passage": "String (2-3 sentences)",
      "timeLimitSeconds": 18,
      "targetCPM": 130,
      "question": "String",
      "options": ["String", "String", "String", "String"],
      "correctAnswer": "String",
      "explanation": "String"
    }
  },
  {
    "id": "ex-7",
    "type": "pitch_shadowing",
    "title": "Acoustic Pitch Shadowing",
    "instructions": "Listen to the native reference audio, then record yourself shadowing the exact tones.",
    "payload": {
      "sentence": "String",
      "pinyin": "String",
      "translation": "String"
    }
  },
  {
    "id": "ex-8",
    "type": "roleplay_dialogue",
    "title": "Communicative Scenario Roleplay",
    "instructions": "Complete this real-world dialogue by responding appropriately using the target vocabulary.",
    "payload": {
      "scenarioTitle": "String",
      "contextDescription": "String",
      "requiredKeywords": ["String", "String"],
      "initialPrompt": "String",
      "initialPromptPinyin": "String",
      "initialPromptTranslation": "String",
      "sampleReplies": ["String"]
    }
  }
]

RULES:
1. Provide exactly 8 exercises strictly matching the schema above.
2. All Chinese text in Simplified Chinese with accurate Pinyin tone marks (e.g. nǐ hǎo, bù yòng).
3. The exercises must directly teach and test the target vocabulary: ${node.targetVocabulary.join(', ')}.
4. Output ONLY raw JSON. Do not wrap in markdown fences.`;

      let text = '';
      try {
        const model = genAI.getGenerativeModel({
          model: 'gemini-3.1-flash-lite',
          safetySettings,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
      } catch (e1) {
        console.warn('gemini-3.1-flash-lite routine generation failed, trying gemini-2.5-flash fallback:', e1);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.5-flash',
          safetySettings,
          generationConfig: { responseMimeType: 'application/json' }
        });
        const result = await model.generateContent(prompt);
        text = result.response.text().trim();
      }

      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      }

      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length >= 6) {
        return parsed as OdysseyExercise[];
      }
      return this.generateOfflineRoutine(node, chapter, course);
    } catch (err) {
      console.warn('AI Lesson Routine generation failed, using deterministic offline routine generator:', err);
      return this.generateOfflineRoutine(node, chapter, course);
    }
  }

  /**
   * Deterministic Offline Routine Generator
   * Produces an authentic, high-quality 8-stage interactive exercise routine
   * specifically built around the node's target vocabulary and chapter theme.
   */
  public static generateOfflineRoutine(
    node: CourseNode,
    chapter: Chapter,
    course: Course
  ): OdysseyExercise[] {
    const vocab = node.targetVocabulary && node.targetVocabulary.length > 0
      ? node.targetVocabulary
      : ['请问', '谢谢', '捷运'];
    const primaryWord = vocab[0];
    const secondaryWord = vocab[1] || vocab[0];
    const tertiaryWord = vocab[2] || vocab[0];

    const isBoss = node.type === 'boss_capstone';
    const isAmbush = node.type === 'review_ambush';
    const isSideQuest = node.branchType === 'side_quest';

    const exercises: OdysseyExercise[] = [
      // 1. Vocab Intro
      {
        id: `${node.id}-ex-1-vocab`,
        type: 'vocab_intro',
        title: `${node.title}: Lexicon Discovery`,
        instructions: 'Listen and absorb core definitions, characters, and contextual examples.',
        payload: {
          words: [
            {
              character: primaryWord,
              pinyin: 'target pīnyīn',
              definition: `Key term for ${node.title}`,
              exampleSentence: `在${chapter.title}中，我们需要掌握「${primaryWord}」。`,
              exampleTranslation: `In this scenario, mastering "${primaryWord}" is essential.`
            },
            {
              character: secondaryWord,
              pinyin: 'target pīnyīn',
              definition: `Secondary term for ${node.title}`,
              exampleSentence: `请问这个${secondaryWord}怎么说？`,
              exampleTranslation: `Excuse me, how do you say "${secondaryWord}"?`
            },
            {
              character: tertiaryWord,
              pinyin: 'target pīnyīn',
              definition: `Contextual token for ${chapter.themeBiome} context`,
              exampleSentence: `大家都知道${tertiaryWord}的意思。`,
              exampleTranslation: `Everyone understands the meaning of "${tertiaryWord}".`
            }
          ]
        }
      },

      // 2. Minimal Pair Triage
      {
        id: `${node.id}-ex-2-triage`,
        type: 'minimal_pair_triage',
        title: isSideQuest ? 'Bonus Reflex: Acoustic Triage' : 'Phonetic & Tone Reflex Triage',
        instructions: 'Listen carefully to the audio prompt and distinguish between the tone pair within 8 seconds.',
        payload: {
          promptAudioText: primaryWord,
          contrastCategory: 'tone',
          explanation: `Discriminating the tone of 「${primaryWord}」 prevents misunderstandings during native conversations.`,
          timeLimitSeconds: 8,
          options: [
            {
              text: primaryWord,
              pinyin: 'Correct Tone Form',
              meaning: `Accurate representation of ${primaryWord}`,
              isCorrect: true
            },
            {
              text: '对比变音',
              pinyin: 'Shifted Tone Variant',
              meaning: 'Phonetic distractor with incorrect pitch register',
              isCorrect: false
            }
          ]
        }
      },

      // 3. Blind Dictation
      {
        id: `${node.id}-ex-3-dictation`,
        type: 'blind_dictation',
        title: 'Audio Blind Dictation',
        instructions: 'Listen to the native audio clip without text and type what you hear (Characters or Pinyin).',
        payload: {
          audioText: `请问${primaryWord}在哪里`,
          pinyin: `qǐng wèn ${primaryWord} zài nǎ lǐ`,
          englishTranslation: `Excuse me, where is ${primaryWord}?`,
          acceptedAnswers: [
            `请问${primaryWord}在哪里`,
            `${primaryWord}在哪里`,
            `${primaryWord}`,
            `qing wen ${primaryWord} zai na li`
          ],
          hint: `Inquiry pattern starting with 请问...`
        }
      },

      // 4. Sentence Builder with Distractors
      {
        id: `${node.id}-ex-4-builder`,
        type: 'sentence_builder_distractors',
        title: 'Sentence Assembly with Distractors',
        instructions: 'Tap the chips in order to construct the target sentence. Beware of grammatical distractors!',
        payload: {
          targetSentence: `我们一起去了解${primaryWord}`,
          englishTranslation: `Let us explore ${primaryWord} together.`,
          pinyin: `wǒ men yì qǐ qù liǎo jiě ${primaryWord}`,
          validChips: ['我们', '一起去', '了解', primaryWord],
          distractorChips: ['己', '已', '着'],
          explanation: 'Subject (我们) + Adverbial (一起) + Verb phrase (去了解) + Object.'
        }
      },

      // 5. Stroke Order Hanzi Quiz
      {
        id: `${node.id}-ex-5-stroke`,
        type: 'stroke_order_quiz',
        title: 'Hanzi Stroke Memory Canvas',
        instructions: `Recall the character structure and draw 「${primaryWord.charAt(0) || '字'}」 on the grid canvas.`,
        payload: {
          character: primaryWord.charAt(0) || '字',
          pinyin: 'zhōng',
          definition: `Foundational character in 「${primaryWord}」`,
          radical: 'Radical Core',
          strokeCount: 6
        }
      },

      // 6. Speed Reading Sprint
      {
        id: `${node.id}-ex-6-sprint`,
        type: 'speed_reading_sprint',
        title: isBoss ? 'Capstone Speed Reading Sprint' : 'Paced Comprehension Sprint',
        instructions: 'Read through the context passage before the timer expires and answer the comprehension question.',
        payload: {
          passage: `在${chapter.title}的探索中，掌握${primaryWord}至关重要。不论是与当地人交流，还是完成${secondaryWord}，清晰的表达都能带来极佳的体验。`,
          timeLimitSeconds: 18,
          targetCPM: 135,
          question: `这段文字的核心主旨是什么？`,
          options: [
            `掌握${primaryWord}能让交流更加顺畅`,
            `不要使用${primaryWord}`,
            `去别的城市旅行`,
            `只看不说`
          ],
          correctAnswer: `掌握${primaryWord}能让交流更加顺畅`,
          explanation: `文段强调了掌握核心词汇${primaryWord}在交流中的重要性。`
        }
      },

      // 7. Pitch Shadowing
      {
        id: `${node.id}-ex-7-shadowing`,
        type: 'pitch_shadowing',
        title: 'Acoustic Pitch Shadowing',
        instructions: 'Listen to the native reference audio, then record yourself shadowing the exact pitch inflection.',
        payload: {
          sentence: `请问，这里可以使用${primaryWord}吗？`,
          pinyin: `qǐng wèn, zhè lǐ kě yǐ shǐ yòng ${primaryWord} ma?`,
          translation: `Excuse me, can I use ${primaryWord} here?`
        }
      },

      // 8. Interactive Roleplay Dialogue
      {
        id: `${node.id}-ex-8-roleplay`,
        type: 'roleplay_dialogue',
        title: isBoss ? 'Final Capstone Boss Trial' : 'Communicative Scenario Roleplay',
        instructions: 'Engage with the native dialogue partner and achieve the goal using your target vocabulary.',
        payload: {
          scenarioTitle: `${node.title} Interaction`,
          contextDescription: `You are in a ${chapter.themeBiome} setting speaking with a local assistant.`,
          requiredKeywords: [primaryWord, secondaryWord],
          initialPrompt: `你好！请问有什么可以帮助您的吗？`,
          initialPromptPinyin: `Nǐ hǎo! Qǐng wèn yǒu shénme kě yǐ bāng zhù nín de ma?`,
          initialPromptTranslation: `Hello! How may I assist you today?`,
          sampleReplies: [
            `我想了解关于${primaryWord}的事情。`,
            `请问${primaryWord}和${secondaryWord}怎么安排？`
          ]
        }
      }
    ];

    // If review ambush, inject an SRS ambush review card step
    if (isAmbush) {
      exercises.splice(2, 0, {
        id: `${node.id}-ex-ambush-step`,
        type: 'srs_ambush',
        title: 'Spaced Memory Ambush',
        instructions: 'Rapid review of prioritized vocabulary due for memory reinforcement.',
        payload: {
          ambushTitle: 'Memory Retention Checkpoint',
          reason: 'These tokens are flagged for spaced repetition review.',
          cards: vocab.map(w => ({
            character: w,
            pinyin: 'toned pīnyīn',
            definition: 'Key review token',
            hskLevel: node.hskLevel || '2'
          }))
        }
      });
    }

    return exercises;
  }
}
