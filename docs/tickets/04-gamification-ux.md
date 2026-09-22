# Domain 4: Gamification, Tracking & UX (`GTU`)

**Backlog Domain Specification**  
**Target Subsystems:** `readingAnalytics.ts`, `stateHydration.ts`, `ReviewWorkspace.tsx`, UI Layout & Theming  
**Status:** Canonical Specifications (Do NOT action until scheduled)

---

## Ticket: `GTU-001` — Multi-Device Synchronization (CRDT / P2P)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 13 (Large)
* **Target Audience:** Learners studying across both mobile and desktop devices.

### 1. Problem Statement & Impact
Moyun currently operates entirely within local browser IndexedDB storage. If a user reads on desktop in the morning and reviews flashcards on mobile in the evening, progress does not sync without manual JSON file export/import. A conflict-free synchronization mechanism enables fluid multi-device usage without compromising zero-backend privacy.

### 2. Architectural Design & Affected Subsystems
* **CRDT Data Layer (`src/services/crdtSync.ts`):**
  Integrate `Yjs` or `Automerge` backed by IndexedDB.
* **Sync Transports:**
  1. *Cloud Relay (Zero-Knowledge E2EE):* Optional WebRTC signaling or lightweight WebSocket sync room using user's private sync key.
  2. *Cloud Storage Vault:* Optional Google Drive / WebDAV personal sync file.
* **Conflict Resolution:** Flashcard intervals merge using max timestamp; reading heatmaps merge via set union.

### 3. Acceptance Criteria
1. Changes made on one device propagate to another within 5 seconds when online.
2. Maintains full offline functionality; queues changes and merges cleanly upon reconnection.
3. End-to-end encrypted so user vocabulary data remains private.

---

## Ticket: `GTU-002` — Dynamic Reading Speed Tracker & History Analytics (CPM)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 3 (Small)
* **Target Audience:** Extensive readers monitoring fluency development over time.

### 1. Problem Statement & Impact
Characters Per Minute (CPM) is the standard objective metric for measuring reading fluency in logographic languages. While Moyun calculates real-time CPM in the toolbar, learners lack a historical analytics view showing how their reading speed accelerates across HSK levels over weeks and months.

### 2. Architectural Design & Affected Subsystems
* **Analytics Engine (`src/services/readingAnalytics.ts`):**
  Extend session logging to record: `timestamp`, `charactersRead`, `durationSeconds`, `hskLevel`, `calculatedCPM`.
* **Visualization Component (`src/components/ReadingAnalyticsChart.tsx`):**
  Render an interactive Line / Area chart in `ReviewWorkspace.tsx` graphing CPM trends over the last 30/90/365 days, segmented by HSK level.
* **Corpus Benchmarks:** Displays reference benchmarks (e.g. *HSK 1 beginner: 50 CPM, HSK 4 intermediate: 150 CPM, Native adult: 300–500 CPM*).

### 3. Acceptance Criteria
1. Automatically logs completed reading sessions without manual user intervention.
2. Graphs CPM progression over time with benchmark comparison lines.

---

## Ticket: `GTU-003` — Opt-in Community Leaderboards

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 5 (Medium)
* **Target Audience:** Competitive learners motivated by peer accountability and friendly benchmarks.

### 1. Problem Statement & Impact
Studying alone can lead to isolation and attrition. Opt-in leaderboards gamify reading volume (characters read per week, SRS reviews completed) while preserving Moyun's zero-tracking philosophy.

### 2. Architectural Design & Affected Subsystems
* **Backend Bridge (Optional / Serverless):**
  Lightweight Supabase or Cloudflare Worker accepting anonymous weekly aggregates:
  `{ anonymousHandle: string, weeklyChars: number, weeklyReviews: number, avatarIcon: string }`.
* **Privacy Controls:** 100% opt-in. Default is completely offline and invisible.
* **UI View:** A clean, editorial "Weekly Reading Cohort" leaderboard tab.

### 3. Acceptance Criteria
1. Users can opt in with a pseudonym to compare weekly character counts.
2. Leaderboard resets cleanly every Sunday at midnight UTC.
3. Never requires personal identifiers or emails.

---

## Ticket: `GTU-004` — Daily Reading Streaks & Calendar Heatmap

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 2 (Small)
* **Target Audience:** All learners establishing daily habit loops.

### 1. Problem Statement & Impact
Consistency is the single greatest predictor of language acquisition success. Missing days leads to insurmountable SRS backlogs. Visualizing daily streaks and activity heatmaps (similar to GitHub contributions) triggers powerful habit-reinforcement psychology.

### 2. Architectural Design & Affected Subsystems
* **Streak Calculator (`src/services/streakTracker.ts`):**
  Evaluate daily activity timestamps in `localStorage: characters_read_heatmap`:
  * Current active streak (consecutive calendar days with >= 100 characters read or 10 flashcards reviewed).
  * Longest historical streak.
  * Streak freeze mechanism (allow 1 missed day per month).
* **Header & Workspace UI:**
  Subtle flame/streak counter in `ReviewWorkspace.tsx` and calendar grid showing daily activity depth.

### 3. Acceptance Criteria
1. Accurately increments streak based on the learner's local timezone.
2. Celebrates streak milestones (7, 30, 100, 365 days) with subtle editorial badge unlocks.

---

## Ticket: `GTU-005` — Peer-to-Peer Story Sharing (JSON / QR Import)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Teachers, study groups, and community content creators.

### 1. Problem Statement & Impact
When a learner or teacher creates or discovers an outstanding graded story, sharing it currently requires manual text copy-pasting. A standardized 1-click sharing bundle (containing text, vocabulary tokens, custom overrides, and audio metadata) enables effortless sharing.

### 2. Architectural Design & Affected Subsystems
* **Bundle Format (`MoyunStoryBundle`):**
  ```typescript
  interface MoyunStoryBundle {
    version: '1.0';
    title: string;
    hskLevel: string;
    text: string;
    author?: string;
    vocabularyOverrides?: Record<string, { pinyin: string; definition: string }>;
    checksum: string;
  }
  ```
* **Sharing Transports:**
  1. *Compact URL:* Base64 URL parameter: `https://moyun.app/#import=<base64>`.
  2. *QR Code Generator:* Modal displays a scannable QR code for immediate mobile camera import.
  3. *File Export:* Download `.moyun.json` file.

### 3. Acceptance Criteria
1. Opening a share link instantly previews the story and prompts to import it into the local library.
2. Scannable QR code allows instant transfer from desktop monitor to mobile phone.

---

## Ticket: `GTU-006` — Tutor / Classroom Dashboard

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 13 (Large)
* **Target Audience:** Chinese language teachers and institutional classrooms.

### 1. Problem Statement & Impact
Educators want to assign specific graded readings to their classes and track which characters gave students the most difficulty. A dedicated Classroom Dashboard allows instructors to assign weekly stories and view aggregated cohort analytics.

### 2. Architectural Design & Affected Subsystems
* **Classroom Portal Architecture:**
  Multi-tenant workspace mode where teacher generates a classroom join code.
* **Student Telemetry:** Students export encrypted progress report bundles or sync to classroom room:
  * Characters read per assignment
  * Comprehension quiz scores
  * High-frequency lookups (which words the whole class struggled with)
* **Curriculum Publisher:** Teacher can push standardized graded stories directly into students' libraries.

### 3. Acceptance Criteria
1. Teachers can bundle assignments and monitor student completion rates.
2. Identifies class-wide vocabulary blind spots to inform lesson planning.

---

## Ticket: `GTU-007` — Interactive Dialogue Trees (Adventure Engine)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Gamified readers who enjoy text-based interactive fiction (CYOA).

### 1. Problem Statement & Impact
Moyun already features a "Choose Your Own Adventure" prompt input. Formalizing this into branching dialogue trees with distinct choices (e.g. Option A: Go to the police station; Option B: Enter the tea house) turns passive reading into an immersive interactive roleplaying game.

### 2. Architectural Design & Affected Subsystems
* **Branching Node Schema (`src/types/StoryGraph.ts`):**
  ```typescript
  interface StoryNode {
    id: string;
    text: string;
    tokens: HanziItem[];
    choices: { label: string; pinyin: string; nextNodeId: string }[];
  }
  ```
* **AI Continuation Engine (`src/services/gemini.ts`):**
  Prompt instructions demand structured JSON output containing 2–3 grammatically constrained choices for the user to pick from.
* **Visual Progress Map:** Displays branching graph showing visited vs unexplored story paths.

### 3. Acceptance Criteria
1. Each story chapter concludes with 2–3 actionable choices written in target HSK Chinese.
2. Clicking a choice generates the subsequent chapter coherently continuing the plot.
3. Preserves reading history across branches.

---

## Ticket: `GTU-008` — Export to PDF & Print Mode Optimization

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 2 (Small)
* **Target Audience:** Traditional learners and teachers preparing physical paper worksheets.

### 1. Problem Statement & Impact
Many learners experience digital screen fatigue and retain information better from physical paper. Providing dedicated `@media print` stylesheets ensures printing produces high-contrast, beautiful typography with optional Pinyin rubies and vocabulary glossaries.

### 2. Architectural Design & Affected Subsystems
* **Print Stylesheet (`src/App.css`):**
  * Strips all UI headers, navigation, buttons, and dark mode backgrounds.
  * Injects pure black text on pure white paper (`#000000` on `#FFFFFF`).
  * Formats typography using elegant Songti serif fonts with generous 2.4 line height.
* **Vocabulary Footnotes:** Automatically appends an alphabetical glossary of difficult characters at the bottom of the printed page.

### 3. Acceptance Criteria
1. Window print / PDF export is clean, margin-balanced, and zero-waste.
2. Optional checkbox before printing: *"Include Pinyin Rubies"* and *"Include Vocabulary Glossary"*.

---

## Ticket: `GTU-009` — Full-Screen Focus Mode Drawer

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 2 (Small)
* **Target Audience:** Readers looking for deep, meditative reading without distractions.

### 1. Problem Statement & Impact
Visual clutter (buttons, badges, metrics, navigations) induces cognitive fatigue during 30+ minute reading sessions. Full-Screen Focus Mode completely hides all UI controls, leaving only pure, distraction-free Chinese typography centered on screen.

### 2. Architectural Design & Affected Subsystems
* **Reading Theater Extension (`src/components/ReadingTheater.tsx`):**
  Expand existing `isFocusMode` state:
  * Transitions reader into full viewport immersion (`100vw`, `100vh`).
  * Auto-hides toolbar into a subtle hover trigger at the top edge.
  * Pressing `Escape` or clicking `Exit Focus Mode` smoothly restores normal layout.
* **Keyboard Navigation:** Support `ArrowLeft` / `ArrowRight` to step through pacing sentences.

### 3. Acceptance Criteria
1. Zero non-story elements visible during active focus reading.
2. Ambient lighting adjustment: softens background contrast for nighttime reading.

---

## Ticket: `GTU-010` — Memory Palace Integrations (Method of Loci)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 13 (Large)
* **Target Audience:** Mnemonic champions and spatial learners.

### 1. Problem Statement & Impact
The ancient Method of Loci (Memory Palace) is proven to be the most potent mnemonic technique for ordered recall. Associating Chinese characters, their radicals, and tonal colors with specific physical locations in a familiar room anchors them permanently in memory.

### 2. Architectural Design & Affected Subsystems
* **Spatial Room Engine (`src/components/MemoryPalaceCanvas.tsx`):**
  Lightweight 2D/2.5D interactive floor plan (or Three.js room) where users map vocabulary items to spatial "loci" (e.g. The Front Door, The Kitchen Counter, The Study Desk).
* **Mnemonic Attachment:** Each locus stores the character, its radical breakdown, tone color, and a vivid user-written scene.
* **Walkthrough Mode:** User can "walk" through their palace in sequence to review cards.

### 3. Acceptance Criteria
1. Users can create customized virtual rooms with spatial anchor points.
2. Links directly with the SRS review schedule.
