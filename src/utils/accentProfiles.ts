/**
 * Regional Dialect & Accent Profiles (ALS-004)
 * Supports Standard Northern Mandarin, Beijing Erhua (儿化音), and Taiwanese Mandarin (台湾国语)
 */

export type RegionalAccent = 'standard' | 'beijing_erhua' | 'taiwan';

export interface RegionalAccentProfile {
  id: RegionalAccent;
  name: string;
  chineseName: string;
  badge: string;
  description: string;
  azureVoice: string;
  systemLang: string;
  voiceGender: 'female' | 'male';
  phoneticCharacteristics: string[];
}

export const REGIONAL_ACCENT_PROFILES: Record<RegionalAccent, RegionalAccentProfile> = {
  standard: {
    id: 'standard',
    name: 'Standard Northern Mandarin',
    chineseName: '标准普通话 (Standard)',
    badge: '🏛️ 标准普通话',
    description: 'CCTV broadcast standard Mandarin with clear, crisp phonemic contrasts and canonical retroflex consonants.',
    azureVoice: 'zh-CN-XiaoxiaoNeural',
    systemLang: 'zh-CN',
    voiceGender: 'female',
    phonemicCharacteristics: [
      'Strict distinction between retroflex (zh, ch, sh) and dental (z, c, s)',
      'Clear neutral tone (轻声) reductions',
      'Balanced Standard Mandarin pitch range (5-5, 3-5, 2-1-4, 5-1)'
    ]
  },
  beijing_erhua: {
    id: 'beijing_erhua',
    name: 'Beijing Dialect (Erhua / 京腔)',
    chineseName: '北京腔 (儿化音)',
    badge: '🏮 北京儿化音',
    description: 'Lively colloquial Beijing rhythm with characteristic r-colored vowel endings (儿化), softening of stops, and fast sentence flow.',
    azureVoice: 'zh-CN-YunjianNeural',
    systemLang: 'zh-CN',
    voiceGender: 'male',
    phonemicCharacteristics: [
      'R-colored vowel retroflexion (这儿 zhèr, 玩儿 wánr, 一会儿 yíhuìr)',
      'Smooth colloquial assimilation of finals',
      'Deeper melodic pitch excursions in informal discourse'
    ]
  },
  taiwan: {
    id: 'taiwan',
    name: 'Taiwanese Mandarin (Guoyu / 华语)',
    chineseName: '台湾国语 (台湾华语)',
    badge: '🍵 台湾华语',
    description: 'Gentle, melodious Taiwanese Mandarin with softened retroflex friction, distinctive melodic cadences, and warm sentence-final particles.',
    azureVoice: 'zh-TW-HsiaoChenNeural',
    systemLang: 'zh-TW',
    voiceGender: 'female',
    phonemicCharacteristics: [
      'Softened retroflex sounds (zh/ch/sh articulated closer to dental alveolar position)',
      'Vowel "e" slightly more open; neutral tones retain subtle tone color',
      'Gentle sentence cadence without harsh apical friction'
    ]
  }
};

const ACCENT_STORAGE_KEY = 'moyun_regional_accent';

export function getStoredAccent(): RegionalAccent {
  try {
    const raw = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (raw && (raw === 'standard' || raw === 'beijing_erhua' || raw === 'taiwan')) {
      return raw as RegionalAccent;
    }
    return 'standard';
  } catch {
    return 'standard';
  }
}

export function saveStoredAccent(accent: RegionalAccent): void {
  localStorage.setItem(ACCENT_STORAGE_KEY, accent);
}

/**
 * Applies Beijing Erhua colloquial phonetics to common nouns when Beijing accent is selected
 */
export function applyAccentTransform(text: string, accent: RegionalAccent): string {
  if (accent !== 'beijing_erhua' || !text) return text;

  // Add Erhua to high-frequency colloquial nouns if not already ending in 儿
  return text
    .replace(/玩(?![儿儿])/g, '玩儿')
    .replace(/一点(?![儿儿])/g, '一点儿')
    .replace(/这(?=[，。、\s]|$)/g, '这儿')
    .replace(/那(?=[，。、\s]|$)/g, '那儿')
    .replace(/天(?=[，。、\s]|$)/g, '天儿');
}
