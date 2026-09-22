export interface MinimalPairItem {
  char: string;
  pinyin: string;
  translation: string;
  tone: number;
}

export interface MinimalPair {
  id: string;
  category: 'retroflex_dental' | 'aspiration' | 'nasals' | 'palatals' | 'vowels';
  categoryLabel: string;
  contrastLabel: string; // e.g., "sh vs s"
  phonemicContrast: string;
  itemA: MinimalPairItem;
  itemB: MinimalPairItem;
  articulatoryTip: string;
  acousticFeature: string;
}

export const MINIMAL_PAIRS_CATALOG: MinimalPair[] = [
  // 1. Retroflex vs Dental Sibilants
  {
    id: 'rd-01',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'sh vs s',
    phonemicContrast: '[ʂ] vs [s]',
    itemA: { char: '是', pinyin: 'shì', translation: 'to be / yes', tone: 4 },
    itemB: { char: '四', pinyin: 'sì', translation: 'four', tone: 4 },
    articulatoryTip: 'For "sh" (是), curl your tongue tip upward toward the roof of your mouth. For "s" (四), keep the tongue tip flat resting behind your teeth.',
    acousticFeature: '"sh" produces a lower-pitched, darker turbulent hiss; "s" produces a crisp, sharp high-frequency whistle.'
  },
  {
    id: 'rd-02',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'sh vs s',
    phonemicContrast: '[ʂ] vs [s]',
    itemA: { char: '山', pinyin: 'shān', translation: 'mountain', tone: 1 },
    itemB: { char: '三', pinyin: 'sān', translation: 'three', tone: 1 },
    articulatoryTip: 'For "shān", hollow out the center of the tongue and retract slightly. For "sān", press sides against upper molars and expel air through the front teeth.',
    acousticFeature: 'Listen to the spectral centroid: "s" has higher acoustic friction.'
  },
  {
    id: 'rd-03',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'sh vs s',
    phonemicContrast: '[ʂ] vs [s]',
    itemA: { char: '书', pinyin: 'shū', translation: 'book', tone: 1 },
    itemB: { char: '苏', pinyin: 'sū', translation: 'revive / Suzhou', tone: 1 },
    articulatoryTip: 'Both use rounded lips for "u", but "shū" curls the tongue backward while "sū" keeps the blade of the tongue flat against alveolar ridge.',
    acousticFeature: 'Retroflex formant transition lowers F3 significantly.'
  },
  {
    id: 'rd-04',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'zh vs z',
    phonemicContrast: '[ʈʂ] vs [ts]',
    itemA: { char: '中', pinyin: 'zhōng', translation: 'middle / China', tone: 1 },
    itemB: { char: '宗', pinyin: 'zōng', translation: 'ancestor / school', tone: 1 },
    articulatoryTip: 'Both are unaspirated affricates. "zh" starts with tongue tip curled on post-alveolar zone; "z" starts with tongue tip touching back of front teeth.',
    acousticFeature: 'Affricate release burst is muffled and deeper for "zh", sharper for "z".'
  },
  {
    id: 'rd-05',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'zh vs z',
    phonemicContrast: '[ʈʂ] vs [ts]',
    itemA: { char: '知', pinyin: 'zhī', translation: 'to know', tone: 1 },
    itemB: { char: '资', pinyin: 'zī', translation: 'capital / resources', tone: 1 },
    articulatoryTip: 'Vowel [ʅ] in "zhī" resonates behind curled tongue. Vowel [ɿ] in "zī" is a dental apical buzzing sound right behind incisors.',
    acousticFeature: 'Distinct apical vowel coloration: "zhī" sounds like "jir", "zī" sounds like "dz-z".'
  },
  {
    id: 'rd-06',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'ch vs c',
    phonemicContrast: '[ʈʂʰ] vs [tsʰ]',
    itemA: { char: '出', pinyin: 'chū', translation: 'to go out / exit', tone: 1 },
    itemB: { char: '粗', pinyin: 'cū', translation: 'coarse / thick', tone: 1 },
    articulatoryTip: 'Both are heavily aspirated! Release a strong burst of breath. "ch" bursts from curled tongue; "c" bursts between tongue tip and upper teeth.',
    acousticFeature: 'High-pressure aspiration burst with retroflex cavity resonance on "ch".'
  },
  {
    id: 'rd-07',
    category: 'retroflex_dental',
    categoryLabel: 'Retroflex vs Dental Sibilants',
    contrastLabel: 'ch vs c',
    phonemicContrast: '[ʈʂʰ] vs [tsʰ]',
    itemA: { char: '草', pinyin: 'cǎo', translation: 'grass', tone: 3 },
    itemB: { char: '吵', pinyin: 'chǎo', translation: 'noisy / argue', tone: 3 },
    articulatoryTip: 'Notice the initial release: "cǎo" sounds like English "ts" in "cats", whereas "chǎo" sounds like English "ch" in "chalk".',
    acousticFeature: 'Aspiration onset and tongue position contrast.'
  },

  // 2. Aspirated vs Unaspirated Stops & Affricates
  {
    id: 'asp-01',
    category: 'aspiration',
    categoryLabel: 'Aspirated vs Unaspirated Stops',
    contrastLabel: 'b vs p',
    phonemicContrast: '[p] vs [pʰ]',
    itemA: { char: '爸', pinyin: 'bà', translation: 'father / dad', tone: 4 },
    itemB: { char: '怕', pinyin: 'pà', translation: 'to fear / afraid', tone: 4 },
    articulatoryTip: 'Mandarin "b" is completely voiceless (NOT voiced like English "b" in "boy"). The ONLY difference is aspiration: "p" releases a heavy puff of air, while "b" has zero air puff.',
    acousticFeature: 'Voice Onset Time (VOT): "b" has VOT < 20ms; "p" has long delay VOT > 80ms.'
  },
  {
    id: 'asp-02',
    category: 'aspiration',
    categoryLabel: 'Aspirated vs Unaspirated Stops',
    contrastLabel: 'b vs p',
    phonemicContrast: '[p] vs [pʰ]',
    itemA: { char: '包', pinyin: 'bāo', translation: 'bun / bag', tone: 1 },
    itemB: { char: '跑', pinyin: 'pǎo', translation: 'to run', tone: 3 },
    articulatoryTip: 'Hold a tissue paper in front of your lips: for "bāo" the paper should stay completely still; for "pǎo" the paper will fly forward vigorously.',
    acousticFeature: 'Explosive turbulent noise burst right after lip release.'
  },
  {
    id: 'asp-03',
    category: 'aspiration',
    categoryLabel: 'Aspirated vs Unaspirated Stops',
    contrastLabel: 'd vs t',
    phonemicContrast: '[t] vs [tʰ]',
    itemA: { char: '大', pinyin: 'dà', translation: 'big / large', tone: 4 },
    itemB: { char: '太', pinyin: 'tài', translation: 'too / extremely', tone: 4 },
    articulatoryTip: 'Tongue tip seals alveolar ridge for both. "d" releases without breath (like "t" in English "star"). "t" releases with forceful aspiration (like "t" in "tar").',
    acousticFeature: 'Aspiration duration and plosive release energy.'
  },
  {
    id: 'asp-04',
    category: 'aspiration',
    categoryLabel: 'Aspirated vs Unaspirated Stops',
    contrastLabel: 'g vs k',
    phonemicContrast: '[k] vs [kʰ]',
    itemA: { char: '哥', pinyin: 'gē', translation: 'elder brother', tone: 1 },
    itemB: { char: '渴', pinyin: 'kě', translation: 'thirsty', tone: 3 },
    articulatoryTip: 'Back of tongue contacts soft palate (velum). "g" releases silently into the vowel; "k" expels a throat breath before phonation.',
    acousticFeature: 'Velar plosive aspiration burst duration.'
  },
  {
    id: 'asp-05',
    category: 'aspiration',
    categoryLabel: 'Aspirated vs Unaspirated Stops',
    contrastLabel: 'g vs k',
    phonemicContrast: '[k] vs [kʰ]',
    itemA: { char: '狗', pinyin: 'gǒu', translation: 'dog', tone: 3 },
    itemB: { char: '口', pinyin: 'kǒu', translation: 'mouth / entrance', tone: 3 },
    articulatoryTip: 'Identical 3rd tone dipping pitch contour! Isolate purely whether you hear the forceful rush of air on "kǒu".',
    acousticFeature: 'Identical pitch; distinct Voice Onset Time.'
  },

  // 3. Nasal Codas (Alveolar -n vs Velar -ng)
  {
    id: 'nas-01',
    category: 'nasals',
    categoryLabel: 'Nasal Codas (-n vs -ng)',
    contrastLabel: 'in vs ing',
    phonemicContrast: '[-in] vs [-iŋ]',
    itemA: { char: '心', pinyin: 'xīn', translation: 'heart / mind', tone: 1 },
    itemB: { char: '星', pinyin: 'xīng', translation: 'star', tone: 1 },
    articulatoryTip: 'For "-in" (心), tongue tip touches roof behind front teeth, cutting off oral cavity. For "-ing" (星), tongue tip stays low and root rises against soft palate.',
    acousticFeature: '"-in" has a sharp nasal cutoff; "-ing" resonates openly in the nasopharynx like a bell ringing.'
  },
  {
    id: 'nas-02',
    category: 'nasals',
    categoryLabel: 'Nasal Codas (-n vs -ng)',
    contrastLabel: 'in vs ing',
    phonemicContrast: '[-in] vs [-iŋ]',
    itemA: { char: '金', pinyin: 'jīn', translation: 'gold / metal', tone: 1 },
    itemB: { char: '京', pinyin: 'jīng', translation: 'capital (Beijing)', tone: 1 },
    articulatoryTip: 'Feel the vibration: place a finger on the bridge of your nose. "-in" terminates forward; "-ing" rings backward into the throat.',
    acousticFeature: 'Velar nasal formant nasalization extends into the vowel.'
  },
  {
    id: 'nas-03',
    category: 'nasals',
    categoryLabel: 'Nasal Codas (-n vs -ng)',
    contrastLabel: 'an vs ang',
    phonemicContrast: '[an] vs [ɑŋ]',
    itemA: { char: '蓝', pinyin: 'lán', translation: 'blue', tone: 2 },
    itemB: { char: '狼', pinyin: 'láng', translation: 'wolf', tone: 2 },
    articulatoryTip: 'Notice the vowel shift! In "lán", the "a" is front [a]. In "láng", the vowel automatically shifts to back [ɑ] before the "-ng".',
    acousticFeature: 'Clear F1/F2 vowel shift: back [ɑ] in "-ang" versus bright front [a] in "-an".'
  },
  {
    id: 'nas-04',
    category: 'nasals',
    categoryLabel: 'Nasal Codas (-n vs -ng)',
    contrastLabel: 'en vs eng',
    phonemicContrast: '[ən] vs [əŋ]',
    itemA: { char: '真', pinyin: 'zhēn', translation: 'real / truly', tone: 1 },
    itemB: { char: '争', pinyin: 'zhēng', translation: 'struggle / strive', tone: 1 },
    articulatoryTip: '"zhēn" finishes with front dental closure. "zhēng" finishes with open oral airway and velar contact.',
    acousticFeature: 'Nasal antiformants and coda resonant chamber volume.'
  },

  // 4. Palatals (j, q, x)
  {
    id: 'pal-01',
    category: 'palatals',
    categoryLabel: 'Alveolo-Palatals (j, q, x)',
    contrastLabel: 'j vs q',
    phonemicContrast: '[tɕ] vs [tɕʰ]',
    itemA: { char: '机', pinyin: 'jī', translation: 'machine / plane', tone: 1 },
    itemB: { char: '期', pinyin: 'qī', translation: 'period / phase', tone: 1 },
    articulatoryTip: 'Tongue blade contacts hard palate. "j" is unaspirated (sounds similar to "j" in "jeep" without voicing). "q" has intense aspiration (like "ch" in "cheese").',
    acousticFeature: 'High friction duration and aspiration burst energy on "q".'
  },
  {
    id: 'pal-02',
    category: 'palatals',
    categoryLabel: 'Alveolo-Palatals (j, q, x)',
    contrastLabel: 'j vs x',
    phonemicContrast: '[tɕ] vs [ɕ]',
    itemA: { char: '鸡', pinyin: 'jī', translation: 'chicken', tone: 1 },
    itemB: { char: '西', pinyin: 'xī', translation: 'west', tone: 1 },
    articulatoryTip: '"j" is an affricate (starts with complete closure then releases). "x" is a continuous fricative (no stop/plosive start, continuous smooth hiss).',
    acousticFeature: 'Affricate plosive transient on "j" versus continuous friction on "x".'
  },
  {
    id: 'pal-03',
    category: 'palatals',
    categoryLabel: 'Alveolo-Palatals (j, q, x)',
    contrastLabel: 'q vs x',
    phonemicContrast: '[tɕʰ] vs [ɕ]',
    itemA: { char: '前', pinyin: 'qián', translation: 'front / before', tone: 2 },
    itemB: { char: '钱', pinyin: 'qián', translation: 'money', tone: 2 },
    articulatoryTip: 'Homophone check: Both "前" and "钱" are identical in sound! But compare either with "线" (xiàn): "q" has an initial explosive tap; "x" glides in without a tap.',
    acousticFeature: 'Initial closure burst presence.'
  },

  // 5. Vowels & Semivowels
  {
    id: 'vow-01',
    category: 'vowels',
    categoryLabel: 'Umlaut & Rounded Vowels',
    contrastLabel: 'u vs ü',
    phonemicContrast: '[u] vs [y]',
    itemA: { char: '路', pinyin: 'lù', translation: 'road / path', tone: 4 },
    itemB: { char: '绿', pinyin: 'lǜ', translation: 'green', tone: 4 },
    articulatoryTip: 'For "u" (路), back of tongue is raised toward soft palate. For "ü" (绿), tongue is in the high-front position (like English "ee"), but lips are tightly rounded into an "o".',
    acousticFeature: 'High F2 for "ü" (front vowel) versus low F2 for "u" (back vowel).'
  },
  {
    id: 'vow-02',
    category: 'vowels',
    categoryLabel: 'Umlaut & Rounded Vowels',
    contrastLabel: 'u vs ü',
    phonemicContrast: '[u] vs [y]',
    itemA: { char: '努', pinyin: 'nǔ', translation: 'strive / exert', tone: 3 },
    itemB: { char: '女', pinyin: 'nǚ', translation: 'female / woman', tone: 3 },
    articulatoryTip: 'Say "nǐ" and hold your tongue still, then without moving your tongue, purse your lips into a whistle circle to pronounce "nǚ". Compare with relaxed back tongue "nǔ".',
    acousticFeature: 'Distinct front cavity resonance.'
  }
];
