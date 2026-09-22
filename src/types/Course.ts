/**
 * Course & Adaptive Odyssey Data Contracts
 * Defines the macro-level course campaign, chapters, biomes, nodes,
 * and micro-level 10-stage exercise payloads for the adaptive IRT state machine.
 */

export type BiomeType = 'mountains' | 'city' | 'forest';
export type NodeType = 'learning' | 'review_ambush' | 'boss_capstone';
export type NodeStatus = 'locked' | 'active' | 'completed';

export type OdysseyExerciseType =
  | 'blind_dictation'
  | 'minimal_pair_triage'
  | 'pitch_shadowing'
  | 'roleplay_dialogue'
  | 'sentence_builder_distractors'
  | 'stroke_order_quiz'
  | 'srs_ambush'
  | 'speed_reading_sprint'
  | 'multiple_choice'
  | 'vocab_intro';

export interface BlindDictationPayload {
  audioText: string;
  pinyin: string;
  englishTranslation: string;
  acceptedAnswers: string[]; // Chinese characters or toneless/toned pinyin
  hint?: string;
}

export interface MinimalPairOption {
  text: string;
  pinyin: string;
  meaning: string;
  audioPrompt?: string;
  isCorrect: boolean;
}

export interface MinimalPairTriagePayload {
  promptAudioText: string;
  contrastCategory: 'tone' | 'aspiration' | 'retroflex' | 'vowel';
  explanation: string;
  timeLimitSeconds: number; // e.g. 8 seconds
  options: MinimalPairOption[];
}

export interface PitchShadowingPayload {
  sentence: string;
  pinyin: string;
  translation: string;
  targetTonePattern?: number[]; // e.g. [3, 2, 4]
  slowAudioSpeed?: number;
}

export interface RoleplayMessage {
  speaker: 'agent' | 'user';
  text: string;
  pinyin?: string;
  translation?: string;
}

export interface RoleplayDialoguePayload {
  scenarioTitle: string;
  contextDescription: string;
  requiredKeywords: string[]; // e.g. ["冰", "拿铁"]
  initialPrompt: string;
  initialPromptPinyin: string;
  initialPromptTranslation: string;
  sampleReplies: string[];
}

export interface SentenceBuilderDistractorPayload {
  targetSentence: string;
  englishTranslation: string;
  pinyin: string;
  validChips: string[];       // Target chunks
  distractorChips: string[];  // Deceptive distractors (e.g. 己 vs 已, 着 vs 了)
  explanation?: string;
}

export interface StrokeOrderQuizPayload {
  character: string;
  pinyin: string;
  definition: string;
  radical?: string;
  strokeCount?: number;
}

export interface SrsAmbushCard {
  character: string;
  pinyin: string;
  definition: string;
  hskLevel?: string;
}

export interface SrsAmbushPayload {
  ambushTitle: string;
  reason: string; // e.g. "We noticed you hesitated with these words recently"
  cards: SrsAmbushCard[];
}

export interface SpeedReadingSprintPayload {
  passage: string;
  pinyin?: string;
  timeLimitSeconds: number; // e.g. 15 seconds
  targetCPM: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface MultipleChoicePayload {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface VocabWord {
  character: string;
  pinyin: string;
  definition: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export interface VocabIntroPayload {
  words: VocabWord[];
}

export type ExercisePayload =
  | BlindDictationPayload
  | MinimalPairTriagePayload
  | PitchShadowingPayload
  | RoleplayDialoguePayload
  | SentenceBuilderDistractorPayload
  | StrokeOrderQuizPayload
  | SrsAmbushPayload
  | SpeedReadingSprintPayload
  | MultipleChoicePayload
  | VocabIntroPayload;

export interface OdysseyExercise {
  id: string;
  type: OdysseyExerciseType;
  title: string;
  instructions: string;
  payload: ExercisePayload;
  difficultyRating?: number; // 1 to 5
  isRemedial?: boolean;      // Injected dynamically by IRT state machine
  targetConcept?: string;    // Concept tag e.g. "tone_3_sandhi" or "word_捷运"
}

export interface CourseNode {
  id: string;
  chapterId: string;
  title: string;
  description: string;
  type: NodeType;
  branchType?: 'main' | 'side_quest' | 'ambush' | 'boss';
  status: NodeStatus;
  mapCoordinates: { x: number; y: number }; // Relative percentage (0-100)
  connectedTo?: string[]; // IDs of destination nodes for DAG path linking and branching
  hskLevel: string;
  targetVocabulary: string[];
  exercises: OdysseyExercise[];
  icon?: string; // Visual thematic icon/emoji (e.g. 🎺, 🐶, 🥟, 🕵️, 🏮, 💼)
  score?: number;
  stars?: number; // 1 to 3
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  themeBiome: BiomeType;
  isUnlocked: boolean;
  nodes: CourseNode[];
}

export interface Course {
  id: string;
  title: string;
  targetGoal: string;
  level: string;
  globalMasteryStats: Record<string, number>; // key: word or concept, value: confidence 0-100
  weaknesses: string[];                       // Persistent flagged weaknesses
  chapters: Chapter[];
  createdAt: number;
  updatedAt: number;
  totalXp: number;
  currentRank: string;
}

export interface DiagnosticReport {
  accuracyPercentage: number;
  exercisesCompleted: number;
  heartsRemaining: number;
  comboStreakMax: number;
  readingSpeedCPM: number;
  weaknessesIdentified: string[];
  masteryGains: Record<string, number>;
  xpEarned: number;
  stars: number;
}
