/**
 * Moyun Ink-Wash Watercolor Story Illustration Generator (AIM-005)
 * Procedurally generates traditional Chinese ink-and-wash landscape paintings
 * (水墨山水画) as scalable editorial SVG artwork tailored to story themes and HSK titles.
 */

export interface InkWashTheme {
  primaryInk: string;
  mistColor: string;
  accentSunColor: string;
  paperColor: string;
  sealColor: string;
}

export const INK_THEMES: Record<string, InkWashTheme> = {
  mountain: {
    primaryInk: '#201C16',
    mistColor: 'rgba(236, 229, 211, 0.45)',
    accentSunColor: '#B03A2E',
    paperColor: '#F4EFE4',
    sealColor: '#B03A2E'
  },
  misty_night: {
    primaryInk: '#181A20',
    mistColor: 'rgba(30, 32, 40, 0.5)',
    accentSunColor: '#D4A017',
    paperColor: '#16130F',
    sealColor: '#D0574A'
  },
  bamboo_spring: {
    primaryInk: '#1E2B22',
    mistColor: 'rgba(220, 235, 225, 0.4)',
    accentSunColor: '#B8904D',
    paperColor: '#F2F6F3',
    sealColor: '#9E3228'
  }
};

export const InkWashGenerator = {
  /**
   * Generates a procedural Chinese ink wash landscape SVG based on the story title and text.
   */
  generateIllustrationSvg(title: string, isDarkTheme: boolean = false): string {
    const theme = isDarkTheme ? INK_THEMES.misty_night : INK_THEMES.mountain;

    // Deterministic pseudo-random seed based on title characters
    let seed = 0;
    for (let i = 0; i < title.length; i++) {
      seed = (seed * 31 + title.charCodeAt(i)) & 0xffffffff;
    }
    const rand = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    const sunX = 120 + rand(1) * 200;
    const sunY = 55 + rand(2) * 35;
    const sunR = 28 + rand(3) * 10;

    // Far mountain path
    const m1Y = 90 + rand(4) * 20;
    const m2Y = 120 + rand(5) * 25;
    const m3Y = 160 + rand(6) * 30;

    const width = 840;
    const height = 240;

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="border-radius: 8px; overflow: hidden; display: block;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.paperColor}" stop-opacity="0.9" />
      <stop offset="100%" stop-color="${theme.paperColor}" stop-opacity="1" />
    </linearGradient>
    <linearGradient id="mistGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${theme.mistColor}" stop-opacity="0" />
      <stop offset="50%" stop-color="${theme.mistColor}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${theme.mistColor}" stop-opacity="0" />
    </linearGradient>
    <filter id="inkBleed" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>

  <!-- Paper background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Soft traditional crimson rising sun / moon -->
  <circle cx="${sunX}" cy="${sunY}" r="${sunR}" fill="${theme.accentSunColor}" opacity="0.65" filter="url(#inkBleed)" />

  <!-- Layer 1: Distant Misty Mountains (淡墨) -->
  <path d="M 0,${height} L 0,${m1Y + 30} Q 180,${m1Y - 40} 380,${m1Y + 20} T 680,${m1Y - 30} T ${width},${m1Y + 10} L ${width},${height} Z"
        fill="${theme.primaryInk}" opacity="0.12" filter="url(#inkBleed)" />

  <!-- Mid-level Mist Band -->
  <rect x="0" y="${m1Y + 10}" width="${width}" height="60" fill="url(#mistGrad)" />

  <!-- Layer 2: Mid-ground Peaks (中墨) -->
  <path d="M 0,${height} L 0,${m2Y + 40} Q 140,${m2Y - 35} 280,${m2Y + 15} Q 460,${m2Y - 50} 640,${m2Y + 10} Q 740,${m2Y - 20} ${width},${m2Y + 30} L ${width},${height} Z"
        fill="${theme.primaryInk}" opacity="0.28" filter="url(#inkBleed)" />

  <!-- Layer 3: Foreground Crags & River Bank (浓墨) -->
  <path d="M 0,${height} L 0,${m3Y + 30} Q 100,${m3Y - 20} 220,${m3Y + 15} Q 400,${m3Y - 30} 560,${m3Y + 10} Q 720,${m3Y - 15} ${width},${m3Y + 25} L ${width},${height} Z"
        fill="${theme.primaryInk}" opacity="0.65" filter="url(#inkBleed)" />

  <!-- Traditional Solitary River Skiff / Boat (孤舟) -->
  <g transform="translate(${240 + rand(7) * 200}, ${m3Y - 8}) scale(0.75)" opacity="0.75">
    <ellipse cx="25" cy="10" rx="22" ry="3.5" fill="${theme.primaryInk}" />
    <!-- Fisherman -->
    <path d="M 22,7 L 24,0 L 27,2 L 25,7 Z" fill="${theme.primaryInk}" />
    <!-- Fishing pole -->
    <line x1="25" y1="2" x2="38" y2="-4" stroke="${theme.primaryInk}" stroke-width="0.8" />
  </g>

  <!-- Distant Birds in V-Formation (远鸟) -->
  <g fill="${theme.primaryInk}" opacity="0.5">
    <path d="M 480,45 Q 484,40 488,45 Q 492,40 496,45 Q 492,42 488,44 Q 484,42 480,45 Z" transform="scale(0.8)" />
    <path d="M 495,55 Q 499,50 503,55 Q 507,50 511,55 Q 507,52 503,54 Q 499,52 495,55 Z" transform="scale(0.7)" />
    <path d="M 515,62 Q 519,57 523,62 Q 527,57 531,62 Q 527,59 523,61 Q 519,59 515,62 Z" transform="scale(0.6)" />
  </g>

  <!-- Traditional Red Calligraphic Seal (印章 墨韵) -->
  <g transform="translate(${width - 55}, 20)">
    <rect x="0" y="0" width="28" height="28" rx="3" fill="${theme.sealColor}" opacity="0.85" />
    <rect x="2" y="2" width="24" height="24" rx="2" fill="none" stroke="${theme.paperColor}" stroke-width="0.8" opacity="0.7" />
    <text x="14" y="20" font-family="'Noto Serif SC', 'Songti SC', serif" font-size="14" font-weight="bold" fill="${theme.paperColor}" text-anchor="middle">韵</text>
  </g>

  <!-- Calligraphic Title Watermark in Classical Serif -->
  <text x="${width - 70}" y="42" font-family="'Noto Serif SC', 'Songti SC', serif" font-size="14" fill="${theme.primaryInk}" opacity="0.4" text-anchor="end" letter-spacing="3">
    ${title.slice(0, 8)}
  </text>
</svg>
`.trim();

    return svg;
  }
};
