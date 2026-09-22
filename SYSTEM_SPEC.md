# Mandarin Graded Reader — Master System Specification & Architecture Manual

**Document Version:** 7.0.0  
**Status:** Canonical Single Source of Truth  
**Target Audience:** Software Architects, Frontend Engineers, Full-Stack Developers, and Autonomous AI Agents  
**Scope:** Complete Client-Side Architecture, 5 Modular Workspaces, Pitch Tracking Engine, Azure Neural Audio & SSML, EPUB/OCR Ingestion, Curriculum Alignment, State Hydration, and Sleek Modern UI Design System.

---

## Table of Contents

1. [System Overview & Architectural Paradigm](#1-system-overview--architectural-paradigm)
2. [Runtime Stack & Dependency Registry](#2-runtime-stack--dependency-registry)
3. [Component Hierarchy & React State Machine](#3-component-hierarchy--react-state-machine)
4. [Complete Feature Inventory & Execution Workflows](#4-complete-feature-inventory--execution-workflows)
5. [Design System, Styling Tokens & Component Classes](#5-design-system-styling-tokens--component-classes)
6. [Data Architecture, Storage Contracts & SM-2 Algorithm](#6-data-architecture-storage-contracts--sm-2-algorithm)
7. [NLP Word Segmentation & Search Ranking Engine](#7-nlp-word-segmentation--search-ranking-engine)
8. [AI Services, Prompt Engineering & JSON Contracts](#8-ai-services-prompt-engineering--json-contracts)
9. [Interactive Lesson Engine Subsystem](#9-interactive-lesson-engine-subsystem)
10. [Audio Narration, Neural Azure Speech & Acoustic Pitch Engine](#10-audio-narration-neural-azure-speech--acoustic-pitch-engine)
11. [Progressive Web App (PWA) & Offline Capabilities](#11-progressive-web-app-pwa--offline-capabilities)
12. [System Extension & Evolution Playbooks](#12-system-extension--evolution-playbooks)
13. [Known Constraints, Edge Cases & Technical Debt](#13-known-constraints-edge-cases--technical-debt)
14. [Complete File & Module Map](#14-complete-file--module-map)

---

## 1. System Overview & Architectural Paradigm

The Mandarin Graded Reader is a local-first, zero-backend Single Page Application (SPA) designed for acquiring Mandarin Chinese through comprehensible input, active recall, guided drawing, real-time vocal pitch tracking, and adaptive generative instruction.

```
+---------------------------------------------------------------------------------------------------------------+
|                                            BROWSER CLIENT RUNTIME                                             |
|                                                                                                               |
|  +---------------------------------------------------------------------------------------------------------+  |
|  |                                  Presentation Layer (React 19 + TypeScript)                             |  |
|  |                                                                                                         |  |
|  |   [App.tsx] Root Master Coordinator & 5-Modular Workspace Switcher                                      |  |
|  |   ├── Header: Logo 文, OfflineStatusIndicator, Global Search, 50-Q Diagnostic Modal, Theme Selector      |  |
|  |   ├── Workspace 1: 📖 ReadingWorkspace (ReadingTheater, Deep Focus, Pacing Highlights, Branching, Poly) |  |
|  |   ├── Workspace 2: 🎙️ SpeakingWorkspace (ToneVisualizerCanvas, ShadowingStudio, VoiceAgent)            |  |
|  |   ├── Workspace 3: 📂 ImportMediaWorkspace (EpubParser, OcrService, VideoSubtitleReader, TTR Analyzer)  |  |
|  |   ├── Workspace 4: 🗂️ ReviewWorkspace (AudioFirstFlashcard, HanziWriter, SM-2 Deck, ActivityHeatmap)   |  |
|  |   └── Workspace 5: 🎯 LessonWorkspace (LessonEngine, HSK 1-6 & SCQF Level 6 Standards, Diagnostic)     |  |
|  +---------------------------------------------------------------------------------------------------------+  |
|           |                               |                         |                         |               |
|           v                               v                         v                         v               |
|  +------------------+         +-----------------------+     +--------------------+    +--------------------+  |
|  | Local NLP Engine |         | Client Storage Engine |     | Neural Audio & TTS |    | Pitch & Speech DSP |  |
|  | - Intl.Segmenter |         | - IndexedDB:          |     | - Azure Neural     |    | - pYIN / Autocorr  |  |
|  | - Polyphone Det. |         |     SRS Flashcards    |     |   (Xiaoxiao/Yunxi) |    |   F0 Detection     |  |
|  | - Grammar Matcher|         |     Story Library     |     | - SSML Compiler    |    | - Canvas Tone Plot |  |
|  | - Lexical Density|         |     Dict Overrides    |     | - Audio Chunking   |    | - DTW Normalizer   |  |
|  |   (TTR Analyzer) |         |     SHA-256 Audio     |     | - SHA-256 LRU      |    | - Browser Speech   |  |
|  +------------------+         |     Pitch F0 Cache    |     |   IndexedDB Cache  |    |   Recognition      |  |
|           |                   | - localStorage:       |     | - Web Speech API   |    +--------------------+  |
|           v                   |     API Keys, Theme   |     |   Offline Fallback |              |             |
|  +------------------+         |     Reading Heatmap   |     +--------------------+              |             |
|  | Precached Data   |         |     CPM Speed Logs    |               |                         |             |
|  | - hanziDB.csv    |         | - Workbox PWA Cache:  |               |                         |             |
|  | - vocabDB.csv    |         |     App Shell, CSVs   |               |                         |             |
|  +------------------+         +-----------------------+               |                         |             |
+-------------------------------------------|---------------------------|-------------------------|-------------+
                                            |                           |                         |
                                            v                           v                         v
                               +-------------------------+     +-------------------+     +------------------+
                               | Google Gemini API       |     | Azure Speech REST |     | Microphone Input |
                               | (gemini-2.5-flash)      |     | Service           |     | Web Audio API    |
                               | - Graded Stories        |     | - Xiaoxiao Neural |     | AudioContext     |
                               | - Grammar Analysis      |     | - Yunxi Neural    |     | AnalyserNode     |
                               | - Duolingo Lessons      |     | - SSML express-as |     +------------------+
                               | - Voice Agent Dialogue  |     +-------------------+
                               +-------------------------+
```

### Architectural Principles
1. **Zero-Backend Sovereignty:** The client executes completely in the browser. User data (reading history, vocabulary, flashcards, custom overrides) is stored strictly client-side in IndexedDB and `localStorage`.
2. **Local-First Degradation:** All core reading, dictionary lookups, writing practice, and flashcard reviews function 100% offline via Service Worker precaching. Only generative AI features require network access.
3. **Deterministic Lexical Resolution:** Text parsing does not rely on nondeterministic AI. It uses a strict 4-tier cascade matching `Intl.Segmenter` tokens against local databases and user overrides.
4. **Defensive API Interfacing:** Integrations with flaky or experimental browser APIs (Web Speech API, CDN scripts) are wrapped in garbage-collection anchors, queue flush deferrals, and fallback checks.

---

## 2. Runtime Stack & Dependency Registry

### 2.1 Core Dependencies

| Package | Version | Purpose | Architectural Rationale |
| :--- | :--- | :--- | :--- |
| `react` | `^19.1.1` | UI Library | Modern hooks, concurrent rendering, virtual DOM reconciliation. |
| `react-dom` | `^19.1.1` | DOM Renderer | Browser DOM mounting and updates. |
| `typescript` | `~5.8.3` | Language | Strict static typing, schema contracts, compile-time safety. |
| `vite` | `^7.1.2` | Bundler / Dev Server | Native ESM hot reloading and optimized Rollup production builds. |
| `vite-plugin-pwa` | `^0.21.1` | PWA / Offline | Generates Workbox service worker and manifest for offline caching. |
| `papaparse` | `^5.5.3` | CSV Parser | High-performance, streaming client-side CSV parsing. |
| `@google/generative-ai` | `^0.24.1` | AI Client | Official Google Gemini SDK for story generation and lesson synthesis. |
| `lucide-react` | `^0.539.0` | Iconography | Lightweight, tree-shakeable SVG UI and thematic category icons. |

### 2.2 External CDN Dependencies

*   **HanziWriter (`v3.5.0`):** Loaded via CDN (`https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js`) in `index.html` with an asynchronous script injector fallback inside `src/HanziPracticeModal.tsx`. Provides SVG stroke animations and interactive drawing evaluation against the standard Chinese character vector registry.

### 2.3 Package Manager Configuration & Overrides

In `package.json`, an `overrides` block resolves upstream peer dependency conflicts between `vite-plugin-pwa` (peer-capped at Vite 6) and the root Vite 7 environment:
```json
"overrides": {
  "vite-plugin-pwa": {
    "vite": "$vite"
  }
}
```

---

## 3. Component Hierarchy & React State Machine

### 3.1 Component Tree Architecture

```
[index.html] -> HanziWriter CDN script
  └── [src/main.tsx]
        └── [src/App.tsx] (Master Workspace Coordinator)
              ├── [Global Header]
              │     ├── Brand Seal (文) & Title
              │     ├── [OfflineStatusIndicator] (Network Status Badge)
              │     ├── Universal Search Bar & Scored Dropdown
              │     ├── [DiagnosticTestModal] Trigger Button
              │     └── Theme Palette Switcher & Settings Button
              ├── [Workspace Navigation Bar] (Centered Flexbox)
              │     ├── 📖 Reading (ReadingWorkspace)
              │     ├── 🎙️ Speaking (SpeakingWorkspace)
              │     ├── 📂 Import (ImportMediaWorkspace)
              │     ├── 🗂️ Review (ReviewWorkspace with Due badge)
              │     └── 🎯 Lessons (LessonWorkspace)
              ├── Workspace 1: [ReadingWorkspace]
              │     ├── Story Generator Form (Topic prompt, HSK level selector, Generate button)
              │     ├── [ReadingTheater]
              │     │     ├── Toolbar (Horizontal/Vertical-rl, Pinyin, Hide HSK, Speed, TTS, Scale, Focus)
              │     │     ├── Focus Mode Fullscreen Drawer
              │     │     ├── Flow / Column Container [.story-content-vertical / .story-content-horizontal]
              │     │     ├── Interactive Sentence Spans with Pacing Highlights
              │     │     ├── Grammar Pattern Highlights ([.grammar-flag])
              │     │     ├── Polyphone Indicators ([.polyphone-flag])
              │     │     ├── Inline Sentence Translation Reveal Box
              │     │     └── Choose Your Own Adventure Branching Continuation Bar
              │     └── Offline Story Library Grid & Semantic Search
              ├── Workspace 2: [SpeakingWorkspace]
              │     ├── Sub-nav (Tone Visualizer, Shadowing Studio, Conversational Voice Agent)
              │     ├── [ToneVisualizerCanvas] (HTML5 Canvas 5-degree grid, real-time F0 curve)
              │     ├── [ShadowingStudio] (Target audio, user microphone, back-to-back dual playback)
              │     └── [ConversationalVoiceAgent] (Speech recognition, Gemini dialogue loop, audio)
              ├── Workspace 3: [ImportMediaWorkspace]
              │     ├── Ingestion Tabs (EPUB Books, Local OCR Scanner, Subtitle Track)
              │     ├── [EpubParser] (Client-side zip unzip via DecompressionStream, TOC list)
              │     ├── [TocDrawer] (Chapter drawer with word counts)
              │     ├── [OcrService] (Canvas binarization, character extraction)
              │     ├── [VideoSubtitleReader] (Timed cues, tokenized display, hover lookups)
              │     ├── [LexicalDensity] (TTR analysis card, HSK level distributions)
              │     └── [VocabExtractor] (Identifies words above user HSK level)
              ├── Workspace 4: [ReviewWorkspace]
              │     ├── [AudioFirstFlashcard] (Pronunciation trigger, reveal, SM-2 quality grade)
              │     ├── [SrsHeatmap] (28-day review activity in monochrome / subtle green)
              │     ├── Reading Speed Analytics (CPM calculation and session logs)
              │     └── Export Deck (Anki TSV format)
              ├── Workspace 5: [LessonWorkspace]
              │     ├── [LessonEngine] (4-stage Duolingo-style structured learning modules)
              │     ├── HSK 1-6 (HSK 3.0) Framework Explorer
              │     ├── SQA Higher Mandarin (SCQF Level 6) Syllabus & Essay Prompts
              │     └── [DiagnosticTestModal] (50-question dynamic placement test)
              ├── Modals & Floating Tooltips:
              │     ├── [RadicalDecomposition] (Kangxi radical breakdown tooltip)
              │     ├── [HanziPracticeModal] (Interactive stroke writing canvas)
              │     ├── [DiagnosticTestModal] (50-Q placement test with level calibration)
              │     ├── [Dictionary Override Modal] (Custom pinyin & definition editor)
              │     └── [Settings Modal] (Gemini Key, Azure Key/Region, Themes, State Hydration)
```

### 3.2 Master State Machine Specification (`App.tsx`)

| State Variable | Type | Default Value | Trigger / Mutation Scope |
| :--- | :--- | :--- | :--- |
| `activeWorkspace` | `'reading' \| 'speaking' \| 'import' \| 'review' \| 'lessons'` | `'reading'` | Workspace navigation bar. Swaps active isolated pedagogical environment. |
| `currentThemeId` | `'light' \| 'dark' \| 'system'` | `'light'` | Toggled via header or settings modal. Controls modern CSS variables and palette. |
| `apiKey` | `string` | `localStorage: gemini_api_key` | Gemini AI API key for story synthesis, lessons, and conversational tutor. |
| `azureKey` | `string` | `localStorage: azure_speech_key` | Azure Speech REST API key for Xiaoxiao/Yunxi neural voices. |
| `azureRegion` | `string` | `localStorage: azure_speech_region` | Azure Cognitive Services region (e.g. `eastus`). |
| `showSettings` | `boolean` | `false` | Controls visibility of global settings and state hydration modal. |
| `isDiagnosticOpen` | `boolean` | `false` | Modal visibility for 50-question dynamic placement diagnostic. |
| `hanziData` | `HanziItem[]` | `[]` | Loaded on launch from `/hanziDB.csv` (10,000+ single characters). |
| `vocabData` | `HanziItem[]` | `[]` | Loaded on launch from `/vocabDB.csv` (compound words). |
| `overridesMap` | `Record<string, { pinyin, definition }>` | `{}` | Hydrated from IndexedDB `MandarinGradedReaderOverrides`. |
| `storyIdea` | `string` | `""` | User prompt input in story generator form. |
| `hskLevel` | `string` | `"1"` | Target proficiency level ("1" through "6"). |
| `loading` | `boolean` | `false` | Spinner state during story generation / difficulty rewrite. |
| `storyTitle` | `string` | `"欢迎体验墨韵华文阅读器"` | Active document / story title. |
| `generatedStory` | `HanziItem[]` | `[]` | Tokenized words displayed in Reading Theater. |
| `dueCardsCount` | `number` | `0` | Number of flashcards due for SM-2 review today. |
| `totalCardsCount` | `number` | `0` | Total cards registered in `MandarinGradedReaderSRS`. |
| `currentReviewCard` | `Flashcard \| null` | `null` | Head card in the active review queue. |
| `savedStories` | `SavedStory[]` | `[]` | Stories loaded from offline IndexedDB story store. |
| `heatmapData` | `Record<string, number>` | `localStorage` | Map of `YYYY-MM-DD` to character count read. |
| `readingStats` | `ReadingSpeedRecord[]` | `localStorage` | Session CPM history and characters read metrics. |
| `activeLesson` | `Lesson \| null` | `null` | Structured JSON lesson payload loaded into `LessonEngine`. |

---

## 4. Complete Feature Inventory & Execution Workflows

### 4.1 Feature 1: Graded Story Generator
*   **Workflow:**
    1. User inputs `storyIdea` and selects `hskLevel` (1-6) $\implies$ clicks "Generate Graded Story".
    2. Guard validates non-empty `apiKey` and inputs. Sets `loading = true`.
    3. Retrieves `grammarConstraint = HSK_GRAMMAR_CONSTRAINTS[hskLevel]`.
    4. Calls Gemini SDK (`gemini-3.1-flash-lite`) with story generation prompt.
    5. Receives response $\implies$ splits on `\n`. Line 1 is sanitized into `storyTitle`; lines $2..N$ are joined into `storyContent`.
    6. Calls `tokenizeStory(storyContent, hanziData, vocabData, overridesMap)` $\implies$ assigns output tokens to `generatedStory`.
    7. Calls `recordCharactersRead(storyContent.length)` to log character count to the reading heatmap.
    8. Sets `loading = false`.

### 4.2 Feature 2: In-Line Difficulty Scaling (Simplify / Harder)
*   **Workflow:**
    1. User clicks `📉 Simplify` ($L - 1$) or `📈 Harder` ($L + 1$) on an active story.
    2. Guard bounds target level between $1$ and $6$. Sets `loading = true`.
    3. Serializes current story tokens back to plain text: `currentText = generatedStory.map(i => i.character).join('')`.
    4. Calls Gemini with difficulty scaling rewrite prompt.
    5. Re-tokenizes rewritten text and updates `generatedStory`, `storyTitle`, and `hskLevel`.
    6. Sets `loading = false`.

### 4.3 Feature 3: Story Continuation ("Choose Your Own Adventure")
*   **Workflow:**
    1. User types plot direction into `continuationPrompt` at story bottom $\implies$ clicks "Continue Story".
    2. Guard validates non-empty prompt. Sets `continuing = true`.
    3. Sends current story text + continuation prompt + HSK constraint to Gemini.
    4. Tokenizes newly generated paragraph.
    5. Appends new tokens to `generatedStory`: `setGeneratedStory(prev => [...prev, ...newTokens])`.
    6. Increments heatmap with length of appended text. Clears `continuationPrompt`. Sets `continuing = false`.

### 4.4 Feature 4: Interactive Reader, Selective Pinyin & Sentence Grouping
*   **Workflow:**
    1. Renders `generatedStory` tokens in sequence.
    2. Paragraph breaks (`\n`) render as block line breaks.
    3. Punctuation (`。`, `！`, `？`) marks boundaries between sentence spans (`.story-sentence-span`).
    4. Pinyin ruby display is rendered above Chinese glyphs if `showPinyin === true`.
    5. If token's `hsk_level` is $\le$ `hidePinyinLevel`, Pinyin is suppressed for that token.

### 4.5 Feature 5: Lexical Hover Tooltips
*   **Workflow:**
    1. User hovers cursor over `.hanzi-character` chip.
    2. Clears any pending dismissal timeout (`hideTimeoutRef`).
    3. Queries token metadata: Pinyin, English gloss, HSK level, frequency rank, radical, stroke count.
    4. Calculates viewport-safe coordinates (`x, y`) from bounding rectangle.
    5. Renders floating card (`.tooltip-popup`) with quick-action buttons (`➕ Add to Flashcards`, `✍️ Practice Writing`, `✏️ Edit`).
    6. On mouse leave, initiates 300ms debounce timeout before unmounting tooltip, permitting cursor entry into the card.

### 4.6 Feature 6: Ranked Scoring Dictionary Search
*   **Workflow:**
    1. User types query into search input (`searchQuery`).
    2. Normalizes query by trimming and stripping diacritical tone marks via Unicode NFD.
    3. Iterates unified corpus (`hanziData` + `vocabData` + `overridesMap`).
    4. Computes 7-tier score (100, 95, 90, 80, 70, 50, 30).
    5. Sorts matches by `score DESC`, breaking ties by `frequency_rank ASC`.
    6. Returns top-10 matches into floating dropdown.
    7. Clicking an item opens the Hanzi writing practice modal for that word.

### 4.7 Feature 7: Custom Dictionary Overrides
*   **Workflow:**
    1. User clicks `✏️ Edit` on any tooltip or search item.
    2. Opens modal prefilled with character glyph, current Pinyin, and definition.
    3. User edits fields $\implies$ clicks "Save Override".
    4. Calls `saveOverride()` to write record into IndexedDB `MandarinGradedReaderOverrides`.
    5. Reloads `overridesMap` in memory.
    6. Triggers re-tokenization of active story (`generatedStory`) so changes reflect immediately across the reading view.

### 4.8 Feature 8: Hanzi Stroke Writing Practice Canvas
*   **Workflow:**
    1. Triggered via tooltip, search result, SRS review card, or sidebar practice button.
    2. If item is a multi-character compound word (e.g. `你好`), splits string into character tabs.
    3. Checks `window.HanziWriter`. If unmounted, dynamically injects CDN script tag.
    4. Instantiates `HanziWriter.create()` on target SVG container.
    5. Modes:
       *   **Animate:** Plays stroke-order sequence at target speed.
       *   **Quiz:** Evaluates user drawing strokes against vector glyph data. Tracks mistrokes. Calls `onSuccess()` upon final stroke completion.

### 4.9 Feature 9: Spaced Repetition (SRS) Flashcards (SuperMemo-2)
*   **Workflow:**
    1. User adds word via `➕ Add to Flashcards` on tooltip.
    2. Calls `addCard()` to persist card into IndexedDB `MandarinGradedReaderSRS`.
    3. In Tab 3 (`review`), queries `getDueCards()` where `nextReviewDate <= Date.now()`.
    4. Displays head card (`currentReviewCard`).
    5. Mode A: User clicks "👁️ Just Reveal Answer" $\implies$ shows Pinyin, definition, and grading buttons.
    6. Mode B: User clicks "✍️ Practice Writing & Reveal" $\implies$ opens writing canvas. Completing the stroke quiz automatically reveals the card.
    7. User selects self-grade quality (1: Fail, 2: Hard, 3: Good, 4: Easy).
    8. Calls `updateCard(character, quality)` applying SM-2 algorithm. Advances to next card in due queue.

### 4.10 Feature 10: AI-Generated Structured Lessons (Duolingo Style)
*   **Workflow:**
    1. In Tab 5 (`lessons`), user inputs `lessonTopic` and selects `lessonHskLevel` $\implies$ clicks "Generate Structured Lesson".
    2. Sets `loadingLesson = true`. Calls `generateLesson()` in `src/services/gemini.ts`.
    3. Gemini SDK called with `generationConfig: { responseMimeType: "application/json" }`.
    4. Parses structured JSON response into `Lesson` object. Sets `activeLesson = lesson`.
    5. Mounts `<LessonEngine>` component.
    6. Coordinates 4-stage sequential state machine (VocabIntro $\implies$ MultipleChoice $\implies$ SentenceBuilder $\implies$ DialogueReading).
    7. User completes final stage $\implies$ celebration trophy screen renders, credit characters read added to heatmap, state resets.

### 4.11 Feature 11: Sentence-Level AI Grammar Decomposition
*   **Workflow:**
    1. User clicks any sentence span (`.story-sentence-span`).
    2. Highlights sentence span with `.selected` class (`rgba(129, 140, 248, 0.3)`).
    3. Sets `loadingGrammar = true`.
    4. Sends sentence text to Gemini with grammar analysis prompt.
    5. Parses response with `renderMarkdown()` (bold, italics, lists, step numbers).
    6. Renders formatted grammar card in the right sticky workspace. Sets `loadingGrammar = false`.

### 4.12 Feature 12: Contextual AI Story Tutor
*   **Workflow:**
    1. User types question into chat input in the right workspace $\implies$ clicks Send.
    2. Appends user message to `chatMessages`. Sets `loadingTutor = true`.
    3. Injects active story text as context into Gemini tutor prompt.
    4. Receives response $\implies$ parses with `renderMarkdown()`.
    5. Appends tutor response to `chatMessages`. Auto-scrolls chat window to bottom. Sets `loadingTutor = false`.

### 4.13 Feature 13: Custom Text Importer
*   **Workflow:**
    1. In Tab 2 (`importer`), user enters `importedTitle` and pastes raw Chinese text into `importedText`.
    2. Clicks "Import & Tokenize".
    3. Tokenizes pasted text using `tokenizeStory()`.
    4. Sets `generatedStory = tokens`, `storyTitle = importedTitle || 'Imported Text'`.
    5. Switches view to `activeTab = 'reader'`, enabling full hover, TTS, grammar, and practice tools.

### 4.14 Feature 14: Story Library Dashboard
*   **Workflow:**
    1. User clicks `💾 Save` in reader toolbar.
    2. Calls `saveStory()` in `src/services/libraryStore.ts`, writing to IndexedDB `MandarinGradedReaderLibrary`.
    3. Displays saved confirmation alert.
    4. In Tab 4 (`library`), lists all saved stories sorted by timestamp descending.
    5. Clicking a story card reloads it directly into the interactive reader.
    6. Clicking `🗑️` deletes the story record from IndexedDB.

### 4.15 Feature 15: Progression Activity Heatmap
*   **Workflow:**
    1. Whenever characters are generated, imported, continued, or completed in a lesson, `recordCharactersRead(count)` is invoked.
    2. Gets today's ISO date (`YYYY-MM-DD`). Increments count in `heatmapData`.
    3. Persists JSON to `localStorage: characters_read_heatmap`.
    4. Right panel renders a 28-day grid (4 columns $\times$ 7 rows).
    5. Evaluates daily character totals into 4 intensity tiers (`lvl-1` through `lvl-4`).

### 4.16 Feature 16: Narrator Text-to-Speech (TTS)
*   **Workflow:**
    1. User clicks `▶️ Play` in story reader toolbar or speaker button on vocabulary/dialogue cards.
    2. Checks `window.speechSynthesis`.
    3. Verifies Chinese voice presence (`zhVoice`). If none found, displays OS voice package guide alert.
    4. Calls `window.speechSynthesis.cancel()` to clear audio queue.
    5. Constructs `SpeechSynthesisUtterance`. Sets `lang = 'zh-CN'`, `rate = ttsSpeed`, `voice = zhVoice`.
    6. Dual-anchors utterance (`utteranceRef.current` and `(window as any).activeUtterance`).
    7. Defers `speak()` call by 100ms via `setTimeout` to allow cancellation queue flush.
    8. Updates `ttsState = 'playing'`. Unbinds anchors on `onend` or `onerror`.

---

## 5. Design System, Styling Tokens & Component Classes

### 5.1 Design Philosophy: Modern Editorial Dark (Anti-AI Slop)
The platform prioritizes long-session reading and intensive studying. The aesthetic is utilitarian, grounded, flat, and highly legible.
* **Zero "AI Slop":** Strictly prohibits glassmorphism (`backdrop-filter: blur`), gradient meshes, glowing drop shadows, and bubbly pill border radiuses (`border-radius: 9999px` is prohibited).
* **Flat & Structural:** Depth is established through hard borders and subtle background color differences, not drop shadows.
* **Dark-Default Editorial:** The default theme is an intentional, low-contrast dark palette (`#121212` base) resembling high-end typography specimens or high-density code editors. Pure black (`#000000`) and pure white (`#FFFFFF`) are avoided.
* **Typographic Segregation:** Clear boundaries between UI controls (modern geometric sans), reading material (literary serif), and phonetics (monospace).

### 5.2 CSS Custom Properties (Semantic Tokens)

Declared in `src/App.css`:

```css
:root {
  /* Surface & Container Tokens - Editorial Dark (Default) */
  --bg-base: #121212;
  --bg-surface: #1E1E20;
  --bg-surface-hover: #2A2A2D;
  --bg-panel: #18181A;

  /* Typography Colors */
  --text-primary: #E5E5E5;
  --text-secondary: #A0A0A5;
  --text-muted: #6B6B70;

  /* Structural Borders */
  --border-subtle: #2C2C30;
  --border-strong: #3F3F45;

  /* Semantic Accents */
  --accent-seal: #A33B3B;     /* Cinnabar/Seal Red: Primary accent, destructive */
  --accent-bamboo: #4C6B53;   /* Scholar Bamboo: Success, learned states */
  --accent-gold: #B8904D;     /* Antique Bronze: Warnings, tone highlights */

  /* Typographic Stacks */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-serif-zh: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', Menlo, monospace;

  /* Brutalist Geometry (Anti-Pill Rule) */
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 0px;
  --radius-pill: 2px;

  /* Elevation (No Soft Blurs) */
  --shadow-main: none;
  --shadow-card: none;
  --shadow-tooltip: 4px 4px 0px rgba(0, 0, 0, 0.8);
}

/* Editorial Paper Palette (Warm Light Mode) */
[data-theme="paper"] {
  --bg-base: #F6F5F2;
  --bg-surface: #ECEAE4;
  --bg-surface-hover: #E2DFD7;
  --bg-panel: #F0EFEB;

  --text-primary: #222224;
  --text-secondary: #59595E;
  --text-muted: #8C8C91;

  --border-subtle: #DBD7CE;
  --border-strong: #8C8C91;

  --accent-seal: #8B2626;
  --accent-bamboo: #3B5740;
  --accent-gold: #8C6B2D;
}
```

### 5.3 Anti-Overlap Reading Theater Geometry

Vertical overlapping of Chinese characters and absolute Pinyin annotations is eliminated through explicit box modeling:

```css
.story-header-title {
  font-family: var(--font-serif-zh);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.01em;
  margin: 0 0 36px 0; /* Clear boundary preventing title from overlapping body */
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.story-content-horizontal {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 16px;
  line-height: 2.8; /* Expands line boxes to accommodate Pinyin */
  font-family: var(--font-serif-zh);
  font-size: 24px;
  color: var(--text-primary);
}

.hanzi-chip,
.hanzi-character {
  position: relative;
  display: inline-block;
  margin-top: 22px; /* Reserves physical height in the line box for absolute pinyin */
  margin-bottom: 6px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.1s ease;
}

.hanzi-chip:hover,
.hanzi-character:hover {
  background: var(--bg-surface-hover);
  border-bottom: 1px solid var(--accent-seal);
}

.pinyin-above,
.pinyin-display {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-secondary);
  pointer-events: none;
  white-space: nowrap;
}
```

### 5.4 Component Construction Blueprints

* **Main Workspace Navigation:** Flat horizontal bar pinned to top. Background `var(--bg-base)`, border-bottom `1px solid var(--border-subtle)`. Tabs are rectangular, uppercase, `13px`, letter spacing `0.08em`. Active tab uses `border-bottom: 2px solid var(--accent-seal)` and `var(--bg-surface)` highlight.
* **Lexical Hover Tooltip:** Strict rectangle without speech-bubble tails (`border-radius: 2px; border: 1px solid var(--border-strong); background: var(--bg-panel); box-shadow: var(--shadow-tooltip);`). Top bar renders character in `32px` serif with adjacent monospace Pinyin. Definition text in clean sans-serif. Action triggers are 2px-radius rectangular buttons.
* **Form Controls & Buttons:** Height 32px or 36px, `border: 1px solid var(--border-subtle)`, `background: var(--bg-surface)`, uppercase `12px` font with `0.08em` tracking. Primary action uses `var(--accent-seal)` background and `#FFFFFF` text. No rounded bubble pills.
* **Tone Visualizer Canvas:** Canvas drawn with `var(--bg-base)` (`#121212`), 5-degree tonal grid lines `1px solid var(--border-subtle)`, reference curve in Antique Gold (`#B8904D`), and real-time user microphone pitch curve in Seal Red (`#A33B3B`). No glowing neon blurs.
* **SM-2 Flashcards:** Quality grading buttons mapped to canonical palette: `1: Fail` (Seal Red `#A33B3B`), `2: Hard` (Antique Gold `#B8904D`), `3: Good` (Scholar Bamboo `#4C6B53`), `4: Easy` (Forest `#354E3C`).

### 5.5 Print Media Styles (`@media print`)

When `window.print()` is invoked:
* Backgrounds force to `#FFFFFF`, text forces to `#000000`.
* All navigation controls, search bars, toolbars, buttons, and modals are hidden (`display: none !important`).
* `.story-content-horizontal`, `.story-content-vertical` expand to full page width with borders and shadows stripped.
* Characters scale to `24px` with line height `2.8`. Pinyin displays in `#555555`.

---

## 6. Data Architecture, Storage Contracts & SM-2 Algorithm

### 6.1 TypeScript Domain Interfaces

#### 1. Dictionary & Token Item (`src/types/HanziItem.ts`)
```typescript
export interface HanziItem {
  frequency_rank: string;      // Corpus frequency rank (e.g. "1")
  character: string;           // Chinese glyph or compound word
  pinyin: string;              // Tone-marked Pinyin
  definition: string;          // English translation
  radical: string;             // Kangxi radical glyph
  radical_code: string;        // Radical number code
  stroke_count: string;        // Total strokes
  hsk_level: string;           // HSK level string ("1" - "6" or "Custom")
  general_standard_num: string;// Standard Ministry of Education index
  isNonChinese?: boolean;      // True if punctuation, whitespace, or latin
}
```

#### 2. Spaced Repetition Flashcard (`src/services/srsStore.ts`)
```typescript
export interface Flashcard {
  character: string;           // Primary Key
  pinyin: string;              // Pronunciation helper
  definition: string;          // Meaning translation
  nextReviewDate: number;      // Epoch ms when card becomes due
  interval: number;            // Current interval in days
  easeFactor: number;          // SM-2 multiplier (default: 2.5, min: 1.3)
  hsk_level?: string;          // HSK level tag
}
```

#### 3. Saved Story Record (`src/services/libraryStore.ts`)
```typescript
export interface SavedStory {
  id: string;                  // Primary Key: e.g. "story_1710000000000"
  title: string;               // Display title
  text: string;                // Raw Chinese text
  hskLevel: string;            // Level tag ("1" - "6" or "Custom")
  timestamp: number;           // Creation epoch timestamp (ms)
}
```

#### 4. Custom Dictionary Override (`src/services/dictionaryStore.ts`)
```typescript
export interface DictionaryOverride {
  character: string;           // Primary Key: character or compound word
  pinyin: string;              // User-defined Pinyin
  definition: string;          // User-defined English gloss
}
```

#### 5. Hover Tooltip Details (`src/types/ToolTip.ts`)
```typescript
export interface TooltipContent {
  pinyin?: string;
  definition?: string;
  hskLevel?: string;
  frequency?: string;
  radical?: string;
  strokes?: string;
}
```

### 6.2 IndexedDB Database Specifications

| Database Name | Store Name | Key Path | Version | Storage Adapter |
| :--- | :--- | :--- | :---: | :--- |
| `MandarinGradedReaderSRS` | `flashcards` | `character` | `1` | `src/services/srsStore.ts` |
| `MandarinGradedReaderLibrary` | `stories` | `id` | `1` | `src/services/libraryStore.ts` |
| `MandarinGradedReaderOverrides` | `overrides` | `character` | `1` | `src/services/dictionaryStore.ts` |

### 6.3 SuperMemo-2 (SM-2) Spaced Repetition Mathematics

Calculated in `updateCard(character, quality)`:

1.  **User Evaluation Grade:** Input $quality \in \{1, 2, 3, 4\}$
    $$\begin{aligned}
    quality = 1 \text{ (Fail)} &\implies q_{\text{mapped}} = 0 \\
    quality = 2 \text{ (Hard)} &\implies q_{\text{mapped}} = 2 \\
    quality = 3 \text{ (Good)} &\implies q_{\text{mapped}} = 4 \\
    quality = 4 \text{ (Easy)} &\implies q_{\text{mapped}} = 5
    \end{aligned}$$

2.  **Ease Factor ($EF$) Adjustment:**
    $$EF' = EF + \left(0.1 - (5 - q_{\text{mapped}}) \times (0.08 + (5 - q_{\text{mapped}}) \times 0.02)\right)$$
    $$\text{Constraint: } EF' \ge 1.3$$

3.  **Interval ($I$, in days) Recalculation:**
    *   If $q_{\text{mapped}} < 3 \implies I' = 1$ (Reset interval on failure).
    *   If $q_{\text{mapped}} \ge 3$:
        *   If $I = 0 \implies I' = 1$
        *   If $I = 1 \implies I' = 4$
        *   If $I > 1 \implies I' = \text{round}(I \times EF')$

4.  **Due Timestamp:**
    $$\text{nextReviewDate} = \text{Date.now}() + (I' \times 86,400,000\text{ ms})$$

### 6.4 LocalStorage Key Registry

| Key | Type | Example | Purpose |
| :--- | :--- | :--- | :--- |
| `gemini_api_key` | `string` | `"AIzaSy..."` | User's Google Gemini API key |
| `theme` | `'light' \| 'dark'` | `"dark"` | Persistent visual theme preference |
| `characters_read_heatmap` | `Record<string, number>` | `{"2026-09-20": 450}` | 28-day cumulative characters read logging |

---

## 7. NLP Word Segmentation & Search Ranking Engine

### 7.1 Multi-Character Tokenization Pipeline (`tokenizeStory`)

```
Raw Text Input
      |
      v
Intl.Segmenter('zh-CN', { granularity: 'word' })
      |
      v
Word Segments (Array of strings)
      |
      +---> Non-Chinese (/[\u4E00-\u9FFF]/.test(seg) === false)
      |     -> Return token with isNonChinese: true
      |
      +---> Chinese Word Token
            |
            v
      [Priority 0] customOverrides[word]?
            |-- (Yes) -> Return token with user pinyin, definition, hsk_level: 'Custom'
            |
            v
      [Priority 1] vocabData.find(item => item.character === word)?
            |-- (Yes) -> Return compound token from vocabDB.csv
            |
            v
      [Priority 2] word.length === 1 && hanziData.find(item => item.character === word)?
            |-- (Yes) -> Return single character token from hanziDB.csv
            |
            v
      [Priority 3] Fallback: Decompose into individual characters [c]
            For each character c in word:
              1. Check customOverrides[c] -> return Custom Token
              2. Check hanziData[c] -> return Character Token
              3. If unfound -> return Unknown Token (Pinyin: "Unknown", Def: "Definition not found")
```

### 7.2 Unicode Tone Stripping Algorithm

Used to normalize Pinyin for tone-agnostic queries:
```typescript
const stripToneMarks = (str: string): string => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};
```

### 7.3 Multi-Factor Search Ranking Algorithm

Queries search across `hanziData`, `vocabData`, and `overridesMap`. Each item is assigned a score:

```typescript
let score = 0;
if (item.character === rawQuery) {
  score = 100; // Tier 1: Exact character match
} else if (item.character.includes(rawQuery)) {
  score = 95;  // Tier 2: Character inclusion
} else if (cleanPinyin === cleanQuery) {
  score = 90;  // Tier 3: Exact tone-stripped Pinyin
} else if (cleanPinyin.startsWith(cleanQuery)) {
  score = 80;  // Tier 4: Pinyin prefix match
} else if (new RegExp('\\b' + rawQuery.toLowerCase() + '\\b').test(item.definition.toLowerCase())) {
  score = 70;  // Tier 5: Definition word-boundary match
} else if (cleanPinyin.includes(cleanQuery)) {
  score = 50;  // Tier 6: Pinyin substring match
} else if (item.definition.toLowerCase().includes(rawQuery.toLowerCase())) {
  score = 30;  // Tier 7: Definition substring match
}
```

**Tie-Breaking:**
```typescript
results.sort((a, b) => {
  if (b.score !== a.score) return b.score - a.score;
  const rankA = parseInt(a.item.frequency_rank, 10) || 999999;
  const rankB = parseInt(b.item.frequency_rank, 10) || 999999;
  return rankA - rankB; // Lower rank integer = more common word
});
return results.slice(0, 10).map(r => r.item);
```

---

## 8. AI Services, Prompt Engineering & JSON Contracts

### 8.1 Model Configuration
*   **Model Name:** `gemini-3.1-flash-lite`
*   **Client Factory:** `new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-3.1-flash-lite" })`

### 8.2 HSK Grammar Constraints Matrix

Injected into all story generation and continuation prompts:

```typescript
const HSK_GRAMMAR_CONSTRAINTS: Record<string, string> = {
  "1": "Strictly limit grammar to HSK 1 patterns. Use extremely simple sentence structures like '主语 + 动词 + 宾语' (e.g. 我去商店). Use basic particles like '的' or '吗'. Do NOT use any compound sentences, advanced conjunctions, or grammar structures from HSK 2 or above.",
  "2": "Strictly limit grammar to HSK 1 and 2 patterns. Use simple conjunctions like '虽然...但是...' or '因为...所以...' and comparison structures like '比'. Do NOT use advanced grammar like '把' sentences, passive '被' sentences, or HSK 3+ structures.",
  "3": "Strictly limit grammar to HSK 1-3 patterns. You can use grammar like '把' sentences, simple passive '被' sentences, result complements, and structures like '除了...以外'. Do NOT use advanced structures like '才' vs '就' in complex clauses, conditional '无论', or HSK 4+ structures.",
  "4": "Limit grammar to HSK 1-4 patterns. You may use passive clauses, complex complements, double negatives, and conjunctions like '只要...就...' or '不管...都...'. Keep vocabulary and grammar natural but within standard upper-intermediate levels.",
  "5": "Limit grammar to HSK 1-5 patterns. You may use abstract grammatical structures, formal written conventions, and idiomatic expressions (成语) appropriate for HSK 5. Do not use extremely complex literary structures.",
  "6": "Use full vocabulary and grammar proficiency of HSK 6. You can use advanced syntax, idioms, abstract concepts, literary styles, and complex sentence chains."
};
```

### 8.3 Structured Lesson JSON Schema

Enforced using `generationConfig: { responseMimeType: "application/json" }` in `src/services/gemini.ts`:

```json
{
  "title": "String",
  "topic": "String",
  "hskLevel": "String",
  "themeTag": "food | travel | business | daily_life | school | shopping | transport",
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
        "correctAnswer": "String",
        "explanation": "String (optional)"
      }
    },
    {
      "type": "sentence_builder",
      "title": "String",
      "instructions": "String",
      "payload": {
        "targetSentence": "String",
        "englishTranslation": "String",
        "wordBank": ["String", "String"],
        "correctAnswer": "String"
      }
    },
    {
      "type": "dialogue_reading",
      "title": "String",
      "instructions": "String",
      "payload": {
        "dialogue": [
          { "speaker": "String", "text": "String", "pinyin": "String", "translation": "String" }
        ]
      }
    }
  ]
}
```

---

## 9. Interactive Lesson Engine Subsystem

### 9.1 Exercise Stage Lifecycle & Verification Rules

```
Step 0: VocabIntro
  ├── Displays 3 vocabulary flashcards.
  ├── User clicks audio button to hear pronunciation.
  ├── User clicks checkmark to mark learned.
  └── Rule: isStepComplete = true when all 3 cards are verified.

Step 1: MultipleChoice
  ├── Displays question prompt + 4 options in 2x2 grid.
  ├── User clicks incorrect option -> triggers mc-shake animation & red outline.
  └── User clicks correct option -> highlights green, shows explanation, isStepComplete = true.

Step 2: SentenceBuilder
  ├── Displays English target translation + scrambled word chips.
  ├── User clicks chips to move between bank and answer tray.
  ├── User clicks "Check Answer".
  ├── Mismatch -> triggers sb-shake animation & error warning.
  └── Match -> turns tray green, locks inputs, isStepComplete = true.

Step 3: DialogueReading
  ├── Displays 4-line conversation in alternating chat bubbles.
  ├── User can play audio per line or toggle English translations.
  └── Rule: isStepComplete = true by default. User clicks "Complete Lesson".

Completion: Trophy Celebration Screen
  ├── Displays animated floating trophy badge (float-trophy).
  ├── Calculates total characters read across vocabulary and dialogue.
  ├── Invokes recordCharactersRead(totalChars) to update heatmap.
  └── Closes lesson engine on confirmation.
```

### 9.2 Thematic Icon Mapping (`src/utils/iconMap.ts`)

| `themeTag` | Lucide Icon Component | Visual Semantics |
| :--- | :--- | :--- |
| `'food'` | `Utensils` | Dining, restaurants, ordering dishes |
| `'travel'` | `Plane` | Flights, directions, tourism |
| `'business'` | `Briefcase` | Office, commercial meetings, corporate |
| `'daily_life'` | `Home` | Household routines, family life |
| `'school'` | `BookOpen` | Academic studies, exams, classrooms |
| `'shopping'` | `ShoppingBag` | Retail, purchasing, markets |
| `'transport'` | `Car` | Taxis, public transit, navigation |
| *fallback* | `GraduationCap` | General academic study |

---

## 10. Audio Narration, Neural Azure Speech & Acoustic Pitch Engine

### 10.1 Multi-Engine High-Fidelity Architecture
The system features a 3-tier speech synthesis pipeline to replace legacy robotic 16kHz SAPI5 voices with high-definition natural human cadence:
1. **Cloud Natural Engine (`'cloud-natural'`):**
   - Streams high-fidelity neural Mandarin speech with authentic native tones and cadence.
   - Zero setup, zero API key required.
   - Ideal for beginner and intermediate learners needing clear, fluent spoken input.
2. **Microsoft Azure Neural REST API (`'azure-neural'`):**
   - High-grade studio neural voices: `zh-CN-XiaoxiaoNeural`, `zh-CN-YunxiNeural`, `zh-CN-YunjianNeural`, and `zh-CN-XiaoyiNeural`.
   - Rich SSML compilation with `mstts:express-as` emotional styling and prosody stretching.
   - SHA-256 persistent IndexedDB caching (`MandarinGradedReaderAudioCache`).
3. **Smart System Voice Prioritization (`'system'`):**
   - Scans `window.speechSynthesis.getVoices()`.
   - Prioritizes modern `Natural`, `Online`, and `Neural` voices (e.g. `Microsoft Xiaoxiao Online (Natural)`) over legacy desktop voices.
   - Provides in-app diagnostics and instructions for installing Microsoft Natural voices in Windows 11/Edge.

### 10.2 Deterministic Audio Playback Controller & Pause Machine
In `ReadingTheater`, audio narration coordinates through a strict 3-state playback machine (`'idle' | 'playing' | 'paused'`):
* **Immediate Halt on Pause:**
  - Sets `isPausedRef.current = true;` and `isStoppedRef.current = true;`.
  - Clears any pending inter-sentence timeouts (`pendingTimeoutRef.current`).
  - Halts active `<audio>` elements or detaches `onend`/`onerror` handlers before calling `window.speechSynthesis.cancel()`, preventing synthetic `onend` events from advancing to the next sentence.
* **Resume Capability:**
  - Maintains `currentIdxRef.current` and visual pacing highlighting at the paused sentence.
  - Clicking "Resume" restarts playback seamlessly from the paused position.
* **Unmount Safety:**
  - Guaranteed `useEffect` cleanup halts all audio, clears timers, and frees resources when switching workspaces.

---

## 11. Progressive Web App (PWA) & Offline Capabilities

### 11.1 Workbox Precaching Strategy

Configured in `vite.config.ts`:
```typescript
VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'hanziDB.csv', 'vocabDB.csv'],
  manifest: {
    name: 'Mandarin Graded Reader',
    short_name: 'MandarinReader',
    display: 'standalone',
    theme_color: '#667eea',
    background_color: '#f5f7fa',
    icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,csv}']
  }
})
```

### 11.2 Offline Capability Matrix

| Feature | Offline Functional? | Data / Processing Provider |
| :--- | :---: | :--- |
| **Story Generator** | **No** | Requires Google Gemini API |
| **Difficulty Scaling** | **No** | Requires Google Gemini API |
| **Story Continuation** | **No** | Requires Google Gemini API |
| **Sentence Grammar Analysis** | **No** | Requires Google Gemini API |
| **Contextual Chat Tutor** | **No** | Requires Google Gemini API |
| **Structured Lesson Synthesis** | **No** | Requires Google Gemini API |
| **Reading Saved Library Stories** | **Yes** | IndexedDB (`stories` store) |
| **Interactive Reader Tooltips** | **Yes** | Precached `hanziDB.csv` and `vocabDB.csv` |
| **Custom Text Importer** | **Yes** | Client-side `Intl.Segmenter` |
| **Hanzi Stroke Writing Practice** | **Yes** | Precached CDN assets & vector data |
| **SRS Flashcard Reviews** | **Yes** | IndexedDB (`flashcards` store) + local SM-2 |
| **Dictionary Autocomplete Search** | **Yes** | In-memory scoring algorithm |
| **Custom Dictionary Overrides** | **Yes** | IndexedDB (`overrides` store) |
| **Audio Narration (TTS)** | **Yes** | Host operating system speech synthesis engine |
| **Reading Activity Heatmap** | **Yes** | `localStorage: characters_read_heatmap` |
| **Visual Theming (Light/Dark)** | **Yes** | CSS variables + `localStorage: theme` |

---

## 12. System Extension & Evolution Playbooks

This section outlines exact implementation blueprints for developers extending or refactoring the application.

### Playbook A: Adding a New Interactive Lesson Exercise Type

To introduce a new exercise type (e.g. `tone_quiz`):

1.  **Extend TypeScript Types (`src/types/Lesson.ts`):**
    ```typescript
    export type ExerciseType = 'vocab_intro' | 'multiple_choice' | 'sentence_builder' | 'dialogue_reading' | 'tone_quiz';

    export interface ToneQuizPayload {
      character: string;
      syllableWithoutTone: string; // e.g. "ma"
      correctTone: 1 | 2 | 3 | 4 | 5;
      audioPrompt?: string;
    }
    ```
2.  **Update Gemini Lesson Prompt (`src/services/gemini.ts`):**
    Add the `tone_quiz` schema definition and instruct Gemini to include it in the `exercises` array.
3.  **Build Exercise Component (`src/components/exercises/ToneQuiz.tsx`):**
    ```typescript
    interface ToneQuizProps {
      payload: ToneQuizPayload;
      onComplete: () => void;
    }
    export const ToneQuiz: React.FC<ToneQuizProps> = ({ payload, onComplete }) => {
      // Implement tone selection buttons (1-4). On correct tone, invoke onComplete().
    };
    ```
4.  **Mount in Coordinator (`src/components/LessonEngine.tsx`):**
    Import `ToneQuiz` and add a case to the active exercise switch:
    ```typescript
    {activeExercise.type === 'tone_quiz' && (
      <ToneQuiz
        payload={activeExercise.payload as ToneQuizPayload}
        onComplete={handleExerciseComplete}
      />
    )}
    ```

---

### Playbook B: Adding a New Top-Level Navigation View / Tab

To add a new view (e.g. `vocab_explorer`):

1.  **Update Navigation State Union (`src/App.tsx`):**
    ```typescript
    const [activeTab, setActiveTab] = useState<'reader' | 'importer' | 'library' | 'review' | 'lessons' | 'vocab_explorer'>('reader');
    ```
2.  **Add Tab Switcher Button (`src/App.tsx`):**
    ```tsx
    <button
      onClick={() => setActiveTab('vocab_explorer')}
      className="control-button"
      style={{
        flex: 1,
        background: activeTab === 'vocab_explorer' ? 'var(--accent-gradient)' : 'var(--bg-card)',
        color: activeTab === 'vocab_explorer' ? 'white' : 'var(--text-main)'
      }}
    >
      📚 Vocabulary Explorer
    </button>
    ```
3.  **Render View Container (`src/App.tsx`):**
    ```tsx
    {activeTab === 'vocab_explorer' && (
      <div className="vocab-explorer-container">
        {/* Render Vocabulary List, Filters, and Export Tools */}
      </div>
    )}
    ```

---

### Playbook C: Switching or Multi-Providing LLM Backends

To support OpenAI (`gpt-4o-mini`), Anthropic Claude, or local Ollama:

1.  **Create Provider Interface (`src/services/llmProvider.ts`):**
    ```typescript
    export interface LLMProvider {
      generateStory(prompt: string, hskLevel: string): Promise<{ title: string; content: string }>;
      analyzeGrammar(sentence: string): Promise<string>;
      chatTutor(history: { sender: string; text: string }[], message: string, storyContext: string): Promise<string>;
      generateLesson(topic: string, hskLevel: string): Promise<Lesson>;
    }
    ```
2.  **Implement Gemini Provider (`src/services/providers/geminiProvider.ts`):**
    Wrap existing Gemini logic into the interface.
3.  **Implement Alternative Provider (e.g. `ollamaProvider.ts`):**
    Issue HTTP POST requests to `http://localhost:11434/api/generate` with `format: "json"`.
4.  **Add Provider Selector in Settings Modal:**
    Store `selected_llm_provider` in `localStorage` and instantiate the matching client.

---

### Playbook D: Migrating to HSK 3.0 or Expanding Corpora

The current database adheres to HSK 2.0 (Levels 1 to 6). To support the newer HSK 3.0 standard (Levels 1 to 9):

1.  **Update CSV Datasets:**
    *   Replace `public/hanziDB.csv` and `public/vocabDB.csv` with updated HSK 3.0 frequency and level indices.
    *   Update `src/assets/hanziDB.csv` and run `node copy-db.js`.
2.  **Extend Grammar Constraints Matrix (`src/App.tsx`):**
    Add keys `"7"`, `"8"`, and `"9"` to `HSK_GRAMMAR_CONSTRAINTS`.
3.  **Update Dropdowns:**
    Update HSK selector options in `App.tsx` (Reader, Lesson Generator, Importer) to include levels 1 through 9.

---

### Playbook E: Cloud Synchronization & User Authentication

To sync user data across devices:

1.  **Add Backend-as-a-Service Client (e.g. Supabase or Firebase):**
    Install `@supabase/supabase-js`.
2.  **Dual-Write Strategy:**
    *   Keep IndexedDB as the immediate, offline local cache.
    *   On mutations (`addCard`, `updateCard`, `saveStory`, `saveOverride`), push delta records to Supabase tables if an active session exists.
3.  **Sync on Login:**
    Query remote tables, merge records by timestamp (`timestamp > localTimestamp`), and hydrate IndexedDB stores.

---

## 13. Known Constraints, Edge Cases & Technical Debt

### 13.1 State Architecture (Monolithic Coordinator)
*   **Current State:** `src/App.tsx` contains ~1,800 lines of code coordinating ~35 distinct state variables, multiple modals, and tab views.
*   **Refactoring Opportunity:** Extract state slices into modular React Contexts or custom hooks:
    *   `useReaderState`: Active story, title, Pinyin toggles, continuation.
    *   `useSRSState`: Flashcards queue, card grading, SM-2 calculations.
    *   `useTTSState`: Speech synthesis, voices, speed, audio state.
    *   `useDictionaryState`: Hanzi and vocab datasets, overrides map, search results.

### 13.2 Dataset Memory Footprint
*   **Current State:** `hanziDB.csv` (~10,000 entries) and `vocabDB.csv` are fully loaded into in-memory JavaScript arrays (`HanziItem[]`).
*   **Performance:** Memory usage is ~8–12 MB, which modern mobile browsers handle effortlessly. However, expanding the dictionary to 100,000+ words should migrate lookups from in-memory arrays to IndexedDB indexes or SQLite via WebAssembly (OPFS).

### 13.3 API Key Security in Client-Side SPA
*   **Current State:** The user's Google Gemini API key is stored in plain text in browser `localStorage`.
*   **Security Context:** This is standard for client-only desktop/web utility apps without backends, but users should be advised to apply HTTP referer or quota restrictions in their Google Cloud console.

---

## 14. Complete File & Module Map

```
mandarin-graded-reader/
├── docs/                                  # Deep-Dive Modular Technical Knowledge Base
│   ├── ai-services.md                     # Gemini SDK protocols, prompt engineering & voice loops
│   ├── audio-tts.md                       # Azure Neural TTS, SSML compilation & pitch estimation
│   ├── data-storage.md                    # CSV schemas, IndexedDB stores, SM-2 math & state hydration
│   ├── features.md                        # Functional breakdown of all 36 platform capabilities
│   ├── lesson-engine.md                   # 4-stage Duolingo-style state machine & exercise payloads
│   ├── nlp-tokenization.md                # Intl.Segmenter, polyphones, grammar highlighter & TTR
│   ├── pwa-and-offline.md                 # Workbox precaching, manifest, offline status & sync
│   └── styling-and-design-system.md       # Mineral pigment tokens, vertical typography & print
├── public/                                # Static files served directly at root
│   ├── favicon.svg                        # Traditional Chinese brand seal (文)
│   ├── hanziDB.csv                        # Primary character dictionary (~10,000 rows)
│   ├── manifest.json                      # PWA web application manifest
│   ├── vite.svg                           # Vite build asset
│   └── vocabDB.csv                        # Compound vocabulary dictionary
├── src/
│   ├── assets/
│   │   ├── hanziDB.csv                    # Source character database
│   │   └── react.svg                      # React logo asset
│   ├── components/
│   │   ├── exercises/                     # Modular lesson exercise stage components
│   │   │   ├── DialogueReading.tsx        # Stage 4: Chat dialogue bubbles with line audio
│   │   │   ├── MultipleChoice.tsx         # Stage 2: 2x2 grid quiz with shake animation
│   │   │   ├── SentenceBuilder.tsx        # Stage 3: Scrambled word bank chip puzzle
│   │   │   └── VocabIntro.tsx             # Stage 1: Vocabulary flashcards with audio verification
│   │   ├── AudioFirstFlashcard.tsx        # Auditory-first active recall flashcard
│   │   ├── ConversationalVoiceAgent.tsx   # Push-to-talk spoken roleplay agent with Gemini LLM
│   │   ├── DiagnosticTestModal.tsx        # 50-question dynamic adaptive placement test
│   │   ├── ImportMediaWorkspace.tsx       # Dedicated media ingestion workspace (EPUB, OCR, Subtitles)
│   │   ├── LessonEngine.tsx               # Coordinator for 4-stage interactive lesson progression
│   │   ├── LessonWorkspace.tsx            # Dedicated lesson & curriculum workspace (HSK, SCQF, Diagnostic)
│   │   ├── MediaIngestionWorkspace.tsx    # EPUB reader, OCR document scanner & subtitle explorer
│   │   ├── OfflineStatusIndicator.tsx     # Real-time network state and sovereignty badge
│   │   ├── PronunciationStudio.tsx        # Coordinator for pitch curves, shadowing & voice agent
│   │   ├── RadicalDecomposition.tsx       # Kangxi radical component breakdown and etymology
│   │   ├── ReadingTheater.tsx             # Deep reading theater with vertical-rl & pacing highlights
│   │   ├── ReadingWorkspace.tsx           # Dedicated reading workspace (Generator, Theater, Library)
│   │   ├── ReviewWorkspace.tsx            # Dedicated SRS review dashboard (Flashcards, Heatmap, Speed)
│   │   ├── ShadowingStudio.tsx            # Sentence shadowing with dual back-to-back playback
│   │   ├── SpeakingWorkspace.tsx          # Dedicated speaking workspace (Tone Visualizer, Shadowing, Voice)
│   │   ├── SrsHeatmap.tsx                 # 28-day review activity heatmap in Bamboo green #7B8D62
│   │   ├── TocDrawer.tsx                  # Table of contents navigation drawer for literature
│   │   ├── ToneVisualizerCanvas.tsx       # Real-time HTML5 canvas tone curve visualizer (F0)
│   │   └── VideoSubtitleReader.tsx        # Interactive video subtitle player (.srt/.vtt)
│   ├── services/
│   │   ├── ankiExport.ts                  # Anki TSV flashcard deck exporter
│   │   ├── audioCache.ts                  # SHA-256 IndexedDB audio blob cache with LRU eviction
│   │   ├── audioChunker.ts                # Semantic sentence segmenter for long audio streaming
│   │   ├── audioPitchCache.ts             # IndexedDB cache for reference F0 pitch curves
│   │   ├── azureSpeech.ts                 # Azure Neural TTS client with SSML compilation
│   │   ├── cloudSync.ts                   # Snapshot export/import & CRDT sync protocol
│   │   ├── curriculum.ts                  # HSK 1-6 (HSK 3.0) & SCQF Level 6 framework standards
│   │   ├── dictionaryStore.ts             # IndexedDB manager for custom dictionary overrides
│   │   ├── epubParser.ts                  # Client-side EPUB parser via DecompressionStream
│   │   ├── gemini.ts                      # Gemini API service for structured lesson generation
│   │   ├── libraryStore.ts                # IndexedDB manager for saved story library records
│   │   ├── ocrService.ts                  # Local canvas OCR pipeline with contrast enhancement
│   │   ├── pitchTracker.ts                # Autocorrelation F0 pitch extraction & DTW tone scoring
│   │   ├── pronunciationAssessment.ts     # Phoneme and acoustic pronunciation scoring engine
│   │   ├── readingAnalytics.ts            # Characters Per Minute (CPM) reading speed tracker
│   │   ├── semanticSearch.ts              # Inverted index search engine for story library
│   │   ├── speechRecognition.ts           # Browser speech recognition wrapper
│   │   ├── srsStore.ts                    # IndexedDB manager for SM-2 spaced repetition cards
│   │   ├── stateHydration.ts              # Multi-device JSON backup, restore & merge engine
│   │   ├── subtitleParser.ts              # Subtitle track parser for .srt and .vtt files
│   │   └── themeEngine.ts                 # Mineral pigment theme manager (Rice Paper, Ink, etc.)
│   ├── types/
│   │   ├── hanzi-writer.d.ts              # Ambient TypeScript declarations for HanziWriter CDN
│   │   ├── HanziItem.ts                   # Type interface for dictionary items and word tokens
│   │   ├── Lesson.ts                      # Type interfaces for lesson schemas and exercise payloads
│   │   └── ToolTip.ts                     # Type interface for hover tooltip lexical details
│   ├── utils/
│   │   ├── grammarHighlighter.ts          # Functional HSK grammar pattern detection
│   │   ├── homophoneDetector.ts           # Polyphone (多音字) detector with contextual guidance
│   │   ├── iconMap.ts                     # Thematic category tag to Lucide icon resolver
│   │   ├── lexicalDensity.ts              # Type-Token Ratio (TTR) and HSK lexical distribution
│   │   ├── tokenizer.ts                   # Intl.Segmenter word segmentation & fallback cascade
│   │   └── vocabExtractor.ts              # Dynamic vocabulary extractor for unknown words
│   ├── App.css                            # Master design system, mineral pigments & vertical CSS
│   ├── App.tsx                            # Root master coordinator for 5 isolated workspaces
│   ├── HanziPracticeModal.tsx             # Guided drawing canvas modal wrapping HanziWriter
│   ├── main.tsx                           # React DOM root mounting entrypoint
│   └── vite-env.d.ts                      # Vite client environment types
├── copy-db.js                             # Node utility syncing src/assets/hanziDB.csv to public/
├── eslint.config.js                       # ESLint v9 configuration
├── index.html                             # Application HTML shell loading HanziWriter CDN script
├── NEXT_GEN_TRACKER.md                    # 36-feature verification and audit tracker
├── package.json                           # NPM dependencies, lifecycle scripts & overrides
├── README.md                              # Public introduction and repository documentation portal
├── SYSTEM_SPEC.md                         # This Document: Canonical System Specification
├── tsconfig.app.json                      # Application TypeScript compiler configuration
├── tsconfig.json                          # Root TypeScript compiler configuration
└── vite.config.ts                         # Vite configuration (React, PWA, Workbox)
```
