export type ExerciseType = 'vocab_intro' | 'multiple_choice' | 'sentence_builder' | 'dialogue_reading';

export interface VocabWord {
  character: string;
  pinyin: string;
  definition: string;
}

export interface VocabIntroPayload {
  words: VocabWord[];
}

export interface MultipleChoicePayload {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface SentenceBuilderPayload {
  targetSentence: string;
  englishTranslation: string;
  wordBank: string[]; // Randomized Chinese word chunks, e.g. ["我", "今天", "想", "喝", "咖啡"]
  correctAnswer: string; // The exact string e.g. "我今天想喝咖啡"
}

export interface DialogueLine {
  speaker: string;
  text: string;
  pinyin: string;
  translation: string;
}

export interface DialogueReadingPayload {
  dialogue: DialogueLine[];
}

export interface Exercise {
  type: ExerciseType;
  title: string;
  instructions: string;
  payload: VocabIntroPayload | MultipleChoicePayload | SentenceBuilderPayload | DialogueReadingPayload;
}

export interface Lesson {
  title: string;
  topic: string;
  hskLevel: string;
  themeTag: string; // e.g. 'food', 'travel', 'business', 'daily_life', 'school', 'shopping'
  exercises: Exercise[];
}
