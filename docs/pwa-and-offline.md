# Progressive Web App (PWA) & Offline Capabilities

This document details the Progressive Web App (PWA) configuration, Service Worker precaching strategies, and zero-backend offline architecture of the platform.

---

## 1. PWA Engine & Configuration

The application is configured as a standalone installable Progressive Web App via `vite-plugin-pwa`:

*   **Plugin:** `vite-plugin-pwa` (`^0.21.1`)
*   **Vite Configuration File:** `vite.config.ts`
*   **Web App Manifest:** `public/manifest.json`

### 1.1 `vite.config.ts` Configuration

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'hanziDB.csv', 'vocabDB.csv'],
      manifest: {
        name: '墨韵华文 Next-Gen Mandarin Learning Platform',
        short_name: 'MandarinReader',
        description: 'Next-Generation Multimodal Mandarin Graded Reader & Spoken Studio',
        theme_color: '#C83E2D',
        background_color: '#FAF9F6',
        display: 'standalone',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,csv}']
      }
    })
  ],
});
```

---

## 2. Zero-Backend Offline Capabilities Matrix

| Capability / Subsystem | Offline Availability | Storage / Fallback Mechanism |
| :--- | :---: | :--- |
| **Graded Reading & Tokenizer** | 100% Offline | Precached CSV dictionaries (`hanziDB.csv`, `vocabDB.csv`) & `Intl.Segmenter` |
| **Dictionary Search & Lookups** | 100% Offline | In-memory lexical scan with user IndexedDB overrides |
| **Hanzi Stroke Practice** | 100% Offline | Precached HanziWriter vector data |
| **SRS Flashcards & SM-2** | 100% Offline | IndexedDB (`MandarinGradedReaderSRS`) |
| **Story Library** | 100% Offline | IndexedDB (`MandarinGradedReaderLibrary`) |
| **Pitch Tracking & Tone Canvas**| 100% Offline | Client Web Audio API autocorrelation & IndexedDB pitch cache |
| **Shadowing Dual Playback** | 100% Offline | Browser MediaRecorder API & Web Audio buffers |
| **EPUB & Subtitle Ingestion** | 100% Offline | In-browser `DecompressionStream` & local file reading |
| **Local OCR Document Scanning** | 100% Offline | HTML5 Canvas contrast binarization & local pixel extraction |
| **Reading Speed Analytics (CPM)**| 100% Offline | `localStorage: reading_speed_history` |
| **Audio Playback** | Fallback Available | Azure Neural TTS when online; native OS voices when offline |
| **Story & Lesson Generation** | Online Required | Google Gemini Generative AI API (`gemini-2.5-flash`) |

---

## 3. Real-Time Offline Status Indicator (`src/components/OfflineStatusIndicator.tsx`)

A persistent status pill in the global navigation header listens to `window` network events:
- **Online:** Green badge (`#7B8D62`) indicating cloud services and local caches are fully active.
- **Offline:** Cinnabar badge (`#C83E2D`) reassuring the user that zero-backend local databases and IndexedDB stores remain operational.

---

## 4. Multi-Device State Hydration (.json)

To transfer data between offline devices without relying on external authentication or central servers:
- **Export Backup:** Serializes all IndexedDB stores (flashcards, stories, overrides, heatmap) into an encrypted `.json` file.
- **Import Restore:** Merges external `.json` backups into local browser IndexedDB using timestamp conflict resolution.
