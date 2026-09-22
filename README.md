# 墨韵华文 Next-Gen Mandarin Learning Platform 📚

An offline-first, client-side React 19 + TypeScript + Vite web platform for comprehensive Mandarin Chinese acquisition. Built around an authentic organic print design system with mineral pigments and traditional Chinese typography, the platform provides zero-backend sovereignty, neural speech synthesis, real-time vocal pitch tracking, in-browser EPUB/OCR media ingestion, and standardized curriculum alignment.

---

## 📖 Canonical Documentation & Specifications

*   **[Master Issue & Ticket Registry (docs/TICKETS.md)](./docs/TICKETS.md)**: Centralized issue management tracking all active, completed, and backlog tickets with status and requirements.
*   **[Audit & Verification Matrix (NEXT_GEN_TRACKER.md)](./NEXT_GEN_TRACKER.md)**: Master verification matrix auditing all 36 features and 5 core pillars.
*   **[Master System Specification (SYSTEM_SPEC.md)](./SYSTEM_SPEC.md)**: The definitive technical architecture specification, design tokens, data contracts, and AI protocols.
*   **[Features Catalog (FEATURES.md)](./FEATURES.md)**: Comprehensive breakdown of all 36 capabilities.
*   **[Developer Guide (DEVELOPER.md)](./DEVELOPER.md)**: Codebase map, architectural invariants, and contribution standards.
*   **[Technical Guides (`docs/`)](./docs/)**: Subsystem deep-dives covering styling, audio, NLP, SRS storage, and lesson engines.

---

## 🏛️ The 5 Modular Learning Workspaces

1. **📖 Reading Workspace (`ReadingWorkspace`)**:
   - Story generator with custom HSK levels, AI prompt input, and instant generation.
   - Deep reading theater with authentic vertical reading mode (`writing-mode: vertical-rl`) and `.tcy` upright Latin/numerals.
   - Pacing sentence highlights synchronized with neural audio narration.
   - Interactive grammar markers (`把`, `被`, `除了...以外`) and polyphone (多音字) detection.
   - Choose Your Own Adventure story branching and in-line difficulty scaling.
   - Focus Mode for distraction-free reading immersion.
   - Offline story library with inverted-index semantic search.

2. **🎙️ Speaking Workspace (`SpeakingWorkspace`)**:
   - Real-time vocal pitch tracking ($F_0$ estimation via autocorrelation) at 60 FPS.
   - Canvas tone visualizer comparing user pitch against ideal Mandarin tone curves (Tones 1–4).
   - Sentence Shadowing Studio with native audio playback, user recording, and dual back-to-back comparison.
   - Conversational Voice Agent enabling push-to-talk spoken roleplay dialogues with Gemini LLM.

3. **📂 Import Media Workspace (`ImportMediaWorkspace`)**:
   - Zero-dependency client-side EPUB ingestion engine powered by native `DecompressionStream`.
   - Table of Contents navigation drawer for long literature.
   - Canvas-driven OCR document scanner for images and PDFs.
   - Timed `.srt` and `.vtt` interactive video subtitle player.
   - Lexical density analysis (Type-Token Ratio - TTR) and dynamic vocabulary extraction.

4. **🗂️ Review Workspace (`ReviewWorkspace`)**:
   - Audio-first active recall flashcards playing pronunciation before revealing characters.
   - SuperMemo-2 (SM-2) review queue persisted in IndexedDB with 4-tier grading.
   - Enhanced `HanziWriter` stroke writing practice canvas with stroke-order animations.
   - 28-day review activity heatmap and real-time reading speed analytics (CPM).
   - One-click Anki TSV deck export.

5. **🎯 Lesson Workspace (`LessonWorkspace`)**:
   - AI-generated 4-stage interactive Duolingo-style structured lessons (`LessonEngine`).
   - HSK 1–6 / HSK 3.0 international curriculum alignment.
   - SQA Higher Mandarin (SCQF Level 6) thematic syllabus explorer and essay prompts.
   - 50-question dynamic adaptive diagnostic placement test with automatic level calibration.

---

## 🎨 Modern Minimalist Design System

Inspired by Apple and Vercel:
- **Clean Typography**: Sans-serif interface typography (`-apple-system`, `Inter`) paired with clean Chinese sans fonts (`PingFang SC`, `Noto Sans SC`).
- **Centered Layout**: Centered flexbox layout architecture eliminating off-center drift.
- **Refined Monochrome Palette**: Clean neutral surfaces with pure black/white accents (`#000000`/`#FFFFFF`).
- **Pill Buttons & Soft Shadows**: Tactile pill buttons, crisp thin borders (`#E4E4E7`), and soft subtle shadows (`0 4px 20px rgba(0, 0, 0, 0.04)`).
- **Responsive Dark Mode**: Automatic system preference sync or manual light/dark toggle.

---

## 🚀 Quick Start

### 1. Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [npm](https://www.npmjs.com/)

### 2. Installation & Run
```bash
# Clone the repository
git clone https://github.com/JamesBeach1/mandarin-graded-reader.git
cd mandarin-graded-reader

# Install dependencies
npm install

# Start development server
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🔒 Zero-Backend Sovereignty & Privacy

All user data—including custom dictionary overrides, flashcard review intervals, saved stories, reading history, and audio pitch caches—is stored strictly client-side in browser **IndexedDB** and **localStorage**. No accounts or external database servers are required. Full multi-device state hydration is supported via downloadable encrypted JSON backup bundles.
