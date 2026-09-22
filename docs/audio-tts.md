# Audio, Neural TTS & Acoustic Pitch Engine Architecture

This document describes the dual audio pipeline: Azure Neural Speech Synthesis with SSML contextual compilation, persistent SHA-256 IndexedDB audio caching, audio chunking, defensive Web Speech fallbacks, and the client-side autocorrelation pitch tracking engine.

---

## 1. High-Fidelity Multi-Engine Audio Architecture

The audio pipeline provides studio-grade, natural Mandarin pronunciation across three distinct tiers:

```
                          [Plain Chinese Text]
                                    │
                                    ▼
                       [Audio Chunking Manager]
                   (Segments into sentence buffers)
                                    │
                                    ▼
                      [AzureSpeechService.speak]
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
 [Azure Neural Engine]     [Cloud Natural Engine]      [System Web Speech]
 (Xiaoxiao / Yunxi /       (Google WaveNet Neural     (Smart Prioritization:
  Yunjian with SSML)        Stream - Zero Setup)       Natural / Online first)
        │                           │                           │
        ▼                           ▼                           ▼
[SHA-256 IndexedDB]        [HTML5 Audio Stream]       [SpeechSynthesisUtterance]
        │                           │                           │
        └───────────────────────────┴───────────────────────────┘
                                    │
                                    ▼
                     [AudioPlaybackHandle Controller]
                     - Immediate pause & unpause
                     - Cancellation-safe abort
                     - Prevents phantom next-sentence triggers
```

---

## 2. Audio Playback Controller & Pause State Machine

In earlier revisions, calling `window.speechSynthesis.cancel()` triggered the utterance's `onend` event, which inadvertently advanced the sentence pointer and began playing subsequent sentences.

### 2.1 Deterministic 3-State Machine
`ReadingTheater` manages playback via three strict states:
* `'idle'`: Playback stopped; pointer at sentence 0.
* `'playing'`: Actively narrating sentence $i$ with visual pacing highlight.
* `'paused'`: Playback immediately halted; pointer frozen at sentence $i$.

### 2.2 Immediate Cancellation Protocol
When the user clicks **Pause** or **Stop**:
1. `isPausedRef.current = true` and `isStoppedRef.current = true`.
2. Any pending inter-sentence `setTimeout` timer is cleared via `clearTimeout(pendingTimeoutRef.current)`.
3. The active `AudioPlaybackHandle.stop()` method is invoked:
   - For `<audio>` elements: Invokes `.pause()`, unbinds `.onended` and `.onerror`, and clears `.src`.
   - For `speechSynthesis`: Detaches `onend` and `onerror` handlers before invoking `window.speechSynthesis.cancel()`, preventing synthetic completion callbacks.
4. On component unmount, `useEffect` cleanup invokes `stopAudio()`, preventing background audio leakage across workspace switches.

---

## 3. High-Fidelity Neural Voice Providers

### 3.1 Cloud Natural Engine (Default / Recommended)
- Streamed from high-fidelity neural Mandarin speech synthesis.
- Zero configuration and zero API key required.
- Natural human prosody, tonal cadence, and smooth phoneme transitions without robotic artifacts.
- Automatically falls back to the best system voice if offline.

### 3.2 Microsoft Azure Neural REST API (`src/services/azureSpeech.ts`)
- Studio-grade voices: `zh-CN-XiaoxiaoNeural`, `zh-CN-YunxiNeural`, `zh-CN-YunjianNeural`, `zh-CN-XiaoyiNeural`.
- Rich SSML markup with contextual emotional styles (`narration-professional`, `chat`, `calm`).
- Free tier: 500,000 characters per month from Microsoft Cognitive Services.
- Cached in IndexedDB via SHA-256 hash keys.

### 3.3 Smart System Voice Prioritization
- Windows legacy SAPI5 voices (`Microsoft Huihui Desktop`) sound metallic and robotic (16 kHz).
- `AzureSpeechService.getAvailableSystemVoices()` actively scans installed browser/OS voices and scores them:
  1. `Natural`, `Online`, `Neural` voices (e.g. `Microsoft Xiaoxiao Online (Natural)`) get highest priority ($+60$).
  2. Google cloud voices (e.g. `Google 普通话`) get high priority ($+40$).
  3. Legacy desktop voices receive negative score penalties ($-30$).
- Enables users in Microsoft Edge or Windows 11 with Natural Voice packs to enjoy native high-definition speech offline.

---

## 6. Autocorrelation Fundamental Frequency ($F_0$) Pitch Tracking

### 6.1 Digital Signal Processing Pipeline (`src/services/pitchTracker.ts`)
1. **Audio Capture:** Requests user microphone access via `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **AnalyserNode:** Connects stream to `AudioContext` with `analyser.fftSize = 2048` and sample rate 44.1 kHz / 48 kHz.
3. **Normalized Autocorrelation:**
   $$\text{ACF}(\tau) = \sum_{n=0}^{N-1} x[n] \cdot x[n+\tau]$$
   Searches for the peak correlation within the human vocal range (75 Hz to 500 Hz).
4. **Volume Thresholding:** Filters out silence or background room noise below RMS threshold 0.015.

### 6.2 5-Degree Mandarin Tone Grids & DTW Normalization
1. **Chao Tone Scale:** Plots pitch values on a 5-degree logarithmic musical grid (1 = low, 5 = high).
2. **Reference Tone Contours:**
   - Tone 1: High level $[5, 5, 5, 5, 5]$
   - Tone 2: Rising $[3, 3.5, 4, 4.5, 5]$
   - Tone 3: Dipping $[2, 1.5, 1, 2, 4]$
   - Tone 4: Falling $[5, 4, 3, 2, 1]$
3. **Dynamic Time Warping (DTW):** Interpolates captured pitch samples to 50 equidistant normalized points and calculates distance against the target tone model to yield a tone accuracy score ($0–100\%$).
