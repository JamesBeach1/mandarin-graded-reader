/**
 * Chinese Pinyin IME Simulator Engine (AIM-003)
 * Simulates standard QWERTY Chinese Input Method candidate window and selection
 */

export interface ImePrompt {
  id: string;
  hskLevel: number;
  hanzi: string;
  pinyin: string;
  translation: string;
}

export const IME_DRILL_PROMPTS: ImePrompt[] = [
  // HSK 1
  { id: 'h1-1', hskLevel: 1, hanzi: '你好吗', pinyin: 'ni hao ma', translation: 'How are you?' },
  { id: 'h1-2', hskLevel: 1, hanzi: '我是学生', pinyin: 'wo shi xue sheng', translation: 'I am a student.' },
  { id: 'h1-3', hskLevel: 1, hanzi: '谢谢你', pinyin: 'xie xie ni', translation: 'Thank you.' },
  { id: 'h1-4', hskLevel: 1, hanzi: '北京欢迎你', pinyin: 'bei jing huan ying ni', translation: 'Beijing welcomes you.' },
  { id: 'h1-5', hskLevel: 1, hanzi: '明天见', pinyin: 'ming tian jian', translation: 'See you tomorrow.' },
  { id: 'h1-6', hskLevel: 1, hanzi: '我喜欢喝茶', pinyin: 'wo xi huan he cha', translation: 'I like drinking tea.' },

  // HSK 2
  { id: 'h2-1', hskLevel: 2, hanzi: '今天天气真好', pinyin: 'jin tian tian qi zhen hao', translation: 'The weather is really nice today.' },
  { id: 'h2-2', hskLevel: 2, hanzi: '我想买两本书', pinyin: 'wo xiang mai liang ben shu', translation: 'I want to buy two books.' },
  { id: 'h2-3', hskLevel: 2, hanzi: '虽然下雨但是不冷', pinyin: 'sui ran xia yu dan shi bu leng', translation: 'Although it is raining, it is not cold.' },
  { id: 'h2-4', hskLevel: 2, hanzi: '请问火车站怎么走', pinyin: 'qing wen huo che zhan zen me zou', translation: 'Excuse me, how do I get to the train station?' },
  { id: 'h2-5', hskLevel: 2, hanzi: '我每天早上跑步', pinyin: 'wo mei tian zao shang pao bu', translation: 'I run every morning.' },

  // HSK 3
  { id: 'h3-1', hskLevel: 3, hanzi: '学中文很有意思', pinyin: 'xue zhong wen hen you yi si', translation: 'Learning Chinese is very interesting.' },
  { id: 'h3-2', hskLevel: 3, hanzi: '你最好早点休息', pinyin: 'ni zui hao zao dian xiu xi', translation: 'You had better rest early.' },
  { id: 'h3-3', hskLevel: 3, hanzi: '把门关上吧', pinyin: 'ba men guan shang ba', translation: 'Please close the door.' },
  { id: 'h3-4', hskLevel: 3, hanzi: '除了英语以外我还想学法语', pinyin: 'chu le ying yu yi wai wo hai xiang xue fa yu', translation: 'Besides English, I also want to learn French.' },

  // HSK 4
  { id: 'h4-1', hskLevel: 4, hanzi: '坚持到底就是胜利', pinyin: 'jian chi dao di jiu shi sheng li', translation: 'Persisting to the end is victory.' },
  { id: 'h4-2', hskLevel: 4, hanzi: '不管遇到什么困难都不要放弃', pinyin: 'bu guan yu dao shen me kun nan dou bu yao fang qi', translation: 'No matter what difficulties you encounter, do not give up.' },
  { id: 'h4-3', hskLevel: 4, hanzi: '阅读能够开阔我们的视野', pinyin: 'yue du neng gou kai kuo wo men de shi ye', translation: 'Reading broadens our horizons.' }
];

// Realistic candidate dictionary: maps pinyin input string (syllable or multi-syllable) to top candidates
export const IME_CANDIDATES_MAP: Record<string, string[]> = {
  // Syllables
  ni: ['你', '呢', '泥', '拟', '逆'],
  hao: ['好', '号', '毫', '浩', '耗'],
  ma: ['吗', '妈', '马', '骂', '麻'],
  wo: ['我', '握', '窝', '卧', '沃'],
  shi: ['是', '事', '时', '十', '使', '市', '识'],
  xue: ['学', '雪', '血', '靴'],
  sheng: ['生', '声', '升', '胜', '省'],
  xie: ['谢', '写', '些', '鞋', '斜'],
  bei: ['北', '被', '杯', '背', '倍'],
  jing: ['京', '经', '精', '惊', '静', '景'],
  huan: ['欢', '还', '换', '环', '缓'],
  ying: ['迎', '应', '影', '硬', '英', '赢'],
  ming: ['明', '名', '命', '鸣', '铭'],
  tian: ['天', '田', '填', '甜', '添'],
  jian: ['见', '件', '间', '建', '简', '健'],
  xi: ['喜', '西', '息', '细', '洗', '系'],
  he: ['喝', '和', '合', '河', '荷'],
  cha: ['茶', '查', '差', '察', '插'],
  jin: ['今', '进', '金', '近', '紧'],
  qi: ['气', '其', '起', '七', '期', '奇'],
  zhen: ['真', '阵', '针', '震', '镇'],
  xiang: ['想', '向', '相', '响', '象', '香'],
  mai: ['买', '卖', '麦', '迈'],
  liang: ['两', '亮', '量', '凉', '粮'],
  ben: ['本', '奔', '笨'],
  shu: ['书', '数', '树', '输', '熟', '束'],
  sui: ['虽', '岁', '随', '碎'],
  ran: ['然', '染', '燃'],
  dan: ['但', '单', '蛋', '担', '淡'],
  bu: ['不', '部', '步', '布', '补'],
  leng: ['冷', '愣'],
  qing: ['请', '清', '情', '青', '轻'],
  wen: ['问', '文', '闻', '稳', '温'],
  huo: ['火', '活', '或', '获', '伙'],
  che: ['车', '彻', '澈'],
  zhan: ['站', '战', '占', '展', '沾'],
  zen: ['怎'],
  me: ['么'],
  zou: ['走', '奏', '揍'],
  mei: ['每', '美', '没', '妹', '煤'],
  zao: ['早', '造', '遭', '糟'],
  shang: ['上', '商', '伤', '尚'],
  pao: ['跑', '泡', '炮', '袍'],
  zhong: ['中', '重', '种', '终', '钟'],
  hen: ['很', '恨', '痕'],
  you: ['有', '又', '由', '友', '右', '油'],
  yi: ['一', '意', '已', '以', '衣', '医'],
  si: ['思', '四', '死', '似', '私'],
  zui: ['最', '醉', '嘴', '罪'],
  xiu: ['休', '修', '秀', '羞'],
  ba: ['把', '吧', '八', '爸', '拔'],
  men: ['门', '们', '闷'],
  guan: ['关', '观', '管', '馆', '官'],
  chu: ['出', '初', '除', '楚', '触'],
  le: ['了', '乐'],
  wai: ['外', '歪'],
  hai: ['还', '海', '害', '孩'],
  fa: ['法', '发', '罚', '乏'],
  yu: ['语', '雨', '鱼', '预', '玉', '育'],
  dao: ['到', '道', '倒', '导', '岛'],
  di: ['底', '第', '地', '低', '弟'],
  jiu: ['就', '九', '久', '酒', '旧'],
  kun: ['困', '坤'],
  nan: ['难', '南', '男'],
  dou: ['都', '豆', '斗'],
  yao: ['要', '药', '咬', '摇'],
  fang: ['放', '房', '方', '访', '防'],
  yue: ['月', '越', '约', '阅', '跃'],
  du: ['读', '度', '都', '独', '毒'],
  neng: ['能'],
  gou: ['够', '狗', '沟', '勾'],
  kai: ['开', '凯', '慨'],
  kuo: ['阔', '扩'],
  ye: ['也', '夜', '野', '业', '页'],

  // Multi-syllable word candidates (fast IME compound typing)
  nihao: ['你好', '拟好'],
  xuesheng: ['学生', '学声'],
  xiexie: ['谢谢', '写写'],
  beijing: ['北京', '背景', '北极'],
  huanying: ['欢迎', '幻影'],
  mingtian: ['明天'],
  xihuan: ['喜欢'],
  jintian: ['今天'],
  tianqi: ['天气'],
  suiran: ['虽然'],
  danshi: ['但是'],
  qingwen: ['请问'],
  huochezhan: ['火车站'],
  zenme: ['怎么'],
  meitian: ['每天'],
  zaoshang: ['早上'],
  paobu: ['跑步'],
  zhongwen: ['中文'],
  yisi: ['意思'],
  zuihao: ['最好'],
  xiuxi: ['休息'],
  guanshang: ['关上'],
  chule: ['除了'],
  yiwai: ['以外'],
  jianchi: ['坚持'],
  shenglin: ['胜利'],
  shenglil: ['胜利'],
  shengli: ['胜利'],
  buguan: ['不管'],
  kunnan: ['困难'],
  fangqi: ['放弃'],
  yuedu: ['阅读'],
  nenggou: ['能够'],
  kaikuo: ['开阔'],
  women: ['我们'],
  shiye: ['视野']
};

/**
 * Returns realistic IME candidate array for the current input buffer
 */
export function getImeCandidates(buffer: string): string[] {
  if (!buffer) return [];
  const normalized = buffer.toLowerCase().replace(/[^a-z]/g, '');
  if (!normalized) return [];

  // Exact compound match
  if (IME_CANDIDATES_MAP[normalized]) {
    return IME_CANDIDATES_MAP[normalized];
  }

  // Prefix match in candidate database
  for (const key of Object.keys(IME_CANDIDATES_MAP)) {
    if (key.startsWith(normalized)) {
      return IME_CANDIDATES_MAP[key];
    }
  }

  // Fallback: search individual syllable prefix
  return [normalized];
}
