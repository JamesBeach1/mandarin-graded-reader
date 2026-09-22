export interface ThemePalette {
  id: string;
  name: string;
  bgBase: string;
  bgSurface: string;
  bgSurfaceHover: string;
  bgPanel: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderSubtle: string;
  borderStrong: string;
  accentSeal: string;
  accentBamboo: string;
  accentGold: string;
  // Backward-compatible aliases
  bgPrimary: string;
  bgCard: string;
  bgInput: string;
  textMain: string;
  textPinyin: string;
  borderColor: string;
  accentColor: string;
  accentSecondary: string;
}

export const PRESET_THEMES: Record<string, ThemePalette> = {
  'dark': {
    id: 'dark',
    name: 'Editorial Dark (Anti-AI Slop)',
    bgBase: '#121212',
    bgSurface: '#1E1E20',
    bgSurfaceHover: '#2A2A2D',
    bgPanel: '#18181A',
    textPrimary: '#E5E5E5',
    textSecondary: '#A0A0A5',
    textMuted: '#6B6B70',
    borderSubtle: '#2C2C30',
    borderStrong: '#3F3F45',
    accentSeal: '#A33B3B',
    accentBamboo: '#4C6B53',
    accentGold: '#B8904D',
    // Aliases
    bgPrimary: '#121212',
    bgCard: '#1E1E20',
    bgInput: '#121212',
    textMain: '#E5E5E5',
    textPinyin: '#A0A0A5',
    borderColor: '#2C2C30',
    accentColor: '#A33B3B',
    accentSecondary: '#4C6B53'
  },
  'light': {
    id: 'light',
    name: 'Editorial Paper (Muted Warm)',
    bgBase: '#F5F4F0',
    bgSurface: '#EBEAE4',
    bgSurfaceHover: '#DFDED7',
    bgPanel: '#EDECE6',
    textPrimary: '#1C1C1E',
    textSecondary: '#5C5C60',
    textMuted: '#8E8E93',
    borderSubtle: '#D6D5CD',
    borderStrong: '#BCBBAF',
    accentSeal: '#943232',
    accentBamboo: '#3E5C45',
    accentGold: '#9E7B3D',
    // Aliases
    bgPrimary: '#F5F4F0',
    bgCard: '#EBEAE4',
    bgInput: '#F5F4F0',
    textMain: '#1C1C1E',
    textPinyin: '#5C5C60',
    borderColor: '#D6D5CD',
    accentColor: '#943232',
    accentSecondary: '#3E5C45'
  }
};

const THEME_STORAGE_KEY = 'mgr_custom_theme_config';

export function getStoredTheme(): { themeId: string; customPalette?: ThemePalette } {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.themeId === 'dark' || parsed.themeId === 'light') {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Default to Dark-Default Editorial
  return { themeId: 'dark' };
}

export function applyTheme(themeId: string, customPalette?: ThemePalette): void {
  const root = document.documentElement;
  
  // Default to dark unless explicitly light
  const isDark = themeId !== 'light';
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const palette = customPalette || (isDark ? PRESET_THEMES['dark'] : PRESET_THEMES['light']);

  // Canonical Semantic Tokens
  root.style.setProperty('--bg-base', palette.bgBase);
  root.style.setProperty('--bg-surface', palette.bgSurface);
  root.style.setProperty('--bg-surface-hover', palette.bgSurfaceHover);
  root.style.setProperty('--bg-panel', palette.bgPanel);
  root.style.setProperty('--text-primary', palette.textPrimary);
  root.style.setProperty('--text-secondary', palette.textSecondary);
  root.style.setProperty('--text-muted', palette.textMuted);
  root.style.setProperty('--border-subtle', palette.borderSubtle);
  root.style.setProperty('--border-strong', palette.borderStrong);
  root.style.setProperty('--accent-seal', palette.accentSeal);
  root.style.setProperty('--accent-bamboo', palette.accentBamboo);
  root.style.setProperty('--accent-gold', palette.accentGold);

  // Backward compatibility aliases
  root.style.setProperty('--bg-primary', palette.bgPrimary);
  root.style.setProperty('--bg-card', palette.bgCard);
  root.style.setProperty('--bg-input', palette.bgInput);
  root.style.setProperty('--text-main', palette.textMain);
  root.style.setProperty('--text-pinyin', palette.textPinyin);
  root.style.setProperty('--border-color', palette.borderColor);
  root.style.setProperty('--accent-color', palette.accentColor);
  root.style.setProperty('--accent-secondary', palette.accentSecondary);
  root.style.setProperty('--accent-cinnabar', palette.accentSeal);
  root.style.setProperty('--accent-ochre', palette.accentGold);

  localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({ themeId: isDark ? 'dark' : 'light', customPalette }));
}
