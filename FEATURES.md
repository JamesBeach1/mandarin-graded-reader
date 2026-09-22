# 墨韵华文 Next-Gen Mandarin Learning Platform — Core Features 🚀

This document outlines the complete feature inventory and capabilities of the next-generation multi-modal Mandarin Graded Reader.

> **Canonical System Specification:**  
> For the comprehensive technical specification with architectural contracts, design tokens, and execution blueprints, see **[SYSTEM_SPEC.md](./SYSTEM_SPEC.md)** and the audit matrix in **[NEXT_GEN_TRACKER.md](./NEXT_GEN_TRACKER.md)**.

---

## 🏛️ Architecture & Core Subsystems

The platform is organized into **5 isolated, modular learning workspaces** designed to eliminate cognitive clutter and support deep immersion:

```
[墨韵华文 Next-Gen Platform]
  ├── 📖 Reading Workspace (ReadingWorkspace: Authentic Vertical/Horizontal Reader & Branching Stories)
  ├── 🎙️ Speaking Workspace (SpeakingWorkspace: Real-Time Pitch Curves, Shadowing & Voice Dialogue)
  ├── 📂 Import Media Workspace (ImportMediaWorkspace: EPUB Ingestion, Local OCR & Subtitles)
  ├── 🗂️ Review Workspace (ReviewWorkspace: Audio-First Flashcards, Writing Canvas & Anki Export)
  └── 🎯 Lesson Workspace (LessonWorkspace: Interactive Lessons, Frameworks & 50-Q Diagnostic)
```

---

## 📖 1. Reading Theater Subsystem

1. **Authentic Vertical Reading Mode (`writing-mode: vertical-rl`)**:
   - One-click toggle between standard horizontal reading and traditional top-to-bottom, right-to-left vertical columns.
   - Preserves upright numerals and Latin letters using `text-combine-upright: all` (`.tcy`).
   - Adaptive Pinyin positioning automatically shifts from top to right column margin.
2. **AI Graded Story Synthesis**:
   - Synthesizes graded texts strictly constrained by HSK 1–6 grammar and vocabulary limits via Google Gemini.
   - In-line difficulty scaling: `📉 Simplify (HSK - 1)` and `📈 Harder (HSK + 1)`.
3. **Choose Your Own Adventure Branching Continuations**:
   - Interactive plot continuation prompts appended smoothly to the active story text at the target HSK level.
4. **Sentence Read-Aloud Pacing Highlights**:
   - Synchronizes neural audio playback progress with visual sentence highlighting and smooth scrolling.
5. **Inline Sentence Translation & Grammatical Breakdown**:
   - Clickable sentence triggers revealing instant English translations and HSK structural explanations.
6. **Grammar Pattern Highlighter**:
   - Automatically detects and highlights functional Mandarin grammar patterns (`把`, `被`, `除了...以外`, `越来越...`, `虽然...但是...`).
7. **Contextual Polyphone (多音字) Detection**:
   - Flags characters with multiple pronunciations (`得`, `行`, `重`, `地`, `发`, `会`) with amber badges and contextual pronunciation guidance.
8. **Focus Mode (Full Immersion)**:
   - Distraction-free full-screen reading mode collapsing headers and navigation bars.
9. **Semantic Story Library Search**:
   - Inverted index search engine enabling keyword and conceptual lookups across saved stories.

---

## 🎙️ 2. Pronunciation & Spoken Language Studio

10. **pYIN / Autocorrelation $F_0$ Pitch Estimation**:
    - Real-time client-side pitch detection capturing vocal fundamental frequency at 60 FPS via Web Audio API.
11. **Canvas Tone Curve Visualizer**:
    - HTML5 Canvas overlay plotting the learner's live vocal pitch contour against target Mandarin tone curves (Tones 1–4: High 55, Rising 35, Dipping 214, Falling 51).
12. **Tone Accuracy & DTW Normalization**:
    - Dynamic Time Warping (DTW) algorithm scoring pitch inflection against reference tone models.
13. **Audio-Pitch IndexedDB Caching**:
    - Stores calculated reference pitch contours in IndexedDB for instant, zero-latency playback and visualization.
14. **Sentence Shadowing Studio**:
    - Three-step shadowing pipeline: Listen to native reference audio $\implies$ Record learner speech $\implies$ Back-to-back dual playback comparison.
15. **Phoneme & Acoustic Pronunciation Scoring**:
    - Real-time scoring of pronunciation accuracy, fluency, pacing, and tonal inflection with Azure Pronunciation Assessment integration.
16. **Conversational Voice Agent**:
    - Real-time push-to-talk spoken roleplay dialogue loop: Voice input $\implies$ In-browser speech recognition $\implies$ Gemini LLM reasoning $\implies$ Neural audio synthesis response.

---

## 📂 3. Media Ingestion Pipeline

17. **Zero-Dependency EPUB Ingestion Engine**:
    - Client-side EPUB parser extracting chapters and Table of Contents using native `DecompressionStream('deflate-raw')`.
    - Tokenizes ingested Chinese text with interactive dictionary lookups.
18. **Table of Contents (TOC) Navigation Drawer**:
    - Interactive chapter drawer displaying chapter titles, word counts, and progress tracking.
19. **Local Browser OCR (Image & PDF Scanner)**:
    - Canvas-driven OCR pipeline with grayscale binarization and contrast enhancement for extracting text from native signage, book pages, and PDFs.
20. **Interactive Video Subtitle Player (`.srt` / `.vtt`)**:
    - Timed subtitle track player enabling character-level tokenization, hover dictionary lookups, and cue looping.
21. **Lexical Density Scoring (Type-Token Ratio - TTR)**:
    - Analyzes vocabulary diversity, unique character percentage, and HSK level distribution for any imported literature.
22. **Dynamic Vocabulary Extraction**:
    - Automatically identifies and extracts words exceeding the learner's current HSK proficiency level, enabling one-click flashcard deck creation.

---

## 🗂️ 4. Review, Writing & Portability Subsystem

23. **Audio-First Active Recall Flashcards**:
    - Plays native pronunciation audio before revealing character glyph and meaning, training auditory comprehension.
24. **SuperMemo-2 (SM-2) Spaced Repetition**:
    - Local IndexedDB SRS engine scheduling reviews with 4-tier grading (Fail, Hard, Good, Easy).
25. **Enhanced HanziWriter Guided Writing Canvas**:
    - Stroke-by-stroke guided drawing with animated stroke order, drawing quizzes, and radical breakdown.
26. **Bamboo Green Review Heatmap (`#7B8D62`)**:
    - 28-day review activity visualization modeled after traditional Chinese botanical pigments.
27. **Reading Speed Analytics (CPM)**:
    - Real-time Characters Per Minute calculation and historical session duration tracking.
28. **Anki Deck Export (.tsv)**:
    - One-click export of local flashcards to Anki-compatible TSV files with Pinyin, audio triggers, and definitions.
29. **Multi-Device State Hydration & Cloud Sync**:
    - Complete JSON data bundle export and import with schema validation and timestamp conflict resolution.

---

## 🎯 5. Curriculum, Standards & System Infrastructure

30. **Interactive 4-Stage AI Lessons**:
    - Custom Duolingo-style structured learning modules (Vocab Intro, Multiple Choice, Sentence Assembly, Dialogue Reading).
31. **HSK 1–6 (HSK 3.0) Curriculum Alignment**:
    - Standardized grammar, vocabulary, and proficiency targets for international Chinese language learners.
32. **SQA Higher Mandarin (SCQF Level 6) Framework**:
    - Upper-secondary context mapping across Society, Learning, Employability, and Culture with discursive essay prompts.
33. **50-Question Dynamic Placement Diagnostic**:
    - Comprehensive multi-stage placement test evaluating character recognition, vocabulary, and grammar, with one-click level calibration.
34. **Radical Decomposition & Kangxi Etymology**:
    - Tooltip component showing Kangxi radical components, semantic categories, and stroke counts.
35. **Traditional Mineral Pigment Theme Engine**:
    - Organic design themes: Rice Paper (`#FAF9F6`), Dark Ink (`#1A1A1A`), Bamboo Tea (`#F4F7F2`), and Scholar Indigo (`#F6F8FA`).
36. **Offline Mode Network Status Indicator**:
    - Real-time indicator reassuring users of zero-backend sovereignty and offline capability.
