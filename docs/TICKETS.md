# Moyun (墨韵) — Centralized Issue & Ticket Registry

**Document Status:** Canonical Single Source of Truth for Issues & Feature Specifications  
**Last Updated:** 2026-09-21  
**Repository:** `mandarin-graded-reader`  
**Total Managed Tickets:** 63 (49 Completed, 14 Backlog)

---

## 1. Issue Management Dashboard

### Status Summary
| Status | Indicator | Count | Percentage | Definition |
|---|:---:|:---:|:---:|---|
| **Completed** | 🟢 | 49 | 77.8% | Verified and shipped in active codebase. |
| **In Progress** | 🟡 | 0 | 0.0% | Actively being engineered in the current sprint. |
| **Backlog** | ⚪ | 14 | 22.2% | Fully specified; pending prioritization and grooming. |
| **Blocked / Deferred** | 🔴 | 0 | 0.0% | External dependencies or architectural blockers. |

### Domain Breakdown
| Domain Code | Feature Domain | Total | Completed | Backlog |
|---|---|:---:|:---:|:---:|
| **CORE** | Engine Fixes & Foundational Upgrades | 13 | 13 | 0 |
| **TRC** | Typography, Reading & Comprehension | 10 | 8 | 2 |
| **ALS** | Audio, Listening & Speaking | 10 | 8 | 2 |
| **SRS** | Spaced Repetition (SRS) & Vocabulary | 10 | 9 | 1 |
| **GTU** | Gamification, Tracking & UX | 10 | 6 | 4 |
| **AIM** | Advanced AI & Input Methods | 10 | 5 | 5 |

---

## 2. Master Ticket Inventory Table

| ID | Domain | Title | Priority | Points | Status | Core Requirement Summary |
|---|---|---|:---:|:---:|:---:|---|
| `FIX-001` | CORE | Read Aloud Skipping & Fallback Guard | High | 3 | 🟢 Completed | Prevent dual-fire fallback synthesis from skipping sentences. |
| `FIX-002` | CORE | Tone Visualizer Prop Resolution | High | 1 | 🟢 Completed | Pass correct `character` and `pinyin` props to canvas audio. |
| `FIX-003` | CORE | Tone Visualizer Pitch Register Labels | Medium | 1 | 🟢 Completed | Replace 1..5 Y-axis with 5 High (高) to 1 Low (低) registers. |
| `FIX-004` | CORE | Shadowing Studio Library & Custom Prompts | High | 5 | 🟢 Completed | HSK 1–6 prompt library and persistent custom sentence drawer. |
| `FIX-005` | CORE | Toneless Pinyin Normalization & Search Ranking | High | 3 | 🟢 Completed | Strip diacritics so `gou` surfaces `狗 (gǒu)` ahead of English matches. |
| `FIX-006` | CORE | Anti-AI Design Refresh & Header De-Clutter | High | 3 | 🟢 Completed | Rename to Moyun, remove header clutter, drop tab emojis. |
| `FIX-007` | CORE | Campaign Header Layout Homogenization & Generative Syllabus Creativity Engine | High | 3 | 🟢 Completed | Unify 32px action toolbar controls, replace act scrollbar with 3-column responsive grid, and eliminate repetitive mad-libs campaign and chapter titles. |
| `FIX-008` | CORE | Tech Debt & Hardcoded Data Elimination: Dynamic Star Calculation & Audit | High | 3 | 🟢 Completed | Dynamically reflect earned stars (1..3) across DAG map buttons, pill labels and preview modal; eliminate mock CPM, fake random scoring, and pre-completed sample nodes. |
| `FEAT-001` | CORE | HSK Grammar Highlighting & Breakdown Panel | High | 5 | 🟢 Completed | In-text gold underline, tooltips, and dynamic breakdown cards. |
| `FEAT-002` | CORE | PDF Document Ingestion Engine | High | 5 | 🟢 Completed | Client-side CJK CMap PDF parsing, page TOC, lexical report & SRS extraction. |
| `FEAT-003` | CORE | Adaptive Odyssey Lesson & Course Engine | High | 13 | 🟢 Completed | Macro campaign map, 10-stage exercise arsenal, IRT state machine & boss battles. |
| `FEAT-004` | CORE | Tactile Gamification, Map Personalization & Dynamic LLM Story Engine | High | 5 | 🟢 Completed | 3D stepping stones, thematic node emoji engine, mascot companion bubble, preview modal, Zap bugfix, pure LLM prompt without hardcoding. |
| `TRC-001` | TRC | Traditional Character Toggle (繁体字转换) | Medium | 3 | 🟢 Completed | 1-click bidirectional 简/繁 script switching in reader, print, and dictionary. |
| `TRC-002` | TRC | Zhuyin (Bopomofo 注音符号) Phonetic Support | Low | 5 | 🟢 Completed | Render Bopomofo phonetic ruby text as alternative to Latin Pinyin with toolbar switcher. |
| `TRC-003` | TRC | Tone Color Coding (Visual Memory Tones) | High | 2 | 🟢 Completed | Map 5 tones to distinct editorial colors on Hanzi and Pinyin with Off/Pinyin/Both toggle. |
| `TRC-004` | TRC | Adaptive Pinyin Fading | High | 5 | 🟢 Completed | Automatically hide Pinyin on characters mastered in SRS with hover reveal safety net. |
| `TRC-005` | TRC | Idiom (Chengyu 成语) Deep-Dive Tooltips | Medium | 5 | 🟢 Completed | Tokenize 4-character idioms as units with literal translation vs historical allusion (典故) tooltips. |
| `TRC-006` | TRC | Sentence Syntax Tree Visualizer | Low | 8 | ⚪ Backlog | Diagram sentence hierarchies (topic-comment, covers, complements). |
| `TRC-007` | TRC | Character Frequency Overlays (Top 500 Hanzi) | Medium | 3 | 🟢 Completed | Visually identify high-yield top 500 characters in imported texts with coverage analytics modal. |
| `TRC-008` | TRC | Browser Extension Companion | High | 13 | ⚪ Backlog | Chrome/Edge extension to tokenize and look up native web pages. |
| `TRC-009` | TRC | Cultural Context AI Notes | Medium | 5 | 🟢 Completed | Explain social etiquette, taboos, and traditions embedded in stories with dedicated modal and encyclopedia. |
| `TRC-010` | TRC | Contextual Translation Toggle (Paragraph by Paragraph) | High | 3 | 🟢 Completed | Disclose translations by paragraph rather than whole-story spoilers with inline cards. |
| `ALS-001` | ALS | Hover-to-Play Audio Narration | High | 2 | 🟢 Completed | 300ms debounced audio playback on word hover without starting Read Aloud. |
| `ALS-002` | ALS | Minimal Pairs Listening Drills | Medium | 5 | 🟢 Completed | Auditory discrimination drills for `sh/s`, `zh/z`, aspirated stops, and nasal codas. |
| `ALS-003` | ALS | Tonal Pair Practice (2-Syllable Sandhi) | High | 5 | 🟢 Completed | Practice all 20 tone pair combinations and 3-3 tone sandhi rules with pitch contours. |
| `ALS-004` | ALS | Regional Dialect & Accent Toggles (Erhua/Taiwan) | Low | 5 | 🟢 Completed | Neural voice profiles for Beijing Erhua and Taiwanese Mandarin with toolbar & settings toggles. |
| `ALS-005` | ALS | Video Subtitle Syncing (YouTube / Bilibili) | High | 13 | ⚪ Backlog | Synchronize video stream with clickable interactive transcript. |
| `ALS-006` | ALS | Podcast Transcription Engine | Medium | 13 | ⚪ Backlog | Speech-to-text pipeline turning native Chinese audio into graded texts. |
| `ALS-007` | ALS | Audio-Only Commute Mode (Hands-Free SRS) | High | 5 | 🟢 Completed | Background audio loop speaking prompts and answers via headphone controls. |
| `ALS-008` | ALS | Sentence Mixing (Auditory Jigsaw) | Medium | 5 | 🟢 Completed | Auditory drill requiring learners to assemble scrambled compound word chips from native audio. |
| `ALS-009` | ALS | Conversational Roleplay Chatbots (Situational) | High | 8 | 🟢 Completed | Persona-driven voice agent simulations (barista, taxi driver, landlord, receptionist). |
| `ALS-010` | ALS | Pronunciation Weakness Heatmap | Medium | 5 | 🟢 Completed | Track persistent initial, final, and tonal speaking inaccuracies with interactive drill inspector. |
| `SRS-001` | SRS | Sentence-Level SRS Flashcards | High | 5 | 🟢 Completed | Flashcards testing whole contextual sentences with blanked target words and audio replay. |
| `SRS-002` | SRS | Grammar Pattern SRS (Cloze Syntax Cards) | Medium | 5 | 🟢 Completed | Cloze review cards testing connective structures (e.g. `虽然...但是...`) with SM-2 grading. |
| `SRS-003` | SRS | Visual Flashcard Generation (AI Imagery) | Low | 8 | ⚪ Backlog | Synthesize and cache offline memory illustrations for abstract cards. |
| `SRS-004` | SRS | Custom Vocabulary Playlists & Thematic Decks | High | 5 | 🟢 Completed | Curate and review isolated topical decks (Business, Dining, Travel) with independent due counters. |
| `SRS-005` | SRS | Look-Alike (Visually Similar Hanzi) Quizzes | Medium | 5 | 🟢 Completed | Contextual quizzes and visual stroke diff breakdowns distinguishing visually confusable pairs (已/己/巳). |
| `SRS-006` | SRS | Etymology and Radical Mnemonics | Medium | 5 | 🟢 Completed | Paleographic origins (六书) with radical breakdowns, mnemonics, and dedicated explorer modal. |
| `SRS-007` | SRS | Automated Cloze Tests in Story Reading | High | 3 | 🟢 Completed | Auto-blank out due SRS cards in reading stories for active recall and instant SM-2 grading. |
| `SRS-008` | SRS | Export to Anki (.apkg) & Pleco (.txt) | High | 3 | 🟢 Completed | 1-click export of flashcard decks to Anki format and Pleco TSV. |
| `SRS-009` | SRS | Homophone Warning Tooltips | Medium | 2 | 🟢 Completed | Warn users in dictionary and reader when a character shares pronunciation with other words. |
| `SRS-010` | SRS | User-Tweakable SRS Intervals (SM-2 Customizer) | Low | 2 | 🟢 Completed | Customizable graduation steps, ease floors, and multipliers with preset profiles. |
| `GTU-001` | GTU | Multi-Device Synchronization (CRDT / P2P) | High | 13 | ⚪ Backlog | Conflict-free E2EE synchronization of IndexedDB across mobile & desktop. |
| `GTU-002` | GTU | Dynamic Reading Speed Tracker & Analytics (CPM) | High | 3 | 🟢 Completed | Real-time CPM tracking, historical velocity sessions, and HSK benchmark tiers. |
| `GTU-003` | GTU | Opt-in Community Leaderboards | Low | 5 | ⚪ Backlog | Anonymous weekly leaderboard ranking reading volume and reviews. |
| `GTU-004` | GTU | Daily Reading Streaks & Calendar Heatmap | High | 2 | 🟢 Completed | Local timezone streak counter, flame badge, best streak, and 35-day activity grid. |
| `GTU-005` | GTU | Peer-to-Peer Story Sharing (JSON / QR Import) | Medium | 5 | 🟢 Completed | Export stories as `.moyun.json` or scan QR codes for instant mobile load. |
| `GTU-006` | GTU | Tutor / Classroom Dashboard | Low | 13 | ⚪ Backlog | Teacher assignments, student progress tracking, and cohort blind spots. |
| `GTU-007` | GTU | Interactive Dialogue Trees (Adventure Engine) | High | 5 | 🟢 Completed | Grammatically constrained 2–3 branch choices at chapter ends driving narrative progression. |
| `GTU-008` | GTU | Export to PDF & Print Mode Optimization | High | 2 | 🟢 Completed | Clean paper stylesheets, printable header, vocabulary glossary appendix, and print button. |
| `GTU-009` | GTU | Full-Screen Focus Mode Drawer | High | 2 | 🟢 Completed | Zero-distraction reading layout with sticky HUD, font scale, and Esc key exit. |
| `GTU-010` | GTU | Memory Palace Integrations (Method of Loci) | Low | 13 | ⚪ Backlog | Spatial memory mapping of characters to user-defined physical rooms. |
| `AIM-001` | AIM | AI Grader for Free Writing & Composition | High | 5 | ⚪ Backlog | Line-by-line grammar, particle, and collocation feedback on essays. |
| `AIM-002` | AIM | Handwriting Recognition Input (Drawing Hanzi) | High | 8 | ⚪ Backlog | Canvas stroke drawing tool to search characters without knowing Pinyin. |
| `AIM-003` | AIM | Pinyin Typing Practice & IME Drills | Medium | 5 | 🟢 Completed | Speed typing drills simulating standard QWERTY Chinese IME candidate selection. |
| `AIM-004` | AIM | Vocabulary Difficulty Slider (Real-Time Simplifier) | High | 5 | 🟢 Completed | In-place dynamic synonym swapping scaling text difficulty up and down without LLM latency. |
| `AIM-005` | AIM | Text-to-Image Generation for Stories | Low | 5 | ⚪ Backlog | Ink-wash watercolor illustration generation for custom story passages. |
| `AIM-006` | AIM | Grammar Pattern Directory with Personal Corpus | High | 5 | 🟢 Completed | Searchable HSK grammar index displaying formula templates and sentences mined from user library. |
| `AIM-007` | AIM | Automated Dynamic HSK Placement Test | High | 5 | 🟢 Completed | 20-question adaptive diagnostic calibrating starting level across HSK 1–6. |
| `AIM-008` | AIM | Subtitles Export (.srt / .vtt) | Medium | 2 | 🟢 Completed | Export synchronized subtitle files (.srt/.vtt) with Chinese, Pinyin, or bilingual lines. |
| `AIM-009` | AIM | Offline Audio Pre-caching (Neural Audio Packs) | Medium | 8 | ⚪ Backlog | Download and cache studio neural audio for entire stories for flight use. |
| `AIM-010` | AIM | Integrated Stroke Order Numbered Typography | Medium | 5 | ⚪ Backlog | Render numbered stroke sequences directly within character fonts. |

---

## 3. Completed Tickets (Active & Verified)

### `FIX-001` — Read Aloud Skipping & Fallback Guard
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/services/azureSpeech.ts`, `src/components/ReadingTheater.tsx`
* **Requirements:**
  1. Guard against concurrent fallback synthesis when Google TTS fails.
  2. Prevent browser `speechSynthesis.cancel()` from firing cascading `onend` events that skip through sentences in milliseconds.
  3. Ensure pressing "Pause" halts audio immediately without queuing subsequent sentences.

### `FIX-002` — Speaking Practice Reference Audio Undefined Prop Fix
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/components/SpeakingWorkspace.tsx`
* **Requirements:**
  1. Pass accurate `character` and `pinyin` props to `<ToneVisualizerCanvas>`.
  2. Prevent speech synthesis engine from vocalizing the literal string `"undefined"`.

### `FIX-003` — Tone Visualizer Pitch Register Y-Axis Clarification
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/components/ToneVisualizerCanvas.tsx`
* **Requirements:**
  1. Replace abstract `1..5` numbers with pedagogical Chao tone register labels: `5 High (高)`, `4 Mid-High (半高)`, `3 Mid (中)`, `2 Mid-Low (半低)`, `1 Low (低)`.

### `FIX-004` — Shadowing Studio Custom Prompts & Multi-Domain Library
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/components/ShadowingStudio.tsx`
* **Requirements:**
  1. Multi-level curated curriculum library spanning HSK 1–6 across Greetings, Dining, Travel, Education, Mindset, and Literature.
  2. Custom Sentence drawer allowing users to enter, save, and record custom sentences to `localStorage: custom_shadowing_prompts`.
  3. Guarantee native reference audio plays cleanly once without doubling.

### `FIX-005` — Toneless Pinyin Normalization & Search Ranking
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/App.tsx`
* **Requirements:**
  1. Strip diacritics via `str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')`.
  2. Implement tiered relevance ranking: exact Hanzi > exact toneless Pinyin > prefix Pinyin > substring Hanzi > English definition match.
  3. Guarantee searching `gou` surfaces `狗 (gǒu)` as the #1 match ahead of English substring words like "courageous".

### `FIX-006` — Anti-AI Design Refresh & Header De-Clutter
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/App.tsx`, `src/App.css`, `src/components/OfflineStatusIndicator.tsx`
* **Requirements:**
  1. Rebrand platform to **墨韵 Moyun** (*Moyun — Graded Chinese Reader & Spoken Studio*).
  2. Remove Light Mode and Placement Test buttons from global header; tuck placement test into Settings and Lessons.
  3. Eliminate emojis from workspace navigation tabs.
  4. Fix spacing of `<OfflineStatusIndicator>` so it never touches adjacent controls.
  5. Consolidate 16 reading toolbar buttons into 3 calm visual clusters.

### `FEAT-001` — HSK Grammar Pattern Highlighting & Breakdown Panel
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/utils/grammarHighlighter.ts`, `src/components/ReadingTheater.tsx`, `src/App.css`
* **Requirements:**
  1. Expand pattern regex library to cover high-frequency HSK 1–4 sentence patterns and syntactic formulas.
  2. Map character offsets to tokens so matched words render with a gold underline and detailed hover tooltip.
  3. Render an expandable **HSK Grammar Pattern Breakdown** panel below the reading story showing formula templates, context quotes, and usage explanations.

### `FEAT-002` — PDF Document Ingestion Engine
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/services/pdfParser.ts`, `src/components/MediaIngestionWorkspace.tsx`
* **Requirements:**
  1. Ingest `.pdf` files client-side using dynamic CDN loading of Mozilla PDF.js with standard font datasets and CJK CMaps (`cMapUrl`, `cMapPacked: true`).
  2. Implement logographic text assembly that avoids unwanted whitespace between adjacent Chinese characters while preserving whitespace for Latin/English text.
  3. Provide client-side fallback extraction using native `DecompressionStream('deflate')` for offline environments.
  4. Render PDF page-by-page Table of Contents sidebar, reading preview, lexical density report (HSK level estimation, TTR), and target vocabulary extraction with 1-click SRS card generation.
  5. Support 1-click "Open Page in Reading Theater" and "Open Entire PDF" loading into the primary reading workspace.

### `FEAT-003` — Adaptive Odyssey Lesson & Course Engine
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/types/Course.ts`, `src/services/courseStore.ts`, `src/services/odysseyAudio.ts`, `src/services/adaptiveEngine.ts`, `src/services/syllabusGenerator.ts`, `src/services/lessonRoutineGenerator.ts`, `src/components/odyssey/CampaignMap.tsx`, `src/components/odyssey/AdaptiveLessonEngine.tsx`, `src/components/odyssey/SyllabusGeneratorModal.tsx`, `src/components/LessonWorkspace.tsx`
* **Requirements:**
  1. **Macro-Level Campaign Map**: Programmable 2D SVG canvas with Duolingo-style snaking S-curve Bezier paths, multi-branching DAG connectivity (main line, side quests with dashed connectors and +50 XP bonus badges, ambushes, and boss gates), stepping stone milestone dots, interactive Map Legend & Guide modal, node briefing previews, and Checkpoint Boss Capstone battles.
  2. **Generative Syllabus Engine & On-Demand Routine Synthesis**: Decoupled macro/micro architecture. Course prompt generates high-level DAG structure (3 chapters, 5-6 nodes, biomes, branches) with lightweight `exercises: []`. Dedicated `lessonRoutineGenerator.ts` synthesizes full 8-to-10 stage interactive routines on demand when each node is launched, caching results to IndexedDB.
  3. **Creative Storytelling, 3-Act Narrative Arcs & Bespoke Titles**: Gemini and offline engines synthesize imaginative, witty titles without template suffixes (e.g. *"Trombones, Paws & Parents: A Symphony of In-Law Diplomacy"*), structured across an escalating 3-act story arc (Act 1: Setup & Inciting Incident, Act 2: Rising Stakes & Rehearsals, Act 3: Grand Climax & Resolution) with bespoke narrative node titles and scenario vocabulary.
  4. **Hang-Prevention Safeguards & Live Progress Modal**: 16-second timeout safety guard with `Promise.race` auto-fallback to offline synthesis, multi-stage animated progress card (5 steps with live feedback and progress bar), instant offline shortcut bypass, and robust async synchronization in `LessonWorkspace`.
  5. **Global Course Memory & IndexedDB**: Persistent `MandarinGradedReaderCourses` store tracking mastery confidence (0-100), accumulated weaknesses, XP, and rank.
  6. **10-Stage Exercise Arsenal**: Blind Dictation (听写), Minimal Pair Triage (timed), Pitch-Matched Shadowing, Interactive Roleplay Dialogue, Sentence Assembly with Distractors, Stroke Order Hanzi Quiz, SRS Ambush, Speed Reading Sprint, Multiple Choice, and Vocab Intro.
  7. **Adaptive IRT & Duolingo Mistake Review Loop**: Non-blocking error continuation with instant explanation banner, soft health diamonds (no forced quitting), and a dedicated Target Practice Review Round at the end of the lesson for 100% mastery.
  8. **Metacognitive Gamification**: Geometric Health Diamonds (rotate 45deg), Combo Multipliers (2x, 3x, 5x), Web Audio synthesizer tactile feedback (chip pops, bass error chimes, victory fanfare), and End-of-Node Diagnostic breakdown.

### `FIX-007` — Campaign Header Layout Homogenization & Generative Syllabus Creativity Engine
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/components/odyssey/CampaignMap.tsx`, `src/services/syllabusGenerator.ts`
* **Requirements:**
  1. **Homogenous Unified Action Toolbar**: Standardize all 4 interactables (Rank & XP badge, Course Switcher select, Map Legend button, New Campaign button) to a uniform `32px` height, matching `12px` font size, border-radius, and vertical alignment.
  2. **Decoupled Full-Width Course Title**: Separate the course title and premise description onto their own dedicated full-width row so long titles never displace, shift, or squish toolbar controls.
  3. **3-Column Responsive Act Grid**: Replace `overflowX: 'auto'` tabs with a responsive CSS grid (`gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'`) featuring Act tags (`ACT 1`), clean truncated subtitles with text ellipsis, node progress counters (`3/5 Nodes`), and hover tooltips for full titles, eliminating clunky horizontal scrollbars.
  4. **Elimination of Template Mad-Libs**: Overhaul `syllabusGenerator.ts` to synthesize evocative, bespoke titles (e.g. *"Alibis & Narrow Escapes: The Rogue's Guide to City Nights"* for misdemeanors, *"Ledgers, Audits & Alibis"* for finance), concise act subtitles (under 26 characters), and rich 1-sentence narrative premises, strictly banning `"The ... Chronicles: A 3-Act Mandarin Odyssey"`, `"The Art of [User Prompt]: Fluency & Mastery"`, or `"Setup/Immersion/Mastery of ..."`.
  5. **Story-Driven Node Quest Naming**: In both AI and offline fallback modes, eliminate generic node names (*"Foundations: Immediate survival & greetings"*). Every node is dynamically named and contextualized relative to the user's quest topic (e.g. *"Scouting the Perimeter (暗中观察)"*, *"Disabling Alarms"*, *"The 24-Hour Noodle Shop Alibi"* for rogue capers; *"Infiltration: First Contact with [Quest]"*, *"Casing the Scene"*, *"Behind Enemy Lines"* for arbitrary adventures).
  6. **Safety Guardrail Optimization & Model Call Prioritization**: Frame user prompts as playful roleplay simulations to prevent false-positive safety flags, prioritize `gemini-3.1-flash-lite` first with graceful fallback to `gemini-2.5-flash`, and add post-processing sanitizers to guarantee high-quality creative output across online and offline paths.

### `FEAT-004` — Tactile Gamification, Map Personalization & Dynamic LLM Story Engine
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/types/Course.ts`, `src/services/syllabusGenerator.ts`, `src/services/lessonRoutineGenerator.ts`, `src/components/odyssey/CampaignMap.tsx`, `src/App.css`
* **Requirements:**
  1. **Tactile 3D Milestone Stepping Stones**: Upgrade 2D flat nodes to tactile 3D buttons with vibrant gradients, `0 5px 0` / `0 6px 0` bevel bevel shadows, press feedback, and active aura rings.
  2. **Thematic Node Iconography**: Add `icon?: string` to `CourseNode` and implement `resolveNodeEmoji` mapping semantic keywords (e.g. 🎺 trombone, 🐶 dog, 🥟 food, 🍵 family, 💼 business, 🕵️ caper/alibi, 🏮 night market).
  3. **Centered Floating Mascot Companion Bubble**: Center the Moyun Scholar 🐼 speech bubble directly over active milestone buttons with `left: 50%` and `translateX(-50%)`.
  4. **Headroom Buffer**: Implement `getSafeY` remapping (16%..86%) in both SVG Bezier canvas paths and HTML milestone node positions, preventing top clipping.
  5. **Pure LLM Generation (Zero Hardcoding)**: Remove hardcoded scenario checks (`isAbsurdTromboneDog`, etc.) in `syllabusGenerator.ts`; configure `HarmBlockThreshold.BLOCK_NONE` and model fallback (`gemini-3.1-flash-lite` -> `gemini-2.5-flash`).
  6. **Fix `Zap is not defined`**: Ensure `Zap` is imported from `lucide-react` in `CampaignMap.tsx`.

### `FIX-008` — Tech Debt & Hardcoded Data Elimination: Dynamic Star Calculation & Audit
* **Status:** 🟢 `Completed`
* **Subsystems:** `src/components/odyssey/CampaignMap.tsx`, `src/components/odyssey/AdaptiveLessonEngine.tsx`, `src/services/courseStore.ts`, `src/services/pronunciationAssessment.ts`, `src/components/odyssey/exercises/PitchShadowing.tsx`
* **Requirements:**
  1. **Eliminate Hardcoded 3 Stars in DAG Map**: Replace unconditionally filled `[1, 2, 3].map(s => <Star fill="#f59e0b" color="#f59e0b" />)` in `CampaignMap.tsx` with dynamic rendering matching `node.stars` (1, 2, or 3). Unearned stars render dim/unfilled (`fill="none"`, `rgba(255,255,255,0.12)`).
  2. **Tactile Node Star Badges**: Add mini 3-star indicator bars beneath completed 3D stepping stone buttons and text badges (`${node.stars || 1}/3★`) on pill labels.
  3. **Node Briefing Modal Star Reporting**: Display exact earned stars (e.g. `1/3 Stars (78%)`) inside the node launch preview modal for completed exercises.
  4. **Dynamic Reading Speed (CPM)**: Eliminate `readingSpeedCPM: Math.floor(Math.random() * 30) + 135` in `AdaptiveLessonEngine.tsx`. Track lesson start time via `lessonStartTimeRef` and compute real CPM from actual characters encountered across completed exercises divided by actual elapsed minutes.
  5. **Deterministic Acoustic Scoring**: Eliminate `Math.random() * 12` in `pronunciationAssessment.ts` and `Math.random() * 20 + 80` in `PitchShadowing.tsx`. Score deterministically based on actual recording duration and acoustic pacing deltas against expected sentence lengths.
  6. **Clean Initial Course State**: Remove pre-completed status (`status: 'completed', score: 95, stars: 3`) from `node-1-1` in `createDefaultTaipeiCampaign()`, ensuring all courses start fresh with only `node-1-1` active and subsequent nodes locked.

---

## 4. Backlog Specifications: Requirements & Acceptance Criteria

### [TRC] Typography, Reading & Comprehension

#### `TRC-001`: Traditional Character Toggle (繁体字转换)
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 3
* **Requirements:**
  * Client-side mapping table between Simplified and Traditional glyphs (~3,000 frequent characters).
  * Toolbar toggle (`简 / 繁`) in `ReadingTheater.tsx`.
  * Preserve Pinyin rubies, audio timing, and vocabulary database lookups regardless of active script.
* **Acceptance Criteria:**
  1. Toggling `简/繁` updates the entire displayed text and inspection tooltips instantly with zero server requests.
  2. Persists preference in `localStorage: preferred_chinese_script`.

#### `TRC-002`: Zhuyin (Bopomofo 注音符号) Phonetic Support
* **Status:** 🟢 `Completed` | **Priority:** Low | **Points:** 5
* **Requirements:**
  * Converter utility taking toned Pinyin and mapping to standard Bopomofo (ㄅㄆㄇㄈ) symbols (`src/utils/zhuyinConverter.ts`).
  * Ruby text and chip styling in `ReadingTheater.tsx` rendering Zhuyin with accurate diacritics (ˊ ˇ ˋ ˙).
* **Acceptance Criteria:**
  1. Switching to Zhuyin in the toolbar replaces all Pinyin rubies with accurate Bopomofo glyphs and tones, persisted to `localStorage: moyun_phonetic_notation`.
  2. Character inspection tooltip and dictionary display bilingual Pinyin and Zhuyin transcriptions side-by-side.
  3. Audio pacing, sentence sync, and tone color coding operate identically across both notation systems.

#### `TRC-003`: Tone Color Coding (Visual Memory Tones)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 2
* **Requirements:**
  * Define tone colors: 1st=Red (`#E06C75`), 2nd=Green (`#98C379`), 3rd=Yellow (`#E5C07B`), 4th=Blue (`#61AFEF`), Neutral=Muted Gray.
  * Extract tone number from token Pinyin and apply colors to Pinyin or Hanzi text.
* **Acceptance Criteria:**
  1. Contrast passes WCAG AA standards against both Editorial Dark and Paper Light backgrounds.
  2. Settings toggle: `Tone Colors: Off | Pinyin Only | Hanzi & Pinyin`.

#### `TRC-004`: Adaptive Pinyin Fading
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Query `srsStore.ts` for characters with interval > 21 days or streak >= 4.
  * Reduce ruby Pinyin opacity to `0%` (revealed at 20% on hover) for mastered characters.
* **Acceptance Criteria:**
  1. Mastered characters have Pinyin hidden automatically without manual level adjustment.
  2. Hovering or clicking reveals Pinyin immediately as a fallback.

#### `TRC-005`: Idiom (Chengyu 成语) Deep-Dive Tooltips
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Curated database of high-yield 4-character idioms with literal translations, figurative meanings, and historical allusions (典故) in `src/utils/chengyuDatabase.ts`.
  * Tokenizer greedy 4-character matching treating Chengyu as cohesive semantic units.
* **Acceptance Criteria:**
  1. Idioms are tokenized as unified compounds rather than 4 isolated characters, styled with subtle amber dashed underline (`.token-chengyu`).
  2. Character tooltip displays `📜 成语 Chengyu` badge, literal translation, and complete historical allusion (典故).

#### `TRC-006`: Sentence Syntax Tree Visualizer
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 8
* **Requirements:**
  * Dependency parsing service analyzing grammatical role (Subject, Verb, Object, Adverbial, Complement).
  * Interactive SVG tree diagram rendering sentence syntactic structure.
* **Acceptance Criteria:**
  1. Clicking "Syntax Tree" on any sentence renders hierarchical block diagrams.
  2. Identifies subject, main verb, aspect particles, and relative modifier clauses.

#### `TRC-007`: Character Frequency Overlays (Top 500 Hanzi)
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 3
* **Requirements:**
  * Overlay highlighting characters with `frequency_rank <= 500` from `hanziDB.csv`.
  * Display real-time coverage statistics: *"84% of this text consists of Top 500 characters."*
* **Acceptance Criteria:**
  1. Toggles visual highlights across the reading passage in one click (`.frequency-top-500` with frequency rank hover tooltips).
  2. Accurately computes frequency coverage metrics and presents multi-tier breakdown (Top 100, 250, 500, Rare) in `FrequencyCoverageModal`.

#### `TRC-008`: Browser Extension Companion
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 13
* **Requirements:**
  * Manifest V3 extension packaging Moyun's tokenizer and dictionary.
  * Injects hover cards into native Chinese web pages with 1-click "Add to Moyun Deck" sync.
* **Acceptance Criteria:**
  1. Operates on external websites with zero server dependency.
  2. Added cards sync back to Moyun IndexedDB via `chrome.storage.sync`.

#### `TRC-009`: Cultural Context AI Notes
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Engine detecting cultural etiquette, taboos, traditions, social philosophy, and linguistic subtexts (`src/utils/culturalContextEngine.ts`).
  * Dedicated cultural notes modal (`src/components/CulturalNotesModal.tsx`) with category filters, audio pronunciation, practical native etiquette tips, and historical origins.
* **Acceptance Criteria:**
  1. Scans story text for cultural markers (toasting hierarchy, saving face, red envelopes, tea finger kowtow, gifting taboos, chopstick manners, modesty decline rituals, and hot water wellness).
  2. Reading Theater toolbar displays dynamic `🏮 Culture (N)` trigger button opening the cultural context dossier.
  3. Provides full offline cultural encyclopedia with keyword triggers, subtext analysis, and audio synthesis.

#### `TRC-010`: Contextual Translation Toggle (Paragraph by Paragraph)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 3
* **Requirements:**
  * Group reading text into paragraphs (`\n\n`) and place a subtle translation trigger below each paragraph.
* **Acceptance Criteria:**
  1. Each paragraph translates independently to prevent narrative spoilers.

---

### [ALS] Audio, Listening & Speaking

#### `ALS-001`: Hover-to-Play Audio Narration
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 2
* **Requirements:**
  * Hovering over any word with 300ms debounce calls `AzureSpeechService.speak(token.character)`.
* **Acceptance Criteria:**
  1. Speaks character cleanly once without interfering with Read Aloud pacing.
  2. Toggleable in Reading Toolbar.

#### `ALS-002`: Minimal Pairs Listening Drills
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Curated phonemic minimal contrast pairs spanning retroflex vs dental (`sh/s`, `zh/z`, `ch/c`), aspirated stops (`b/p`, `d/t`, `g/k`), nasal codas (`in/ing`, `an/ang`, `en/eng`), alveolo-palatals (`j/q/x`), and rounded vowels (`u/ü`) in `src/utils/minimalPairsData.ts`.
  * Dedicated training studio `<MinimalPairDrills>` mounted in `SpeakingWorkspace.tsx`.
* **Acceptance Criteria:**
  1. Blind auditory discrimination tests with randomized target selection, native audio synthesis, and option cards.
  2. Side-by-side comparison audio playback post-answer, articulatory tongue/mouth placement tips, and acoustic spectrogram cues.
  3. Real-time accuracy metrics, streak counters, and category filters.

#### `ALS-003`: Tonal Pair Practice (2-Syllable Sandhi)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * 20 two-syllable tone pair matrix populated with common HSK words.
  * Pitch visualizer canvas tracking continuous pitch trajectory across both syllables.
* **Acceptance Criteria:**
  1. Correctly diagrams tone sandhi rules (3-3 -> 2-3, 不 and 一 sandhi).
  2. Compares user voice F0 trajectory against native benchmark.

#### `ALS-004`: Regional Dialect & Accent Toggles (Erhua/Taiwan)
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 5
* **Requirements:**
  * Voice mapping for Beijing Erhua (`zh-CN-BeijingNeural` / SSML) and Taiwanese Mandarin (`zh-TW-HsiaoChenNeural`).
* **Acceptance Criteria:**
  1. User can switch audio between Standard Northern, Beijing Erhua, and Taiwanese Mandarin.

#### `ALS-005`: Video Subtitle Syncing (YouTube / Bilibili)
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 13
* **Requirements:**
  * Video URL dropzone + subtitle parser (`.srt`/`.vtt`).
  * Split layout: Video player synchronized with scrollable interactive Chinese transcript.
* **Acceptance Criteria:**
  1. Video and transcript stay synchronized within 100ms.
  2. Clicking any transcript word pauses video and opens dictionary tooltip.

#### `ALS-006`: Podcast Transcription Engine
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 13
* **Requirements:**
  * Audio file dropzone (`.mp3`/`.m4a`) running WebAssembly Whisper or Azure Speech STT.
  * Automatically segments and tokenizes audio into a readable Graded Story.
* **Acceptance Criteria:**
  1. Generates clickable Chinese text with Pinyin rubies from raw audio.

#### `ALS-007`: Audio-Only Commute Mode (Hands-Free SRS)
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Hands-free audio loop: Prompt in English -> pause for recall -> answer in Chinese -> example sentence.
  * MediaSession API integration for headphone button grading.
* **Acceptance Criteria:**
  1. Plays in background on mobile lock-screens.
  2. Next track button marks card Easy; previous track marks card Hard.

#### `ALS-008`: Sentence Mixing (Auditory Jigsaw)
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Plays native audio sentence via `AzureSpeechService`, scrambles cohesive grammatical phrase chips, user reconstructs word order.
  * Interactive workbench in `src/components/SentenceMixingTrainer.tsx` mounted in SpeakingWorkspace.
* **Acceptance Criteria:**
  1. Compounds and phrases stay intact when scrambled (`tokens: ['虽然', '天气很冷', '但是', ...]`).
  2. Immediate tactile feedback confirming correct syntax with automatic audio playback and HSK level indicators.

#### `ALS-009`: Conversational Roleplay Chatbots (Situational)
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 8
* **Requirements:**
  * 10+ realistic scenarios (barista, taxi driver, landlord, market vendor).
  * AI voice loop constrained to user's target HSK level.
* **Acceptance Criteria:**
  1. Realistic personas with natural conversational turn-taking.
  2. Provides hints and real-time translation safety nets.

#### `ALS-010`: Pronunciation Weakness Heatmap
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Store outcomes of speaking attempts by Initial, Final, and Tone.
  * Visual matrix showing red/green mastery distribution.
* **Acceptance Criteria:**
  1. Updates automatically on speaking exercises.
  2. Clicking a red cell launches a 5-minute targeted drill.

---

### [SRS] Spaced Repetition (SRS) & Vocabulary

#### `SRS-001`: Sentence-Level SRS Flashcards
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Store `exampleSentence`, `examplePinyin`, and `exampleTranslation` on `Flashcard`.
  * Card front blanks out target word in sentence context; card back reveals full audio and translation.
* **Acceptance Criteria:**
  1. Adding character from reader or media ingestion automatically attaches contextual narrative sentence (`exampleSentence`) to IndexedDB flashcard.
  2. Flashcard front presents sentence cloze with target character blanked out; card reveal discloses full highlighted sentence with native speech playback button (`AzureSpeechService.speak`).
  3. Anki TSV export includes 6th column for `ExampleSentence`.

#### `SRS-002`: Grammar Pattern SRS (Cloze Syntax Cards)
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Save grammar matches from reading into review deck.
  * Clozes paired grammatical particles (e.g. `[虽然]...[但是]...`).
* **Acceptance Criteria:**
  1. Tests active recall of grammatical particles in context.
  2. Managed with standard SM-2 intervals.

#### `SRS-003`: Visual Flashcard Generation (AI Imagery)
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 8
* **Requirements:**
  * Generate mnemonic illustration via AI API and cache blob in IndexedDB.
* **Acceptance Criteria:**
  1. 1-click generation from card editing interface.
  2. Stored offline for instant loading during reviews.

#### `SRS-004`: Custom Vocabulary Playlists & Thematic Decks
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Group cards by custom `deckId` (e.g. Business, Dining, Travel, General) in `srsStore.ts`.
  * Filter review sessions and due counts by active deck.
  * Dedicated Deck Management Modal (`DeckManagementModal.tsx`).
* **Acceptance Criteria:**
  1. Full CRUD for custom thematic decks stored in `localStorage: moyun_custom_srs_decks`.
  2. Independent due count badges and total card counters calculated per playlist.
  3. Switching active deck immediately updates review session queue and counters in ReviewWorkspace.

#### `SRS-005`: Look-Alike (Visually Similar Hanzi) Quizzes
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Catalog 150+ confusable character clusters (已/己/巳, 未/末, 见/贝).
  * Interactive fill-in-the-blank drills with visual stroke diff overlays.
* **Acceptance Criteria:**
  1. Highlights the exact micro-stroke variation that distinguishes the confusable pair with mnemonic rhymes in `confusableHanzi.ts`.
  2. Interactive `ConfusableHanziModal` provides active sentence cloze quizzes and visual catalog comparing high-res character glyphs side-by-side.
  3. Character inspection tooltip warns when a character belongs to a confusable cluster with 1-click drill launch.

#### `SRS-006`: Etymology and Radical Mnemonics
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Add etymological category and mnemonic hooks to character dictionary and tooltips (`src/utils/etymologyDatabase.ts`).
  * Decompose characters into functional building blocks (semantic radical vs phonetic component) with ancient Oracle Bone / Bronze script origins.
  * Dedicated master-detail explorer modal (`src/components/EtymologyModal.tsx`).
* **Acceptance Criteria:**
  1. Decomposes characters into functional building blocks with 六书 classifications (象形, 指事, 会意, 形声) and vivid narrative mnemonics.
  2. Integrated into character inspection tooltips with 1-click modal launch and direct "Save Mnemonic to SRS" card persistence.

#### `SRS-007`: Automated Cloze Tests in Story Reading
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 3
* **Requirements:**
  * Automatically blank out words due for SRS review directly within story reading view.
* **Acceptance Criteria:**
  1. Auto-blanks out due SRS cards in reading stories as interactive `[ ❓ 填空 ]` chips.
  2. Clicking cloze launches quick 4-option recall challenge.
  3. Submits instant SM-2 review score (`updateCard`, 3 for Good, 1 for Fail) to SRS database with audio feedback and real-time story unmasking.

#### `SRS-008`: Export to Anki (.apkg) & Pleco (.txt)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 3
* **Requirements:**
  * Generate tab-delimited Pleco import file and standard Anki deck.
* **Acceptance Criteria:**
  1. 1-click export preserving Hanzi, Pinyin, definitions, and sentences.

#### `SRS-009`: Homophone Warning Tooltips
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 2
* **Requirements:**
  * Query homophone dictionary and display alert badge if character shares pronunciation with other common words.
* **Acceptance Criteria:**
  1. Lists top common homophones with identical tones.

#### `SRS-010`: User-Tweakable SRS Intervals (SM-2 Customizer)
* **Status:** 🟢 `Completed` | **Priority:** Low | **Points:** 2
* **Requirements:**
  * Expose initial graduation days (Step 1, Step 2), minimum ease floor, starting ease factor, easy bonus multiplier, and lapse intervals in `src/services/srsStore.ts`.
  * Dedicated modal `<SrsCustomizerModal>` launched from ReviewWorkspace action header with preset profiles (Standard SM-2, Intensive Cram, Relaxed Long-Term).
* **Acceptance Criteria:**
  1. SM-2 algorithm dynamically calculates review intervals using live user-configured settings saved in `localStorage: moyun_srs_customizer_settings`.
  2. 1-click reset to defaults and preset profiles for different pacing intensities.

---

### [GTU] Gamification, Tracking & UX

#### `GTU-001`: Multi-Device Synchronization (CRDT / P2P)
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 13
* **Requirements:**
  * Conflict-free replicated data types (`Yjs`) backed by IndexedDB.
  * Optional E2EE sync relay merging mobile and desktop review queues.
* **Acceptance Criteria:**
  1. Bidirectional sync within 5 seconds when online.
  2. Full offline resilience without data loss.

#### `GTU-002`: Dynamic Reading Speed Tracker & Analytics (CPM)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 3
* **Requirements:**
  * Historical chart logging reading speed (Characters Per Minute) across HSK levels over time.
* **Acceptance Criteria:**
  1. Visualizes fluency acceleration with benchmark comparison lines.

#### `GTU-003`: Opt-in Community Leaderboards
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 5
* **Requirements:**
  * Anonymous weekly character reading count comparisons (100% opt-in).
* **Acceptance Criteria:**
  1. Weekly reset; zero personal information required.

#### `GTU-004`: Daily Reading Streaks & Calendar Heatmap
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 2
* **Requirements:**
  * Local timezone streak calculation and calendar heatmap grid in ReviewWorkspace.
* **Acceptance Criteria:**
  1. Increments streak when user reads >= 100 characters or completes 10 reviews.

#### `GTU-005`: Peer-to-Peer Story Sharing (JSON / QR Import)
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Bundle story + tokens + custom overrides into `.moyun.json` or scannable QR code.
* **Acceptance Criteria:**
  1. Instant import from mobile camera scan or URL parameter.

#### `GTU-006`: Tutor / Classroom Dashboard
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 13
* **Requirements:**
  * Teacher portal assigning graded stories and reviewing cohort lookups and quiz scores.
* **Acceptance Criteria:**
  1. Aggregates class vocabulary blind spots.

#### `GTU-007`: Interactive Dialogue Trees (Adventure Engine)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Story generator creates 2–3 grammatically constrained choices at chapter ends in `src/utils/adventureEngine.ts`.
  * Interactive choice cards rendered in `ReadingTheater.tsx` with Pinyin, English, and narrative archetype tags.
* **Acceptance Criteria:**
  1. Clicking choices synthesizes next chapter continuing the narrative branch at active HSK level.
  2. Fallback text input persists for custom user-written narrative directions.

#### `GTU-008`: Export to PDF & Print Mode Optimization
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 2
* **Requirements:**
  * High-contrast `@media print` styling with optional Pinyin rubies and vocabulary footer glossary.
* **Acceptance Criteria:**
  1. Zero UI elements visible in print layout.

#### `GTU-009`: Full-Screen Focus Mode Drawer
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 2
* **Requirements:**
  * Collapses all headers, badges, and controls into an auto-hiding top trigger.
* **Acceptance Criteria:**
  1. Distraction-free typography with keyboard arrow navigation.

#### `GTU-010`: Memory Palace Integrations (Method of Loci)
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 13
* **Requirements:**
  * Spatial 2D canvas mapping characters and radicals to anchor points in virtual rooms.
* **Acceptance Criteria:**
  1. Interactive spatial walkthrough review mode.

---

### [AIM] Advanced AI & Input Methods

#### `AIM-001`: AI Grader for Free Writing & Composition
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 5
* **Requirements:**
  * AI analysis of user-typed essays evaluating grammar, particle placement, and collocations.
* **Acceptance Criteria:**
  1. Diff-highlighted corrections with grammatical explanations.

#### `AIM-002`: Handwriting Recognition Input (Drawing Hanzi)
* **Status:** ⚪ `Backlog` | **Priority:** High | **Points:** 8
* **Requirements:**
  * Drawing canvas tracking stroke trajectories and returning top matching Hanzi candidates.
* **Acceptance Criteria:**
  1. Embedded directly into dictionary search bar.

#### `AIM-003`: Pinyin Typing Practice & IME Drills
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Speed drill simulating standard Chinese QWERTY IME candidate selection with floating candidate bar (`src/utils/imeEngine.ts`).
  * Dedicated modal `<PinyinImeDrillModal>` accessible from LessonWorkspace subnav bar.
* **Acceptance Criteria:**
  1. Real-time QWERTY typing with Space / 1..5 candidate selection and accurate character matching against target sentences.
  2. Tracks characters per minute (CPM), keystroke accuracy %, and multi-syllable compound inputs across HSK 1–4.
  3. Instant audio vocalization upon sentence completion.

#### `AIM-004`: Vocabulary Difficulty Slider (Real-Time Simplifier)
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Synonym ladder matrix allowing real-time slider to swap advanced words for basic equivalents.
* **Acceptance Criteria:**
  1. In-place in-memory substitution without full LLM regeneration latency (`SynonymLadderEngine.scaleDifficulty`).
  2. Interactive HSK 1–6 slider in Reading Theater Actions menu with instant word swapping, swap counts, `.token-substituted` visual highlights, and 1-click reversion.

#### `AIM-005`: Text-to-Image Generation for Stories
* **Status:** ⚪ `Backlog` | **Priority:** Low | **Points:** 5
* **Requirements:**
  * Synthesizes traditional Chinese ink wash / watercolor illustrations matching story plot.
* **Acceptance Criteria:**
  1. Seamless header art matching Moyun's editorial aesthetic.

#### `AIM-006`: Grammar Pattern Directory with Personal Corpus
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Searchable index of all HSK grammar patterns with formulas, explanations, and personal corpus citations in `src/components/GrammarDirectoryModal.tsx`.
  * Dynamic scanner matching patterns against user's offline saved stories in `libraryStore.ts`.
* **Acceptance Criteria:**
  1. Search and HSK level filter across all patterns.
  2. Displays formulas, linguistic rules, and highlighted sentence citations mined from user's personal story library with audio playback.

#### `AIM-007`: Automated Dynamic HSK Placement Test
* **Status:** 🟢 `Completed` | **Priority:** High | **Points:** 5
* **Requirements:**
  * Adaptive diagnostic assessment converging on user's HSK level in 20 comprehensive questions across HSK 1 through HSK 6 (`src/components/DiagnosticTestModal.tsx`).
* **Acceptance Criteria:**
  1. Calibrates user's target curriculum level across all 6 HSK levels with 1 click upon completion.
  2. Real-time scoring, answer explanations, and level graduation benchmarks.

#### `AIM-008`: Subtitles Export (.srt / .vtt)
* **Status:** 🟢 `Completed` | **Priority:** Medium | **Points:** 2
* **Requirements:**
  * Exports stories with TTS audio timestamps as `.srt` or `.vtt` files.
* **Acceptance Criteria:**
  1. Valid standard subtitle files with Chinese, Pinyin, or dual English lines.

#### `AIM-009`: Offline Audio Pre-caching (Neural Audio Packs)
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 8
* **Requirements:**
  * Pre-generates and caches studio neural audio clips in IndexedDB/CacheStorage for offline travel.
* **Acceptance Criteria:**
  1. Full studio audio playback in 100% airplane mode.

#### `AIM-010`: Integrated Stroke Order Numbered Typography
* **Status:** ⚪ `Backlog` | **Priority:** Medium | **Points:** 5
* **Requirements:**
  * Stroke-order font overlaying sequence numbers on character strokes during reading.
* **Acceptance Criteria:**
  1. Displays numbered stroke paths without disrupting ruby alignment or line spacing.
