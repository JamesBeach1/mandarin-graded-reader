# Structured Lesson Engine Architecture

This document details the architecture, state machine, component contracts, and UI behaviors of the interactive Duolingo-style lesson engine.

---

## 1. System Architecture & Schemas

*   **Coordinator:** `src/components/LessonEngine.tsx`
*   **Schema Contracts:** `src/types/Lesson.ts`
*   **Thematic Icon Resolver:** `src/utils/iconMap.ts`

### 1.1 TypeScript Schemas (`Lesson.ts`)

```typescript
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
  wordBank: string[];
  correctAnswer: string;
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
  themeTag: string; // 'food' | 'travel' | 'business' | 'daily_life' | 'school' | 'shopping' | 'transport'
  exercises: Exercise[];
}
```

---

## 2. State Machine Lifecycle (`LessonEngine.tsx`)

The lesson engine manages a linear progression across `lesson.exercises`:

```
                    [Mount LessonEngine]
                             |
                             v
           +---> currentStepIndex = 0..totalSteps-1
           |     isStepComplete = false
           |                 |
           |                 v
           |     Render Active Exercise Component
           |     (VocabIntro / MultipleChoice /
           |      SentenceBuilder / DialogueReading)
           |                 |
           |                 v
           |     User Completes Exercise Actions
           |     -> onComplete() fired
           |     -> isStepComplete = true
           |                 |
           |                 v
           |     Render Sticky Bottom Banner
           |     (Next Step / Complete Lesson Button)
           |                 |
           |                 v
           |           [User Clicks Action]
           |                 |
           +--- (currentStepIndex < totalSteps - 1)
                             |
                             | (currentStepIndex === totalSteps - 1)
                             v
                  isLessonFinished = true
                  Render Trophy Screen
                  Record Character Count to Heatmap
                  Trigger onLessonComplete()
```

### 2.1 Progress Bar Calculation
The header displays a dynamic progress bar tracking exercise index:
$$\text{progressPercent} = \left(\frac{\text{currentStepIndex}}{\text{totalSteps}}\right) \times 100\%$$

---

## 3. Exercise Subsystem Specifications

### 3.1 Stage 1: Vocabulary Introduction (`VocabIntro.tsx`)
*   **Objective:** Familiarize the learner with 3 new core vocabulary items.
*   **UI Layout:** Vertical stack of interactive cards.
*   **Elements per Card:**
    *   Large Chinese glyph (`28px`).
    *   Pinyin with tone marks (`font-family: monospace`).
    *   English translation definition.
    *   Audio button (`<Volume2 />`): Speaks the word via Web Speech API (`zh-CN`).
    *   Verification button (`<CheckCircle2 />`): Marks the word as learned.
*   **Completion Rule:** `onComplete()` triggers once all items in `words` array are toggled as learned.

---

### 3.2 Stage 2: Multiple Choice Quiz (`MultipleChoice.tsx`)
*   **Objective:** Test vocabulary recall under quick recognition.
*   **UI Layout:** Centered question prompt with a 2x2 responsive grid of answer options.
*   **Interaction States:**
    *   **Incorrect Option:** Adds `.wrong-shake` class triggering the `mc-shake` keyframe animation (`±6px` oscillation) and changes border to `#e53e3e` (red).
    *   **Correct Option:** Highlights with `#48bb78` (green) background and border, shows explanation banner (if present), and fires `onComplete()`.

---

### 3.3 Stage 3: Sentence Builder Puzzle (`SentenceBuilder.tsx`)
*   **Objective:** Assemble scrambled lexical chips into a grammatically correct target sentence.
*   **UI Layout:**
    *   Top card displaying `englishTranslation`.
    *   Empty answer tray (`.selected-chips-tray`).
    *   Scrambled `wordBank` chips tray (`.word-bank-tray`).
*   **Interactions:**
    *   Click chip in word bank $\implies$ moves chip into answer tray.
    *   Click chip in answer tray $\implies$ returns chip to word bank.
    *   Reset button (`<RefreshCw />`): Clears answer tray and restores word bank.
    *   "Check Answer" button: Compares assembled string against `correctAnswer`.
    *   **Mismatch:** Triggers `sb-shake` keyframe animation and red validation alert.
    *   **Match:** Disables interaction, turns tray green, displays checkmark, and triggers `onComplete()`.

---

### 3.4 Stage 4: Conversational Dialogue Reading (`DialogueReading.tsx`)
*   **Objective:** Read a contextual 4-line conversation incorporating the lesson's target vocabulary.
*   **UI Layout:** Chat stream with alternating speech bubbles:
    *   Speaker A: Aligned left with subtle accent glow border.
    *   Speaker B: Aligned right with secondary background border.
*   **Features per Bubble:**
    *   Speaker avatar icon and name.
    *   Large Chinese sentence text with Pinyin annotations.
    *   Narration button (`<Volume2 />`): Reads that line out loud via native TTS.
    *   Translation reveal toggle (`<MessageCircle />`): Expands English translation.
*   **Completion Rule:** Active by default, allowing the user to mark "Complete Lesson".

---

## 4. Thematic Iconography Mapping (`iconMap.ts`)

Theme tags generated by Gemini map to Lucide icons:

| Tag String | Icon Component | Semantics |
| :--- | :--- | :--- |
| `'food'` | `Utensils` | Dining, restaurants, cuisine |
| `'travel'` | `Plane` | Flights, directions, tourism |
| `'business'` | `Briefcase` | Work, meetings, commercial |
| `'daily_life'` | `Home` | Domestic routines, family |
| `'school'` | `BookOpen` | Academic studies, exams |
| `'shopping'` | `ShoppingBag` | Markets, prices, transactions |
| `'transport'` | `Car` | Vehicles, traffic, public transit |
| *fallback* | `GraduationCap` | General study & pedagogy |
