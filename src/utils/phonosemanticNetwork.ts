/**
 * Phonosemantic Character Network Engine (NONLLM-002)
 *
 * Deconstructs Chinese characters into Semantic Radicals (形旁) and Phonetic Stems (声旁).
 * Explores family clusters where 80%+ of Hanzi inherit sound cues from a shared stem:
 * e.g. 青 (qīng) -> 清 (qīng), 晴 (qíng), 情 (qíng), 请 (qǐng), 精 (jīng), 蜻 (qīng), 睛 (jīng)
 */

export interface PhonosemanticNode {
  character: string;
  pinyin: string;
  meaning: string;
  hskLevel: string;
  radical: string;
  radicalMeaning: string;
  isExactToneMatch: boolean;
  soundSimilarity: 'identical' | 'same_syllable_diff_tone' | 'close_rhyme' | 'divergent';
}

export interface PhoneticStemFamily {
  stem: string;
  stemPinyin: string;
  stemMeaning: string;
  familySize: number;
  siblings: PhonosemanticNode[];
  pedagogicalInsight: string;
}

export const PHONETIC_STEM_FAMILIES: Record<string, PhoneticStemFamily> = {
  '青': {
    stem: '青',
    stemPinyin: 'qīng',
    stemMeaning: 'blue-green / azure / young',
    familySize: 7,
    pedagogicalInsight: '青 serves as a high-fidelity phonetic stem for syllables ending in -ing. The radical designates the realm: 氵(water) -> 清 clear; 日(sun) -> 晴 sunny; 忄(heart) -> 情 emotion; 讠(speech) -> 请 please; 米(rice) -> 精 refined; 虫(insect) -> 蜻 dragonfly; 目(eye) -> 睛 pupil.',
    siblings: [
      { character: '清', pinyin: 'qīng', meaning: 'clear, pure, distinct', hskLevel: '3', radical: '氵', radicalMeaning: 'Water droplets', isExactToneMatch: true, soundSimilarity: 'identical' },
      { character: '晴', pinyin: 'qíng', meaning: 'clear, sunny skies', hskLevel: '2', radical: '日', radicalMeaning: 'Sun', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '情', pinyin: 'qíng', meaning: 'feeling, emotion, passion', hskLevel: '3', radical: '忄 (心)', radicalMeaning: 'Heart / Mind', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '请', pinyin: 'qǐng', meaning: 'to ask, invite, please', hskLevel: '1', radical: '讠 (言)', radicalMeaning: 'Speech / Words', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '精', pinyin: 'jīng', meaning: 'energy, spirit, refined', hskLevel: '4', radical: '米', radicalMeaning: 'Rice / Essence', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '蜻', pinyin: 'qīng', meaning: 'dragonfly (蜻蜓)', hskLevel: '5', radical: '虫', radicalMeaning: 'Insect', isExactToneMatch: true, soundSimilarity: 'identical' },
      { character: '睛', pinyin: 'jīng', meaning: 'eye, eyeball, pupil', hskLevel: '3', radical: '目', radicalMeaning: 'Eye', isExactToneMatch: false, soundSimilarity: 'close_rhyme' }
    ]
  },
  '包': {
    stem: '包',
    stemPinyin: 'bāo',
    stemMeaning: 'to wrap / bundle / package',
    familySize: 6,
    pedagogicalInsight: '包 provides the /bao/ or /pao/ rhyme. The radical shows what is wrapped or bursting: 饣(food) -> 饱 full; 火(fire) -> 炮 cannon; 氵(water) -> 泡 bubble; 足(foot) -> 跑 run; 扌(hand) -> 抱 embrace; 艹(grass) -> 苞 bud.',
    siblings: [
      { character: '饱', pinyin: 'bǎo', meaning: 'full, satisfied from eating', hskLevel: '2', radical: '饣 (食)', radicalMeaning: 'Food', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '跑', pinyin: 'pǎo', meaning: 'to run, sprint', hskLevel: '1', radical: '⻊ (足)', radicalMeaning: 'Foot / Leg', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '抱', pinyin: 'bào', meaning: 'to hug, embrace, cradle', hskLevel: '3', radical: '扌 (手)', radicalMeaning: 'Hand', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '泡', pinyin: 'pào', meaning: 'bubble, soak, steep', hskLevel: '4', radical: '氵', radicalMeaning: 'Water droplets', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '炮', pinyin: 'pào', meaning: 'cannon, firecracker, artillery', hskLevel: '5', radical: '火', radicalMeaning: 'Fire', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '胞', pinyin: 'bāo', meaning: 'cell (cellular), placenta', hskLevel: '5', radical: '月 (肉)', radicalMeaning: 'Flesh / Body', isExactToneMatch: true, soundSimilarity: 'identical' }
    ]
  },
  '巴': {
    stem: '巴',
    stemPinyin: 'bā',
    stemMeaning: 'cling / hope / tail',
    familySize: 5,
    pedagogicalInsight: '巴 provides /ba/ and /pa/ rhymes: 父(father) -> 爸 dad; 口(mouth) -> 吧 suggestion particle; 扌(hand) -> 把 grasp/handle; 爪(claw) -> 爬 crawl; 艹(grass) -> 芭 banana plant.',
    siblings: [
      { character: '爸', pinyin: 'bà', meaning: 'father, dad', hskLevel: '1', radical: '父', radicalMeaning: 'Father', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '把', pinyin: 'bǎ', meaning: 'to hold, grasp, measure word', hskLevel: '2', radical: '扌', radicalMeaning: 'Hand', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '吧', pinyin: 'ba', meaning: 'modal particle for suggestion', hskLevel: '1', radical: '口', radicalMeaning: 'Mouth', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '爬', pinyin: 'pá', meaning: 'to crawl, climb', hskLevel: '3', radical: '爪', radicalMeaning: 'Claw', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '芭', pinyin: 'bā', meaning: 'fragrant herb, ballet (芭蕾)', hskLevel: '5', radical: '艹', radicalMeaning: 'Grass / Plant', isExactToneMatch: true, soundSimilarity: 'identical' }
    ]
  },
  '马': {
    stem: '马',
    stemPinyin: 'mǎ',
    stemMeaning: 'horse',
    familySize: 4,
    pedagogicalInsight: '马 lends the /ma/ sound: 女(woman) -> 妈 mom; 口(mouth) -> 吗 question particle; 虫(insect) -> 蚂 ant; 疒(illness) -> 痳 measles.',
    siblings: [
      { character: '妈', pinyin: 'mā', meaning: 'mother, mom', hskLevel: '1', radical: '女', radicalMeaning: 'Woman', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '吗', pinyin: 'ma', meaning: 'yes-no question particle', hskLevel: '1', radical: '口', radicalMeaning: 'Mouth', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '骂', pinyin: 'mà', meaning: 'to scold, curse, berate', hskLevel: '4', radical: '口 (吅)', radicalMeaning: 'Two mouths shouting', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '蚂', pinyin: 'mǎ', meaning: 'ant (蚂蚁)', hskLevel: '4', radical: '虫', radicalMeaning: 'Insect', isExactToneMatch: true, soundSimilarity: 'identical' }
    ]
  },
  '方': {
    stem: '方',
    stemPinyin: 'fāng',
    stemMeaning: 'square / direction / method',
    familySize: 5,
    pedagogicalInsight: '方 lends the /fang/ rhyme: 扌(hand) -> 放 release; 纟(silk) -> 纺 spin yarn; 户(door) -> 房 house/room; 阝(city/mound) -> 防 defend; 艹(plant) -> 芳 fragrant.',
    siblings: [
      { character: '房', pinyin: 'fáng', meaning: 'house, room, building', hskLevel: '2', radical: '户', radicalMeaning: 'Door / Household', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '放', pinyin: 'fàng', meaning: 'to release, put down, blossom', hskLevel: '2', radical: '攵', radicalMeaning: 'Action / Strike', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '防', pinyin: 'fáng', meaning: 'to defend, guard against, prevent', hskLevel: '4', radical: '阝', radicalMeaning: 'Mound / Wall', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '访', pinyin: 'fǎng', meaning: 'to visit, interview, seek', hskLevel: '4', radical: '讠', radicalMeaning: 'Speech / Words', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '芳', pinyin: 'fāng', meaning: 'fragrant, sweet-smelling', hskLevel: '5', radical: '艹', radicalMeaning: 'Grass / Herb', isExactToneMatch: true, soundSimilarity: 'identical' }
    ]
  },
  '门': {
    stem: '门',
    stemPinyin: 'mén',
    stemMeaning: 'gate / door',
    familySize: 4,
    pedagogicalInsight: '门 lends the /men/ or /wen/ sound: 口(mouth) -> 问 ask; 亻(person) -> 们 plural suffix; 闪 flash (ideogram); 闷 depressed/stifled.',
    siblings: [
      { character: '们', pinyin: 'men', meaning: 'plural suffix for pronouns/people', hskLevel: '1', radical: '亻', radicalMeaning: 'Person', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '问', pinyin: 'wèn', meaning: 'to ask, inquire', hskLevel: '1', radical: '口', radicalMeaning: 'Mouth', isExactToneMatch: false, soundSimilarity: 'close_rhyme' },
      { character: '闷', pinyin: 'mèn', meaning: 'stifled, suffocating, bored', hskLevel: '4', radical: '心', radicalMeaning: 'Heart enclosed in gate', isExactToneMatch: false, soundSimilarity: 'same_syllable_diff_tone' },
      { character: '闻', pinyin: 'wén', meaning: 'to hear, smell, news (新闻)', hskLevel: '3', radical: '耳', radicalMeaning: 'Ear at gate listening', isExactToneMatch: false, soundSimilarity: 'close_rhyme' }
    ]
  }
};

// Inverted lookup map: character -> stem key
const CHAR_TO_STEM_MAP: Record<string, string> = {};

Object.entries(PHONETIC_STEM_FAMILIES).forEach(([stemKey, family]) => {
  CHAR_TO_STEM_MAP[stemKey] = stemKey;
  family.siblings.forEach(s => {
    CHAR_TO_STEM_MAP[s.character] = stemKey;
  });
});

export const PhonosemanticService = {
  /**
   * Find phonetic stem family for a given character
   */
  getFamilyForCharacter(char: string): PhoneticStemFamily | null {
    if (!char) return null;
    const target = char.trim()[0];
    const stem = CHAR_TO_STEM_MAP[target];
    if (stem && PHONETIC_STEM_FAMILIES[stem]) {
      return PHONETIC_STEM_FAMILIES[stem];
    }
    return null;
  },

  /**
   * Check if a character has a known phonosemantic family
   */
  hasPhoneticFamily(char: string): boolean {
    if (!char) return false;
    const target = char.trim()[0];
    return Boolean(CHAR_TO_STEM_MAP[target]);
  },

  /**
   * Return all registered phonetic stem families
   */
  getAllFamilies(): PhoneticStemFamily[] {
    return Object.values(PHONETIC_STEM_FAMILIES);
  }
};
