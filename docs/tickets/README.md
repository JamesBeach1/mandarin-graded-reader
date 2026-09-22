# Moyun (墨韵) — Product Feature Backlog & Ticket Registry

**Document Version:** 1.0.0  
**Status:** Canonical Product Backlog (Ready for Grooming / Sprint Planning)  
**Total Tickets:** 50  
**Central Hub:** 👉 [**Master Issue & Ticket Registry (`docs/TICKETS.md`)**](../TICKETS.md) — Single source of truth for all active and backlog tickets with status and requirements.  
**Execution Directive:** *Do NOT action any tickets until formally scheduled.*

---

## 1. Backlog Overview

This registry formalizes 50 enhancement proposals designed to expand Moyun from a standalone offline reader into an enterprise-grade multi-modal Mandarin acquisition ecosystem. 

Each ticket is assigned a canonical identifier, domain classification, architectural impact analysis, and acceptance criteria.

| Domain Code | Feature Domain | Ticket Range | Count | Spec File |
|---|---|---|---|---|
| **TRC** | Typography, Reading & Comprehension | `TRC-001` – `TRC-010` | 10 | [01-typography-reading.md](./01-typography-reading.md) |
| **ALS** | Audio, Listening & Speaking | `ALS-001` – `ALS-010` | 10 | [02-audio-speaking.md](./02-audio-speaking.md) |
| **SRS** | Spaced Repetition & Vocabulary | `SRS-001` – `SRS-010` | 10 | [03-srs-vocabulary.md](./03-srs-vocabulary.md) |
| **GTU** | Gamification, Tracking & UX | `GTU-001` – `GTU-010` | 10 | [04-gamification-ux.md](./04-gamification-ux.md) |
| **AIM** | Advanced AI & Input Methods | `AIM-001` – `AIM-010` | 10 | [05-ai-input-methods.md](./05-ai-input-methods.md) |

---

## 2. Master Ticket Inventory

### Domain 1: Typography, Reading & Comprehension
| ID | Title | Priority | Complexity | Target Subsystem |
|---|---|---|---|---|
| `TRC-001` | Traditional Character Toggle (繁体字转换) | Medium | Small (3) | Tokenizer / Lexicon |
| `TRC-002` | Zhuyin (Bopomofo 注音符号) Phonetic Support | Low | Medium (5) | Ruby Renderer |
| `TRC-003` | Tone Color Coding (Visual Memory Tones) | High | Small (2) | CSS / ReadingTheater |
| `TRC-004` | Adaptive Pinyin Fading | High | Medium (5) | SRS Store / Tokenizer |
| `TRC-005` | Idiom (Chengyu 成语) Deep-Dive Tooltips | Medium | Medium (5) | Dictionary DB / Tooltip |
| `TRC-006` | Sentence Syntax Tree Visualizer | Low | Large (8) | NLP Engine / SVG Canvas |
| `TRC-007` | Character Frequency Overlays (Top 500 Hanzi) | Medium | Small (3) | Tokenizer / Analytics |
| `TRC-008` | Browser Extension Companion | High | Large (13) | Web Extension API |
| `TRC-009` | Cultural Context AI Notes | Medium | Medium (5) | Gemini AI / Tooltip |
| `TRC-010` | Contextual Translation Toggle (Paragraph by Paragraph) | High | Small (3) | ReadingTheater State |

### Domain 2: Audio, Listening & Speaking
| ID | Title | Priority | Complexity | Target Subsystem |
|---|---|---|---|---|
| `ALS-001` | Hover-to-Play Audio Narration | High | Small (2) | AzureSpeech / HanziChip |
| `ALS-002` | Minimal Pairs Listening Drills | Medium | Medium (5) | Audio Engine / Drills UI |
| `ALS-003` | Tonal Pair Practice (2-Syllable Sandhi) | High | Medium (5) | Tone Engine / Pitch Canvas |
| `ALS-004` | Regional Dialect & Accent Toggles (Erhua/Taiwan) | Low | Medium (5) | Neural Voice Models |
| `ALS-005` | Video Subtitle Syncing (YouTube / Bilibili) | High | Large (13) | Media Pipeline / Video Player |
| `ALS-006` | Podcast Transcription Engine | Medium | Large (13) | Web Speech / Whisper API |
| `ALS-007` | Audio-Only Commute Mode (Hands-Free SRS) | High | Medium (5) | SRS Audio Loop / MediaSession |
| `ALS-008` | Sentence Mixing (Auditory Jigsaw) | Medium | Medium (5) | Interactive Lesson Engine |
| `ALS-009` | Conversational Roleplay Chatbots (Situational) | High | Large (8) | Voice Agent / LLM Persona |
| `ALS-010` | Pronunciation Weakness Heatmap | Medium | Medium (5) | Speech Recognition / Analytics |

### Domain 3: Spaced Repetition (SRS) & Vocabulary
| ID | Title | Priority | Complexity | Target Subsystem |
|---|---|---|---|---|
| `SRS-001` | Sentence-Level SRS Flashcards | High | Medium (5) | srsStore / ReviewWorkspace |
| `SRS-002` | Grammar Pattern SRS (Cloze Syntax Cards) | Medium | Medium (5) | grammarHighlighter / SRS |
| `SRS-003` | Visual Flashcard Generation (AI Imagery) | Low | Large (8) | Imagen / Pollinations API |
| `SRS-004` | Custom Vocabulary Playlists & Thematic Decks | High | Medium (5) | IndexedDB / Deck Manager |
| `SRS-005` | Look-Alike (Visually Similar Hanzi) Quizzes | Medium | Medium (5) | RadicalDecomp / Quiz Engine |
| `SRS-006` | Etymology and Radical Mnemonics | Medium | Medium (5) | Dictionary DB / Tooltip |
| `SRS-007` | Automated Cloze Tests in Story Reading | High | Small (3) | ReadingTheater / Pacing |
| `SRS-008` | Export to Anki (.apkg) & Pleco (.txt) | High | Small (3) | File Export / Data Bridge |
| `SRS-009` | Homophone Warning Tooltips | Medium | Small (2) | homophoneDetector |
| `SRS-010` | User-Tweakable SRS Intervals (SM-2 Customizer) | Low | Small (2) | SM-2 Engine / Settings |

### Domain 4: Gamification, Tracking & UX
| ID | Title | Priority | Complexity | Target Subsystem |
|---|---|---|---|---|
| `GTU-001` | Multi-Device Synchronization (CRDT / Cloud Storage) | High | Large (13) | Yjs / IndexedDB Sync |
| `GTU-002` | Dynamic Reading Speed Tracker & History Analytics (CPM) | High | Small (3) | readingAnalytics / Chart |
| `GTU-003` | Opt-in Community Leaderboards | Low | Medium (5) | Supabase / Anonymized Telemetry |
| `GTU-004` | Daily Reading Streaks & Calendar Heatmap | High | Small (2) | localStorage / Heatmap |
| `GTU-005` | Peer-to-Peer Story Sharing (JSON / QR Import) | Medium | Medium (5) | stateHydration / QR Code |
| `GTU-006` | Tutor / Classroom Dashboard | Low | Large (13) | Teacher Portal / Multi-user |
| `GTU-007` | Interactive Dialogue Trees (Adventure Engine) | High | Medium (5) | Story Continuation / Branching |
| `GTU-008` | Export to PDF & Print Mode Optimization | High | Small (2) | CSS @media print / PrintEngine |
| `GTU-009` | Full-Screen Focus Mode Drawer | High | Small (2) | ReadingTheater Layout |
| `GTU-010` | Memory Palace Integrations (Method of Loci) | Low | Large (13) | Three.js / Spatial Canvas |

### Domain 5: Advanced AI & Input Methods
| ID | Title | Priority | Complexity | Target Subsystem |
|---|---|---|---|---|
| `AIM-001` | AI Grader for Free Writing & Composition | High | Medium (5) | Gemini Flash / Writing Modal |
| `AIM-002` | Handwriting Recognition Input (Drawing Hanzi) | High | Large (8) | HanziWriter / Canvas Recognition |
| `AIM-003` | Pinyin Typing Practice & IME Drills | Medium | Medium (5) | Typing Engine / Speed Test |
| `AIM-004` | Vocabulary Difficulty Slider (Real-Time Simplifier) | High | Medium (5) | Lexicon Ranker / LLM Rewrite |
| `AIM-005` | Text-to-Image Generation for Stories | Low | Medium (5) | Image Generation Pipeline |
| `AIM-006` | Grammar Pattern Directory with Personal Corpus | High | Medium (5) | grammarHighlighter / Index |
| `AIM-007` | Automated Dynamic HSK Placement Test | High | Medium (5) | DiagnosticTestModal / CAT Engine |
| `AIM-008` | Subtitles Export (.srt / .vtt) | Medium | Small (2) | Audio Timestamps / File Exporter |
| `AIM-009` | Offline Audio Pre-caching (Neural Audio Packs) | Medium | Large (8) | CacheStorage / ServiceWorker |
| `AIM-010` | Integrated Stroke Order Numbered Typography | Medium | Medium (5) | SVG Font / Canvas Stencil |

---

## 3. Implementation Phasing Strategy

When prioritization begins, tickets should be sequenced according to learning return-on-investment (ROI):

* **Phase 1 — Core Reading & Phonetics (Low Friction, High Utility)**:
  `TRC-003` (Tone Colors), `TRC-004` (Adaptive Pinyin), `ALS-001` (Hover Audio), `SRS-008` (Anki Export), `AIM-004` (Difficulty Slider).
* **Phase 2 — Speaking & Audio Calibration**:
  `ALS-003` (Tonal Pairs), `ALS-007` (Commute Audio Mode), `ALS-009` (Voice Roleplay), `AIM-002` (Handwriting Input).
* **Phase 3 — Deep Immersion & Syntax Mastery**:
  `TRC-001` (Traditional Toggle), `TRC-005` (Chengyu Tooltips), `SRS-001` (Sentence SRS), `AIM-006` (Grammar Directory).
* **Phase 4 — Ecosystem & Sync**:
  `GTU-001` (Multi-device Sync), `TRC-008` (Browser Extension), `ALS-005` (Video Subtitles).
