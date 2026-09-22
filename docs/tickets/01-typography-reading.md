# Domain 1: Typography, Reading & Comprehension (`TRC`)

**Backlog Domain Specification**  
**Target Subsystems:** `ReadingTheater.tsx`, `tokenizer.ts`, `HanziChip.tsx`, Tooltips, CSS Design System  
**Status:** Canonical Specifications (Do NOT action until scheduled)

---

## Ticket: `TRC-001` — Traditional Character Toggle (繁体字转换)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 3 (Small)
* **Target Audience:** Learners studying in Taiwan, Hong Kong, or reading classical literature.

### 1. Problem Statement & Impact
Currently, Moyun exclusively displays Simplified Chinese (简体字) characters parsed from `hanziDB.csv` and `vocabDB.csv`. Learners residing in Taiwan, Hong Kong, or diaspora communities who read Traditional characters (繁體字) cannot utilize the reader without external conversion tools. Providing an instant bidirectional toggle enables zero-friction cross-curriculum reading.

### 2. Architectural Design & Affected Subsystems
* **Data Layer:** Integrate a zero-backend, client-side conversion table (e.g. OpenCC lightweight JSON dictionary or unidirectional 1:1 map ~3,000 frequent character mappings).
* **Tokenizer Pipeline (`src/utils/tokenizer.ts`):** Maintain underlying token identity while adding a `traditional?: string` property to `HanziItem`.
* **UI Controls (`src/components/ReadingTheater.tsx`):** Add a toggle icon button in the reading toolbar (`简 / 繁`).
* **Storage:** Persist preference in `localStorage: preferred_chinese_script ('simplified' | 'traditional')`.

### 3. Acceptance Criteria
1. Toggling `简/繁` updates the entire displayed story text and vocabulary inspection tooltips immediately without re-fetching CSV databases.
2. Pinyin and audio synthesis remain unchanged and perfectly synchronized regardless of script mode.
3. Dictionary search accommodates both Simplified and Traditional input queries.

---

## Ticket: `TRC-002` — Zhuyin (Bopomofo 注音符号) Phonetic Support

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners targeting Taiwanese Mandarin and children's literature.

### 1. Problem Statement & Impact
Pinyin uses Latin letters, often causing native English speakers to subconsciously carry over English phonetic rules (e.g. pronouncing "c" as /k/ or "e" as /i/). Zhuyin Fuhao (注音符号) uses dedicated non-Latin phonetic symbols (ㄅㄆㄇㄈ), completely eliminating orthographic interference from the Roman alphabet.

### 2. Architectural Design & Affected Subsystems
* **Phonetic Converter Utility (`src/utils/pinyinToZhuyin.ts`):** Deterministic converter taking tone-marked Pinyin syllables (e.g. `zhōng`, `guó`, `hǎo`) and outputting standard Zhuyin glyphs with tone markers (e.g. `ㄓㄨㄥ`, `ㄍㄨㄛˊ`, `ㄏㄠˇ`).
* **Ruby Text Styling (`src/App.css`):** Add vertical right-aligned ruby layout for traditional vertical column reading, or top ruby for horizontal reading.
* **Settings Modal:** Add "Phonetic Notation" selection: `Hanyu Pinyin` | `Zhuyin (Bopomofo)`.

### 3. Acceptance Criteria
1. Switching to Zhuyin replaces all Pinyin rubies with accurate Bopomofo symbols across horizontal and vertical reading modes.
2. Neutral tone (light dot) and tones 2, 3, 4 are accurately positioned.
3. Audio pacing and sentence sync operate identically.

---

## Ticket: `TRC-003` — Tone Color Coding (Visual Memory Tones)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 2 (Small)
* **Target Audience:** Visual learners and tonal beginner/intermediate students.

### 1. Problem Statement & Impact
Tones are one of the steepest initial hurdles for non-tonal language speakers. Color-coding tones (e.g., Tone 1 = Red, Tone 2 = Orange/Green, Tone 3 = Green/Blue, Tone 4 = Blue/Purple, Neutral = Gray) leverages involuntary visual memory to anchor pitch contours to characters.

### 2. Architectural Design & Affected Subsystems
* **Color Palette Tokens (`src/App.css`):** Define subtle, editorial dark-friendly tone colors:
  * `--tone-1: #E06C75` (Flat High)
  * `--tone-2: #98C379` (Rising)
  * `--tone-3: #E5C07B` (Dipping)
  * `--tone-4: #61AFEF` (Falling)
  * `--tone-5: var(--text-muted)` (Neutral)
* **Component Level (`src/components/ReadingTheater.tsx`):**
  Extract tone number from Pinyin diacritics via regex (`1-5`). Apply color to either the Pinyin text or the Hanzi character depending on the user preference.
* **Settings Control:** Toggle for `Tone Colors: Off | Pinyin Only | Hanzi & Pinyin`.

### 3. Acceptance Criteria
1. Characters or Pinyin syllables dynamically reflect their tone color without causing visual fatigue.
2. Tone colors maintain WCAG AA contrast against both Editorial Dark (`#121212`) and Paper Light (`#F5F4F0`) themes.
3. Polyphonic characters default to their contextual reading tone.

---

## Ticket: `TRC-004` — Adaptive Pinyin Fading

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Intermediate learners breaking free of "Pinyin crutch" syndrome.

### 1. Problem Statement & Impact
Learners frequently become reliant on Pinyin rubies even when they already know a character, hindering direct Hanzi ideographic recognition. Rather than an all-or-nothing toggle, adaptive fading gradually suppresses Pinyin based on the learner's actual review history in the SRS database.

### 2. Architectural Design & Affected Subsystems
* **State Bridge (`src/services/srsStore.ts`):** Expose query `getMasteredCharacters(): Promise<Set<string>>` where card interval > 21 days or review streak >= 4.
* **Reading Engine (`src/components/ReadingTheater.tsx`):** Check if `token.character` exists in the mastered set. If mastered, reduce ruby opacity to `0%` (or `20%` ghost opacity on hover).
* **UI Indicator:** Mastered characters display a tiny dot or clean visual state indicating "Mastered (Pinyin Hidden)".

### 3. Acceptance Criteria
1. Known vocabulary automatically has Pinyin hidden without manual level switching.
2. Hovering or clicking the character reveals the pinyin immediately as a safety net.
3. The option is configurable in toolbar: `Show All` | `HSK Level Suppression` | `Adaptive SRS Mastered`.

---

## Ticket: `TRC-005` — Idiom (Chengyu 成语) Deep-Dive Tooltips

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Intermediate to Advanced learners (HSK 4–6).

### 1. Problem Statement & Impact
Four-character idioms (成语) carry profound cultural and historical allegories that cannot be deduced from literal word-for-word translation. Beginners and intermediates often struggle to identify where an idiom begins and ends.

### 2. Architectural Design & Affected Subsystems
* **Database Extension (`public/chengyuDB.json`):** Curated database of ~1,200 common idioms with literal translation, figurative meaning, allusion story (典故), and HSK level.
* **Tokenizer Extension (`src/utils/tokenizer.ts`):** Prioritize greedy 4-gram matching for entries in `chengyuDB`.
* **Tooltip Enhancement (`src/App.tsx`):** Tooltip modal detects `isChengyu: true` and renders a dedicated "Allusion & Story" collapsible tab explaining historical context (e.g. `守株待兔`, `画蛇添足`).

### 3. Acceptance Criteria
1. Four-character idioms are tokenized as a single unified cohesive compound rather than 4 isolated characters.
2. Tooltip exhibits a distinct badge (`成语 Chengyu`) and displays literal breakdown vs metaphorical meaning.

---

## Ticket: `TRC-006` — Sentence Syntax Tree Visualizer

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 8 (Large)
* **Target Audience:** Analytical and grammar-oriented learners.

### 1. Problem Statement & Impact
Chinese grammar relies heavily on word order (Topic-Comment, Time-When before Verb, Prepositional covers, Resultative Complements). Novices frequently get confused by nested relative clauses with `的`. A visual syntax tree breaks down sentence hierarchy into clean diagrams.

### 2. Architectural Design & Affected Subsystems
* **NLP Dependency Parsing Service (`src/services/syntaxParser.ts`):** Lightweight client-side dependency parser or Gemini API prompt returning structured JSON: `{ role: 'Subject' | 'Predicate' | 'Object' | 'Adverbial' | 'Complement', tokens: [] }`.
* **Visual Component (`src/components/SyntaxTreeCanvas.tsx`):** Interactive SVG node diagram highlighting syntactic components in color-coded blocks.
* **Trigger:** Click sentence translation box -> "View Syntax Tree".

### 3. Acceptance Criteria
1. Clicking "Syntax Tree" on any sentence generates an interactive hierarchical block diagram.
2. Identifies subject, main verb, aspect particles, and relative modifier clauses.
3. Renders cleanly within the existing modal system.

---

## Ticket: `TRC-007` — Character Frequency Overlays (Top 500 Hanzi)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 3 (Small)
* **Target Audience:** Beginners prioritizing highest-yield vocabulary.

### 1. Problem Statement & Impact
When learners import arbitrary native texts (news articles, books), they face hundreds of unfamiliar characters. Identifying which characters belong to the top 500 highest-frequency words prevents wasting time memorizing rare or archaic characters.

### 2. Architectural Design & Affected Subsystems
* **Data Layer:** Add `frequency_rank` check from `hanziDB.csv`.
* **Toolbar Control:** Add toggle `Highlight High-Yield (Top 500)`.
* **Styling (`src/App.css`):** Top 500 characters display a subtle under-dot or gentle background tint.
* **Analytics Bar:** Displays coverage percentage: e.g. *"84% of this text consists of Top 500 characters."*

### 3. Acceptance Criteria
1. Highlights characters with frequency rank <= 500 in one visual pass.
2. Calculates and displays real-time corpus coverage metrics for any imported text.

---

## Ticket: `TRC-008` — Browser Extension Companion

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 13 (Large)
* **Target Audience:** All learners reading native Chinese content across the web.

### 1. Problem Statement & Impact
Requiring learners to copy-paste articles into Moyun creates high friction. A dedicated browser extension (Chrome/Edge/Firefox) injects Moyun's tokenization, dictionary lookups, and TTS engine directly into any live Chinese website.

### 2. Architectural Design & Affected Subsystems
* **Extension Package (`extension/`):** Manifest V3 background worker and content script.
* **Shared Engine:** Package Moyun's `tokenizer.ts`, `hanziDB.csv`, and `azureSpeech.ts` as an ES module runnable in content scripts.
* **Hover Card:** Lightweight floating tooltip mirroring Moyun's editorial design tokens with "Add to Moyun SRS Deck" bridge via `chrome.storage.sync`.

### 3. Acceptance Criteria
1. Operates on any Chinese webpage with instant hover lookups.
2. Characters added to flashcards sync directly back to Moyun IndexedDB storage.

---

## Ticket: `TRC-009` — Cultural Context AI Notes

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Intermediate to Advanced learners striving for cultural fluency.

### 1. Problem Statement & Impact
Language is inseparable from culture. Phrases related to gift giving, dining etiquette (e.g. paying the bill, fish head orientation), numerology (4 vs 8), and kinship titles have nuances that standard dictionary definitions fail to convey.

### 2. Architectural Design & Affected Subsystems
* **AI Service (`src/services/gemini.ts`):** Method `fetchCulturalContext(sentence: string, context: string, apiKey: string)`.
* **UI Integration:** Tooltip or sentence translation reveal includes a "Cultural Nuance" spark icon if cultural markers are detected.

### 3. Acceptance Criteria
1. Automatically flags cultural idioms or traditions in AI stories or imported literature.
2. Explains the pragmatic and social etiquette meaning behind the wording.

---

## Ticket: `TRC-010` — Contextual Translation Toggle (Paragraph by Paragraph)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 3 (Small)
* **Target Audience:** Extensive readers who want occasional validation without spoilers.

### 1. Problem Statement & Impact
Translating an entire article at once ruins active comprehension, while translating sentence-by-sentence disrupts narrative flow. A paragraph-level toggle provides the ideal balance for extensive reading.

### 2. Architectural Design & Affected Subsystems
* **Component Level (`src/components/ReadingTheater.tsx`):**
  Group sentences by paragraph boundaries (`\n\n`). Add a discreet translation toggle at the end of each paragraph: `[Show English Translation]`.
* **State Management:** Record revealed paragraphs in component state `revealedParagraphs: Set<number>`.

### 3. Acceptance Criteria
1. Each paragraph possesses an independent reveal toggle.
2. Prevents spoiling upcoming plot twists or answers in comprehension passages.
