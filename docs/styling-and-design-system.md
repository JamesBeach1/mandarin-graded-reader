# Mandarin Learning Platform — Design System & Styling Source of Truth

**Document Status:** Canonical Design Specification  
**Document Version:** 7.1.0  
**Target Audience:** UI/UX Designers, Frontend Engineers  
**Design Paradigm:** Modern Editorial Dark (Anti-AI Slop)  

---

## 1. Core Design Philosophy

This platform prioritizes long-session reading and intensive studying. The aesthetic must be utilitarian, grounded, and highly legible.

* **Zero "AI Slop":** Strictly prohibit glassmorphism (`backdrop-filter: blur`), gradient meshes, neon glows, and pill-shaped/bubbly border radiuses.
* **Flat & Structural:** Depth is established through hard borders and subtle background color variations, not drop shadows.
* **Dark-Default Editorial:** The default theme is an intentional, low-contrast dark palette resembling high-end typography specimens or high-density IDEs (`#121212` base). It is NOT pitch black (`#000000`) or high-contrast neon. Pure white (`#FFFFFF`) is likewise prohibited.
* **Typographic Segregation:** Clear boundaries between UI controls (modern geometric sans), reading material (literary serif), and phonetics (monospace).

---

## 2. Color Palette & Semantic Tokens

### 2.1 Editorial Dark Palette (Default)

| Semantic Token | Hex Value | Usage / Notes |
| :--- | :--- | :--- |
| `--bg-base` | `#121212` | Root application background. Soft, matte near-black. |
| `--bg-surface` | `#1E1E20` | Containers, cards, tables, inputs. |
| `--bg-surface-hover` | `#2A2A2D` | Hover states for list items, character chips, and controls. |
| `--bg-panel` | `#18181A` | Secondary sidebars, drawers, and modal backdrops. |
| `--text-primary` | `#E5E5E5` | High readability foreground. Off-white to prevent retina fatigue. |
| `--text-secondary` | `#A0A0A5` | Metadata, pinyin, subheadings, non-active states. |
| `--text-muted` | `#6B6B70` | Placeholders, borders on low-emphasis dividers, disabled states. |
| `--border-subtle` | `#2C2C30` | Structural card borders, grid dividers, horizontal rules. |
| `--border-strong` | `#3F3F45` | Focus rings, active tabs, modal borders, highlighted sentences. |
| `--accent-seal` | `#A33B3B` | Traditional Cinnabar/Seal Red. Primary brand accent, destructive actions. |
| `--accent-bamboo` | `#4C6B53` | Muted Scholar Bamboo. Success, learned states, masteries. |
| `--accent-gold` | `#B8904D` | Antique Bronze/Gold. Warnings, polyphone indicators, tone highlights. |

### 2.2 Editorial Paper Palette (Light Mode)

| Semantic Token | Hex Value | Usage / Notes |
| :--- | :--- | :--- |
| `--bg-base` | `#F6F5F2` | Warm off-white parchment paper. Pure white (`#FFFFFF`) is prohibited. |
| `--bg-surface` | `#ECEAE4` | Elevated reading surfaces, input backgrounds. |
| `--bg-surface-hover` | `#E2DFD7` | Hover feedback. |
| `--bg-panel` | `#F0EFEB` | Sidebar, drawers, toolbars. |
| `--text-primary` | `#222224` | Rich charcoal black. Pure black (`#000000`) is prohibited. |
| `--text-secondary` | `#59595E` | Annotations, secondary metadata, pinyin. |
| `--text-muted` | `#8C8C91` | Dividers, disabled controls. |
| `--border-subtle` | `#DBD7CE` | Card containers and dividers. |
| `--border-strong` | `#8C8C91` | Active tabs and interactive borders. |
| `--accent-seal` | `#8B2626` | Deep Cinnabar. |
| `--accent-bamboo` | `#3B5740` | Deep Forest Bamboo. |
| `--accent-gold` | `#8C6B2D` | Deep Raw Umber / Bronze. |

---

## 3. Typography Stack & Hierarchy

The application declares three explicit font families:

```css
:root {
  /* UI & Structural Labels */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Reading Material & Characters (Literary Serif) */
  --font-serif-zh: 'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', 'STSong', serif;
  
  /* Pinyin & Phonetics (Monospace) */
  --font-mono: 'JetBrains Mono', 'Fira Code', Menlo, monospace;
}
```

### 3.1 Type Scale & Rules

* **Story Titles:** `font-family: var(--font-serif-zh); font-size: 26px; font-weight: 500; letter-spacing: -0.01em; margin-bottom: 36px;`
* **Story Body Text:** `font-family: var(--font-serif-zh); font-size: 24px; font-weight: 400; line-height: 2.8;`
  * *Crucial Rule:* Line height must be `2.8` or greater when pinyin is displayed to prevent vertical overlapping.
* **Pinyin Annotations:** `font-family: var(--font-mono); font-size: 0.82rem; font-weight: 400; letter-spacing: 0.05em;`
* **UI Controls & Tabs:** `font-family: var(--font-sans); font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em;`
* **Dictionary Definitions:** `font-family: var(--font-sans); font-size: 14px; line-height: 1.5;`

---

## 4. Geometry, Elevation & Layout

### 4.1 Strict Geometry (Anti-Pill Rule)

Pill buttons, bubbles, and overly rounded cards belong to AI-generated toy apps. This system uses brutalist, architectural radiuses:

```css
:root {
  --radius-sm: 2px;
  --radius-md: 4px;
  --radius-lg: 0px; /* Outer workspace containers have sharp right-angle edges */
  --radius-pill: 2px; /* Pill radius is strictly mapped to 2px */
}
```

### 4.2 Elevation without Shadows

* **Banned:** `box-shadow: 0 10px 30px rgba(0,0,0,...)`, `box-shadow: 0 0 15px var(--accent-...)`
* **Allowed:**
  * Flat borders: `border: 1px solid var(--border-subtle)`
  * Active state: `border-color: var(--border-strong)`
  * Modals/Dropdowns: Harsh un-blurred shadow: `box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8)`

---

## 5. Component Construction Blueprints

### 5.1 Main Workspace Navigation

* Flat horizontal bar pinned to top.
* Background: `var(--bg-base)`.
* Border bottom: `1px solid var(--border-subtle)`.
* Tabs: Rectangular, uppercase, `12px` / `13px`, tracking `0.08em`.
* Active Tab: Highlighted with `border-bottom: 2px solid var(--accent-seal)` and `var(--bg-surface)`.

### 5.2 The Reading Theater & Character Grid (Anti-Overlap)

Vertical overlapping of Chinese text and pinyin is eliminated with the following layout rules:

```css
.story-header-title {
  font-family: var(--font-serif-zh);
  font-size: 26px;
  margin-bottom: 36px; /* Prevents title from overlapping story body */
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.story-content-horizontal {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 24px;
  line-height: 2.8; /* Generous clearance for pinyin line boxes */
  font-family: var(--font-serif-zh);
  font-size: 24px;
  color: var(--text-primary);
}

.hanzi-chip {
  position: relative;
  display: inline-block;
  margin-top: 22px; /* Critical: Reserves physical height in the line box for absolute pinyin */
  margin-bottom: 6px;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background 0.1s ease;
}

.hanzi-chip:hover {
  background: var(--bg-surface-hover);
  border-bottom: 1px solid var(--accent-seal);
}

.pinyin-above {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text-secondary);
  pointer-events: none;
  white-space: nowrap;
}
```

### 5.3 Vertical Reading Mode (`vertical-rl`)

```css
.story-content-vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  direction: ltr;
  overflow-x: auto;
  overflow-y: hidden;
  max-height: 540px;
  padding: 24px;
  line-height: 2.8;
  font-family: var(--font-serif-zh);
  font-size: 24px;
  border: 1px solid var(--border-subtle);
  background-color: var(--bg-surface);
}

.story-content-vertical .pinyin-above {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
  font-size: 10px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
}
```

### 5.4 Dictionary & Lexical Hover Tooltip

* Must NOT look like a speech bubble.
* Strict rectangle: `border-radius: var(--radius-sm); border: 1px solid var(--border-strong); background: var(--bg-panel); box-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);`.
* Top bar: Character displayed in large serif (`32px`), adjacent to pinyin in monospace (`14px`, `var(--text-secondary)`).
* Divider: `1px solid var(--border-subtle)`.
* Definition text: Clean sans-serif (`13px`, `var(--text-primary)`).
* Actions: Flat text links or 2px-radius rectangular buttons.

### 5.5 Pitch Tracking Canvas (Tone Visualizer)

* Canvas background: `var(--bg-base)` (`#121212`).
* Grid Lines (5-degree tonal scale): `1px solid var(--border-subtle)` (`rgba(63, 63, 69, 0.4)`).
* Reference Tone Curve: Calligraphy Gold (`var(--accent-gold)`, `#B8904D`), line width `2.5px`.
* User Real-Time Vocal Pitch Curve: Seal Red (`var(--accent-seal)`, `#A33B3B`), line width `2px`.
* Zero particle/glow slop. Pure vector curves.

### 5.6 SM-2 Spaced Repetition Grading Buttons

* `1: Fail` $\rightarrow$ Seal Red (`#A33B3B`)
* `2: Hard` $\rightarrow$ Antique Gold (`#B8904D`)
* `3: Good` $\rightarrow$ Scholar Bamboo (`#4C6B53`)
* `4: Easy` $\rightarrow$ Forest Green (`#354E3C`)
