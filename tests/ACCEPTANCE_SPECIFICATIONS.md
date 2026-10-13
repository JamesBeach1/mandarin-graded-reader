# Moyun (墨韵) Mandarin Graded Reader — Master BDD Acceptance Specifications

This document defines the exhaustive Behavior-Driven Development (BDD) specification matrix for the Moyun Mandarin Graded Reader application. Each requirement is specified in standard Gherkin syntax (`Feature`, `Scenario`, `Given`, `When`, `Then`) and directly mapped to automated acceptance tests in `tests/acceptance/`.

---

## Table of Contents
1. [FT-TOK: Tokenization, Word Segmentation & Compound Lookups](#ft-tok-tokenization-word-segmentation--compound-lookups)
2. [FT-TRC-001: Simplified ⇄ Traditional Script Conversion](#ft-trc-001-simplified--traditional-script-conversion)
3. [FT-TRC-002: Zhuyin / Bopomofo Phonetic Conversion](#ft-trc-002-zhuyin--bopomofo-phonetic-conversion)
4. [FT-TRC-003: 5-Tone Visual Colorizer & Diacritic Extraction](#ft-trc-003-5-tone-visual-colorizer--diacritic-extraction)
5. [FT-LEX: Lexical Density, Type-Token Ratio & HSK Difficulty Estimation](#ft-lex-lexical-density-type-token-ratio--hsk-difficulty-estimation)
6. [FT-VOCAB: Target Vocabulary Extraction Above User Threshold](#ft-vocab-target-vocabulary-extraction-above-user-threshold)
7. [FT-GRAM: Chinese Grammar Pattern Rule Engine & Highlighter](#ft-gram-chinese-grammar-pattern-rule-engine--highlighter)
8. [FT-HOMO: Contextual Polyphone (多音字) & Confusable Homophone Warning](#ft-homo-contextual-polyphone-多音字--confusable-homophone-warning)
9. [FT-SYN: In-Memory Synonym Ladder & Real-Time Simplifier](#ft-syn-in-memory-synonym-ladder--real-time-simplifier)
10. [FT-CHENGYU: Chengyu (成语) Four-Character Idiom Knowledge Base](#ft-chengyu-chengyu-成语-four-character-idiom-knowledge-base)
11. [FT-SRS: Spaced Repetition (SM-2) Interval Calculation & Deck Management](#ft-srs-spaced-repetition-sm-2-interval-calculation--deck-management)
12. [FT-IRT: Adaptive Item Response Theory (IRT) Confidence & Remedial Generator](#ft-irt-adaptive-item-response-theory-irt-confidence--remedial-generator)
13. [FT-SUB: Timed Subtitle (.srt / .vtt) Parser](#ft-sub-timed-subtitle-srt--vtt-parser)
14. [FT-SHARE: Peer-to-Peer Story Sharing (.moyun.json & URL Hash)](#ft-share-peer-to-peer-story-sharing-moyunjson--url-hash)
15. [FT-ANKI: Anki & Pleco TSV Flashcard Export](#ft-anki-anki--pleco-tsv-flashcard-export)
16. [FT-CPM: Reading Speed Analytics & Characters Per Minute (CPM)](#ft-cpm-reading-speed-analytics--characters-per-minute-cpm)
17. [FT-STORAGE: Centralized StorageService & Type-Safe Persistence](#ft-storage-centralized-storageservice--type-safe-persistence)
18. [FT-TOAST: In-App Toast Notification & Dialog Promises](#ft-toast-in-app-toast-notification--dialog-promises)
19. [FT-SEARCH: Semantic Inverted-Index Story Library Search](#ft-search-semantic-inverted-index-story-library-search)
20. [FT-ADV: Adventure Branch Constrained Narrative Generator](#ft-adv-adventure-branch-constrained-narrative-generator)
21. [FT-DICT: Multi-Tier Dictionary Relevance Search & Toneless Stripping](#ft-dict-multi-tier-dictionary-relevance-search--toneless-stripping)
22. [FT-COMP: Multi-Character Compound Resolution & Decomposition](#ft-comp-multi-character-compound-resolution--decomposition)
23. [FT-GEMINI: Dynamic Model Discovery & Self-Healing Engine](#ft-gemini-dynamic-model-discovery--self-healing-engine)
24. [FT-WRITER: AI Grader for Free Writing & Composition (AIM-001)](#ft-writer-ai-grader-for-free-writing--composition-aim-001)
25. [FT-STROKE: Rice-Grid Calligraphic Stroke Rules & Catalog (AIM-010)](#ft-stroke-rice-grid-calligraphic-stroke-rules--catalog-aim-010)
26. [FT-SYLLABUS: Generative Syllabus & Course DAG Normalization](#ft-syllabus-generative-syllabus--course-dag-normalization)
27. [FT-UX-FLOWS: End-to-End User Experience State Machine](#ft-ux-flows-end-to-end-user-experience-state-machine)

---

### FT-TOK: Tokenization, Word Segmentation & Compound Lookups

#### Scenario: Segmentation of multi-character compound words using Intl.Segmenter
- **Given** a sentence containing multi-character words like "燕麦奶拿铁" and "图书馆"
- **And** loaded single-character Hanzi and multi-character vocabulary databases
- **When** `tokenizeStory` is executed on the text
- **Then** compound words should be grouped as coherent tokens rather than split into isolated characters
- **And** each token should contain character glyphs, pinyin, definition, and non-Chinese flags.

#### Scenario: Preservation of punctuation, whitespace, and non-Chinese characters
- **Given** an input text containing mixed characters: "你好，world! 123"
- **When** `tokenizeStory` parses the mixed string
- **Then** non-Chinese characters and punctuation should be flagged with `isNonChinese = true`
- **And** Chinese characters should be flagged with `isNonChinese = false`
- **And** the original order and glyph count must remain invariant.

#### Scenario: 4-character Chengyu boundary recognition across segment boundaries
- **Given** an input text containing the idiom "守株待兔"
- **When** `tokenizeStory` processes the segment stream
- **Then** the 4 characters must be coalesced into a single Chengyu token with level 5 and idiomatic definition.

#### Scenario: Custom vocabulary overrides take precedence over dictionary entries
- **Given** a custom override for character "行" with pinyin "háng" and definition "row / bank"
- **When** `tokenizeStory` parses "银行" with overrides provided
- **Then** the token for "行" must reflect the override values rather than the default dictionary entry.

---

### FT-TRC-001: Simplified ⇄ Traditional Script Conversion

#### Scenario: Conversion of Simplified Chinese to Traditional Chinese
- **Given** a Simplified Chinese sentence "这门语言非常有趣，我想学好它"
- **When** `toTraditional` is called on the sentence
- **Then** all characters with traditional variants must convert accurately: "這門語言非常有趣，我想學好它"
- **And** characters without variants must remain unchanged.

#### Scenario: Conversion of Traditional Chinese back to Simplified Chinese
- **Given** a Traditional Chinese sentence "這是繁體中文測試"
- **When** `toSimplified` is called on the sentence
- **Then** all glyphs must convert back to their Simplified counterparts: "这是繁体中文测试".

#### Scenario: Variant detection and query helpers
- **Given** character "国" and character "人"
- **When** `hasTraditionalVariant` and `getTraditionalVariant` are queried
- **Then** "国" must return `true` with variant "國"
- **And** "人" must return `false` with variant `null`.

#### Scenario: Bidirectional idempotency of conversion
- **Given** an arbitrary string of Chinese text
- **When** converted with `convertScript(text, 'simplified')` on already simplified text
- **Then** the resulting string must strictly equal the input text.

---

### FT-TRC-002: Zhuyin / Bopomofo Phonetic Conversion

#### Scenario: Single syllable conversion with tone marks
- **Given** Pinyin syllables: "mā", "má", "mǎ", "mà", "ma"
- **When** `pinyinSyllableToZhuyin` is called on each syllable
- **Then** tone 1 must return unmarked "ㄇㄚ"
- **And** tone 2 must return "ㄇㄚˊ"
- **And** tone 3 must return "ㄇㄚˇ"
- **And** tone 4 must return "ㄇㄚˋ"
- **And** neutral tone (tone 5) must return prefixed dot "˙ㄇㄚ".

#### Scenario: Multi-syllable phrases with punctuation
- **Given** a phrase with spaces and diacritics: "nǐ hǎo, shìjiè!"
- **When** `pinyinToZhuyin` is executed on the phrase
- **Then** it should return "ㄋㄧˇ ㄏㄠˇ, ㄕˋㄐㄧㄝˋ!" preserving spacing and punctuation.

#### Scenario: Numeric Pinyin fallback support
- **Given** numeric tone notation like "zhong1 wen2"
- **When** parsed into Zhuyin
- **Then** the syllables must accurately map to "ㄓㄨㄥ ㄨㄣˊ".

---

### FT-TRC-003: 5-Tone Visual Colorizer & Diacritic Extraction

#### Scenario: Accurate tone number extraction from diacritics
- **Given** syllables with standard diacritics: "gāo", "hóng", "dǎ", "kàn", "de"
- **When** `getToneNumber` is executed on each syllable
- **Then** tone numbers returned must be 1, 2, 3, 4, and 5 respectively.

#### Scenario: Accurate tone number extraction from trailing digits
- **Given** syllables with numeric endings: "hao3", "ma5", "yi1", "shi4", "ren2"
- **When** `getToneNumber` is evaluated
- **Then** the exact trailing integer must be returned as tone number (3, 5, 1, 4, 2).

#### Scenario: Tone color hex mapping
- **Given** tones 1 through 5
- **When** `getToneColor` is evaluated
- **Then** tone 1 must map to `#e06c75` (Coral Red)
- **And** tone 2 must map to `#98c379` (Grass Green)
- **And** tone 3 must map to `#e5c07b` (Golden Amber)
- **And** tone 4 must map to `#61afef` (Azure Blue)
- **And** tone 5 must map to `#9ca3af` (Muted Slate).

---

### FT-LEX: Lexical Density, Type-Token Ratio & HSK Difficulty Estimation

#### Scenario: Calculation of Type-Token Ratio (TTR) and character counts
- **Given** a tokenized passage containing 10 Chinese characters with 5 unique glyphs
- **When** `analyzeLexicalDensity` evaluates the token list
- **Then** `totalCharacters` must equal 10
- **And** `uniqueCharacters` must equal 5
- **And** `typeTokenRatio` must equal 0.500
- **And** `lexicalDensityPercentage` must equal 50.

#### Scenario: Weighted HSK difficulty level estimation
- **Given** a passage containing predominantly HSK 1 and HSK 2 tokens
- **When** `analyzeLexicalDensity` computes the HSK distribution
- **Then** `hskDistribution` must calculate correct percentage breakdowns per level
- **And** `estimatedHSKLevel` must round to the weighted average level.

#### Scenario: Non-Chinese tokens do not skew character counts
- **Given** a text with English words, punctuation, and emojis alongside Chinese characters
- **When** `analyzeLexicalDensity` runs
- **Then** non-Chinese tokens are excluded from `totalCharacters` and `uniqueCharacters`.

---

### FT-VOCAB: Target Vocabulary Extraction Above User Threshold

#### Scenario: Filter vocabulary exceeding the user's known HSK level
- **Given** a token list with HSK 1, HSK 2, HSK 4, and HSK 5 words
- **When** `extractTargetVocabulary` is run with `userKnownHskLevel = 2`
- **Then** only tokens with HSK > 2 or unknown/custom levels must be returned
- **And** HSK 1 and HSK 2 words must be completely excluded.

#### Scenario: Deduplication and frequency descending sort
- **Given** an unknown word appearing 5 times and another unknown word appearing 2 times
- **When** target vocabulary is extracted
- **Then** the word appearing 5 times must be ranked first with `occurrenceCount = 5`
- **And** each unique word must appear exactly once in the list.

---

### FT-GRAM: Chinese Grammar Pattern Rule Engine & Highlighter

#### Scenario: Detection of locational frameworks (在...里/中/上)
- **Given** a sentence "我在房间里看书"
- **When** `findGrammarPatterns` analyzes the sentence
- **Then** a match for "在...里/中/上 (Locational Framework)" must be returned
- **And** `matchedText` must encompass "在房间里" with correct start and end indices.

#### Scenario: Detection of causal constructions (因为...所以...)
- **Given** a sentence "因为下雨，所以我们没去公园"
- **When** `findGrammarPatterns` parses the text
- **Then** a match for "因为...所以... (Causal Construction)" must be identified at HSK Level 2.

#### Scenario: Chronological ordering of pattern matches
- **Given** a complex text with multiple overlapping or sequential grammar markers
- **When** `findGrammarPatterns` returns the match list
- **Then** matches must be strictly sorted by `startIndex` ascending.

---

### FT-HOMO: Contextual Polyphone (多音字) & Confusable Homophone Warning

#### Scenario: Polyphone lookup for multi-pronunciation glyphs
- **Given** polyphonic characters "得", "行", "重", "发", "地"
- **When** `checkPolyphone` is called
- **Then** an entry must be returned containing all distinct pinyin readings, definitions, and contextual examples
- **And** a non-polyphone character must return `null`.

#### Scenario: Confusable homophone pair detection
- **Given** commonly confused characters "在" and "再", or "坐" and "座"
- **When** `checkHomophone` is invoked with character "在"
- **Then** it must return a warning clarifying location/ongoing action vs future repetition "再"
- **And** list "再" in its confusables array.

---

### FT-SYN: In-Memory Synonym Ladder & Real-Time Simplifier

#### Scenario: Downward simplification of advanced vocabulary
- **Given** a text containing HSK 6 word "甚是" or HSK 5 word "购置"
- **When** `scaleTextDifficulty` is called with `targetHsk = 1`
- **Then** "甚是" must be replaced with HSK 1 synonym "很"
- **And** "购置" must be replaced with HSK 1 synonym "买"
- **And** substitutions log must record original and replaced words.

#### Scenario: Upward enrichment of simple vocabulary
- **Given** a simple sentence "我很喜欢看书"
- **When** `scaleTextDifficulty` is called with `targetHsk = 4`
- **Then** "很" must scale up to "十分"
- **And** "看" must scale up to "观看" or higher tier.

#### Scenario: Synonym ladder lookup for specific vocabulary
- **Given** word "买"
- **When** `getLadderForWord("买")` is queried
- **Then** the ladder for "buy" must be returned with tiers for HSK 1 (买), HSK 3 (购买), and HSK 5 (购置).

---

### FT-CHENGYU: Chengyu (成语) Four-Character Idiom Knowledge Base

#### Scenario: Exact Chengyu retrieval with historical allusion
- **Given** the 4-character idiom "守株待兔"
- **When** `getChengyu("守株待兔")` is retrieved
- **Then** literal translation ("stand by tree stump waiting for hare"), figurative meaning, pinyin, and allusion from Han Feizi must be returned.

#### Scenario: Full text scan for embedded 4-character idioms
- **Given** a story passage containing "他做事总是半途而废，从来不坚持"
- **When** `scanChengyu` inspects the text
- **Then** it must detect "半途而废" at the exact string character index with complete entry details.

---

### FT-SRS: Spaced Repetition (SM-2) Interval Calculation & Deck Management

#### Scenario: Review rating calculation under default SM-2 settings
- **Given** an initial flashcard with interval 0 and easeFactor 2.5
- **When** rated 3 ("Good") on first review
- **Then** interval must advance to `initialInterval` (1 day)
- **When** rated 3 ("Good") on second review
- **Then** interval must advance to `secondInterval` (4 days)
- **When** rated 1 ("Fail") on subsequent review
- **Then** interval must lapse back to `failureInterval` (1 day).

#### Scenario: Customizer settings modify interval scaling
- **Given** custom SRS settings with `secondInterval = 7` and `easyBonusMultiplier = 1.5`
- **When** an easy rating (4) is awarded
- **Then** easeFactor increases and interval compounds with the easy bonus multiplier.

#### Scenario: Minimum ease factor floor enforcement
- **Given** repeated failure ratings (1) on a difficult card
- **When** easeFactor degrades
- **Then** easeFactor must never drop below `minEaseFactor` (1.30).

---

### FT-IRT: Adaptive Item Response Theory (IRT) Confidence & Remedial Generator

#### Scenario: IRT response confidence computation
- **Given** a correct answer completed in 2 seconds (baseline 8 seconds)
- **When** `AdaptiveEngine.calculateConfidence(true, 2, 8, 1)` is called
- **Then** a high mastery confidence score (>= 90) must be returned
- **When** an incorrect answer is given on attempt 2
- **Then** confidence must plummet to <= 25.

#### Scenario: Zero-latency synthesis of remedial micro-exercises
- **Given** a detected error concept "买 (mǎi) vs 卖 (mài)" with errorType `tone_confusion`
- **When** `AdaptiveEngine.generateRemedialExercise` is invoked
- **Then** a `minimal_pair_triage` exercise targeting the tonal distinction must be generated instantaneously
- **And** marked with `isRemedial = true`.

---

### FT-SUB: Timed Subtitle (.srt / .vtt) Parser

#### Scenario: Parsing standard SRT subtitle format with comma milliseconds
- **Given** SRT subtitle content with timestamps like `00:01:20,500 --> 00:01:23,800`
- **When** `SubtitleParser.parse` is executed
- **Then** start and end times must parse accurately into decimal seconds (80.5s to 83.8s)
- **And** HTML styling tags must be stripped from the subtitle text.

#### Scenario: Parsing WebVTT format with dot milliseconds and headers
- **Given** WebVTT content starting with `WEBVTT` and timestamps like `00:00:15.200 --> 00:00:18.000`
- **When** `SubtitleParser.parse` is executed
- **Then** cues must be extracted with correct sequential IDs and formatted string properties.

---

### FT-SHARE: Peer-to-Peer Story Sharing (.moyun.json & URL Hash)

#### Scenario: Story package generation with metadata
- **Given** a story titled "茶馆故事" with HSK level 3 text of 240 characters
- **When** `StoryShareService.createPackage` is called
- **Then** format must be `moyun-story-v1`
- **And** `metadata.characterCount` must equal 240
- **And** `metadata.estimatedReadTimeMinutes` must equal 2.

#### Scenario: Validating and parsing valid package vs legacy JSON
- **Given** a serialized `.moyun.json` string
- **When** `StoryShareService.parseStoryPackage` parses the string
- **Then** the story title, text, and level must be safely reconstituted.

---

### FT-ANKI: Anki & Pleco TSV Flashcard Export

#### Scenario: Anki TSV format conformance
- **Given** flashcard entries with character, pinyin, definition, example sentence, and interval
- **When** `AnkiExportService.exportToAnkiTSV` runs
- **Then** output must contain headers `#separator:tab`, `#html:true`, `#columns:...`
- **And** each row must be tab-delimited with embedded tabs safely replaced by spaces.

#### Scenario: Pleco TSV format conformance
- **Given** flashcard entries
- **When** `AnkiExportService.exportToPlecoTSV` runs
- **Then** rows must match Pleco format `Character\tPinyin\tDefinition` with comment headers.

---

### FT-CPM: Reading Speed Analytics & Characters Per Minute (CPM)

#### Scenario: Real-time CPM calculation
- **Given** 300 characters read in 120 seconds
- **When** `ReadingAnalytics.calculateCPM(300, 120)` is computed
- **Then** CPM must equal exactly 150.

#### Scenario: Reading benchmark tiers mapping
- **Given** a current CPM of 75
- **When** `ReadingAnalytics.getBenchmarks(75)` is evaluated
- **Then** the "HSK 1-2 Foundational Pacing" tier must be marked as active (`isCurrentTier = true`).

---

### FT-STORAGE: Centralized StorageService & Type-Safe Persistence

#### Scenario: Safe retrieval and fallback handling
- **Given** an uninitialized storage key
- **When** `StorageService.getItem` or `StorageService.getJson` is queried with default fallback
- **Then** the fallback value must be returned without raising exceptions.

#### Scenario: Universal getter and setter
- **Given** string values and complex JSON objects
- **When** saved via `StorageService.set` and retrieved via `StorageService.get`
- **Then** values must round-trip with full type fidelity.

---

### FT-TOAST: In-App Toast Notification & Dialog Promises

#### Scenario: Toast queue lifecycle
- **Given** an active `ToastStore`
- **When** `ToastStore.success("Saved successfully")` is triggered
- **Then** a toast item must appear in `getToasts()` with type 'success'
- **When** `dismissToast` is called
- **Then** the toast item must be removed and subscribers notified.

#### Scenario: Promise-based native confirmation modal
- **Given** a confirm request dispatched via `ToastStore.confirm({...})`
- **When** resolved via `ToastStore.resolveConfirm(true)`
- **Then** the awaiting promise must resolve with `true` and clear `activeConfirm`.

---

### FT-SEARCH: Semantic Inverted-Index Story Library Search

#### Scenario: Relevance scoring for title matches and query frequency
- **Given** a library of saved stories
- **When** `SemanticSearchEngine.searchStories` searches for keyword "北京"
- **Then** stories with "北京" in the title must score higher than stories with body matches alone
- **And** each result must include an excerpt snippet containing the keyword.

---

### FT-ADV: Adventure Branch Constrained Narrative Generator

#### Scenario: HSK level-constrained branch generation
- **Given** story text about ordering food in a restaurant
- **When** `generateAdventureBranches` generates choices for HSK Level 1-2
- **Then** 3 choices using basic grammar and pinyin must be returned
- **When** generated for HSK Level 4+
- **Then** choices must feature advanced vocabulary (e.g. 烹饪, 招牌菜, 秘方).

---

### FT-DICT: Multi-Tier Dictionary Relevance Search & Toneless Stripping

#### Scenario: Diacritic stripping for toneless matching
- **Given** pinyin strings "nǐ hǎo", "zhōngguó", "gǒu"
- **When** `stripDiacritics` is evaluated
- **Then** strings must convert to toneless lowercase "ni hao", "zhongguo", "gou".

#### Scenario: Multi-tier relevance ranking
- **Given** a query "gou"
- **When** `searchDictionary` ranks matches
- **Then** exact toneless matches ("gǒu" 狗) must rank above substring or definition matches.

---

### FT-COMP: Multi-Character Compound Resolution & Decomposition

#### Scenario: Builtin compound lexicon lookup
- **Given** high-frequency compound "燕麦奶" (oat milk)
- **When** `CompoundDictionaryService.lookupSync("燕麦奶")` is called
- **Then** it must resolve with pinyin "yàn mài nǎi", definition "oat milk", and source "lexicon".

#### Scenario: Constituent character decomposition
- **Given** compound word "补牙" (tooth filling)
- **When** resolved by `CompoundDictionaryService`
- **Then** `constituentChars` must decompose into "补" and "牙" with their individual radicals, stroke counts, and meanings.

---

### FT-GEMINI: Dynamic Model Discovery & Self-Healing Engine

#### Scenario: Production stability precedence in model sorting
- **Given** candidate models including experimental testbeds (`gemini-4-argon`) and frontier stable models (`gemini-3.5-flash`)
- **When** `sortGeminiModels` sorts the options
- **Then** stable production models strictly precede experimental models.

#### Scenario: Google deprecation recommendation recovery
- **Given** a Google 404 message recommending an upgrade model
- **When** `extractSuggestedModelFromError` parses the message
- **Then** the recommended replacement identifier is parsed and persistently adopted.

---

### FT-WRITER: AI Grader for Free Writing & Composition (AIM-001)

#### Scenario: Structural particle and measure word heuristics
- **Given** text with "跑的快" and "一个书"
- **When** `WritingGraderEngine.evaluateOffline` runs
- **Then** issues are generated correcting them to "跑得快" and "一本书".

---

### FT-STROKE: Rice-Grid Calligraphic Stroke Rules & Catalog (AIM-010)

#### Scenario: Standard stroke order rules catalog
- **Given** the calligraphic stroke order rules
- **When** queried via `StrokeOrderService.getRules()`
- **Then** all 7 classical rules (先横后竖, 先撇后捺, etc.) are cataloged with bilingual examples.

---

### FT-SYLLABUS: Generative Syllabus & Course DAG Normalization

#### Scenario: Course DAG expansion to rich 5-node branch structure
- **Given** a sparse chapter with only 1 node
- **When** `SyllabusGenerator.normalizeCourseDAG` executes
- **Then** the chapter is expanded into a 5-node DAG with main line, side quest, review ambush, and boss capstone.

---

### FT-UX-FLOWS: End-to-End User Experience State Machine

#### Scenario: Full user journey from free text paste to graded reader and flashcard review
- **Given** an unformatted Chinese text snippet
- **When** ingested through the free text area, tokenized, and inspected
- **Then** tokens display compound metadata, character tooltips provide stroke order drills, and saved words progress through SM-2 thematic review decks.

