/**
 * Offline CJK Stroke & Direction Analyzer for Handwriting Input (AIM-002)
 *
 * Classifies raw user pointer/mouse/touch strokes into Chinese stroke directions
 * and matches stroke counts & sequences against standard character databases.
 *
 * Standard 5 Main Stroke Classes (五笔 / 五种基本笔画):
 * 1: 横 (Hèng) - Horizontal: [0° to 35° or 325° to 360°]
 * 2: 竖 (Shù) - Vertical downwards: [60° to 120°]
 * 3: 撇 (Piě) - Left-falling slant: [125° to 170°]
 * 4: 点/捺 (Diǎn/Nà) - Dot or Right-falling slant: [25° to 75°]
 * 5: 折 (Zhé) - Turning / Hook: Strokes with abrupt angular change (> 60°)
 */

export interface StrokePoint {
  x: number;
  y: number;
  time?: number;
}

export type RawStroke = StrokePoint[];

export type StrokeType = '横' | '竖' | '撇' | '点捺' | '折';

export interface ClassifiedStroke {
  type: StrokeType;
  code: number; // 1: 横, 2: 竖, 3: 撇, 4: 点捺, 5: 折
  length: number;
  startPoint: StrokePoint;
  endPoint: StrokePoint;
}

export interface CharacterCandidate {
  character: string;
  pinyin: string;
  definition: string;
  hskLevel?: string;
  strokeCount: number;
  matchScore: number;
}

/**
 * Common stroke signature lookup for high-frequency Hanzi (HSK 1-6).
 * Code string is standard Wubi stroke order sequence (1:横, 2:竖, 3:撇, 4:点捺, 5:折).
 */
export const COMMON_CHARACTER_STROKES: Record<string, { strokes: number; code: string; pinyin: string; def: string; hsk: string }> = {
  '一': { strokes: 1, code: '1', pinyin: 'yī', def: 'one', hsk: '1' },
  '乙': { strokes: 1, code: '5', pinyin: 'yǐ', def: 'second, bend', hsk: '6' },
  '二': { strokes: 2, code: '11', pinyin: 'èr', def: 'two', hsk: '1' },
  '十': { strokes: 2, code: '12', pinyin: 'shí', def: 'ten', hsk: '1' },
  '人': { strokes: 2, code: '34', pinyin: 'rén', def: 'person, human', hsk: '1' },
  '入': { strokes: 2, code: '34', pinyin: 'rù', def: 'enter', hsk: '3' },
  '八': { strokes: 2, code: '34', pinyin: 'bā', def: 'eight', hsk: '1' },
  '几': { strokes: 2, code: '35', pinyin: 'jǐ', def: 'how many, a few', hsk: '1' },
  '九': { strokes: 2, code: '35', pinyin: 'jiǔ', def: 'nine', hsk: '1' },
  '了': { strokes: 2, code: '52', pinyin: 'le', def: 'completed action particle', hsk: '1' },
  '力': { strokes: 2, code: '53', pinyin: 'lì', def: 'power, strength', hsk: '2' },
  '刀': { strokes: 2, code: '53', pinyin: 'dāo', def: 'knife, blade', hsk: '3' },
  '又': { strokes: 2, code: '54', pinyin: 'yòu', def: 'again, also', hsk: '2' },
  '三': { strokes: 3, code: '111', pinyin: 'sān', def: 'three', hsk: '1' },
  '工': { strokes: 3, code: '121', pinyin: 'gōng', def: 'work, labor', hsk: '2' },
  '土': { strokes: 3, code: '121', pinyin: 'tǔ', def: 'earth, soil', hsk: '3' },
  '士': { strokes: 3, code: '121', pinyin: 'shì', def: 'scholar, warrior', hsk: '4' },
  '干': { strokes: 3, code: '112', pinyin: 'gān', def: 'dry, to do', hsk: '3' },
  '下': { strokes: 3, code: '124', pinyin: 'xià', def: 'below, under', hsk: '1' },
  '上': { strokes: 3, code: '211', pinyin: 'shàng', def: 'up, above', hsk: '1' },
  '口': { strokes: 3, code: '251', pinyin: 'kǒu', def: 'mouth, entrance', hsk: '1' },
  '山': { strokes: 3, code: '252', pinyin: 'shān', def: 'mountain, hill', hsk: '2' },
  '大': { strokes: 3, code: '134', pinyin: 'dà', def: 'big, large', hsk: '1' },
  '小': { strokes: 3, code: '234', pinyin: 'xiǎo', def: 'small, little', hsk: '1' },
  '个': { strokes: 3, code: '342', pinyin: 'gè', def: 'individual, measure word', hsk: '1' },
  '么': { strokes: 3, code: '354', pinyin: 'me', def: 'interrogative suffix', hsk: '1' },
  '女': { strokes: 3, code: '531', pinyin: 'nǚ', def: 'woman, female', hsk: '1' },
  '子': { strokes: 3, code: '521', pinyin: 'zǐ', def: 'child, son', hsk: '1' },
  '中': { strokes: 4, code: '2512', pinyin: 'zhōng', def: 'center, middle, China', hsk: '1' },
  '日': { strokes: 4, code: '2511', pinyin: 'rì', def: 'sun, day', hsk: '1' },
  '月': { strokes: 4, code: '3511', pinyin: 'yuè', def: 'moon, month', hsk: '1' },
  '水': { strokes: 4, code: '2534', pinyin: 'shuǐ', def: 'water', hsk: '1' },
  '火': { strokes: 4, code: '4334', pinyin: 'huǒ', def: 'fire', hsk: '2' },
  '木': { strokes: 4, code: '1234', pinyin: 'mù', def: 'wood, tree', hsk: '3' },
  '不': { strokes: 4, code: '1324', pinyin: 'bù', def: 'not, no', hsk: '1' },
  '心': { strokes: 4, code: '4544', pinyin: 'xīn', def: 'heart, mind', hsk: '2' },
  '手': { strokes: 4, code: '3112', pinyin: 'shǒu', def: 'hand', hsk: '2' },
  '文': { strokes: 4, code: '4134', pinyin: 'wén', def: 'culture, writing', hsk: '2' },
  '方': { strokes: 4, code: '4153', pinyin: 'fāng', def: 'square, direction', hsk: '3' },
  '天': { strokes: 4, code: '1134', pinyin: 'tiān', def: 'sky, day, heaven', hsk: '1' },
  '分': { strokes: 4, code: '3453', pinyin: 'fēn', def: 'minute, divide', hsk: '1' },
  '太': { strokes: 4, code: '1344', pinyin: 'tài', def: 'too, extremely', hsk: '1' },
  '开': { strokes: 4, code: '1132', pinyin: 'kāi', def: 'open, start', hsk: '1' },
  '白': { strokes: 5, code: '32511', pinyin: 'bái', def: 'white, clear', hsk: '2' },
  '他': { strokes: 5, code: '32525', pinyin: 'tā', def: 'he, him', hsk: '1' },
  '们': { strokes: 5, code: '32412', pinyin: 'men', def: 'plural marker', hsk: '1' },
  '本': { strokes: 5, code: '12341', pinyin: 'běn', def: 'root, book volume', hsk: '1' },
  '生': { strokes: 5, code: '31121', pinyin: 'shēng', def: 'birth, life, student', hsk: '1' },
  '出': { strokes: 5, code: '52522', pinyin: 'chū', def: 'go out, exit', hsk: '1' },
  '去': { strokes: 5, code: '12154', pinyin: 'qù', def: 'to go', hsk: '1' },
  '包': { strokes: 5, code: '35515', pinyin: 'bāo', def: 'bag, wrap', hsk: '2' },
  '好': { strokes: 6, code: '531521', pinyin: 'hǎo', def: 'good, well', hsk: '1' },
  '多': { strokes: 6, code: '354354', pinyin: 'duō', def: 'many, much', hsk: '1' },
  '年': { strokes: 6, code: '311212', pinyin: 'nián', def: 'year', hsk: '1' },
  '字': { strokes: 6, code: '445521', pinyin: 'zì', def: 'character, word', hsk: '1' },
  '会': { strokes: 6, code: '341154', pinyin: 'huì', def: 'can, meeting', hsk: '1' },
  '回': { strokes: 6, code: '252511', pinyin: 'huí', def: 'return, circle', hsk: '1' },
  '安': { strokes: 6, code: '445531', pinyin: 'ān', def: 'peaceful, safe', hsk: '2' },
  '来': { strokes: 7, code: '1431234', pinyin: 'lái', def: 'to come', hsk: '1' },
  '你': { strokes: 7, code: '3235234', pinyin: 'nǐ', def: 'you', hsk: '1' },
  '我': { strokes: 7, code: '3121534', pinyin: 'wǒ', def: 'I, me', hsk: '1' },
  '作': { strokes: 7, code: '3231211', pinyin: 'zuò', def: 'do, make', hsk: '1' },
  '话': { strokes: 8, code: '45312251', pinyin: 'huà', def: 'speech, spoken language', hsk: '1' },
  '国': { strokes: 8, code: '25112141', pinyin: 'guó', def: 'country, nation', hsk: '1' },
  '学': { strokes: 8, code: '44345521', pinyin: 'xué', def: 'study, learn', hsk: '1' },
  '和': { strokes: 8, code: '31234251', pinyin: 'hé', def: 'and, harmony', hsk: '1' },
  '明': { strokes: 8, code: '25113511', pinyin: 'míng', def: 'bright, clear, tomorrow', hsk: '1' },
  '的': { strokes: 8, code: '32511354', pinyin: 'de', def: 'possessive particle', hsk: '1' },
  '点': { strokes: 9, code: '212514444', pinyin: 'diǎn', def: 'point, o clock, dot', hsk: '1' },
  '是': { strokes: 9, code: '251112134', pinyin: 'shì', def: 'to be, yes', hsk: '1' },
  '说': { strokes: 9, code: '454325135', pinyin: 'shuō', def: 'to speak, say', hsk: '1' },
  '爱': { strokes: 10, code: '3443451134', pinyin: 'ài', def: 'love', hsk: '1' },
  '家': { strokes: 10, code: '4451353334', pinyin: 'jiā', def: 'family, home', hsk: '1' },
  '清': { strokes: 11, code: '44111212511', pinyin: 'qīng', def: 'clear, pure', hsk: '3' },
  '情': { strokes: 11, code: '44211212511', pinyin: 'qíng', def: 'feeling, emotion', hsk: '3' },
  '晴': { strokes: 12, code: '251111212511', pinyin: 'qíng', def: 'sunny, clear weather', hsk: '2' },
  '想': { strokes: 13, code: '123425114544', pinyin: 'xiǎng', def: 'think, miss, want', hsk: '1' },
  '精': { strokes: 14, code: '43123411212511', pinyin: 'jīng', def: 'essence, refined', hsk: '4' }
};

/**
 * Analyzes a sequence of (x,y) points drawn by the user and classifies it
 * into one of the 5 standard stroke types:
 * 1: 横, 2: 竖, 3: 撇, 4: 点捺, 5: 折
 */
export function classifyStroke(points: RawStroke): ClassifiedStroke {
  if (points.length < 2) {
    return {
      type: '点捺',
      code: 4,
      length: 0,
      startPoint: points[0] || { x: 0, y: 0 },
      endPoint: points[0] || { x: 0, y: 0 }
    };
  }

  const start = points[0];
  const end = points[points.length - 1];
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const directDist = Math.hypot(dx, dy);

  // Compute total path length
  let pathDist = 0;
  for (let i = 1; i < points.length; i++) {
    pathDist += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }

  // Detect angular deviation / turning (折)
  // If actual path distance is significantly longer than direct Euclidean distance (> 1.35x),
  // or if there's an abrupt change in angle between segments, it's a turning stroke (折).
  const curvatureRatio = directDist > 0 ? pathDist / directDist : 1;
  const hasSharpTurn = detectSharpTurn(points);

  if ((curvatureRatio > 1.38 || hasSharpTurn) && directDist > 20) {
    return {
      type: '折',
      code: 5,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }

  // Calculate angle in degrees from positive X axis [0 to 360]
  // In canvas, +Y is downward.
  let angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angle < 0) angle += 360;

  // 1. 横 (Horizontal): typically from left to right, angle around 0° / 360° or slight upward slant (-20° to +25°)
  if ((angle >= 335 || angle <= 35) || (angle >= 160 && angle <= 200 && Math.abs(dx) > Math.abs(dy) * 2.5)) {
    return {
      type: '横',
      code: 1,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }

  // 2. 竖 (Vertical downwards): 65° to 115°
  if (angle >= 65 && angle <= 115) {
    return {
      type: '竖',
      code: 2,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }

  // 3. 撇 (Left-falling slant): downward and leftward, 115° to 170°
  if (angle > 115 && angle <= 170) {
    return {
      type: '撇',
      code: 3,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }

  // 4. 点捺 (Dot or Right-falling slant): downward and rightward, 35° to 65°
  // Or very short stroke (length < 25px)
  if (pathDist < 25 || (angle > 35 && angle < 65)) {
    return {
      type: '点捺',
      code: 4,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }

  // Default fallback based on principal direction
  if (Math.abs(dx) > Math.abs(dy)) {
    return {
      type: '横',
      code: 1,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  } else {
    return {
      type: '竖',
      code: 2,
      length: pathDist,
      startPoint: start,
      endPoint: end
    };
  }
}

/**
 * Detects whether a stroke has a sharp direction pivot (e.g. 横折, 竖弯).
 */
function detectSharpTurn(points: RawStroke): boolean {
  if (points.length < 5) return false;

  const step = Math.max(1, Math.floor(points.length / 4));
  const mid1 = points[step];
  const mid2 = points[points.length - 1 - step];

  const angle1 = Math.atan2(mid1.y - points[0].y, mid1.x - points[0].x);
  const angle2 = Math.atan2(points[points.length - 1].y - mid2.y, points[points.length - 1].x - mid2.x);

  let diff = Math.abs(angle1 - angle2);
  if (diff > Math.PI) diff = 2 * Math.PI - diff;

  return diff > 0.85; // Roughly > 50 degrees difference
}

/**
 * Recognizes matching Chinese character candidates based on recorded user strokes.
 * Evaluates both:
 * 1. Stroke count exact & near match
 * 2. Prefix & Levenshtein similarity on the 5-stroke directional sequence (1..5)
 */
export function recognizeHandwriting(
  drawnStrokes: RawStroke[],
  externalHanziDb?: Array<{ character: string; stroke_count?: string | number; pinyin?: string; definition?: string; hsk_level?: string }>
): CharacterCandidate[] {
  if (drawnStrokes.length === 0) return [];

  const classified = drawnStrokes.map(classifyStroke);
  const drawnCount = classified.length;
  const userCode = classified.map(s => s.code).join('');

  const candidates: CharacterCandidate[] = [];

  // 1. Check verified common characters registry
  for (const [char, meta] of Object.entries(COMMON_CHARACTER_STROKES)) {
    let score = 0;

    // Stroke count match
    const strokeDiff = Math.abs(meta.strokes - drawnCount);
    if (strokeDiff === 0) {
      score += 50;
    } else if (strokeDiff === 1) {
      score += 25;
    } else if (strokeDiff === 2) {
      score += 10;
    } else {
      score -= strokeDiff * 10;
    }

    // Prefix code match
    if (meta.code.startsWith(userCode)) {
      score += 40;
    } else if (userCode.startsWith(meta.code)) {
      score += 30;
    }

    // Sequence similarity
    const sharedPrefix = getCommonPrefixLength(userCode, meta.code);
    score += sharedPrefix * 15;

    // Levenshtein distance on stroke sequence
    const dist = levenshtein(userCode, meta.code);
    score += Math.max(0, 30 - dist * 8);

    if (score > 15) {
      candidates.push({
        character: char,
        pinyin: meta.pinyin,
        definition: meta.def,
        hskLevel: meta.hsk,
        strokeCount: meta.strokes,
        matchScore: score
      });
    }
  }

  // 2. Fallback / supplement with full 10k HanziDB when available
  if (externalHanziDb && externalHanziDb.length > 0) {
    for (const item of externalHanziDb) {
      const char = item.character;
      if (!char || COMMON_CHARACTER_STROKES[char]) continue;

      const sc = parseInt(String(item.stroke_count || '0'), 10);
      if (sc === drawnCount) {
        candidates.push({
          character: char,
          pinyin: item.pinyin || '',
          definition: item.definition || '',
          hskLevel: String(item.hsk_level || ''),
          strokeCount: sc,
          matchScore: 30
        });
      }
    }
  }

  // Sort candidates by matchScore descending
  candidates.sort((a, b) => b.matchScore - a.matchScore);

  // Return top 12 matches
  return candidates.slice(0, 12);
}

function getCommonPrefixLength(a: string, b: string): number {
  let len = 0;
  const max = Math.min(a.length, b.length);
  while (len < max && a[len] === b[len]) {
    len++;
  }
  return len;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}
