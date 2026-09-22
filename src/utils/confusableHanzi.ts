/**
 * Look-Alike / Visually Similar Hanzi (形近字) Catalog & Quiz Engine
 * SRS-005: Contextual quizzes distinguishing visually confusable pairs.
 */

export interface ConfusableItem {
  character: string;
  pinyin: string;
  definition: string;
  hskLevel?: string;
  strokeDifference: string; // The distinguishing visual feature
}

export interface ConfusableCluster {
  id: string;
  title: string;
  characters: ConfusableItem[];
  pedagogicalTip: string;
}

export interface LookAlikeQuizQuestion {
  id: string;
  clusterId: string;
  sentencePrompt: string; // Sentence with blank [ ___ ]
  sentenceTranslation: string;
  correctCharacter: string;
  distractors: string[];
  options: string[];
  explanation: string;
}

export const CONFUSABLE_CLUSTERS: ConfusableCluster[] = [
  {
    id: 'ji-yi-si',
    title: '已 vs 己 vs 巳',
    characters: [
      { character: '己', pinyin: 'jǐ', definition: 'oneself, self; 6th earthly branch', hskLevel: '2', strokeDifference: 'Top opening is completely open (开口己).' },
      { character: '已', pinyin: 'yǐ', definition: 'already, stop, cease', hskLevel: '2', strokeDifference: 'Top stroke extends halfway across (半开已).' },
      { character: '巳', pinyin: 'sì', definition: '6th earthly branch (snake)', hskLevel: '6', strokeDifference: 'Top loop is completely closed (合口巳).' }
    ],
    pedagogicalTip: 'Mnemonic rhyme: 开口己 (kāi kǒu jǐ), 半开已 (bàn kāi yǐ), 合口巳 (hé kǒu sì).'
  },
  {
    id: 'wei-mo',
    title: '未 vs 末',
    characters: [
      { character: '未', pinyin: 'wèi', definition: 'not yet, future, have not', hskLevel: '3', strokeDifference: 'Top horizontal stroke is shorter than the bottom horizontal stroke.' },
      { character: '末', pinyin: 'mò', definition: 'end, final stage, tip, powder', hskLevel: '3', strokeDifference: 'Top horizontal stroke is longer than the bottom horizontal stroke.' }
    ],
    pedagogicalTip: '未 (wèi) represents a tree whose branches have not fully grown (shorter top). 末 (mò) represents the very tip or end of a branch (longer top).'
  },
  {
    id: 'tu-shi',
    title: '土 vs 士',
    characters: [
      { character: '土', pinyin: 'tǔ', definition: 'earth, soil, ground, local', hskLevel: '2', strokeDifference: 'Bottom horizontal stroke is longer than top stroke.' },
      { character: '士', pinyin: 'shì', definition: 'scholar, soldier, person of rank', hskLevel: '4', strokeDifference: 'Top horizontal stroke is longer than bottom stroke.' }
    ],
    pedagogicalTip: '土 (earth) stands grounded with a wider base. 士 (scholar) has wide shoulders representing intellect and dignity.'
  },
  {
    id: 'ri-yue',
    title: '日 vs 曰',
    characters: [
      { character: '日', pinyin: 'rì', definition: 'sun, day, date', hskLevel: '1', strokeDifference: 'Tall and narrow rectangle.' },
      { character: '曰', pinyin: 'yuē', definition: 'to say, speak (classical)', hskLevel: '5', strokeDifference: 'Wider and squatter rectangle, like an open mouth.' }
    ],
    pedagogicalTip: '日 is slender like the rising sun pillar. 曰 is wide like a talking mouth.'
  },
  {
    id: 'jian-bei',
    title: '见 vs 贝',
    characters: [
      { character: '见', pinyin: 'jiàn', definition: 'see, meet, view', hskLevel: '1', strokeDifference: 'Bottom legs end with a curved hook (竖弯钩).' },
      { character: '贝', pinyin: 'bèi', definition: 'cowrie shell, treasure, money', hskLevel: '3', strokeDifference: 'Bottom consists of two downward diagonal spread strokes (撇和点).' }
    ],
    pedagogicalTip: '见 is an eye on legs walking to look. 贝 is an ancient cowrie shell standing firmly.'
  },
  {
    id: 'guang-chang',
    title: '广 vs 厂',
    characters: [
      { character: '广', pinyin: 'guǎng', definition: 'broad, wide, shelter radical', hskLevel: '3', strokeDifference: 'Has a top dot (点) on the shelter roof.' },
      { character: '厂', pinyin: 'chǎng', definition: 'factory, workshop, cliff radical', hskLevel: '3', strokeDifference: 'No top dot; straight cliff edge roof.' }
    ],
    pedagogicalTip: '广 has a chimney/dot atop the roof. 厂 is an open industrial cliff overhang without a chimney.'
  },
  {
    id: 'mu-ben-he',
    title: '木 vs 本 vs 禾 vs 术',
    characters: [
      { character: '木', pinyin: 'mù', definition: 'tree, wood', hskLevel: '2', strokeDifference: 'Plain tree trunk and roots, no extra dashes.' },
      { character: '本', pinyin: 'běn', definition: 'origin, book, root', hskLevel: '1', strokeDifference: 'Has a horizontal dash across the roots marking the base.' },
      { character: '禾', pinyin: 'hé', definition: 'grain, cereal, seedling', hskLevel: '4', strokeDifference: 'Has a drooping slash dot at the top representing grain ears.' },
      { character: '术', pinyin: 'shù', definition: 'skill, method, art', hskLevel: '3', strokeDifference: 'Has an upper right dot (点).' }
    ],
    pedagogicalTip: '本 marks the roots below; 禾 droops grain at the top; 术 holds a dot of artistic skill.'
  },
  {
    id: 'wu-xu-shu',
    title: '戊 vs 戌 vs 戍 vs 戎',
    characters: [
      { character: '戊', pinyin: 'wù', definition: '5th heavenly stem', hskLevel: '6', strokeDifference: 'Hollow center, no dots or horizontal bars inside.' },
      { character: '戌', pinyin: 'xū', definition: '11th earthly branch (dog)', hskLevel: '6', strokeDifference: 'Has a horizontal stroke across the middle (横).' },
      { character: '戍', pinyin: 'shù', definition: 'guard border, garrison', hskLevel: '6', strokeDifference: 'Has a dot inside the center (点).' },
      { character: '戎', pinyin: 'róng', definition: 'military, arms', hskLevel: '6', strokeDifference: 'Cross stroke with armor hook.' }
    ],
    pedagogicalTip: '戊 (empty), 戌 (horizontal cross), 戍 (dot guard inside).'
  },
  {
    id: 'da-tai-quan',
    title: '大 vs 太 vs 犬',
    characters: [
      { character: '大', pinyin: 'dà', definition: 'big, large, great', hskLevel: '1', strokeDifference: 'Standard standing person with arms wide open, no dot.' },
      { character: '太', pinyin: 'tài', definition: 'too, extremely, highest', hskLevel: '1', strokeDifference: 'Dot is positioned between the legs at the bottom.' },
      { character: '犬', pinyin: 'quǎn', definition: 'dog, canine', hskLevel: '4', strokeDifference: 'Dot is on the upper right shoulder, like a dog perk ear.' }
    ],
    pedagogicalTip: '太 has a dot below; 犬 has a dot above on the shoulder.'
  },
  {
    id: 'ren-ru-ba',
    title: '人 vs 入 vs 八',
    characters: [
      { character: '人', pinyin: 'rén', definition: 'person, people, human', hskLevel: '1', strokeDifference: 'Left falling stroke (撇) overlaps over right falling stroke (捺).' },
      { character: '入', pinyin: 'rù', definition: 'enter, join, go into', hskLevel: '3', strokeDifference: 'Right falling stroke (捺) reaches over the top of the left stroke.' },
      { character: '八', pinyin: 'bā', definition: 'eight', hskLevel: '1', strokeDifference: 'The two strokes are completely detached and separated at the top.' }
    ],
    pedagogicalTip: '人 bows with the left leg leading. 入 wedges its right arm higher into the doorway. 八 stands separated.'
  },
  {
    id: 'mai-mai',
    title: '买 vs 卖',
    characters: [
      { character: '买', pinyin: 'mǎi', definition: 'buy, purchase (3rd tone)', hskLevel: '1', strokeDifference: 'Has a hook hat (乛) without a top cross (+).' },
      { character: '卖', pinyin: 'mài', definition: 'sell, betray (4th tone)', hskLevel: '2', strokeDifference: 'Has a cross (+) top (十) symbolizing goods added on display to sell.' }
    ],
    pedagogicalTip: '卖 (sell) has the extra 十 (goods) on top to get rid of; 买 (buy) is empty on top waiting to take goods.'
  },
  {
    id: 'mian-tu',
    title: '免 vs 兔',
    characters: [
      { character: '免', pinyin: 'miǎn', definition: 'exempt, excuse, avoid', hskLevel: '3', strokeDifference: 'No dot in the lower belly.' },
      { character: '兔', pinyin: 'tù', definition: 'rabbit, hare', hskLevel: '3', strokeDifference: 'Has a dot (点) representing the rabbit little tail!' }
    ],
    pedagogicalTip: '兔 has a dot which is the rabbit fluffy little tail; 免 loses the tail.'
  },
  {
    id: 'zhe-chai',
    title: '折 vs 拆',
    characters: [
      { character: '折', pinyin: 'zhé', definition: 'break, fold, discount', hskLevel: '3', strokeDifference: 'Right side is 斤 (axe), no extra dot.' },
      { character: '拆', pinyin: 'chāi', definition: 'tear open, dismantle, demolish', hskLevel: '4', strokeDifference: 'Right side is 斥 (with an upper right dot 点).' }
    ],
    pedagogicalTip: '拆 contains 斥 with a dot, like debris flying when dismantling.'
  },
  {
    id: 'ba-bo',
    title: '拔 vs 拨',
    characters: [
      { character: '拔', pinyin: 'bá', definition: 'pull up, extract, pluck', hskLevel: '4', strokeDifference: 'Right component is 犮 (with a cross and dot).' },
      { character: '拨', pinyin: 'bō', definition: 'dial, stir, allocate', hskLevel: '4', strokeDifference: 'Right component is 发 (with double strokes).' }
    ],
    pedagogicalTip: '拔 has 犮 like pulling out a turnip (拔萝卜); 拨 dials numbers with fingers.'
  },
  {
    id: 'gan-yu-qian',
    title: '干 vs 于 vs 千',
    characters: [
      { character: '干', pinyin: 'gān', definition: 'dry, shield; to do (gàn)', hskLevel: '2', strokeDifference: 'Horizontal top stroke with straight vertical drop.' },
      { character: '于', pinyin: 'yú', definition: 'in, at, to, than', hskLevel: '3', strokeDifference: 'Vertical stroke has a curved bottom hook (竖钩).' },
      { character: '千', pinyin: 'qiān', definition: 'thousand', hskLevel: '2', strokeDifference: 'Top stroke is a slanted diagonal slash (撇).' }
    ],
    pedagogicalTip: '干 is flat and upright. 于 has a curved hook. 千 has a diagonal roof slash.'
  },
  {
    id: 'shi-shi-shi',
    title: '示 vs 宗 vs 崇',
    characters: [
      { character: '示', pinyin: 'shì', definition: 'show, indicate, spirit altar', hskLevel: '3', strokeDifference: 'Altar base with vertical hanging strokes.' },
      { character: '宗', pinyin: 'zōng', definition: 'ancestor, clan, school', hskLevel: '5', strokeDifference: 'Roof radical (宀) over altar (示).' },
      { character: '崇', pinyin: 'chóng', definition: 'worship, lofty, revere', hskLevel: '5', strokeDifference: 'Mountain (山) atop ancestral temple (宗).' }
    ],
    pedagogicalTip: '示 is the altar; 宗 places it under a roof; 崇 raises it atop a mountain.'
  },
  {
    id: 'ye-zhi',
    title: '冶 vs 治',
    characters: [
      { character: '冶', pinyin: 'yě', definition: 'smelt, fuse metals', hskLevel: '6', strokeDifference: 'Two-dot ice radical (冫) on the left.' },
      { character: '治', pinyin: 'zhì', definition: 'cure, govern, treat water', hskLevel: '4', strokeDifference: 'Three-dot water radical (氵) on the left.' }
    ],
    pedagogicalTip: '冶 uses ice/cooling in metallurgy (冫). 治 regulates floodwaters and governing (氵).'
  }
];

export const LOOKALIKE_DRILLS: LookAlikeQuizQuestion[] = [
  {
    id: 'drill-1',
    clusterId: 'ji-yi-si',
    sentencePrompt: '我 [ ___ ] 经做完了今天的工作。',
    sentenceTranslation: 'I have already finished today\'s work.',
    correctCharacter: '已',
    distractors: ['己', '巳'],
    options: ['已', '己', '巳'],
    explanation: '“已经” (yǐjīng - already) uses 已 (bàn kāi yǐ, half-open stroke).'
  },
  {
    id: 'drill-2',
    clusterId: 'ji-yi-si',
    sentencePrompt: '我们要照顾好自 [ ___ ] 的身体。',
    sentenceTranslation: 'We must take good care of ourselves.',
    correctCharacter: '己',
    distractors: ['已', '巳'],
    options: ['己', '已', '巳'],
    explanation: '“自己” (zìjǐ - oneself) uses 己 (kāi kǒu jǐ, fully open top).'
  },
  {
    id: 'drill-3',
    clusterId: 'wei-mo',
    sentencePrompt: '这个星期的周 [ ___ ] 你有空吗？',
    sentenceTranslation: 'Are you free this weekend?',
    correctCharacter: '末',
    distractors: ['未'],
    options: ['末', '未'],
    explanation: '“周末” (zhōumò - weekend) uses 末 (longer top stroke, signifying the end).'
  },
  {
    id: 'drill-4',
    clusterId: 'wei-mo',
    sentencePrompt: '我们对 [ ___ ] 来的生活充满希望。',
    sentenceTranslation: 'We are full of hope for the future.',
    correctCharacter: '未',
    distractors: ['末'],
    options: ['未', '末'],
    explanation: '“未来” (wèilái - future) uses 未 (shorter top stroke, not yet arrived).'
  },
  {
    id: 'drill-5',
    clusterId: 'mai-mai',
    sentencePrompt: '商店里有很多东西在打折拍 [ ___ ]。',
    sentenceTranslation: 'Many items in the store are being sold at a discount.',
    correctCharacter: '卖',
    distractors: ['买'],
    options: ['卖', '买'],
    explanation: '“拍卖 / 出卖” uses 卖 (mài, 4th tone, has 十 on top for items sold).'
  },
  {
    id: 'drill-6',
    clusterId: 'mai-mai',
    sentencePrompt: '我想去超市 [ ___ ] 一些新鲜水果。',
    sentenceTranslation: 'I want to go to the supermarket to buy some fresh fruit.',
    correctCharacter: '买',
    distractors: ['卖'],
    options: ['买', '卖'],
    explanation: '“买” (mǎi, 3rd tone) means to purchase/buy.'
  },
  {
    id: 'drill-7',
    clusterId: 'tu-shi',
    sentencePrompt: '雨后地上的泥 [ ___ ] 变得很湿软。',
    sentenceTranslation: 'After the rain, the mud on the ground became very wet and soft.',
    correctCharacter: '土',
    distractors: ['士'],
    options: ['土', '士'],
    explanation: '“泥土” (nítǔ - soil/earth) has a longer bottom stroke resting on the earth.'
  },
  {
    id: 'drill-8',
    clusterId: 'tu-shi',
    sentencePrompt: '那位勇敢的战 [ ___ ] 赢得了大家的尊敬。',
    sentenceTranslation: 'That brave soldier won everyone\'s respect.',
    correctCharacter: '士',
    distractors: ['土'],
    options: ['士', '土'],
    explanation: '“战士” (zhànshì - soldier/warrior) has a longer top stroke.'
  },
  {
    id: 'drill-9',
    clusterId: 'mian-tu',
    sentencePrompt: '小草坪上有一只雪白的小 [ ___ ] 子。',
    sentenceTranslation: 'On the small lawn there is a snow-white little bunny.',
    correctCharacter: '兔',
    distractors: ['免'],
    options: ['兔', '免'],
    explanation: '“兔子” (tùzi - rabbit) features the dot (点) representing the tail!'
  },
  {
    id: 'drill-10',
    clusterId: 'mian-tu',
    sentencePrompt: '博物馆今天对所有学生 [ ___ ] 费开放。',
    sentenceTranslation: 'The museum is open free of charge to all students today.',
    correctCharacter: '免',
    distractors: ['兔'],
    options: ['免', '兔'],
    explanation: '“免费” (miǎnfèi - free of charge) has no dot in the lower belly.'
  }
];

export function getConfusableCluster(char: string): ConfusableCluster | null {
  return CONFUSABLE_CLUSTERS.find(cluster => 
    cluster.characters.some(c => c.character === char)
  ) || null;
}

export function getAllConfusableChars(): Set<string> {
  const chars = new Set<string>();
  CONFUSABLE_CLUSTERS.forEach(cluster => {
    cluster.characters.forEach(c => chars.add(c.character));
  });
  return chars;
}
