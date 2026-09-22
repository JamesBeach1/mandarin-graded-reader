# Domain 3: Spaced Repetition (SRS) & Vocabulary (`SRS`)

**Backlog Domain Specification**  
**Target Subsystems:** `srsStore.ts`, `ReviewWorkspace.tsx`, Flashcard UI, Lexical Dictionaries, Import/Export Bridges  
**Status:** Canonical Specifications (Do NOT action until scheduled)

---

## Ticket: `SRS-001` — Sentence-Level SRS Flashcards

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** All learners moving beyond isolated rote character memorization.

### 1. Problem Statement & Impact
Memorizing words in isolation fails to teach collocations, measure words, or natural sentence rhythm. Testing entire sentences with target words highlighted anchors the vocabulary in realistic narrative context and builds grammatical muscle memory.

### 2. Architectural Design & Affected Subsystems
* **Database Schema Extension (`src/services/srsStore.ts`):**
  Extend `Flashcard` interface:
  ```typescript
  interface Flashcard {
    id?: number;
    character: string;
    pinyin: string;
    definition: string;
    hsk_level?: string;
    exampleSentence?: string;
    examplePinyin?: string;
    exampleTranslation?: string;
    targetWordOffset?: [number, number];
    // ... SM-2 fields
  }
  ```
* **Card Creation Bridge (`src/components/ReadingTheater.tsx`):**
  When adding a character from reading, automatically attach the enclosing sentence, its Pinyin, and English translation to the card record.
* **Review UI (`src/components/ReviewWorkspace.tsx`):**
  Card front displays the full Chinese sentence with the target word blanked out or underlined; card back reveals Pinyin, word definition, full sentence translation, and native audio playback.

### 3. Acceptance Criteria
1. Adding a character from any story automatically binds its narrative sentence.
2. Review mode allows toggling between "Word Focus" and "Full Sentence Context".
3. Native sentence audio plays upon card flip.

---

## Ticket: `SRS-002` — Grammar Pattern SRS (Cloze Syntax Cards)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Students preparing for HSK examinations and mastering connective syntax.

### 1. Problem Statement & Impact
Spaced repetition is traditionally restricted to vocabulary. However, grammatical structures (e.g. `不但...而且...`, `虽然...但是...`, `把` disposal, `被` passives) suffer from memory decay just as rapidly as vocabulary. Cloze-testing paired grammatical particles reinforces syntax.

### 2. Architectural Design & Affected Subsystems
* **Card Schema Expansion:** Add `cardType: 'vocabulary' | 'grammar_cloze'`.
* **Generator Pipeline (`src/utils/grammarHighlighter.ts`):**
  When a user reviews a story, offer a 1-click button: *"Add Identified Grammar Patterns to Review Deck"*.
* **Review Mechanics:** Front of card shows: `"我 [____] 喜欢喝茶，[____] 喜欢喝咖啡。(Not only... but also...)"`. User must mentally or verbally supply `不但` and `而且`.

### 3. Acceptance Criteria
1. Allows users to save grammar patterns directly to the spaced repetition schedule.
2. Clozes the paired grammatical markers while keeping the sentence context intact.
3. Grades interval progression using standard SM-2 logic.

---

## Ticket: `SRS-003` — Visual Flashcard Generation (AI Imagery)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 8 (Large)
* **Target Audience:** Visual learners and abstract vocabulary retention.

### 1. Problem Statement & Impact
Dual-coding theory demonstrates that pairing verbal information with distinct visual imagery substantially elevates long-term recall rates. Providing an automated AI illustration for every flashcard turns abstract definitions into memorable mental pictures.

### 2. Architectural Design & Affected Subsystems
* **Image Generation Service (`src/services/imageSynthesis.ts`):**
  Integrate Pollinations AI (free zero-backend REST) or Google Imagen API via user's Gemini key:
  `generateCardImage(prompt: string): Promise<string>` returning a base64 or cached Object URL.
* **Storage Optimization:** Cache generated image blobs in IndexedDB (`flashcard_images` object store) to prevent repeated network calls and preserve offline functionality.
* **UI Integration:** Render the synthesized image prominently on the flashcard back.

### 3. Acceptance Criteria
1. Users can click "Generate Visual Memory Aid" on any card.
2. Images are stored offline in IndexedDB and load instantaneously during reviews.
3. Includes an image regenerator / prompt editor for fine-tuning.

---

## Ticket: `SRS-004` — Custom Vocabulary Playlists & Thematic Decks

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Professionals, university students, and travelers with domain-specific goals.

### 1. Problem Statement & Impact
Learners currently possess only a single monolithic review deck. When studying for a specific goal (e.g. a business trip to Shenzhen, dining vocabulary, or a medical consultation), mixing unrelated general words dilutes focus. Thematic sub-decks enable situational preparation.

### 2. Architectural Design & Affected Subsystems
* **Deck Management (`src/services/srsStore.ts`):**
  Add `deckId: string` and `deckName: string` to `Flashcard`.
  Add deck management CRUD: `createDeck(name)`, `getDecks()`, `moveCards(cardIds, targetDeckId)`.
* **Preset Decks:** Ship built-in offline starter decks:
  * *Restaurant & Dining* (100 items)
  * *Business & Negotiations* (150 items)
  * *Travel & Transport* (120 items)
  * *Digital Life & Tech* (100 items)
* **Review Selector:** ReviewWorkspace lets users filter review sessions by specific deck or review all cards together.

### 3. Acceptance Criteria
1. Users can create, rename, and delete custom decks.
2. Supports selecting single or multiple decks for targeted review sessions.
3. Mastered card counts and due card badges update per deck.

---

## Ticket: `SRS-005` — Look-Alike (Visually Similar Hanzi) Quizzes

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Beginners and intermediate readers plagued by character visual confusion.

### 1. Problem Statement & Impact
Mandarin contains hundreds of confusingly similar character pairs that differ by only a single stroke:
* `己 jǐ` vs `已 yǐ` vs `巳 sì`
* `土 tǔ` vs `士 shì`
* `未 wèi` vs `末 mò`
* `天 tiān` vs `夭 yāo`
* `见 jiàn` vs `贝 bèi`
Unlocking discrimination drills trains orthographic precision.

### 2. Architectural Design & Affected Subsystems
* **Confusion Matrix Data (`src/data/confusableHanzi.ts`):**
  Catalog of 150+ known orthographic confusion clusters with semantic breakdowns and stroke differences highlighted.
* **Quiz Engine (`src/components/LookAlikeQuiz.tsx`):**
  Presents a sentence with a blank: `"我 [___] 经吃过饭了。"` -> User chooses between `己` and `已`.
* **Visual Diff Overlay:** Renders stroke differences highlighted in red/gold SVG paths.

### 3. Acceptance Criteria
1. Features interactive fill-in-the-blank drills using real contextual sentences.
2. Highlights the exact micro-stroke variation that distinguishes the confusable pair.

---

## Ticket: `SRS-006` — Etymology and Radical Mnemonics

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners struggling with abstract, arbitrary character shapes.

### 1. Problem Statement & Impact
Characters appear to be random collections of strokes unless broken down into semantic and phonetic building blocks. Providing historical etymological explanations (Oracle Bone script evolution) and vivid mnemonics makes complex characters unforgettable.

### 2. Architectural Design & Affected Subsystems
* **Database Enhancement (`public/hanziDB.csv`):**
  Add columns: `etymology_type` (Pictographic, Ideographic, Phono-semantic), `mnemonic_story`, and `oracle_bone_svg_path`.
* **Tooltip & Modal Component (`src/components/RadicalDecomposition.tsx`):**
  Render an "Origins & Mnemonic" tab inside the character inspection popup detailing:
  * Why the radical gives the meaning (e.g. `氵` water in `海` sea).
  * Why the phonetic component gives the sound (e.g. `每 měi` in `海 hǎi`).
  * A memorable narrative hook.

### 3. Acceptance Criteria
1. Displays decomposed radicals with individual definitions and stroke contributions.
2. Distinguishes between semantic radicals and phonetic components.

---

## Ticket: `SRS-007` — Automated Cloze Tests in Story Reading

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 3 (Small)
* **Target Audience:** Active readers testing contextual comprehension while reading.

### 1. Problem Statement & Impact
Passive reading often tricks learners into thinking they know words that they can merely recognize in passing. The Automated Cloze mode automatically converts story characters due for SRS review into interactive blank spaces directly inside the story narrative.

### 2. Architectural Design & Affected Subsystems
* **Reading Engine (`src/components/ReadingTheater.tsx`):**
  Add a toolbar toggle: `Cloze Review Mode`.
* **Replacement Logic:**
  Tokens matching user's due flashcard characters are replaced with `[ ? ]` input blocks or multiple-choice dropdowns.
* **Immediate Grade Submission:** Correctly identifying the cloze word automatically updates the card's SM-2 interval in IndexedDB as a review event.

### 3. Acceptance Criteria
1. Automatically detects due cards present in the currently loaded story text.
2. Seamlessly blurs or blanks out the target words without breaking text layout.
3. Submits review grades directly to the SRS database upon correct answer.

---

## Ticket: `SRS-008` — Export to Anki (.apkg) & Pleco (.txt)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 3 (Small)
* **Target Audience:** Power users with established workflows in external mobile apps.

### 1. Problem Statement & Impact
Learners strongly resist platforms that create data silos. Providing zero-friction export to Anki (the global gold standard for spaced repetition) and Pleco (the premier Chinese mobile dictionary) gives users complete sovereignty over their learning data.

### 2. Architectural Design & Affected Subsystems
* **Export Utilities (`src/services/deckExporters.ts`):**
  * **Pleco Format:** Export tab-delimited UTF-8 file formatted as: `Character\tPinyin\tDefinition` with optional category tags.
  * **Anki Format:** Generate standard TSV/CSV format with front/back templates, or package directly as `.apkg` via client-side `sql.js` + `jszip`.
* **Trigger:** Available in `ReviewWorkspace.tsx` and Settings modal.

### 3. Acceptance Criteria
1. 1-click export of the user's entire flashcard deck or filtered by HSK level.
2. Exported Pleco file imports cleanly into Pleco Flashcards without character encoding issues.
3. Anki export preserves Pinyin, definitions, HSK tags, and example sentences.

---

## Ticket: `SRS-009` — Homophone Warning Tooltips

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 2 (Small)
* **Target Audience:** Learners confused by identical pronunciations in listening and reading.

### 1. Problem Statement & Impact
Mandarin has an exceptionally small syllable inventory (~400 syllables or ~1,200 with tones), leading to hundreds of homophones (e.g. `shì`: 是, 事, 市, 室, 试, 视, 适...). Alerting learners to high-frequency homophones prevents conflating distinct words.

### 2. Architectural Design & Affected Subsystems
* **Detection Engine (`src/utils/homophoneDetector.ts`):**
  Leverage existing `homophoneDetector.ts` to query characters sharing identical toneless or toned Pinyin.
* **Tooltip Extension (`src/App.tsx`):**
  Under the character definition, display a subtle warning badge: *"⚠️ 5 common homophones with the exact same tone: 视, 市, 室, 试..."*.

### 3. Acceptance Criteria
1. Accurately groups characters by exact tone and pronunciation.
2. Renders high-frequency confusable counterparts without cluttering the primary definition.

---

## Ticket: `SRS-010` — User-Tweakable SRS Intervals (SM-2 Customizer)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 2 (Small)
* **Target Audience:** Advanced learners optimizing review loads and decay intervals.

### 1. Problem Statement & Impact
The standard SuperMemo SM-2 algorithm uses fixed defaults: initial intervals of 1 and 6 days, and minimum ease factor 1.3. Users with exceptional recall find 6 days too soon, while casual learners find it too aggressive. Permitting custom multiplier tweaks personalizes the review curve.

### 2. Architectural Design & Affected Subsystems
* **Configuration Store (`src/services/srsStore.ts`):**
  Store settings in `localStorage: srs_algorithm_parameters`:
  ```typescript
  interface SrsConfig {
    initialInterval1: number; // default: 1 day
    initialInterval2: number; // default: 6 days
    easyBonusMultiplier: number; // default: 1.3
    maximumIntervalDays: number; // default: 365 days
  }
  ```
* **Settings Modal UI:**
  Sliders in Settings allowing users to customize initial graduation steps and interval multipliers.

### 3. Acceptance Criteria
1. SM-2 calculation respects user-configured interval multipliers.
2. Includes a "Reset to Standard SM-2 Defaults" button.
