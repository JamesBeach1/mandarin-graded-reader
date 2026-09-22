/**
 * Comprehensive Pinyin to Zhuyin (Bopomofo 注音符号) Converter
 * TRC-002: Zhuyin Phonetic Support
 */

// Tone marks in standard Bopomofo:
// Tone 1: unmarked
// Tone 2: ˊ (\u02CA)
// Tone 3: ˇ (\u02C7)
// Tone 4: ˋ (\u02CB)
// Tone 5 (Neutral): ˙ (\u02D9)

const TONE_MARKS: Record<number, string> = {
  1: '',
  2: 'ˊ',
  3: 'ˇ',
  4: 'ˋ',
  5: '˙'
};

// Syllable root mapping (toneless lowercase -> Zhuyin characters)
const SYLLABLE_TO_ZHUYIN: Record<string, string> = {
  // A
  a: 'ㄚ', ai: 'ㄞ', an: 'ㄢ', ang: 'ㄤ', ao: 'ㄠ',
  // B
  ba: 'ㄅㄚ', bai: 'ㄅㄞ', ban: 'ㄅㄢ', bang: 'ㄅㄤ', bao: 'ㄅㄠ',
  bei: 'ㄅㄟ', ben: 'ㄅㄣ', beng: 'ㄅㄥ', bi: 'ㄅㄧ', bian: 'ㄅㄧㄢ',
  biao: 'ㄅㄧㄠ', bie: 'ㄅㄧㄝ', bin: 'ㄅㄧㄣ', bing: 'ㄅㄧㄥ', bo: 'ㄅㄛ', bu: 'ㄅㄨ',
  // C
  ca: 'ㄘㄚ', cai: 'ㄘㄞ', can: 'ㄘㄢ', cang: 'ㄘㄤ', cao: 'ㄘㄠ',
  ce: 'ㄘㄜ', cen: 'ㄘㄣ', ceng: 'ㄘㄥ', cha: 'ㄔㄚ', chai: 'ㄔㄞ',
  chan: 'ㄔㄢ', chang: 'ㄔㄤ', chao: 'ㄔㄠ', che: 'ㄔㄜ', chen: 'ㄔㄣ',
  cheng: 'ㄔㄥ', chi: 'ㄔ', chong: 'ㄔㄨㄥ', chou: 'ㄔㄡ', chu: 'ㄔㄨ',
  chua: 'ㄔㄨㄚ', chuai: 'ㄔㄨㄞ', chuan: 'ㄔㄨㄢ', chuang: 'ㄔㄨㄤ',
  chui: 'ㄔㄨㄟ', chun: 'ㄔㄨㄣ', chuo: 'ㄔㄨㄛ', ci: 'ㄘ', cong: 'ㄘㄨㄥ',
  cou: 'ㄘㄡ', cu: 'ㄘㄨ', cuan: 'ㄘㄨㄢ', cui: 'ㄘㄨㄟ', cun: 'ㄘㄨㄣ', cuo: 'ㄘㄨㄛ',
  // D
  da: 'ㄉㄚ', dai: 'ㄉㄞ', dan: 'ㄉㄢ', dang: 'ㄉㄤ', dao: 'ㄉㄠ',
  de: 'ㄉㄜ', dei: 'ㄉㄟ', den: 'ㄉㄣ', deng: 'ㄉㄥ', di: 'ㄉㄧ',
  dia: 'ㄉㄧㄚ', dian: 'ㄉㄧㄢ', diao: 'ㄉㄧㄠ', die: 'ㄉㄧㄝ', ding: 'ㄉㄧㄥ',
  diu: 'ㄉㄧㄡ', dong: 'ㄉㄨㄥ', dou: 'ㄉㄡ', du: 'ㄉㄨ', duan: 'ㄉㄨㄢ',
  dui: 'ㄉㄨㄟ', dun: 'ㄉㄨㄣ', duo: 'ㄉㄨㄛ',
  // E
  e: 'ㄜ', ei: 'ㄟ', en: 'ㄣ', eng: 'ㄥ', er: 'ㄦ',
  // F
  fa: 'ㄈㄚ', fan: 'ㄈㄢ', fang: 'ㄈㄤ', fei: 'ㄈㄟ', fen: 'ㄈㄣ',
  feng: 'ㄈㄥ', fo: 'ㄈㄛ', fou: 'ㄈㄡ', fu: 'ㄈㄨ',
  // G
  ga: 'ㄍㄚ', gai: 'ㄍㄞ', gan: 'ㄍㄢ', gang: 'ㄍㄤ', gao: 'ㄍㄠ',
  ge: 'ㄍㄜ', gei: 'ㄍㄟ', gen: 'ㄍㄣ', geng: 'ㄍㄥ', gong: 'ㄍㄨㄥ',
  gou: 'ㄍㄡ', gu: 'ㄍㄨ', gua: 'ㄍㄨㄚ', guai: 'ㄍㄨㄞ', guan: 'ㄍㄨㄢ',
  guang: 'ㄍㄨㄤ', gui: 'ㄍㄨㄟ', gun: 'ㄍㄨㄣ', guo: 'ㄍㄨㄛ',
  // H
  ha: 'ㄏㄚ', hai: 'ㄏㄞ', han: 'ㄏㄢ', hang: 'ㄏㄤ', hao: 'ㄏㄠ',
  he: 'ㄏㄜ', hei: 'ㄏㄟ', hen: 'ㄏㄣ', heng: 'ㄏㄥ', hong: 'ㄏㄨㄥ',
  hou: 'ㄏㄡ', hu: 'ㄏㄨ', hua: 'ㄏㄨㄚ', huai: 'ㄏㄨㄞ', huan: 'ㄏㄨㄢ',
  huang: 'ㄏㄨㄤ', hui: 'ㄏㄨㄟ', hun: 'ㄏㄨㄣ', huo: 'ㄏㄨㄛ',
  // J
  ji: 'ㄐㄧ', jia: 'ㄐㄧㄚ', jian: 'ㄐㄧㄢ', jiang: 'ㄐㄧㄤ', jiao: 'ㄐㄧㄠ',
  jie: 'ㄐㄧㄝ', jin: 'ㄐㄧㄣ', jing: 'ㄐㄧㄥ', jiong: 'ㄐㄩㄥ', jiu: 'ㄐㄧㄡ',
  ju: 'ㄐㄩ', juan: 'ㄐㄩㄢ', jue: 'ㄐㄩㄝ', jun: 'ㄐㄩㄣ',
  // K
  ka: 'ㄎㄚ', kai: 'ㄎㄞ', kan: 'ㄎㄢ', kang: 'ㄎㄤ', kao: 'ㄎㄠ',
  ke: 'ㄎㄜ', kei: 'ㄎㄟ', ken: 'ㄎㄣ', keng: 'ㄎㄥ', kong: 'ㄎㄨㄥ',
  kou: 'ㄎㄡ', ku: 'ㄎㄨ', kua: 'ㄎㄨㄚ', kuai: 'ㄎㄨㄞ', kuan: 'ㄎㄨㄢ',
  kuang: 'ㄎㄨㄤ', kui: 'ㄎㄨㄟ', kun: 'ㄎㄨㄣ', kuo: 'ㄎㄨㄛ',
  // L
  la: 'ㄌㄚ', lai: 'ㄌㄞ', lan: 'ㄌㄢ', lang: 'ㄌㄤ', lao: 'ㄌㄠ',
  le: 'ㄌㄜ', lei: 'ㄌㄟ', leng: 'ㄌㄥ', li: 'ㄌㄧ', lia: 'ㄌㄧㄚ',
  lian: 'ㄌㄧㄢ', liang: 'ㄌㄧㄤ', liao: 'ㄌㄧㄠ', lie: 'ㄌㄧㄝ', lin: 'ㄌㄧㄣ',
  ling: 'ㄌㄧㄥ', liu: 'ㄌㄧㄡ', long: 'ㄌㄨㄥ', lou: 'ㄌㄡ', lu: 'ㄌㄨ',
  luan: 'ㄌㄨㄢ', lun: 'ㄌㄨㄣ', luo: 'ㄌㄨㄛ', lv: 'ㄌㄩ', lüe: 'ㄌㄩㄝ', lue: 'ㄌㄩㄝ',
  // M
  ma: 'ㄇㄚ', mai: 'ㄇㄞ', man: 'ㄇㄢ', mang: 'ㄇㄤ', mao: 'ㄇㄠ',
  me: 'ㄇㄜ', mei: 'ㄇㄟ', men: 'ㄇㄣ', meng: 'ㄇㄥ', mi: 'ㄇㄧ',
  mian: 'ㄇㄧㄢ', miao: 'ㄇㄧㄠ', mie: 'ㄇㄧㄝ', min: 'ㄇㄧㄣ', ming: 'ㄇㄧㄥ',
  miu: 'ㄇㄧㄡ', mo: 'ㄇㄛ', mou: 'ㄇㄡ', mu: 'ㄇㄨ',
  // N
  na: 'ㄋㄚ', nai: 'ㄋㄞ', nan: 'ㄋㄢ', nang: 'ㄋㄤ', nao: 'ㄋㄠ',
  ne: 'ㄋㄜ', nei: 'ㄋㄟ', nen: 'ㄋㄣ', neng: 'ㄋㄥ', ni: 'ㄋㄧ',
  nia: 'ㄋㄧㄚ', nian: 'ㄋㄧㄢ', niang: 'ㄋㄧㄤ', niao: 'ㄋㄧㄠ', nie: 'ㄋㄧㄝ',
  nin: 'ㄋㄧㄣ', ning: 'ㄋㄧㄥ', niu: 'ㄋㄧㄡ', nong: 'ㄋㄨㄥ', nou: 'ㄋㄡ',
  nu: 'ㄋㄨ', nuan: 'ㄋㄨㄢ', nun: 'ㄋㄨㄣ', nuo: 'ㄋㄨㄛ', nv: 'ㄋㄩ', nüe: 'ㄋㄩㄝ', nue: 'ㄋㄩㄝ',
  // O
  o: 'ㄛ', ou: 'ㄡ',
  // P
  pa: 'ㄆㄚ', pai: 'ㄆㄞ', pan: 'ㄆㄢ', pang: 'ㄆㄤ', pao: 'ㄆㄠ',
  pei: 'ㄆㄟ', pen: 'ㄆㄣ', peng: 'ㄆㄥ', pi: 'ㄆㄧ', pian: 'ㄆㄧㄢ',
  piao: 'ㄆㄧㄠ', pie: 'ㄆㄧㄝ', pin: 'ㄆㄧㄣ', ping: 'ㄆㄧㄥ', po: 'ㄆㄛ',
  pou: 'ㄆㄡ', pu: 'ㄆㄨ',
  // Q
  qi: 'ㄑㄧ', qia: 'ㄑㄧㄚ', qian: 'ㄑㄧㄢ', qiang: 'ㄑㄧㄤ', qiao: 'ㄑㄧㄠ',
  qie: 'ㄑㄧㄝ', qin: 'ㄑㄧㄣ', qing: 'ㄑㄧㄥ', qiong: 'ㄑㄩㄥ', qiu: 'ㄑㄧㄡ',
  qu: 'ㄑㄩ', quan: 'ㄑㄩㄢ', que: 'ㄑㄩㄝ', qun: 'ㄑㄩㄣ',
  // R
  ran: 'ㄖㄢ', rang: 'ㄖㄤ', rao: 'ㄖㄠ', re: 'ㄖㄜ', ren: 'ㄖㄣ',
  reng: 'ㄖㄥ', ri: 'ㄖ', rong: 'ㄖㄨㄥ', rou: 'ㄖㄡ', ru: 'ㄖㄨ',
  ruan: 'ㄖㄨㄢ', rui: 'ㄖㄨㄟ', run: 'ㄖㄨㄣ', ruo: 'ㄖㄨㄛ',
  // S
  sa: 'ㄙㄚ', sai: 'ㄙㄞ', san: 'ㄙㄢ', sang: 'ㄙㄤ', sao: 'ㄙㄠ',
  se: 'ㄙㄜ', sen: 'ㄙㄣ', seng: 'ㄙㄥ', sha: 'ㄕㄚ', shai: 'ㄕㄞ',
  shan: 'ㄕㄢ', shang: 'ㄕㄤ', shao: 'ㄕㄠ', she: 'ㄕㄜ', shei: 'ㄕㄟ',
  shen: 'ㄕㄣ', sheng: 'ㄕㄥ', shi: 'ㄕ', shou: 'ㄕㄡ', shu: 'ㄕㄨ',
  shua: 'ㄕㄨㄚ', shuai: 'ㄕㄨㄞ', shuan: 'ㄕㄨㄢ', shuang: 'ㄕㄨㄤ',
  shui: 'ㄕㄨㄟ', shun: 'ㄕㄨㄣ', shuo: 'ㄕㄨㄛ', si: 'ㄙ', song: 'ㄙㄨㄥ',
  sou: 'ㄙㄡ', su: 'ㄙㄨ', suan: 'ㄙㄨㄢ', sui: 'ㄙㄨㄟ', sun: 'ㄙㄨㄣ', suo: 'ㄙㄨㄛ',
  // T
  ta: 'ㄊㄚ', tai: 'ㄊㄞ', tan: 'ㄊㄢ', tang: 'ㄊㄤ', tao: 'ㄊㄠ',
  te: 'ㄊㄜ', tei: 'ㄊㄟ', teng: 'ㄊㄥ', ti: 'ㄊㄧ', tian: 'ㄊㄧㄢ',
  tiao: 'ㄊㄧㄠ', tie: 'ㄊㄧㄝ', ting: 'ㄊㄧㄥ', tong: 'ㄊㄨㄥ', tou: 'ㄊㄡ',
  tu: 'ㄊㄨ', tuan: 'ㄊㄨㄢ', tui: 'ㄊㄨㄟ', tun: 'ㄊㄨㄣ', tuo: 'ㄊㄨㄛ',
  // W
  wa: 'ㄨㄚ', wai: 'ㄨㄞ', wan: 'ㄨㄢ', wang: 'ㄨㄤ', wei: 'ㄨㄟ',
  wen: 'ㄨㄣ', weng: 'ㄨㄥ', wo: 'ㄨㄛ', wu: 'ㄨ',
  // X
  xi: 'ㄒㄧ', xia: 'ㄒㄧㄚ', xian: 'ㄒㄧㄢ', xiang: 'ㄒㄧㄤ', xiao: 'ㄒㄧㄠ',
  xie: 'ㄒㄧㄝ', xin: 'ㄒㄧㄣ', xing: 'ㄒㄧㄥ', xiong: 'ㄒㄩㄥ', xiu: 'ㄒㄧㄡ',
  xu: 'ㄒㄩ', xuan: 'ㄒㄩㄢ', xue: 'ㄒㄩㄝ', xun: 'ㄒㄩㄣ',
  // Y
  ya: 'ㄧㄚ', yan: 'ㄧㄢ', yang: 'ㄧㄤ', yao: 'ㄧㄠ', ye: 'ㄧㄝ',
  yi: 'ㄧ', yin: 'ㄧㄣ', ying: 'ㄧㄥ', yo: 'ㄧㄛ', yong: 'ㄩㄥ',
  you: 'ㄧㄡ', yu: 'ㄩ', yuan: 'ㄩㄢ', yue: 'ㄩㄝ', yun: 'ㄩㄣ',
  // Z
  za: 'ㄗㄚ', zai: 'ㄗㄞ', zan: 'ㄗㄢ', zang: 'ㄗㄤ', zao: 'ㄗㄠ',
  ze: 'ㄗㄜ', zei: 'ㄗㄟ', zen: 'ㄗㄣ', zeng: 'ㄗㄥ', zha: 'ㄓㄚ',
  zhai: 'ㄓㄞ', zhan: 'ㄓㄢ', zhang: 'ㄓㄤ', zhao: 'ㄓㄠ', zhe: 'ㄓㄜ',
  zhei: 'ㄓㄟ', zhen: 'ㄓㄣ', zheng: 'ㄓㄥ', zhi: 'ㄓ', zhong: 'ㄓㄨㄥ',
  zhou: 'ㄓㄡ', zhu: 'ㄓㄨ', zhua: 'ㄓㄨㄚ', zhuai: 'ㄓㄨㄞ', zhuan: 'ㄓㄨㄢ',
  zhuang: 'ㄓㄨㄤ', zhui: 'ㄓㄨㄟ', zhun: 'ㄓㄨㄣ', zhuo: 'ㄓㄨㄛ',
  zi: 'ㄗ', zong: 'ㄗㄨㄥ', zou: 'ㄗㄡ', zu: 'ㄗㄨ', zuan: 'ㄗㄨㄢ',
  zui: 'ㄗㄨㄟ', zun: 'ㄗㄨㄣ', zuo: 'ㄗㄨㄛ'
};

// Map toned vowel characters to tone number and base vowel
const VOWEL_MAP: Record<string, { base: string; tone: number }> = {
  // A
  ā: { base: 'a', tone: 1 }, á: { base: 'a', tone: 2 }, ǎ: { base: 'a', tone: 3 }, à: { base: 'a', tone: 4 },
  // E
  ē: { base: 'e', tone: 1 }, é: { base: 'e', tone: 2 }, ě: { base: 'e', tone: 3 }, è: { base: 'e', tone: 4 },
  // I
  ī: { base: 'i', tone: 1 }, í: { base: 'i', tone: 2 }, ǐ: { base: 'i', tone: 3 }, ì: { base: 'i', tone: 4 },
  // O
  ō: { base: 'o', tone: 1 }, ó: { base: 'o', tone: 2 }, ǒ: { base: 'o', tone: 3 }, ò: { base: 'o', tone: 4 },
  // U
  ū: { base: 'u', tone: 1 }, ú: { base: 'u', tone: 2 }, ǔ: { base: 'u', tone: 3 }, ù: { base: 'u', tone: 4 },
  // Ü
  ǖ: { base: 'v', tone: 1 }, ǘ: { base: 'v', tone: 2 }, ǚ: { base: 'v', tone: 3 }, ǜ: { base: 'v', tone: 4 },
  ü: { base: 'v', tone: 5 }, v: { base: 'v', tone: 5 }
};

/**
 * Converts a single Pinyin syllable (with tone mark or neutral) to Zhuyin
 * e.g., "shì" -> "ㄕˋ", "zhōng" -> "ㄓㄨㄥ", "hǎo" -> "ㄏㄠˇ", "de" -> "ㄉㄜ˙"
 */
export function pinyinSyllableToZhuyin(syllable: string): string {
  if (!syllable || !syllable.trim()) return syllable;

  const cleaned = syllable.toLowerCase().trim();
  let tone = 5; // default neutral
  let toneless = '';

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (VOWEL_MAP[char]) {
      toneless += VOWEL_MAP[char].base;
      if (VOWEL_MAP[char].tone !== 5) {
        tone = VOWEL_MAP[char].tone;
      }
    } else if (char >= '1' && char <= '5') {
      tone = parseInt(char);
    } else if (char.match(/[a-z]/)) {
      toneless += char;
    }
  }

  // Look up base zhuyin
  let zhuyin = SYLLABLE_TO_ZHUYIN[toneless];
  if (!zhuyin) {
    // Fallback if not found: return cleaned
    return syllable;
  }

  // Append tone mark
  const toneMark = TONE_MARKS[tone] || '';
  if (tone === 5) {
    // In Zhuyin, neutral tone dot can be prefixed: ˙ㄉㄜ
    return `˙${zhuyin}`;
  }
  return `${zhuyin}${toneMark}`;
}

/**
 * Converts any Pinyin string (single word, phrase, or multi-syllables with spaces) to Zhuyin
 * e.g., "nǐ hǎo" -> "ㄋㄧˇ ㄏㄠˇ", "běijīng" -> "ㄅㄟˇ ㄐㄧㄥ"
 */
export function pinyinToZhuyin(pinyin: string): string {
  if (!pinyin || typeof pinyin !== 'string') return '';

  // Split on spaces or apostrophes
  const parts = pinyin.split(/([\s',.-]+)/);
  return parts.map(part => {
    if (part.match(/^[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]+$/)) {
      return pinyinSyllableToZhuyin(part);
    }
    return part;
  }).join('');
}
