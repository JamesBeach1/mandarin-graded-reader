# Features Specification & 5-Workspace Subsystems Breakdown

This document provides the canonical technical inventory of all 36 capabilities and features implemented in the Mandarin Graded Reader next-generation multi-modal platform.

---

## 🏛️ System Architecture: 5 Isolated Workspaces

The platform eliminates single-page cognitive overload by structuring features across 5 dedicated learning environments:

1. **📖 专注阅读 Reading Theater**: Authentic vertical/horizontal reading, sentence pacing highlights, branching stories, and inline grammatical analysis.
2. **🎙️ 发音工坊 Pronunciation Studio**: Real-time vocal pitch estimation, Canvas tone curves, sentence shadowing with dual playback, and conversational voice roleplay.
3. **📂 媒体解析 Media Ingestion**: Zero-dependency EPUB reader, table of contents navigation, local OCR scanner, timed subtitle player, and lexical density scoring.
4. **🗂️ 间隔复习 SRS Flashcards**: Audio-first active recall flashcards, SM-2 spaced repetition queue, HanziWriter guided drawing, Bamboo review heatmap, and Anki TSV export.
5. **🎯 阶梯课程 Curriculum & Lessons**: Structured Duolingo-style AI lessons, HSK 1-6 / SCQF Level 6 frameworks, and 50-question dynamic placement test.

---

## 📖 Workspace 1: Reading Theater

### 1. Authentic Vertical Reading Mode (`vertical-rl`)
*   **Implementation:** `src/components/ReadingTheater.tsx`, `src/App.css`
*   **CSS Contract:** `writing-mode: vertical-rl`, `text-combine-upright: all` (`.tcy`), `text-orientation: mixed`.
*   **Behavior:** Swaps reading flow from standard horizontal rows to traditional top-to-bottom vertical columns with horizontal scrolling. Latin numerals and characters are kept upright.

### 2. AI Graded Story Synthesis
*   **Implementation:** `src/App.tsx`, Google Gemini API (`gemini-2.5-flash`)
*   **Behavior:** Generates Mandarin stories strictly constrained by `HSK_GRAMMAR_CONSTRAINTS` for HSK 1 through 6.

### 3. In-Line Difficulty Scaling
*   **Implementation:** `src/components/ReadingTheater.tsx`
*   **Controls:** `📉 Simplify (HSK - 1)` and `📈 Harder (HSK + 1)`. Instructs LLM to rewrite the active text to the target level while preserving plot and character names.

### 4. Choose Your Own Adventure Branching Continuations
*   **Implementation:** `src/components/ReadingTheater.tsx` (`handleContinueStory`)
*   **Behavior:** Allows learners to dictate plot turns; LLM generates and appends the next paragraph matching the current HSK level.

### 5. Read-Aloud Sentence Pacing Highlights
*   **Implementation:** `src/components/ReadingTheater.tsx`
*   **Behavior:** Synchronizes audio playback progress with highlighted sentence spans and automatic smooth scrolling.

### 6. Inline Sentence Translation & Grammar Analysis
*   **Implementation:** `src/components/ReadingTheater.tsx`
*   **Behavior:** Clicking any sentence toggles an instant inline English translation card and structural breakdown.

### 7. Grammar Pattern Highlighting
*   **Implementation:** `src/utils/grammarHighlighter.ts`
*   **Patterns:** Identifies key HSK functional patterns (`把`, `被`, `除了...以外`, `越来越...`, `虽然...但是...`).

### 8. Contextual Polyphone (多音字) Detection
*   **Implementation:** `src/utils/homophoneDetector.ts`
*   **Behavior:** Flags characters with multiple pronunciations (`得`, `行`, `重`, `地`, `发`, `会`) with amber pills and contextual pronunciation guidance.

### 9. Focus Mode (Distraction-Free Immersion)
*   **Implementation:** `src/components/ReadingTheater.tsx`
*   **Behavior:** Full-screen reader mode collapsing toolbars, navigation headers, and auxiliary panels.

### 10. Semantic Story Library Search
*   **Implementation:** `src/services/semanticSearch.ts`
*   **Behavior:** Inverted index search across saved stories by English concepts and Chinese keywords.

---

## 🎙️ Workspace 2: Pronunciation & Spoken Language Studio

### 11. pYIN / Autocorrelation $F_0$ Pitch Estimation
*   **Implementation:** `src/services/pitchTracker.ts`
*   **DSP Algorithm:** High-resolution normalized autocorrelation of PCM microphone buffers extracted at 60 FPS via Web Audio API `AudioContext` and `AnalyserNode`.

### 12. Canvas Tone Curve Visualizer
*   **Implementation:** `src/components/ToneVisualizerCanvas.tsx`
*   **Visual Grid:** 5-degree Mandarin pitch scale (Chao tone letters 1 to 5). Plots live vocal pitch in cinnabar/bamboo over ideal reference tone curves (55, 35, 214, 51).

### 13. Dynamic Time Warping (DTW) Tone Scoring
*   **Implementation:** `src/services/pitchTracker.ts`
*   **Algorithm:** Normalizes pitch trajectories to 50 equidistant points and calculates tonal contour similarity score (0–100%).

### 14. Audio Pitch Caching
*   **Implementation:** `src/services/audioPitchCache.ts`
*   **Storage:** Persistent IndexedDB store for calculated pitch curves.

### 15. Sentence Shadowing Studio
*   **Implementation:** `src/components/ShadowingStudio.tsx`
*   **Pipeline:** Listen to native reference audio $\implies$ Record user microphone speech $\implies$ Back-to-back dual playback comparison.

### 16. Phoneme & Acoustic Pronunciation Scoring
*   **Implementation:** `src/services/pronunciationAssessment.ts`
*   **Integration:** Azure Pronunciation Assessment REST endpoint with local acoustic heuristics for pacing, fluency, and tonal accuracy.

### 17. Conversational Voice Agent
*   **Implementation:** `src/components/ConversationalVoiceAgent.tsx`
*   **Loop:** Real-time push-to-talk speech recognition $\implies$ Gemini LLM dialogue generation $\implies$ Neural audio synthesis response.

---

## 📂 Workspace 3: Media Ingestion Pipeline

### 18. Zero-Dependency In-Browser EPUB Ingestion Engine
*   **Implementation:** `src/services/epubParser.ts`
*   **Engine:** Extracts zipped files from `.epub` archives using native browser `DecompressionStream('deflate-raw')`, reads `container.xml` and OPF manifest, and parses chapters into clean DOM text.

### 19. Table of Contents (TOC) Navigation Drawer
*   **Implementation:** `src/components/TocDrawer.tsx`
*   **Behavior:** Chapter index navigation with chapter word count statistics and active chapter indicator.

### 20. Local Browser OCR (Image & PDF Scanner)
*   **Implementation:** `src/services/ocrService.ts`
*   **Behavior:** HTML5 canvas contrast enhancement, binarization, and local character extraction.

### 21. Interactive Video Subtitle Player (`.srt` / `.vtt`)
*   **Implementation:** `src/components/VideoSubtitleReader.tsx`, `src/services/subtitleParser.ts`
*   **Behavior:** Timed subtitle cues with character tokenization, hover dictionary lookups, and cue looping.

### 22. Lexical Density Scoring (Type-Token Ratio - TTR)
*   **Implementation:** `src/utils/lexicalDensity.ts`
*   **Metrics:** Computes Type-Token Ratio, total characters, unique characters, and HSK level distribution percentages.

### 23. Dynamic Target Vocabulary Extraction
*   **Implementation:** `src/utils/vocabExtractor.ts`
*   **Behavior:** Scans imported texts for vocabulary exceeding the user's current HSK level and offers 1-click addition to SRS review cards.

---

## 🗂️ Workspace 4: SRS Review, Writing & Portability

### 24. Audio-First Active Recall Flashcards
*   **Implementation:** `src/components/AudioFirstFlashcard.tsx`
*   **Behavior:** Triggers native pronunciation audio upon card presentation before character glyph or translation is revealed.

### 25. SuperMemo-2 (SM-2) Spaced Repetition
*   **Implementation:** `src/services/srsStore.ts`
*   **Grading:** 4-tier grading: Fail ($q=1$), Hard ($q=2$), Good ($q=3$), Easy ($q=4$). Calculates next review interval and ease factor.

### 26. Enhanced HanziWriter Guided Writing Canvas
*   **Implementation:** `src/HanziPracticeModal.tsx`
*   **Behavior:** Stroke-by-stroke guided drawing with animated stroke order, drawing quizzes, and radical breakdown.

### 27. Bamboo Green Review Activity Heatmap (`#7B8D62`)
*   **Implementation:** `src/components/SrsHeatmap.tsx`
*   **Behavior:** 28-day calendar heatmap using traditional Bamboo pigment with 4 intensity levels.

### 28. Reading Speed Analytics (CPM)
*   **Implementation:** `src/services/readingAnalytics.ts`
*   **Behavior:** Real-time Characters Per Minute tracker recording reading duration and 50-session history.

### 29. Anki TSV Flashcard Export
*   **Implementation:** `src/services/ankiExport.ts`
*   **Format:** Tab-delimited text (`.tsv`) with Character, Pinyin, Definition, Interval, and HSK tags.

### 30. Multi-Device State Hydration & Cloud Sync
*   **Implementation:** `src/services/stateHydration.ts`, `src/services/cloudSync.ts`
*   **Behavior:** Full JSON backup and restore engine with schema validation and timestamp merge logic.

---

## 🎯 Workspace 5: Curriculum & System Infrastructure

### 31. AI-Generated Interactive Duolingo-Style Lessons
*   **Implementation:** `src/components/LessonEngine.tsx`, `src/services/gemini.ts`
*   **Stages:** Stage 1 (`vocab_intro`), Stage 2 (`multiple_choice`), Stage 3 (`sentence_builder`), Stage 4 (`dialogue_reading`).

### 32. HSK 1–6 / HSK 3.0 Curriculum Framework
*   **Implementation:** `src/services/curriculum.ts`
*   **Behavior:** International proficiency framework mapping target vocabulary and grammatical competencies.

### 33. SQA Higher Mandarin (SCQF Level 6) Syllabus
*   **Implementation:** `src/services/curriculum.ts`
*   **Contexts:** Society, Learning, Employability, and Culture with essay prompts.

### 34. 50-Question Dynamic Placement Diagnostic Test
*   **Implementation:** `src/components/DiagnosticTestModal.tsx`
*   **Behavior:** Adaptive assessment evaluating character knowledge, vocabulary, and grammar across HSK 1–6 with 1-click level calibration.

### 35. Radical Decomposition & Kangxi Etymology
*   **Implementation:** `src/components/RadicalDecomposition.tsx`
*   **Behavior:** Displays Kangxi radical breakdown, radical meaning, semantic category, and total stroke counts.

### 36. Traditional Mineral Pigment Theme Engine
*   **Implementation:** `src/services/themeEngine.ts`
*   **Palettes:** Rice Paper (`#FAF9F6`), Dark Ink (`#1A1A1A`), Bamboo Tea (`#F4F7F2`), Scholar Indigo (`#F6F8FA`).
