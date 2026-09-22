# Domain 5: Advanced AI & Input Methods (`AIM`)

**Backlog Domain Specification**  
**Target Subsystems:** `gemini.ts`, `HanziPracticeModal.tsx`, `azureSpeech.ts`, Canvas & IME Handlers  
**Status:** Canonical Specifications (Do NOT action until scheduled)

---

## Ticket: `AIM-001` — AI Grader for Free Writing & Composition

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Intermediate to Advanced learners practicing active output production.

### 1. Problem Statement & Impact
Reading and listening are receptive skills; true fluency requires productive output (writing and speaking). When learners write compositions or journal entries in Chinese, they lack immediate native feedback on unnatural phrasing, word order errors, and incorrect measure words.

### 2. Architectural Design & Affected Subsystems
* **AI Evaluation Engine (`src/services/aiGrader.ts`):**
  Accepts user text + target HSK level.
  Structured prompt to Gemini 2.5 Flash requiring JSON response:
  ```json
  {
    "overallScore": 88,
    "correctedText": "...",
    "grammarCorrections": [
      { "original": "我去在商店", "correction": "我去了商店", "rule": "Aspect particle 了 placement", "explanation": "..." }
    ],
    "lexicalSuggestions": [
      { "original": "很好", "alternative": "极佳", "hskLevel": 4, "benefit": "More expressive idiom" }
    ]
  }
  ```
* **UI Interface (`src/components/WritingCompositionWorkspace.tsx`):**
  Side-by-side editor with diff-highlighting of grammar errors, awkward expressions, and stylistic suggestions.

### 3. Acceptance Criteria
1. Provides line-by-line grammar feedback within 3 seconds.
2. Distinguishes between critical errors (grammatical violations) and stylistic improvements (more native collocations).

---

## Ticket: `AIM-002` — Handwriting Recognition Input (Drawing Hanzi)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 8 (Large)
* **Target Audience:** Learners searching for unknown characters they encounter in the physical world or scanned images.

### 1. Problem Statement & Impact
When learners encounter an unfamiliar Chinese character on a restaurant menu, street sign, or packaging, they cannot type it into a search bar because they do not know its Pinyin. Drawing the character with a mouse, trackpad, or finger is the only natural lookup mechanism.

### 2. Architectural Design & Affected Subsystems
* **Drawing Canvas (`src/components/HandwritingCanvas.tsx`):**
  HTML5 Canvas tracking pointer coordinates, stroke trajectories, and stroke count.
* **Recognition Pipeline:**
  * Client-Side: Integrate open-source Hanzi stroke direction engine (e.g. `hanzi-lookup-js` or lightweight neural stroke model).
  * Returns top 8 ranked candidate characters in real time as the user draws strokes.
* **Integration:** Embedded as a popover button right inside the main dictionary search bar: `[ ✍️ Draw Hanzi ]`.

### 3. Acceptance Criteria
1. Recognizes characters accurately even with minor stroke order deviations.
2. Clicking a candidate character immediately executes the dictionary lookup.

---

## Ticket: `AIM-003` — Pinyin Typing Practice & IME Drills

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners entering the digital modern Chinese workplace.

### 1. Problem Statement & Impact
In the modern world, 99% of written Chinese communication occurs via standard computer keyboards using Pinyin Input Method Editors (IMEs). Novices frequently struggle with candidate selection, syllable segmentation (e.g. `xian` vs `xi'an`), and typing speed.

### 2. Architectural Design & Affected Subsystems
* **Typing Game Engine (`src/components/PinyinTypingDrill.tsx`):**
  Displays target Chinese phrases moving down a terminal-style track.
  * User types pure toneless Pinyin on their standard QWERTY keyboard.
  * Real-time candidate selection simulation (numbers 1–5).
  * Tracks Words Per Minute (WPM) and candidate selection accuracy.
* **Corpus Sourced from Story Reading:** Drills can use sentences directly from the user's active reading library.

### 3. Acceptance Criteria
1. Accurately simulates Pinyin IME behavior and candidate ranking.
2. Measures typing speed (CPM) and accuracy with detailed post-drill metrics.

---

## Ticket: `AIM-004` — Vocabulary Difficulty Slider (Real-Time Simplifier)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Readers experiencing cognitive fatigue or tackling difficult native texts.

### 1. Problem Statement & Impact
While Moyun supports "Simplify" and "Harder" buttons via full LLM regeneration, users want a smooth, real-time slider that instantly substitutes difficult synonyms for basic ones (e.g. `莅临` -> `来`, `迅速` -> `很快`) without regenerating the entire story text.

### 2. Architectural Design & Affected Subsystems
* **Synonym Ladder Matrix (`src/data/synonymLadders.ts`):**
  Hierarchical clusters of equivalent terms mapped by HSK levels (HSK 1 through HSK 6).
* **Slider Control in Reading Toolbar:**
  `Difficulty Level: [ HSK 1 ---|--- HSK 6 ]`.
* **In-Place DOM Swapping:** Dynamically swaps tokens with their lower/higher level synonym counterparts, updating Pinyin rubies and audio timestamps instantaneously with zero server latency.

### 3. Acceptance Criteria
1. Moves text difficulty up and down along a slider without losing paragraph structure.
2. Preserves the underlying grammatical meaning of the passage.

---

## Ticket: `AIM-005` — Text-to-Image Generation for Stories

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 5 (Medium)
* **Target Audience:** Visual learners and story immersion enthusiasts.

### 1. Problem Statement & Impact
Reading pure text for long periods can become dry. Generating authentic, style-consistent illustrations (Chinese ink wash painting or editorial storybook style) for each generated story enhances comprehension and emotional connection.

### 2. Architectural Design & Affected Subsystems
* **Prompt Construction:**
  Extract key visual scene descriptors from the generated Chinese text:
  `"Chinese traditional watercolor ink painting depicting: [Scene prompt], elegant muted tones, editorial aesthetic"`.
* **Image Synthesis Pipeline:**
  Call image generation endpoint asynchronously in background when generating a story.
* **Display Layout:**
  Render a tasteful editorial header illustration above the story title in `ReadingTheater.tsx`.

### 3. Acceptance Criteria
1. Synthesizes a high-quality visual scene matching the story topic.
2. Adheres to Moyun's anti-slop, traditional print-inspired visual aesthetic (ink wash / muted watercolor).

---

## Ticket: `AIM-006` — Grammar Pattern Directory with Personal Corpus

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Grammar explorers and intermediate learners seeking structural clarity.

### 1. Problem Statement & Impact
Learners often want to look up a grammar rule (e.g. "How does `把` work?" or "What is the difference between `因为` and `由于`?") and see real-world examples taken from stories they have personally read, rather than abstract textbook examples.

### 2. Architectural Design & Affected Subsystems
* **Grammar Index View (`src/components/GrammarDirectoryWorkspace.tsx`):**
  Searchable encyclopedia of all 150+ HSK 1–6 grammar patterns.
* **Personal Corpus Aggregator:**
  Scans all stories saved in the user's offline IndexedDB library and extracts exact sentences where that grammar pattern occurred in their own reading history.
* **Filter by HSK:** Filter grammar points by HSK 1, 2, 3, 4, 5, 6.

### 3. Acceptance Criteria
1. Fast search across grammar patterns by name, Pinyin, or English function.
2. Displays formula, structural breakdown, and sentences dynamically mined from the user's library.

---

## Ticket: `AIM-007` — Automated Dynamic HSK Placement Test

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Onboarding learners calibrating their starting curriculum.

### 1. Problem Statement & Impact
Learners arriving at Moyun have varied backgrounds (former university students, heritage speakers, self-taught). Guessing their level leads to either boredom or frustration. A dynamic Computerized Adaptive Testing (CAT) assessment determines their true level in under 5 minutes.

### 2. Architectural Design & Affected Subsystems
* **Adaptive Testing Subsystem (`src/components/DiagnosticTestModal.tsx`):**
  Enhance existing diagnostic assessment engine:
  * Starts at HSK 3 (midpoint).
  * Correct answer escalates question difficulty; incorrect answer descends.
  * Assesses both vocabulary breadth (lexical recognition) and syntax parsing.
  * Terminates after convergence (typically 20–30 questions).
* **Curriculum Calibration:** Automatically configures user's target HSK level and adaptive Pinyin thresholds upon completion.

### 3. Acceptance Criteria
1. Accurately identifies learner level from HSK 1 to HSK 6.
2. Calibrates user's default story generator, flashcard deck, and grammar filters with 1 click.

---

## Ticket: `AIM-008` — Subtitles Export (.srt / .vtt)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 2 (Small)
* **Target Audience:** Content creators, language teachers, and video producers.

### 1. Problem Statement & Impact
Stories generated or read in Moyun with neural TTS audio have precise sentence timing. Allowing users to export synchronized subtitle files (`.srt` or `.vtt`) enables pairing with external video editing tools, language podcasts, or digital flashcard suites.

### 2. Architectural Design & Affected Subsystems
* **Exporter Utility (`src/utils/subtitleExporter.ts`):**
  Iterates over sentence array with calculated or recorded audio timestamps:
  ```
  1
  00:00:01,200 --> 00:00:04,500
  服务员问我：“你要喝什么？”
  The waiter asked me: "What would you like to drink?"
  ```
* **Format Options:** Export with Chinese only, Pinyin + Chinese, or Dual Chinese/English subtitles.

### 3. Acceptance Criteria
1. Generates valid standard `.srt` and `.vtt` files formatted according to subtitle specifications.
2. Synchronizes accurately with recorded/synthesized audio file.

---

## Ticket: `AIM-009` — Offline Audio Pre-caching (Neural Audio Packs)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 8 (Large)
* **Target Audience:** Subway commuters, international travelers, and offline power users.

### 1. Problem Statement & Impact
While Moyun's dictionary databases are 100% offline, high-fidelity Azure Neural or Cloud Natural voice synthesis requires an internet connection when reading new texts. Pre-caching high-fidelity audio packages for entire saved stories or vocabulary decks enables studio-grade audio on flights or underground subways.

### 2. Architectural Design & Affected Subsystems
* **Cache Storage Service (`src/services/audioPrecacheEngine.ts`):**
  Uses browser `CacheStorage` and IndexedDB to batch-generate and download audio clips for every sentence in a story while on Wi-Fi.
* **Service Worker Bridge:** Intercepts audio playback requests and serves cached audio blobs instantly when network is offline.
* **Storage Dashboard:** In Settings, display audio cache storage footprint (e.g. *"Stored 42 stories (18.4 MB) offline"*) with 1-click cleanup.

### 3. Acceptance Criteria
1. 1-click "Download Story Audio for Offline Use".
2. Enables seamless, high-fidelity neural audio playback in complete airplane mode.

---

## Ticket: `AIM-010` — Integrated Stroke Order Numbered Typography

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners developing handwriting muscle memory while reading.

### 1. Problem Statement & Impact
Most reading practice only reinforces character recognition, doing nothing to teach stroke order. Integrating specialized stroke-order font typography that overlays small sequence numbers directly onto character strokes allows learners to passively absorb correct stroke order while reading stories.

### 2. Architectural Design & Affected Subsystems
* **Typography Pipeline:**
  Include open-source stroke-order font (e.g. `CJK Stroke Order` or SVG stroke path renderer via `hanzi-writer` data).
* **Toggle in Reading Toolbar:**
  Add view option: `Stroke Numbers Overlay`.
* **Rendering:** When active, characters in reading mode render with delicate numbered stroke paths without breaking ruby alignment or line pacing.

### 3. Acceptance Criteria
1. Displays numbered stroke paths inside character glyphs.
2. Does not disrupt line height, vertical reading, or Pinyin placement.
