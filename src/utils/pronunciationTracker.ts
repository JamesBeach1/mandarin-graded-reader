/**
 * Pronunciation Weakness Tracker & Heatmap Engine (ALS-010)
 * Evaluates, tracks, and maps learner accuracy across Initials (声母),
 * Finals (韵母), and Tones (声调).
 */

export type PhonemeCategory = 'initial' | 'final' | 'tone';

export interface PhonemeRecord {
  id: string;
  symbol: string;
  ipa: string;
  category: PhonemeCategory;
  groupName: string;
  totalAttempts: number;
  correctAttempts: number;
  sampleWords: { char: string; pinyin: string; english: string }[];
  lastEvaluated?: number;
}

const STORAGE_KEY = 'moyun_pronunciation_heatmap_stats';

const DEFAULT_PHONEME_CATALOG: PhonemeRecord[] = [
  // 1. Initials (声母)
  // Retroflex vs Dental sibilants
  { id: 'zh', symbol: 'zh', ipa: '[ʈʂ]', category: 'initial', groupName: 'Retroflex Sibilants', totalAttempts: 18, correctAttempts: 11, sampleWords: [{ char: '这', pinyin: 'zhè', english: 'this' }, { char: '中', pinyin: 'zhōng', english: 'middle' }, { char: '知', pinyin: 'zhī', english: 'know' }] },
  { id: 'ch', symbol: 'ch', ipa: '[ʈʂʰ]', category: 'initial', groupName: 'Retroflex Sibilants', totalAttempts: 15, correctAttempts: 8, sampleWords: [{ char: '吃', pinyin: 'chī', english: 'eat' }, { char: '茶', pinyin: 'chá', english: 'tea' }, { char: '出', pinyin: 'chū', english: 'exit' }] },
  { id: 'sh', symbol: 'sh', ipa: '[ʂ]', category: 'initial', groupName: 'Retroflex Sibilants', totalAttempts: 22, correctAttempts: 14, sampleWords: [{ char: '是', pinyin: 'shì', english: 'be' }, { char: '书', pinyin: 'shū', english: 'book' }, { char: '水', pinyin: 'shuǐ', english: 'water' }] },
  { id: 'r', symbol: 'r', ipa: '[ʐ]', category: 'initial', groupName: 'Retroflex Sibilants', totalAttempts: 12, correctAttempts: 7, sampleWords: [{ char: '日', pinyin: 'rì', english: 'sun' }, { char: '人', pinyin: 'rén', english: 'person' }, { char: '热', pinyin: 'rè', english: 'hot' }] },
  { id: 'z', symbol: 'z', ipa: '[ts]', category: 'initial', groupName: 'Dental Sibilants', totalAttempts: 14, correctAttempts: 12, sampleWords: [{ char: '在', pinyin: 'zài', english: 'at' }, { char: '走', pinyin: 'zǒu', english: 'walk' }, { char: '早', pinyin: 'zǎo', english: 'early' }] },
  { id: 'c', symbol: 'c', ipa: '[tsʰ]', category: 'initial', groupName: 'Dental Sibilants', totalAttempts: 16, correctAttempts: 9, sampleWords: [{ char: '从', pinyin: 'cóng', english: 'from' }, { char: '次', pinyin: 'cì', english: 'time' }, { char: '菜', pinyin: 'cài', english: 'dish' }] },
  { id: 's', symbol: 's', ipa: '[s]', category: 'initial', groupName: 'Dental Sibilants', totalAttempts: 15, correctAttempts: 14, sampleWords: [{ char: '三', pinyin: 'sān', english: 'three' }, { char: '岁', pinyin: 'suì', english: 'years old' }, { char: '四', pinyin: 'sì', english: 'four' }] },

  // Alveolo-palatals
  { id: 'j', symbol: 'j', ipa: '[tɕ]', category: 'initial', groupName: 'Palatals', totalAttempts: 12, correctAttempts: 11, sampleWords: [{ char: '家', pinyin: 'jiā', english: 'home' }, { char: '见', pinyin: 'jiàn', english: 'see' }, { char: '叫', pinyin: 'jiào', english: 'call' }] },
  { id: 'q', symbol: 'q', ipa: '[tɕʰ]', category: 'initial', groupName: 'Palatals', totalAttempts: 19, correctAttempts: 11, sampleWords: [{ char: '去', pinyin: 'qù', english: 'go' }, { char: '七', pinyin: 'qī', english: 'seven' }, { char: '钱', pinyin: 'qián', english: 'money' }] },
  { id: 'x', symbol: 'x', ipa: '[ɕ]', category: 'initial', groupName: 'Palatals', totalAttempts: 14, correctAttempts: 13, sampleWords: [{ char: '小', pinyin: 'xiǎo', english: 'small' }, { char: '想', pinyin: 'xiǎng', english: 'want' }, { char: '写', pinyin: 'xiě', english: 'write' }] },

  // Bilabials & Labiodentals
  { id: 'b', symbol: 'b', ipa: '[p]', category: 'initial', groupName: 'Bilabials', totalAttempts: 20, correctAttempts: 19, sampleWords: [{ char: '不', pinyin: 'bù', english: 'not' }, { char: '爸爸', pinyin: 'bàba', english: 'dad' }, { char: '白', pinyin: 'bái', english: 'white' }] },
  { id: 'p', symbol: 'p', ipa: '[pʰ]', category: 'initial', groupName: 'Bilabials', totalAttempts: 15, correctAttempts: 13, sampleWords: [{ char: '朋', pinyin: 'péng', english: 'friend' }, { char: '跑', pinyin: 'pǎo', english: 'run' }, { char: '苹', pinyin: 'píng', english: 'apple' }] },
  { id: 'm', symbol: 'm', ipa: '[m]', category: 'initial', groupName: 'Bilabials', totalAttempts: 16, correctAttempts: 16, sampleWords: [{ char: '买', pinyin: 'mǎi', english: 'buy' }, { char: '门', pinyin: 'mén', english: 'door' }, { char: '没', pinyin: 'méi', english: 'not have' }] },
  { id: 'f', symbol: 'f', ipa: '[f]', category: 'initial', groupName: 'Labiodentals', totalAttempts: 14, correctAttempts: 13, sampleWords: [{ char: '飞', pinyin: 'fēi', english: 'fly' }, { char: '饭', pinyin: 'fàn', english: 'rice' }, { char: '分', pinyin: 'fēn', english: 'minute' }] },

  // Alveolars & Velars
  { id: 'd', symbol: 'd', ipa: '[t]', category: 'initial', groupName: 'Alveolars', totalAttempts: 17, correctAttempts: 16, sampleWords: [{ char: '大', pinyin: 'dà', english: 'big' }, { char: '到', pinyin: 'dào', english: 'arrive' }, { char: '的', pinyin: 'de', english: 'of' }] },
  { id: 't', symbol: 't', ipa: '[tʰ]', category: 'initial', groupName: 'Alveolars', totalAttempts: 15, correctAttempts: 14, sampleWords: [{ char: '他', pinyin: 'tā', english: 'he' }, { char: '听', pinyin: 'tīng', english: 'listen' }, { char: '太', pinyin: 'tài', english: 'too' }] },
  { id: 'n', symbol: 'n', ipa: '[n]', category: 'initial', groupName: 'Alveolars', totalAttempts: 14, correctAttempts: 10, sampleWords: [{ char: '你', pinyin: 'nǐ', english: 'you' }, { char: '那', pinyin: 'nà', english: 'that' }, { char: '南', pinyin: 'nán', english: 'south' }] },
  { id: 'l', symbol: 'l', ipa: '[l]', category: 'initial', groupName: 'Alveolars', totalAttempts: 16, correctAttempts: 11, sampleWords: [{ char: '来', pinyin: 'lái', english: 'come' }, { char: '里', pinyin: 'lǐ', english: 'inside' }, { char: '冷', pinyin: 'lěng', english: 'cold' }] },
  { id: 'g', symbol: 'g', ipa: '[k]', category: 'initial', groupName: 'Velars', totalAttempts: 18, correctAttempts: 17, sampleWords: [{ char: '高', pinyin: 'gāo', english: 'tall' }, { char: '个', pinyin: 'gè', english: 'item' }, { char: '给', pinyin: 'gěi', english: 'give' }] },
  { id: 'k', symbol: 'k', ipa: '[kʰ]', category: 'initial', groupName: 'Velars', totalAttempts: 14, correctAttempts: 13, sampleWords: [{ char: '看', pinyin: 'kàn', english: 'look' }, { char: '开', pinyin: 'kāi', english: 'open' }, { char: '客', pinyin: 'kè', english: 'guest' }] },
  { id: 'h', symbol: 'h', ipa: '[x]', category: 'initial', groupName: 'Velars', totalAttempts: 15, correctAttempts: 14, sampleWords: [{ char: '好', pinyin: 'hǎo', english: 'good' }, { char: '和', pinyin: 'hé', english: 'and' }, { char: '很', pinyin: 'hěn', english: 'very' }] },

  // 2. Finals (韵母)
  { id: 'an', symbol: 'an', ipa: '[an]', category: 'final', groupName: 'Front Nasals', totalAttempts: 21, correctAttempts: 18, sampleWords: [{ char: '看', pinyin: 'kàn', english: 'look' }, { char: '安', pinyin: 'ān', english: 'peace' }, { char: '半', pinyin: 'bàn', english: 'half' }] },
  { id: 'ang', symbol: 'ang', ipa: '[ɑŋ]', category: 'final', groupName: 'Back Nasals', totalAttempts: 24, correctAttempts: 13, sampleWords: [{ char: '帮', pinyin: 'bāng', english: 'help' }, { char: '旁', pinyin: 'páng', english: 'beside' }, { char: '放', pinyin: 'fàng', english: 'put' }] },
  { id: 'en', symbol: 'en', ipa: '[ən]', category: 'final', groupName: 'Front Nasals', totalAttempts: 16, correctAttempts: 14, sampleWords: [{ char: '本', pinyin: 'běn', english: 'book/root' }, { char: '门', pinyin: 'mén', english: 'door' }, { char: '人', pinyin: 'rén', english: 'person' }] },
  { id: 'eng', symbol: 'eng', ipa: '[əŋ]', category: 'final', groupName: 'Back Nasals', totalAttempts: 20, correctAttempts: 10, sampleWords: [{ char: '冷', pinyin: 'lěng', english: 'cold' }, { char: '风', pinyin: 'fēng', english: 'wind' }, { char: '生', pinyin: 'shēng', english: 'life' }] },
  { id: 'in', symbol: 'in', ipa: '[in]', category: 'final', groupName: 'Front Nasals', totalAttempts: 19, correctAttempts: 16, sampleWords: [{ char: '新', pinyin: 'xīn', english: 'new' }, { char: '金', pinyin: 'jīn', english: 'gold' }, { char: '信', pinyin: 'xìn', english: 'letter' }] },
  { id: 'ing', symbol: 'ing', ipa: '[iŋ]', category: 'final', groupName: 'Back Nasals', totalAttempts: 22, correctAttempts: 12, sampleWords: [{ char: '星', pinyin: 'xīng', english: 'star' }, { char: '名', pinyin: 'míng', english: 'name' }, { char: '听', pinyin: 'tīng', english: 'listen' }] },
  { id: 'u_final', symbol: 'u', ipa: '[u]', category: 'final', groupName: 'High Vowels', totalAttempts: 15, correctAttempts: 14, sampleWords: [{ char: '路', pinyin: 'lù', english: 'road' }, { char: '图', pinyin: 'tú', english: 'picture' }, { char: '不', pinyin: 'bù', english: 'not' }] },
  { id: 'v_umlaut', symbol: 'ü (yu)', ipa: '[y]', category: 'final', groupName: 'Umlaut Vowels', totalAttempts: 17, correctAttempts: 8, sampleWords: [{ char: '绿', pinyin: 'lǜ', english: 'green' }, { char: '女', pinyin: 'nǚ', english: 'female' }, { char: '鱼', pinyin: 'yú', english: 'fish' }] },

  // 3. Tones (声调)
  { id: 'tone1', symbol: 'Tone 1 (高平 55)', ipa: '[˥˥]', category: 'tone', groupName: 'Pitch Contours', totalAttempts: 32, correctAttempts: 29, sampleWords: [{ char: '妈', pinyin: 'mā', english: 'mother' }, { char: '高', pinyin: 'gāo', english: 'high' }, { char: '天', pinyin: 'tiān', english: 'sky' }] },
  { id: 'tone2', symbol: 'Tone 2 (中升 35)', ipa: '[˧˥]', category: 'tone', groupName: 'Pitch Contours', totalAttempts: 30, correctAttempts: 19, sampleWords: [{ char: '麻', pinyin: 'má', english: 'hemp' }, { char: '人', pinyin: 'rén', english: 'person' }, { char: '来', pinyin: 'lái', english: 'come' }] },
  { id: 'tone3', symbol: 'Tone 3 (曲折 214)', ipa: '[˨˩˦]', category: 'tone', groupName: 'Pitch Contours', totalAttempts: 35, correctAttempts: 17, sampleWords: [{ char: '马', pinyin: 'mǎ', english: 'horse' }, { char: '好', pinyin: 'hǎo', english: 'good' }, { char: '水', pinyin: 'shuǐ', english: 'water' }] },
  { id: 'tone4', symbol: 'Tone 4 (高降 51)', ipa: '[˥˩]', category: 'tone', groupName: 'Pitch Contours', totalAttempts: 34, correctAttempts: 28, sampleWords: [{ char: '骂', pinyin: 'mà', english: 'scold' }, { char: '看', pinyin: 'kàn', english: 'look' }, { char: '去', pinyin: 'qù', english: 'go' }] },
  { id: 'tone5', symbol: 'Tone 5 (轻声 Neutral)', ipa: '[·]', category: 'tone', groupName: 'Pitch Contours', totalAttempts: 18, correctAttempts: 14, sampleWords: [{ char: '吗', pinyin: 'ma', english: 'question' }, { char: '的', pinyin: 'de', english: 'possessive' }, { char: '子', pinyin: 'zi', english: 'noun suffix' }] }
];

export class PronunciationTracker {
  public static getRecords(): PhonemeRecord[] {
    if (typeof localStorage === 'undefined') return DEFAULT_PHONEME_CATALOG;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.saveRecords(DEFAULT_PHONEME_CATALOG);
        return DEFAULT_PHONEME_CATALOG;
      }
      return JSON.parse(raw);
    } catch {
      return DEFAULT_PHONEME_CATALOG;
    }
  }

  public static saveRecords(records: PhonemeRecord[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  public static recordEvaluation(phonemeId: string, isCorrect: boolean): void {
    const records = this.getRecords();
    const target = records.find(r => r.id === phonemeId);
    if (target) {
      target.totalAttempts += 1;
      if (isCorrect) target.correctAttempts += 1;
      target.lastEvaluated = Date.now();
      this.saveRecords(records);
    }
  }

  public static getAccuracy(r: PhonemeRecord): number {
    if (r.totalAttempts === 0) return 100;
    return Math.round((r.correctAttempts / r.totalAttempts) * 100);
  }

  public static getStatusColor(r: PhonemeRecord): { bg: string; border: string; text: string; label: string } {
    const acc = this.getAccuracy(r);
    if (r.totalAttempts === 0) {
      return { bg: 'var(--bg-secondary)', border: 'var(--border-subtle)', text: 'var(--text-muted)', label: 'Untested' };
    }
    if (acc >= 85) {
      return { bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.4)', text: 'var(--accent-bamboo)', label: 'Mastered' };
    }
    if (acc >= 65) {
      return { bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.4)', text: 'var(--accent-gold)', label: 'Moderate' };
    }
    return { bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.4)', text: 'var(--accent-seal)', label: 'Weakness' };
  }
}
