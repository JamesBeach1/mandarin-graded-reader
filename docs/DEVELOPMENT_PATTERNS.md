# Moyun (墨韵) — Engineering Architecture & Development Patterns

**Target Audience:** Autonomous Agents, AI Assistants, and Core Maintainers.  
**Repository:** `mandarin-graded-reader`  
**Last Updated:** 2026-09-23  

---

## 1. Architectural Philosophy & Directory Boundaries

Moyun is built as an offline-first, client-side Mandarin reading and spoken training workstation. To prevent regressions, bloat, and maintainability collapse, all code must respect strict architectural boundaries:

```
src/
├── types/          # Pure TypeScript interfaces & types (zero runtime code)
├── utils/          # Pure functions & algorithmic utilities (stateless, zero React dependencies)
├── services/       # Persistent storage, external APIs, and hardware subsystems (Web Speech, AudioContext)
├── components/     # React UI presentation layer
│   ├── common/     # Reusable primitive UI atoms (Modal, Tooltip, etc.)
│   ├── exercises/  # Lesson & grammar interactive exercise stages
│   └── odyssey/    # Gamified campaign map, boss encounters & adaptive engine
└── App.tsx         # Macro Workspace Router & Global Modals Orchestrator (~700 lines max)
```

### Boundary Rules
1. **`utils/` must remain pure:** Never import React hooks or DOM state into `utils/`. Utilities should take data in and return data out. This allows instant unit testing and zero coupling.
2. **`services/` owns persistence & hardware:** All IndexedDB operations (`idb`), audio synthesis/decoding (`Web Audio API`), and Web Speech interfaces live in `services/`.
3. **Workspace modularity:** The application has 5 core workspaces (`reading`, `speaking`, `import`, `review`, `lessons`). Workspaces must be self-contained within their respective components (`ReadingWorkspace.tsx`, `SpeakingWorkspace.tsx`, etc.).

---

## 2. State Persistence Standards: `StorageService`

### Anti-Pattern: String Literal Splatter
❌ **Never** access `localStorage` using raw string literals or un-guarded `JSON.parse`:
```typescript
// BAD: Prone to typos, silent bugs, and JSON parsing crashes
const theme = localStorage.getItem('theme');
const data = JSON.parse(localStorage.getItem('characters_read_heatmap') || '{}');
localStorage.setItem('moyun_pinyin_display_mode', 'adaptive');
```

### Approved Pattern: `StorageService` & `STORAGE_KEYS`
✅ **Always** use `StorageService` from `src/services/storage.ts`:
```typescript
import { StorageService, STORAGE_KEYS } from '../services/storage';

// Safe string retrieval with fallback
const ttsEngine = StorageService.getItem(STORAGE_KEYS.SELECTED_TTS_ENGINE, 'cloud-natural');

// Type-safe JSON retrieval with automatic fallback and try/catch guard
const heatmap = StorageService.getJson<Record<string, number>>(STORAGE_KEYS.CHARACTERS_HEATMAP, {});

// Safe persistence
StorageService.setItem(STORAGE_KEYS.PINYIN_DISPLAY_MODE, 'adaptive');
StorageService.setJson(STORAGE_KEYS.CHARACTERS_HEATMAP, updatedHeatmap);
```

### Available Keys in `STORAGE_KEYS`:
- `GEMINI_API_KEY`, `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
- `SELECTED_TTS_ENGINE`, `SELECTED_AZURE_VOICE`, `SELECTED_SYSTEM_VOICE`, `REGIONAL_ACCENT`, `HOVER_AUDIO`
- `THEME`, `SCRIPT_PREFERENCE`, `PHONETIC_NOTATION`, `PINYIN_DISPLAY_MODE`, `TONE_COLOR_MODE`
- `CHARACTERS_HEATMAP`, `READING_SPEED_HISTORY`

---

## 3. Standard Modal & Dialog Architecture

### Anti-Pattern: Custom Backdrop Re-implementation
❌ **Never** write ad-hoc overlay `div` wrappers with copy-pasted styles and duplicated ESC key handlers:
```tsx
// BAD: Inconsistent styling, lacks ESC key listener, lacks ARIA roles
{isOpen && (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)' }}>
    <div style={{ padding: '20px', background: '#222' }}>
      <h3>My Modal</h3>
      {children}
    </div>
  </div>
)}
```

### Approved Pattern: `<Modal>` Base Component
✅ **Always** use `src/components/common/Modal.tsx` for new dialogs:
```tsx
import { Modal } from './common/Modal';

interface MyFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SomeData;
}

export const MyFeatureModal: React.FC<MyFeatureModalProps> = ({ isOpen, onClose, payload }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Feature Title"
      maxWidth="540px" // Optional, default is 520px
    >
      <div className="modal-body">
        {/* Modal content */}
      </div>
    </Modal>
  );
};
```
`<Modal>` automatically guarantees:
- `Escape` key listener with cleanup on unmount.
- Backdrop click dismissal with inner panel `e.stopPropagation()`.
- Consistent editorial dark borders (`var(--border-strong)`) and flat brutalist shadow (`box-shadow: 6px 6px 0px rgba(0, 0, 0, 0.9)`).
- Accessibility attributes (`role="dialog"`, `aria-modal="true"`).

---

## 4. React Hook Hygiene & Error Prevention Rules

Large React components (e.g. `ReadingTheater.tsx`, `App.tsx`) frequently suffer from compilation regressions if ordering rules are violated. Autonomous agents must strictly adhere to the following lifecycle ordering:

### The Strict Hook Order
```typescript
export const MyComponent: React.FC<Props> = ({ ...props }) => {
  // 1. Primitive State (Independent)
  const [activeTab, setActiveTab] = useState('reading');
  const [tokens, setTokens] = useState<HanziItem[]>([]);

  // 2. Dependent State (Relies only on state above)
  const [scaledTokens, setScaledTokens] = useState<HanziItem[] | null>(null);

  // 3. Refs
  const audioTimerRef = useRef<number | null>(null);

  // 4. Memos (Derivations)
  // CRITICAL: NEVER reference a state variable in useMemo before its useState declaration!
  // Doing so triggers: "ReferenceError: can't access lexical declaration 'X' before initialization"
  const activeTokens = useMemo(() => scaledTokens || tokens, [scaledTokens, tokens]);

  // 5. Effects (Subscriptions, DOM listeners, Async loading)
  useEffect(() => {
    // Effect logic...
    return () => { /* Cleanup */ };
  }, [dependencies]);

  // 6. Action Handlers & Callbacks
  const handleAction = () => { ... };

  // 7. Render JSX
  return ( ... );
};
```

### Anti-Pattern: Inline IIFEs in JSX
❌ **Never** inject complex Immediately Invoked Function Expressions inside JSX markup:
```tsx
// BAD: Heavy cognitive load, unreadable diffs, impossible to isolate errors
<div>
  {(() => {
    const info = calculateComplexInfo(char);
    if (!info) return null;
    return <span>{info.text}</span>;
  })()}
</div>
```
✅ **Instead:** Extract to a subcomponent (e.g. `<CharacterTooltip>`) or a `useMemo`.

---

## 5. CJK & Mandarin Linguistic Processing Standards

### 1. Toneless Pinyin Normalization (Search & Matching)
When matching user input or checking homophones, always normalize Unicode and strip combining diacritical marks:
```typescript
import { stripDiacritics } from '../utils/dictionarySearch';

// Converts "gǒu" -> "gou", "Lǚ" -> "lu", "Nǐ hǎo" -> "ni hao"
const normalized = stripDiacritics(userInput);
```

### 2. Bidirectional Simplified & Traditional Script Switching
All rendered Chinese text in the reading and review components should respect user script preference (`'simplified' | 'traditional'`):
```typescript
import { convertScript, type ChineseScript } from '../utils/scriptConverter';

// Renders 简体 or 繁體 seamlessly
const displayText = convertScript(char, scriptPreference);
```

### 3. Ruby Phonetics (Pinyin & Zhuyin Bopomofo)
When rendering character annotations, support both standard Latin Pinyin and Taiwanese Zhuyin (注音符号):
```typescript
import { pinyinToZhuyin } from '../utils/zhuyinConverter';

const phonetic = phoneticNotation === 'zhuyin' 
  ? pinyinToZhuyin(item.pinyin) 
  : item.pinyin;
```

---

## 6. Audio Synthesis & Playback Safety

Audio synthesis involves concurrent systems: Browser Web Speech API, Azure Neural REST API, and Web Audio API synthesisers.

### The Double-Fire / Cancellation Race Condition
When browser `speechSynthesis.cancel()` is called, some engines (Chrome/Safari) asynchronously trigger `onend` on the cancelled utterance, leading to runaway sentence skipping.

### Standard Audio Playback Guard:
```typescript
let isExplicitlyStopping = false;

export const stopSpeech = () => {
  isExplicitlyStopping = true;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  setTimeout(() => {
    isExplicitlyStopping = false;
  }, 100);
};

// In utterance onend:
utterance.onend = () => {
  if (isExplicitlyStopping) return; // Do not advance to next sentence!
  onSentenceFinished();
};
```

---

## 7. Editorial Dark Theme & Typography Design Tokens

Moyun deliberately avoids generic "AI Slop" styling (e.g. bubbly pills, 20px blurred drop shadows, pastel gradients, and generic purple buttons).

### Design Tokens (`App.css`):
- **Backgrounds:** Slate & Charcoal (`--bg-base: #121212`, `--bg-surface: #1E1E20`, `--bg-surface-hover: #2A2A2D`)
- **Accents:** Traditional Chinese Print Palette:
  - Cinnabar Seal Red: `--accent-seal: #A33B3B` (Primary actions, deletes, SRS fails)
  - Bamboo Green: `--accent-bamboo: #4C6B53` (Success, correct answers, SRS passes)
  - Calligraphy Ochre / Gold: `--accent-gold: #B8904D` (Grammar highlights, stars, bookmarks)
- **Geometry:** Brutalist flat borders (`--radius-sm: 2px`, `--radius-md: 4px`), sharp elevations (`box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8)`).
- **Typography:**
  - UI Controls: Sans-serif (`--font-sans: 'Inter', system-ui`)
  - Chinese Literature: High-contrast Songti / Noto Serif SC (`--font-serif-zh: 'Noto Serif SC', 'Songti SC'`)
  - Pinyin & Phonetics: Clean Monospace (`--font-mono: 'JetBrains Mono', 'Fira Code'`)

---

## 8. Summary Checklist for New Code
Before committing any changes:
- [ ] Are all `localStorage` reads/writes using `StorageService` with a key from `STORAGE_KEYS`?
- [ ] Are all dialogs and popups built with `<Modal>` or extending its standard interface?
- [ ] Is `App.tsx` kept lean (<800 lines) with subcomponents extracted?
- [ ] Are React hook declarations ordered strictly: `useState` -> `useRef` -> `useMemo` -> `useEffect` -> handlers?
- [ ] Are CJK character transformations (script, pinyin, zhuyin) delegating to pure `utils/` functions?
- [ ] Are design tokens in `App.css` used instead of hardcoded hex colors?
