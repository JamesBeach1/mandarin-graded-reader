# Domain 2: Audio, Listening & Speaking (`ALS`)

**Backlog Domain Specification**  
**Target Subsystems:** `azureSpeech.ts`, `SpeakingWorkspace.tsx`, `ShadowingStudio.tsx`, `ConversationalVoiceAgent.tsx`, Audio Players  
**Status:** Canonical Specifications (Do NOT action until scheduled)

---

## Ticket: `ALS-001` — Hover-to-Play Audio Narration

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 2 (Small)
* **Target Audience:** Readers looking to quickly verify pronunciation without stopping full narration.

### 1. Problem Statement & Impact
Currently, playing audio requires either starting full-story narration or opening the character inspection modal. A lightweight hover-to-play option (e.g. holding `Alt` or enabling a hover mode) lets learners hear any character or compound instantly with zero clicks.

### 2. Architectural Design & Affected Subsystems
* **Component Layer (`src/components/ReadingTheater.tsx`):**
  Add a `hoverAudioEnabled` toggle in settings. When active, hovering over a `HanziChip` with a 300ms debounce calls `AzureSpeechService.speak(token.character)`.
* **Audio Concurrency:** Ensure hovering a new character immediately halts any previous single-character audio snippet without triggering full-sentence narration logic.

### 3. Acceptance Criteria
1. Hovering over a word speaks its native pronunciation cleanly once.
2. Does not conflict with active sentence Read Aloud pacing.
3. Debounced to prevent accidental audio triggers when moving mouse across the screen.

---

## Ticket: `ALS-002` — Minimal Pairs Listening Drills

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Beginners and intermediates struggling with phonemic distinction.

### 1. Problem Statement & Impact
Non-native speakers frequently fail to distinguish contrasting phonemes that do not exist in their native language:
* Retroflex vs Dental sibilants: `sh` vs `s`, `zh` vs `z`, `ch` vs `c`
* Aspirated vs Unaspirated: `p` vs `b`, `t` vs `d`, `k` vs `g`
* Front vs Back nasals: `-in` vs `-ing`, `-en` vs `-eng`
Dedicated minimal pair tests train auditory discrimination.

### 2. Architectural Design & Affected Subsystems
* **Drill Generator Service (`src/services/minimalPairsEngine.ts`):**
  Curated dataset of 200+ minimal pair contrasts (e.g., `四 sì` vs `十 shí`, `知道 zhīdao` vs `指导 zhǐdào`).
* **Interactive UI Component (`src/components/MinimalPairsDrill.tsx`):**
  Renders A/B listening choices: Plays an audio clip, user selects whether they heard Option A or Option B, with immediate visual pitch feedback.
* **Workspace Integration:** Accessible under a dedicated tab in `SpeakingWorkspace.tsx`.

### 3. Acceptance Criteria
1. Plays audio with high-fidelity native voice without revealing the Hanzi or Pinyin upfront.
2. User selects between the two contrasting options; displays instant accuracy feedback and acoustic comparison.
3. Tracks accuracy stats by phoneme pair category.

---

## Ticket: `ALS-003` — Tonal Pair Practice (2-Syllable Sandhi)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners struggling with conversational sentence melody and tone flow.

### 1. Problem Statement & Impact
Isolated single-character tones are rarely spoken in isolation. Conversational Mandarin is dominated by two-character tone pairs ($4 \times 5 = 20$ combinations, e.g., 2nd + 4th tone `学习`, 3rd + 3rd tone sandhi `你好` -> 2nd + 3rd, 4th + neutral `客气`). Learners who master two-syllable pairings unlock fluent speech cadence.

### 2. Architectural Design & Affected Subsystems
* **Data Matrix (`src/data/tonePairs.ts`):**
  Complete matrix of all 20 tone pair combinations populated with high-frequency HSK 1–3 words.
* **Visualization (`src/components/ToneVisualizerCanvas.tsx`):**
  Extend pitch contour tracking from 1 character to continuous 2-character contours showing smooth transitions and Tone 3 half-tone dipping rules.
* **Scoring Algorithm:** Compare user F0 fundamental frequency trajectory across both syllables simultaneously.

### 3. Acceptance Criteria
1. Provides structured drills for all 20 tone pair combinations.
2. Correctly renders and explains tone sandhi rules (e.g., 3-3 -> 2-3, 不 and 一 tone modifications).
3. Graphs user pitch alongside native benchmark.

---

## Ticket: `ALS-004` — Regional Dialect & Accent Toggles (Erhua/Taiwan)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Low
* **Story Points:** 5 (Medium)
* **Target Audience:** Advanced learners preparing for real-world travel and localized immersion.

### 1. Problem Statement & Impact
Standard Putonghua taught in textbooks differs markedly from colloquial accents:
* Northern Mandarin: Heavy rhotic suffixation (儿化音 Erhua, e.g. `哪儿`, `一点儿`, `聊天儿`).
* Southern / Taiwanese Mandarin: Merging retroflexes (`zh/ch/sh` -> `z/c/s`), omission of neutral tones, softening final particles.
Exposing learners to accents builds resilience against real-world listening shock.

### 2. Architectural Design & Affected Subsystems
* **Voice Model Mapping (`src/services/azureSpeech.ts`):**
  Configure regional neural voice profiles:
  * `zh-CN-BeijingNeural` or SSML phonetic rules for Erhua
  * `zh-TW-HsiaoChenNeural` / `zh-TW-YunJheNeural` (Taiwanese Mandarin)
  * `zh-HK-WanLungNeural` (Hong Kong Mandarin accent)
* **Text Adaptation Filter:** Optional toggle in Reading Theater to automatically append standard Erhua characters where natural in northern vernacular.

### 3. Acceptance Criteria
1. User can switch narration between Standard Northern, Beijing Erhua, and Taiwanese Mandarin.
2. Neural voices authentically capture regional cadence, tonal sandhi, and intonation shifts.

---

## Ticket: `ALS-005` — Video Subtitle Syncing (YouTube / Bilibili)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 13 (Large)
* **Target Audience:** Media-focused extensive learners and drama/vlog watchers.

### 1. Problem Statement & Impact
Consuming native video content on YouTube, Bilibili, or local media is the most engaging form of immersion. However, native subtitles fly by too quickly for learners to parse or look up words. Syncing video playback with Moyun's interactive reader creates an active learning environment.

### 2. Architectural Design & Affected Subsystems
* **Ingestion Pipeline (`src/components/ImportMediaWorkspace.tsx`):**
  Accept video URL (YouTube iframe or direct MP4) + subtitle file (`.srt`, `.vtt`) or auto-fetch subtitles via YouTube Data API.
* **Timestamped Reader Player (`src/components/VideoReadingPlayer.tsx`):**
  Split-screen layout: Embedded video on top/left, synchronized scrollable Chinese transcript below/right.
* **Timecode Alignment:** Highlight current active subtitle token based on `video.currentTime`. Clicking any word pauses the video and opens the Hanzi dictionary tooltip.

### 3. Acceptance Criteria
1. Video and interactive transcript remain synchronized within 100ms.
2. Clicking a subtitle line jumps video playback directly to that timestamp.
3. Every word in the transcript is clickable for instant definitions, Pinyin, and SRS addition.

---

## Ticket: `ALS-006` — Podcast Transcription Engine

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 13 (Large)
* **Target Audience:** Intermediate and Advanced auditory learners.

### 1. Problem Statement & Impact
Native podcasts (e.g. StoryFM 故事FM, Mandarin Bean, ChinesePod) offer authentic listening practice, but many episodes lack complete written transcripts. Translating audio to graded reading material unlocks thousands of hours of native content.

### 2. Architectural Design & Affected Subsystems
* **Audio Input:** File dropzone accepting `.mp3`, `.m4a`, or podcast RSS feed audio stream.
* **Speech-to-Text Transcription Service:**
  Integrate client-side Whisper (via WebAssembly Whisper.cpp) or Azure Speech Fast Transcription REST API.
* **Post-processing Pipeline:** Segment recognized Chinese text, apply Moyun dictionary tokenization, and automatically generate a Graded Story entry in the library.

### 3. Acceptance Criteria
1. Users can upload an audio file or paste an audio URL.
2. Produces a complete, formatted Chinese transcript with Pinyin and dictionary tokens.
3. Automatically computes the transcript's HSK level distribution.

---

## Ticket: `ALS-007` — Audio-Only Commute Mode (Hands-Free SRS)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 5 (Medium)
* **Target Audience:** Commuters, runners, and drivers who study without looking at screens.

### 1. Problem Statement & Impact
Learners spend hours each week walking, driving, or commuting where screen interaction is unsafe or impossible. An audio-only spaced repetition loop prompts the learner verbally, pauses for recall, and then speaks the answer and example sentence.

### 2. Architectural Design & Affected Subsystems
* **SRS Audio Loop Service (`src/services/commuteAudioEngine.ts`):**
  Iterates over due cards from `getDueCards()`:
  1. Speaks prompt in English (e.g. *"To study; to learn"*).
  2. Pauses for user mental recall (configurable 2–5 seconds).
  3. Speaks Chinese word + tone: *"学习 xuéxí"*.
  4. Speaks contextual example sentence: *"我在大学学习中文。"*.
  5. Advances to next card automatically.
* **MediaSession API Integration:**
  Registers standard Bluetooth headphone control events (`play`, `pause`, `nexttrack` to rate card Easy, `previoustrack` to rate card Hard).

### 3. Acceptance Criteria
1. Operates continuously in background tabs and mobile lock-screens via HTML5 audio background playback.
2. Responds to headphone physical button presses for hands-free SRS grading.

---

## Ticket: `ALS-008` — Sentence Mixing (Auditory Jigsaw)

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Learners reinforcing Chinese syntactic word order through listening.

### 1. Problem Statement & Impact
Chinese grammatical fluency requires internalizing that time, location, and adverbials precede verbs. The Auditory Jigsaw plays a full native audio sentence, scrambles the token chips on screen, and challenges the user to reconstruct the sentence in correct syntactic order based strictly on what they heard.

### 2. Architectural Design & Affected Subsystems
* **Game Component (`src/components/SentenceMixingGame.tsx`):**
  Accepts any sentence from the reading text or curriculum lesson.
* **Mechanics:**
  * Plays native audio via `AzureSpeechService.speak(sentence)`.
  * Shuffles tokens into draggable/clickable word blocks.
  * User clicks tokens in correct sequence.
  * Re-play audio button with `0.8x` slow option.
* **Immediate Feedback:** Confirms correct syntactic ordering with subtle bamboo green indicator or seal red error retry.

### 3. Acceptance Criteria
1. Words are correctly segmented before shuffling so compounds (e.g. `咖啡店`) remain intact.
2. Gives auditory replay support without giving away the written solution.

---

## Ticket: `ALS-009` — Conversational Roleplay Chatbots (Situational Personas)

* **Status:** `Backlog (Unassigned)`
* **Priority:** High
* **Story Points:** 8 (Large)
* **Target Audience:** Learners suffering from foreign language speaking anxiety.

### 1. Problem Statement & Impact
Speaking with native tutors is expensive and often provokes intense performance anxiety for beginners. Extending the existing `ConversationalVoiceAgent.tsx` into targeted situational roleplays (ordering at a restaurant, checking into a Beijing hotel, haggling at an electronics market) provides low-stakes verbal simulation.

### 2. Architectural Design & Affected Subsystems
* **Persona Configuration Engine (`src/data/roleplayPersonas.ts`):**
  Defines personas with system prompts, target HSK levels, scenario goals, and specialized vocabulary:
  * *The Shanghai Barista* (ordering coffee, dietary preferences)
  * *The Friendly Didi Driver* (asking about hometown, weather, traffic)
  * *The Apartment Landlord* (discussing rent, repairs, utility bills)
* **State & Speech Loop (`src/components/ConversationalVoiceAgent.tsx`):**
  * System prompt instructs Gemini to keep responses within user's calibrated HSK level.
  * Provides hints when user hesitates or stays silent for > 5 seconds.

### 3. Acceptance Criteria
1. User can choose from a library of 10+ realistic situational dialogues.
2. AI persona replies with authentic neural voice synthesis matching the persona's age and character.
3. Provides live English translation and grammar coaching if user gets stuck.

---

## Ticket: `ALS-010` — Pronunciation Weakness Heatmap

* **Status:** `Backlog (Unassigned)`
* **Priority:** Medium
* **Story Points:** 5 (Medium)
* **Target Audience:** Intermediate speakers refining accent and tone accuracy.

### 1. Problem Statement & Impact
Learners often make consistent phonological errors without realizing it (e.g. regularly pronouncing 2nd tone as 1st tone, or failing to aspirate `p/t/k`). A persistent diagnostic heatmap visually tracks where errors accumulate across all speaking and shadowing exercises.

### 2. Architectural Design & Affected Subsystems
* **Analytics Store (`src/services/pronunciationStore.ts`):**
  Record outcomes of Web Speech Recognition and Shadowing attempts by Pinyin initial, final, and tone number into IndexedDB.
* **Visual Matrix UI (`src/components/PronunciationHeatmap.tsx`):**
  Grid displaying:
  * All Initials (`b, p, m, f, d, t, n, l, g, k, h, j, q, x, zh, ch, sh, r, z, c, s`)
  * All Finals (`a, o, e, i, u, ü, ai, ei, ao, ou, an, en, ang, eng, ong...`)
  * Tones (1, 2, 3, 4, 5)
  Cell color indicates mastery (bamboo green = high accuracy, seal red = high error rate).

### 3. Acceptance Criteria
1. Updates automatically whenever user records shadowing or voice agent exercises.
2. Clicking a red cell generates a focused 5-minute drill targeting that specific sound.
