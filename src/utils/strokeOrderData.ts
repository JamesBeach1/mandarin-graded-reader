/**
 * Moyun Stroke Order Engine & Typographic Registry (AIM-010)
 * Provides traditional Chinese stroke classifications, standard rules of stroke order,
 * and progressive stroke breakdown models for Mandarin typography.
 */

export interface StrokeInfo {
  index: number;
  name: string;
  pinyin: string;
  direction: string;
  symbol: string;
}

export const BASIC_CHINESE_STROKES: Record<string, { name: string; pinyin: string; direction: string; symbol: string }> = {
  '一': { name: '横', pinyin: 'hèng', direction: 'Left to right (从左到右)', symbol: '一' },
  '丨': { name: '竖', pinyin: 'shù', direction: 'Top to bottom (从上到下)', symbol: '丨' },
  '丿': { name: '撇', pinyin: 'piě', direction: 'Top-right to bottom-left (从右上到左下)', symbol: '丿' },
  '丶': { name: '点', pinyin: 'diǎn', direction: 'Top-left to bottom-right (从左上到右下)', symbol: '丶' },
  '乀': { name: '捺', pinyin: 'nà', direction: 'Top-left to bottom-right (从左上到右下)', symbol: '乀' },
  '提': { name: '提', pinyin: 'tí', direction: 'Bottom-left to top-right (从左下到右上)', symbol: '㇀' },
  '乛': { name: '横折', pinyin: 'hèng zhé', direction: 'Horizontal then downward bend', symbol: '乛' },
  '亅': { name: '竖钩', pinyin: 'shù gōu', direction: 'Vertical then left hook', symbol: '亅' },
  '乚': { name: '竖弯钩', pinyin: 'shù wān gōu', direction: 'Vertical curve then upward hook', symbol: '乚' },
  '乙': { name: '横折弯钩', pinyin: 'hèng zhé wān gōu', direction: 'Horizontal, bend, curve and hook', symbol: '乙' }
};

export const STROKE_ORDER_RULES = [
  { rule: '先横后竖', pinyin: 'Xiān hèng hòu shù', description: 'Horizontal before vertical', example: '十 (一 then 丨)' },
  { rule: '先撇后捺', pinyin: 'Xiān piě hòu nà', description: 'Left falling before right falling', example: '八 (丿 then 乀)' },
  { rule: '从上到下', pinyin: 'Cóng shàng dào xià', description: 'Top before bottom', example: '三 (top, middle, bottom)' },
  { rule: '从左到右', pinyin: 'Cóng zuǒ dào yòu', description: 'Left before right', example: '川 (left, center, right)' },
  { rule: '从外到内', pinyin: 'Cóng wài dào nèi', description: 'Outside before inside', example: '月 (frame first, then inside strokes)' },
  { rule: '先里头后封口', pinyin: 'Xiān lǐtou hòu fēngkǒu', description: 'Inside contents before closing frame', example: '日, 国 (frame, contents, bottom horizontal seal)' },
  { rule: '先中间后两边', pinyin: 'Xiān zhōngjiān hòu liǎngbiān', description: 'Center before both sides', example: '小, 水 (center hook, then left & right wings)' }
];

export const StrokeOrderService = {
  getRules() {
    return STROKE_ORDER_RULES;
  },

  getStrokeCatalog() {
    return Object.entries(BASIC_CHINESE_STROKES).map(([key, val]) => ({
      key,
      ...val
    }));
  }
};
