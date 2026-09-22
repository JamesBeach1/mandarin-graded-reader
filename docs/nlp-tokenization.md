# NLP Word Tokenization, Polyphones, Grammar & Lexical Density

This document details the word segmentation engine, polyphone detection, functional grammar pattern highlighting, lexical density scoring (TTR), and multi-factor ranked search scoring.

---

## 1. Natural Language Processing (NLP) Segmentation

*   **File:** `src/utils/tokenizer.ts`
*   **Function:** `tokenizeStory(text, hanziData, vocabData, customOverrides): HanziItem[]`

### 1.1 Segmentation Engine: `Intl.Segmenter`
Uses the standard ECMAScript Internationalization API initialized with Chinese locale rules:
```typescript
const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
const segments = Array.from(segmenter.segment(text));
```
*   **Granularity:** `'word'` isolates compound lexical units (`服务员`, `咖啡店`, `很高兴`).
*   **Chinese Unicode Detection:** Tested via regex `/[\u4E00-\u9FFF]/.test(char)`. Non-Chinese segments (Latin letters, punctuation, whitespace, digits) are emitted with `isNonChinese: true`.

---

## 2. Dictionary Resolution Cascade

Each word segment is resolved against dictionary layers using a 4-tier priority cascade:
1. **Priority 0 (User Overrides):** Checks `customOverrides[word]`.
2. **Priority 1 (Compound Vocabulary):** Checks `vocabData` (`vocabDB.csv`).
3. **Priority 2 (Single Character):** If length is 1, checks `hanziData` (`hanziDB.csv`).
4. **Priority 3 (Compound Decomposition Fallback):** Splits compound word into constituent characters and looks up each character in user overrides and `hanziDB.csv`.

---

## 3. Contextual Polyphone (多音字) Detection (`src/utils/homophoneDetector.ts`)

Polyphonic characters change pronunciation and meaning depending on grammatical context:
- **`得`**:
  - Structural complement marker: `de` (e.g. 跑得快)
  - Modal verb (must): `děi` (e.g. 我得走了)
  - Verb (obtain): `dé` (e.g. 得到)
- **`行`**:
  - Verb / Adjective (okay, walk): `xíng` (e.g. 行人, 可以行)
  - Noun (industry, bank): `háng` (e.g. 银行, 行业)
- **`地`**:
  - Adverbial marker: `de` (e.g. 慢慢地走)
  - Noun (earth, place): `dì` (e.g. 地方, 地球)
- **`重`**:
  - Adjective (heavy, serious): `zhòng` (e.g. 很重, 重要)
  - Adverb (again, re-): `chóng` (e.g. 重新, 重复)

The engine flags polyphones with amber `.polyphone-flag` styling and provides contextual tooltip notes.

---

## 4. Grammar Pattern Highlighting (`src/utils/grammarHighlighter.ts`)

Scans sentences for functional HSK grammar markers and pairs:
- Disposal sentences: `把` construction
- Passive sentences: `被` construction
- Conjunctions: `虽然...但是...`, `因为...所以...`, `不但...而且...`
- Scope: `除了...以外`
- Incremental change: `越来越...`
- Emphasis: `连...都/也...`

Matches are tagged with interactive info chips indicating the grammatical function and HSK level.

---

## 5. Lexical Density Scoring (Type-Token Ratio - TTR) (`src/utils/lexicalDensity.ts`)

Calculates vocabulary complexity for imported books, articles, and transcripts:

1. **Type-Token Ratio (TTR):**
   $$\text{TTR} = \frac{V}{N} = \frac{\text{Count of Unique Words}}{\text{Total Word Tokens}}$$
2. **Unique Hanzi Ratio:**
   $$\text{Character Diversity} = \frac{\text{Unique Chinese Glyphs}}{\text{Total Chinese Glyphs}}$$
3. **HSK Distribution Breakdown:** Categorizes each token into HSK 1–6 and unlisted words to evaluate whether a text is comprehensible for a given student.

---

## 6. Ranked Scoring Dictionary Search

When querying the dictionary via the universal search bar:
*   Exact character match: $+100$ pts
*   Character containment: $+40$ pts
*   Exact Pinyin match: $+30$ pts
*   Definition English match: $+10$ pts
*   Frequency penalty: Deducts $\text{rank} / 1000$ to prioritize high-frequency everyday vocabulary.
