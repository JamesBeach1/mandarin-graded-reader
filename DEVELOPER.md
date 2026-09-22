# Mandarin Graded Reader — Developer Guide 🛠️

This guide is designed for human developers and future AI coding agents. It provides an operational breakdown of the system architecture, component contracts, data flows, and subsystem implementations.

> **Canonical Architecture Documents:**  
> - **[SYSTEM_SPEC.md](./SYSTEM_SPEC.md)**: Master System Architecture & Design Specification.  
> - **[NEXT_GEN_TRACKER.md](./NEXT_GEN_TRACKER.md)**: Audit and Verification matrix tracking all 36 features and 5 pillars.  
> - **[FEATURES.md](./FEATURES.md)**: Complete functional breakdown of all platform capabilities.  
> - **[`docs/`](./docs/)**: Modular architectural deep-dives for individual subsystems.

---

## 📂 Codebase & Directory Map

```
mandarin-graded-reader/
├── docs/                       # Modular Subsystem Deep Dives
│   ├── features.md             # Functional breakdown
│   ├── styling-and-design-system.md # Organic pigment design tokens, vertical layout
│   ├── data-storage.md         # CSV schemas, IndexedDB specs, SM-2 math, state hydration
│   ├── ai-services.md          # Gemini models, prompts, SSML synthesis, voice loop
│   ├── nlp-tokenization.md     # Intl.Segmenter, polyphones, grammar, TTR density
│   ├── lesson-engine.md        # Duolingo-style state machine, exercise payloads
│   ├── audio-tts.md            # Azure Neural TTS, SSML compiler, audio chunking, Web Speech
│   └── pwa-and-offline.md      # Workbox precaching, manifest, offline status
├── public/                     # Static assets served at root
│   ├── favicon.svg             # Application seal icon
│   ├── hanziDB.csv             # Primary character database (~10,000 entries)
│   ├── manifest.json           # PWA standalone web app manifest
│   └── vocabDB.csv             # Compound vocabulary database
├── src/
│   ├── components/             # Reusable UI & Workspace Components
│   │   ├── exercises/          # 4-stage interactive lesson exercises
│   │   │   ├── DialogueReading.tsx  # Stage 4: Dialogue reading & line audio
│   │   │   ├── MultipleChoice.tsx   # Stage 2: 2x2 grid quiz with shake animation
│   │   │   ├── SentenceBuilder.tsx  # Stage 3: Word bank puzzle with syntax check
│   │   │   └── VocabIntro.tsx       # Stage 1: Card carousel with audio verification
│   │   ├── AudioFirstFlashcard.tsx  # Listening-first SRS review card
│   │   ├── ConversationalVoiceAgent.tsx # Real-time push-to-talk voice dialogue agent
│   │   ├── DiagnosticTestModal.tsx  # 50-question dynamic placement test modal
│   │   ├── ImportMediaWorkspace.tsx # Dedicated media ingestion workspace (EPUB, OCR, Subtitles)
│   │   ├── LessonEngine.tsx    # Interactive lesson coordinator
│   │   ├── LessonWorkspace.tsx # Dedicated lesson workspace (HSK, SCQF, Diagnostic)
│   │   ├── MediaIngestionWorkspace.tsx # EPUB reader, OCR scanner & subtitle player
│   │   ├── OfflineStatusIndicator.tsx # Network state badge
│   │   ├── PronunciationStudio.tsx # Coordinator for tone canvas, shadowing, voice agent
│   │   ├── RadicalDecomposition.tsx # Kangxi radical and stroke breakdown tooltip
│   │   ├── ReadingTheater.tsx  # Vertical/horizontal reader with pacing & branching
│   │   ├── ReadingWorkspace.tsx # Dedicated reading workspace (Generator, Theater, Library)
│   │   ├── ReviewWorkspace.tsx # Dedicated SRS review dashboard (Flashcards, Heatmap, CPM)
│   │   ├── ShadowingStudio.tsx # Sentence shadowing with back-to-back audio comparison
│   │   ├── SpeakingWorkspace.tsx # Dedicated speaking workspace (Tone Visualizer, Shadowing, Voice)
│   │   ├── SrsHeatmap.tsx      # 28-day review activity heatmap in Bamboo green
│   │   ├── TocDrawer.tsx       # Table of contents drawer for long texts & EPUBs
│   │   ├── ToneVisualizerCanvas.tsx # Real-time HTML5 canvas tone curve visualizer
│   │   └── VideoSubtitleReader.tsx # Timed .srt/.vtt subtitle player
│   ├── services/               # Data Layer & External Subsystems
│   │   ├── ankiExport.ts       # Anki TSV flashcard deck exporter
│   │   ├── audioCache.ts       # SHA-256 IndexedDB audio blob cache
│   │   ├── audioChunker.ts     # Semantic text segmenter for audio streaming
│   │   ├── audioPitchCache.ts  # IndexedDB store for calculated pitch curves
│   │   ├── azureSpeech.ts      # Azure Neural TTS with SSML compilation & fallback
│   │   ├── cloudSync.ts        # Snapshot export/import & CRDT sync schema
│   │   ├── curriculum.ts       # HSK 1-6 and SCQF Level 6 standards definition
│   │   ├── dictionaryStore.ts  # IndexedDB adapter for user overrides
│   │   ├── epubParser.ts       # Zero-dependency client-side EPUB parser
│   │   ├── gemini.ts           # Gemini API client for structured lessons
│   │   ├── libraryStore.ts     # IndexedDB adapter for saved stories
│   │   ├── ocrService.ts       # Local canvas-based OCR scanner
│   │   ├── pitchTracker.ts     # Autocorrelation F0 pitch extraction & DTW scoring
│   │   ├── pronunciationAssessment.ts # Phoneme & acoustic pronunciation scorer
│   │   ├── readingAnalytics.ts # Characters Per Minute (CPM) reading speed tracker
│   │   ├── semanticSearch.ts   # Inverted index search engine for story library
│   │   ├── speechRecognition.ts # Browser speech recognition engine wrapper
│   │   ├── srsStore.ts         # IndexedDB adapter for SM-2 flashcard scheduler
│   │   ├── stateHydration.ts   # Full-platform JSON backup & merge engine
│   │   ├── subtitleParser.ts   # SRT and VTT subtitle file parser
│   │   └── themeEngine.ts      # Traditional mineral pigment theme manager
│   ├── types/                  # TypeScript Schema Contracts
│   │   ├── hanzi-writer.d.ts   # Ambient types for external HanziWriter CDN
│   │   ├── HanziItem.ts        # Hanzi item schema
│   │   ├── Lesson.ts           # Lesson schema and exercise payloads
│   │   └── ToolTip.ts          # Hover tooltip data contract
│   ├── utils/                  # NLP, Scoring & String Utilities
│   │   ├── grammarHighlighter.ts # HSK functional grammar pattern matcher
│   │   ├── homophoneDetector.ts  # Polyphone (多音字) detector
│   │   ├── iconMap.ts          # Category icon resolver
│   │   ├── lexicalDensity.ts   # Type-Token Ratio (TTR) analyzer
│   │   ├── tokenizer.ts        # Intl.Segmenter word segmentation cascade
│   │   └── vocabExtractor.ts   # Dynamic target vocabulary extractor
│   ├── App.css                 # Master print-inspired styling & layout system
│   ├── App.tsx                 # Master coordinator for 5 isolated workspaces
│   ├── HanziPracticeModal.tsx  # Writing practice modal wrapping HanziWriter
│   └── main.tsx                # Entrypoint
├── copy-db.js                  # Predev script copying CSVs to public/
├── index.html                  # HTML entrypoint
├── package.json                # Project dependencies
├── NEXT_GEN_TRACKER.md         # 36-feature verification and audit tracker
└── SYSTEM_SPEC.md              # Global Master Architecture Specification
```

---

## 🚀 Development Quickstart

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm 9+

### Installation & Run
```bash
# Install dependencies
npm install

# Start local development server (automatically runs predev copy-db.js)
npm run dev

# Build for production
npm run build
```

---

## 🧩 Architectural Invariants & Rules

1. **Zero-Backend Requirement**: No user data, flashcards, audio clips, or reading history should ever require an external backend server. Everything must persist in client storage (IndexedDB / localStorage).
2. **Graceful Fallbacks**: When external APIs (Azure Speech, Gemini) lack API keys or fail, the system must seamlessly fall back to local browser capabilities (Web Speech API, local acoustic scoring, offline dictionary).
3. **Purity of Typing**: All files must strictly pass TypeScript verification with complete interfaces.
