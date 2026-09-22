# AI Services, Multimodal Protocols & Prompt Engineering

This document details all interactions between the Mandarin Graded Reader client and generative AI models (Google Gemini API), covering prompt templates, HSK grammar constraints, structured JSON contracts, and conversational voice loops.

---

## 1. Engine Configuration & Runtime

*   **SDK:** `@google/generative-ai` (`GoogleGenerativeAI`)
*   **Target Models:** `gemini-2.5-flash` / `gemini-3.1-flash-lite`
*   **Authentication:** Client-managed API key persisted in `localStorage: gemini_api_key`.
*   **Response Modes:**
    *   **Unstructured Text:** Standard generation for stories, branching continuations, and sentence grammar analysis.
    *   **Structured JSON Mode:** Enforced via `generationConfig: { responseMimeType: "application/json" }` for interactive Duolingo-style lessons.

---

## 2. HSK Grammar Constraints Matrix

To ensure generated texts strictly adhere to official HSK vocabulary and grammar limits, level-specific grammatical constraints are injected into Gemini prompts via `HSK_GRAMMAR_CONSTRAINTS`:

```typescript
export const HSK_GRAMMAR_CONSTRAINTS: Record<string, string> = {
  "1": "Strictly limit grammar to HSK 1 patterns. Use extremely simple sentence structures like '主语 + 动词 + 宾语' (e.g. 我去商店). Use basic particles like '的' or '吗'. Do NOT use any compound sentences, advanced conjunctions, or grammar structures from HSK 2 or above.",
  "2": "Strictly limit grammar to HSK 1 and 2 patterns. Use simple conjunctions like '虽然...但是...' or '因为...所以...' and comparison structures like '比'. Do NOT use advanced grammar like '把' sentences, passive '被' sentences, or HSK 3+ structures.",
  "3": "Strictly limit grammar to HSK 1-3 patterns. You can use grammar like '把' sentences, simple passive '被' sentences, result complements, and structures like '除了...以外'. Do NOT use advanced structures like '才' vs '就' in complex clauses, conditional '无论', or HSK 4+ structures.",
  "4": "Limit grammar to HSK 1-4 patterns. You may use passive clauses, complex complements, double negatives, and conjunctions like '只要...就...' or '不管...都...'. Keep vocabulary and grammar natural but within standard upper-intermediate levels.",
  "5": "Limit grammar to HSK 1-5 patterns. You may use abstract grammatical structures, formal written conventions, and idiomatic expressions (成语) appropriate for HSK 5. Do not use extremely complex literary structures.",
  "6": "Use full vocabulary and grammar proficiency of HSK 6. You can use advanced syntax, idioms, abstract concepts, literary styles, and complex sentence chains."
};
```

---

## 3. Conversational Voice Agent Multimodal Loop (`src/components/ConversationalVoiceAgent.tsx`)

The Conversational Voice Agent allows learners to engage in simulated conversational dialogues in spoken Mandarin:

```
[User Speaks into Mic]
         │
         ▼
[Browser Speech Recognition]  ──> Transcribes to Chinese text
         │
         ▼
[Gemini LLM Prompt]           ──> "You are an encouraging native Mandarin conversational tutor..."
         │
         ▼
[LLM Chinese Response]
         │
         ▼
[Azure Neural TTS / Web Speech] ──> Synthesizes natural audio reply
```

### Prompt Specification:
```typescript
const prompt = `You are an encouraging, natural native Mandarin conversational tutor helping a student practice spoken Chinese.
The student said: "${userTranscript}".
Please reply in natural, conversational Mandarin appropriate for an intermediate student (keep reply under 25 Chinese characters).
Output ONLY the Chinese characters for the spoken reply, with no Pinyin or English.`;
```

---

## 4. SQA Higher Mandarin / SCQF Level 6 Prompts

For formal academic curriculum alignment with Scottish Qualifications Authority (SQA) Higher Mandarin:
- **Themes:** Society & Family, Learning & Schooling, Employability & Careers, Culture & Global Context.
- **Discursive Prompts:** Generate analytical essay topics requiring comparative arguments (e.g., *“探讨社交媒体对现代青少年的积极与消极影响”*).
- **Linguistic Targets:** SCQF Level 6 grammatical structures, modal verbs, rhetorical devices, and formal transitions.

---

## 5. Story Branching & Continuation

Learners choose their own adventure by specifying continuation prompts:
```typescript
const prompt = `Here is the current Chinese story:
"${currentText}"

Continue the story based on this branch: "${continuationPrompt}".
Write strictly in simplified Mandarin at HSK ${hskLevel} level without Pinyin or English.`;
```
Yields seamless textual continuations tokenized and appended to the active reading stream.
