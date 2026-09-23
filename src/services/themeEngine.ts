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
    name: 'Midnight Slate (Soft & Inviting)',
    bgBase: '#131F24',
    bgSurface: '#1E2D34',
    bgSurfaceHover: '#263842',
    bgPanel: '#18242A',
    textPrimary: '#F0F4F8',
    textSecondary: '#9FAFB8',
    textMuted: '#6B7D87',
    borderSubtle: '#293942',
    borderStrong: '#37464F',
    accentSeal: '#FF4B4B',
    accentBamboo: '#58CC02',
    accentGold: '#FFC800',
    // Aliases
    bgPrimary: '#131F24',
    bgCard: '#1E2D34',
    bgInput: '#18242A',
    textMain: '#F0F4F8',
    textPinyin: '#9FAFB8',
    borderColor: '#293942',
    accentColor: '#FF4B4B',
    accentSecondary: '#58CC02'
  },
  'light': {
    id: 'light',
    name: 'Daylight Porcelain (Clean & Gentle)',
    bgBase: '#F7F9FA',
    bgSurface: '#FFFFFF',
    bgSurfaceHover: '#F0F3F5',
    bgPanel: '#FFFFFF',
    textPrimary: '#1F2E35',
    textSecondary: '#4B5A63',
    textMuted: '#778893',
    borderSubtle: '#E5E9EB',
    borderStrong: '#D3D9DE',
    accentSeal: '#FF4B4B',
    accentBamboo: '#58CC02',
    accentGold: '#E5A100',
    // Aliases
    bgPrimary: '#F7F9FA',
    bgCard: '#FFFFFF',
    bgInput: '#F7F9FA',
    textMain: '#1F2E35',
    textPinyin: '#4B5A63',
    borderColor: '#E5E9EB',
    accentColor: '#FF4B4B',
    accentSecondary: '#58CC02'
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
