/**
 * High-Fidelity Neural Speech Synthesis Service
 * Supports:
 * 1. Cloud Natural TTS (High-Fidelity Neural Mandarin - Zero Configuration)
 * 2. Azure Neural REST API (Xiaoxiao / Yunxi / Yunjian with SSML & IndexedDB caching)
 * 3. Smart System Voice Prioritization (Automatic ranking of Natural/Online/Neural system voices)
 * 4. Custom / OpenAI-compatible TTS endpoints
 */

import { hashString, getCachedAudio, setCachedAudio } from './audioCache';
import { getStoredAccent, REGIONAL_ACCENT_PROFILES, applyAccentTransform, type RegionalAccent } from '../utils/accentProfiles';

export type NeuralVoice = 'zh-CN-XiaoxiaoNeural' | 'zh-CN-YunxiNeural' | 'zh-CN-YunjianNeural' | 'zh-CN-XiaoyiNeural';
export type NeuralStyle = 'narration-professional' | 'chat' | 'cheerful' | 'empathetic' | 'angry' | 'sad' | 'calm';
export type TtsEngine = 'cloud-natural' | 'azure-neural' | 'system' | 'custom';

export interface VoiceOption {
  id: string;
  name: string;
  lang: string;
  isNatural: boolean;
  provider: 'Google' | 'Microsoft' | 'Apple' | 'System';
}

export interface SpeechPlaybackOptions {
  engine?: TtsEngine;
  voice?: string;
  style?: NeuralStyle;
  rate?: number; // 0.5 to 1.5 multiplier
  pitch?: string;
  azureKey?: string;
  azureRegion?: string;
  systemVoiceName?: string;
  customEndpoint?: string;
  customApiKey?: string;
}

export interface AudioPlaybackHandle {
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isStopped: () => boolean;
}

export class AzureSpeechService {
  private static defaultRegion = 'eastus';
  private static cachedSystemVoices: VoiceOption[] = [];

  /**
   * Retrieves all available Chinese system voices sorted intelligently
   * so that modern Natural/Online/Neural voices appear ahead of legacy robotic desktop voices.
   */
  public static getAvailableSystemVoices(): VoiceOption[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];

    const allVoices = window.speechSynthesis.getVoices();
    const zhVoices = allVoices.filter(v => 
      v.lang.startsWith('zh') || 
      v.lang.startsWith('cmn') || 
      v.lang.includes('Chinese') || 
      v.name.includes('Chinese') ||
      v.name.includes('Mandarin')
    );

    const scoreVoice = (v: SpeechSynthesisVoice): number => {
      const nameLower = v.name.toLowerCase();
      let score = 0;
      if (nameLower.includes('natural')) score += 60;
      if (nameLower.includes('online')) score += 50;
      if (nameLower.includes('neural')) score += 45;
      if (nameLower.includes('google')) score += 40;
      if (nameLower.includes('xiaoxiao') || nameLower.includes('yunxi')) score += 35;
      if (v.lang === 'zh-CN') score += 15;
      if (nameLower.includes('desktop') || nameLower.includes('huihui')) score -= 30; // Deprioritize scratchy desktop SAPI5
      return score;
    };

    const sorted = [...zhVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a));

    this.cachedSystemVoices = sorted.map(v => {
      const nameLower = v.name.toLowerCase();
      const isNatural = /natural|online|neural|google|siri/i.test(v.name);
      let provider: VoiceOption['provider'] = 'System';
      if (/google/i.test(nameLower)) provider = 'Google';
      else if (/microsoft/i.test(nameLower)) provider = 'Microsoft';
      else if (/apple|siri|tingting/i.test(nameLower)) provider = 'Apple';

      return {
        id: v.name,
        name: v.name,
        lang: v.lang,
        isNatural,
        provider
      };
    });

    return this.cachedSystemVoices;
  }

  /**
   * Compiles plain Chinese text into rich Speech Synthesis Markup Language (SSML)
   */
  public static compileSSML(text: string, options: SpeechPlaybackOptions = {}): string {
    const accent = getStoredAccent();
    const profile = REGIONAL_ACCENT_PROFILES[accent] || REGIONAL_ACCENT_PROFILES.standard;
    const transformedText = applyAccentTransform(text, accent);

    const voice = options.voice || profile.azureVoice;
    const style = options.style || 'narration-professional';
    const rateMultiplier = options.rate || 1.0;
    
    // Format rate as percentage offset (e.g. 1.25 -> "+25%", 0.75 -> "-25%")
    const ratePercent = `${Math.round((rateMultiplier - 1.0) * 100)}%`;
    const rateString = ratePercent.startsWith('-') ? ratePercent : `+${ratePercent}`;

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${profile.systemLang}">
  <voice name="${voice}">
    <mstts:express-as style="${style}">
      <prosody rate="${rateString}">
        ${transformedText}
      </prosody>
    </mstts:express-as>
  </voice>
</speak>`;
  }

  /**
   * Synthesizes audio using Azure REST API with IndexedDB caching.
   */
  public static async synthesizeSpeech(
    text: string,
    options: SpeechPlaybackOptions = {}
  ): Promise<{ audioUrl?: string; usedFallback: boolean }> {
    const azureKey = options.azureKey || localStorage.getItem('azure_speech_key') || '';
    const azureRegion = options.azureRegion || localStorage.getItem('azure_speech_region') || this.defaultRegion;

    if (!azureKey || !azureKey.trim()) {
      return { usedFallback: true };
    }

    const ssml = this.compileSSML(text, options);
    const ssmlHash = await hashString(ssml);

    // 1. Check local IndexedDB audio cache
    const cachedBlob = await getCachedAudio(ssmlHash);
    if (cachedBlob) {
      const audioUrl = URL.createObjectURL(cachedBlob);
      return { audioUrl, usedFallback: false };
    }

    // 2. Query Azure Speech REST API
    const endpoint = `https://${azureRegion}.tts.speech.microsoft.com/cognitiveservices/v1`;
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': azureKey.trim(),
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'MandarinGradedReader'
        },
        body: ssml
      });

      if (!response.ok) {
        console.warn(`Azure TTS API returned ${response.status}. Falling back.`);
        return { usedFallback: true };
      }

      const audioBlob = await response.blob();
      await setCachedAudio(ssmlHash, text, audioBlob, options.voice || 'zh-CN-XiaoxiaoNeural');
      const audioUrl = URL.createObjectURL(audioBlob);
      return { audioUrl, usedFallback: false };
    } catch (err) {
      console.warn('Network error calling Azure TTS. Falling back.', err);
      return { usedFallback: true };
    }
  }

  /**
   * Unified speech player returning an abortable controller handle.
   * Priority:
   * 1. If engine is 'azure-neural' (or Azure key present) -> Azure Neural synthesis
   * 2. If engine is 'cloud-natural' -> Cloud Natural stream with safe single fallback
   * 3. System voice (Default) -> Best rated system voice (prioritizing Natural/Online/Neural)
   */
  public static speak(
    text: string,
    options: SpeechPlaybackOptions = {},
    onEnd?: () => void,
    onError?: (err: any) => void
  ): AudioPlaybackHandle {
    let stopped = false;
    let currentAudio: HTMLAudioElement | null = null;
    let currentUtterance: SpeechSynthesisUtterance | null = null;
    let hasCompleted = false;

    const safeOnEnd = () => {
      if (stopped || hasCompleted) return;
      hasCompleted = true;
      if (onEnd) onEnd();
    };

    const safeOnError = (err: any) => {
      if (stopped || hasCompleted) return;
      hasCompleted = true;
      if (onError) onError(err);
    };

    const handle: AudioPlaybackHandle = {
      isStopped: () => stopped,
      stop: () => {
        if (stopped) return;
        stopped = true;
        hasCompleted = true;

        // Abort audio element
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.onended = null;
          currentAudio.onerror = null;
          currentAudio.src = '';
          currentAudio = null;
        }

        // Abort Web Speech
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          if (currentUtterance) {
            currentUtterance.onend = null;
            currentUtterance.onerror = null;
            currentUtterance = null;
          }
          window.speechSynthesis.cancel();
        }
      },
      pause: () => {
        if (currentAudio && !currentAudio.paused) {
          currentAudio.pause();
        } else if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
        }
      },
      resume: () => {
        if (stopped) return;
        if (currentAudio && currentAudio.paused) {
          currentAudio.play().catch(e => console.warn('Resume audio failed', e));
        } else if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
      }
    };

    let hasFallenBack = false;
    const triggerFallback = () => {
      if (hasFallenBack || stopped) return;
      hasFallenBack = true;
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.onended = null;
        currentAudio.onerror = null;
        currentAudio.src = '';
        currentAudio = null;
      }
      currentUtterance = this.speakOfflineFallbackInternal(text, options.rate || 1.0, options.systemVoiceName, safeOnEnd, safeOnError);
    };

    const effectiveEngine = options.engine || 
      (localStorage.getItem('selected_tts_engine') as TtsEngine) || 
      (localStorage.getItem('azure_speech_key') ? 'azure-neural' : 'system');

    // 1. Try Azure Neural if configured
    if (effectiveEngine === 'azure-neural' && (options.azureKey || localStorage.getItem('azure_speech_key'))) {
      this.synthesizeSpeech(text, options).then(({ audioUrl, usedFallback }) => {
        if (stopped) return;
        if (audioUrl && !usedFallback) {
          const audio = new Audio(audioUrl);
          currentAudio = audio;
          audio.playbackRate = options.rate || 1.0;
          audio.onended = () => {
            if (stopped) return;
            safeOnEnd();
          };
          audio.onerror = () => {
            triggerFallback();
          };
          audio.play().catch(() => {
            triggerFallback();
          });
          return;
        }

        triggerFallback();
      }).catch(() => {
        triggerFallback();
      });
      return handle;
    }

    // 2. Try Cloud Natural TTS only if explicitly requested
    if (effectiveEngine === 'cloud-natural') {
      try {
        const encodedText = encodeURIComponent(text);
        const naturalUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodedText}`;
        const audio = new Audio(naturalUrl);
        currentAudio = audio;
        audio.playbackRate = options.rate || 1.0;

        audio.onended = () => {
          if (stopped) return;
          safeOnEnd();
        };

        audio.onerror = () => {
          triggerFallback();
        };

        audio.play().catch(() => {
          triggerFallback();
        });

        return handle;
      } catch (err) {
        triggerFallback();
        return handle;
      }
    }

    // 3. Native browser Web Speech API (Default: High compatibility, zero network latency)
    currentUtterance = this.speakOfflineFallbackInternal(text, options.rate || 1.0, options.systemVoiceName, safeOnEnd, safeOnError);
    return handle;
  }

  /**
   * Internal helper for system speech synthesis with smart voice resolution.
   */
  private static speakOfflineFallbackInternal(
    text: string,
    rate = 1.0,
    requestedVoiceName?: string,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): SpeechSynthesisUtterance | null {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null;

    // Detach previous utterance to prevent rogue callbacks before canceling
    if ((window as any).activeUtterance) {
      const prev = (window as any).activeUtterance as SpeechSynthesisUtterance;
      prev.onend = null;
      prev.onerror = null;
    }
    window.speechSynthesis.cancel();

    const accent = getStoredAccent();
    const profile = REGIONAL_ACCENT_PROFILES[accent] || REGIONAL_ACCENT_PROFILES.standard;
    const transformedText = applyAccentTransform(text, accent);

    const utterance = new SpeechSynthesisUtterance(transformedText);
    (window as any).activeUtterance = utterance;
    utterance.lang = profile.systemLang;
    utterance.rate = rate;

    const voices = window.speechSynthesis.getVoices();
    let chosenVoice: SpeechSynthesisVoice | undefined;

    if (requestedVoiceName) {
      chosenVoice = voices.find(v => v.name === requestedVoiceName);
    }

    if (!chosenVoice) {
      const zhVoices = voices.filter(v => v.lang.startsWith('zh') || v.lang.includes('cmn'));
      
      // Look for voices matching the target regional dialect first (e.g. Taiwan or standard)
      chosenVoice = zhVoices.find(v => v.lang.toLowerCase().startsWith(profile.systemLang.toLowerCase()) && /natural|online|neural/i.test(v.name)) ||
                    zhVoices.find(v => v.lang.toLowerCase().startsWith(profile.systemLang.toLowerCase())) ||
                    zhVoices.find(v => /natural|online|neural/i.test(v.name)) ||
                    zhVoices.find(v => /google/i.test(v.name)) ||
                    zhVoices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }

    let fired = false;
    utterance.onend = () => {
      if (fired) return;
      fired = true;
      (window as any).activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      if (fired) return;
      (window as any).activeUtterance = null;
      if (e.error === 'canceled' || e.error === 'interrupted') {
        return;
      }
      fired = true;
      if (onError) onError(e);
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);

    return utterance;
  }

  /**
   * Backward-compatible helper for existing components
   */
  public static speakOfflineFallback(
    text: string,
    rate = 1.0,
    onEnd?: () => void,
    onError?: (err: any) => void
  ): SpeechSynthesisUtterance | null {
    return this.speakOfflineFallbackInternal(text, rate, undefined, onEnd, onError);
  }
}

