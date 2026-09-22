/**
 * Cultural Context AI Notes Engine (TRC-009)
 * Detects, classifies, and explains social etiquette, cultural customs,
 * linguistic subtext, and historical taboos in Chinese texts.
 */

export interface CulturalContextNote {
  id: string;
  topic: string;
  chineseTitle: string;
  category: 'etiquette' | 'taboo' | 'tradition' | 'social_concept' | 'linguistic_subtext';
  categoryBadge: string;
  matchedKeywords: string[];
  summary: string;
  culturalSubtext: string;
  etiquetteTip: string;
  historicalOrigin?: string;
}

export const CULTURAL_KNOWLEDGE_BASE: CulturalContextNote[] = [
  {
    id: 'jingjiu',
    topic: 'Toasting Etiquette (敬酒文化)',
    chineseTitle: '敬酒礼仪与座次',
    category: 'etiquette',
    categoryBadge: '🍶 宴饮礼仪',
    matchedKeywords: ['敬酒', '干杯', '喝酒', '举杯', '敬您', '酒席', '敬一杯'],
    summary: 'Chinese banqueting revolves around hierarchy, mutual respect, and reciprocal toasting.',
    culturalSubtext: 'When toasting an elder, host, or senior colleague, etiquette dictates holding the glass with both hands and tapping your glass rim slightly LOWER than theirs to show modesty and respect.',
    etiquetteTip: 'Always stand up when toasting a senior person. Saying "我干了，您随意" (I will drain my cup, drink as you please) demonstrates generous host etiquette without putting pressure on the guest.',
    historicalOrigin: 'Originates in the Zhou Dynasty (周礼) sacrificial wine rituals, which evolved into formal statecraft and familial dining codes.'
  },
  {
    id: 'mianzi',
    topic: 'Face & Social Harmony (面子与留白)',
    chineseTitle: '面子与人情世故',
    category: 'social_concept',
    categoryBadge: '🎭 社交哲学',
    matchedKeywords: ['面子', '丢脸', '给面子', '不给面子', '赏脸', '没面子', '留情面', '不好意思'],
    summary: '"Mianzi" (face) represents an individual\'s social dignity, reputation, and relational credit in their community.',
    culturalSubtext: 'Direct public disagreement or blunt refusal causes the other person to "lose face" (丢脸). Chinese communication often uses indirect expressions, polite pretexts, or pauses (留白) to allow both sides to preserve dignity.',
    etiquetteTip: 'Never publicly criticize or contradict someone in front of peers or subordinates. Frame feedback as constructive exploration (比如我们可以考虑...) rather than pointing out error.',
    historicalOrigin: 'Deeply rooted in Confucian collectivism, where maintaining harmonious group equilibrium takes precedence over individual confrontational debate.'
  },
  {
    id: 'keqi_maidan',
    topic: 'Fighting for the Bill & Modesty (客气与抢买单)',
    chineseTitle: '客气礼俗与抢买单',
    category: 'etiquette',
    categoryBadge: '💳 待客礼俗',
    matchedKeywords: ['买单', '结账', '客气', '太客气', '抢着', '请客', '不用客气', '这怎么好意思'],
    summary: 'Fighting passionately over who pays the restaurant bill is a quintessential social ritual showing sincerity and hospitality.',
    culturalSubtext: 'Allowing a guest or junior friend to pay alone is considered ungenerous by the host. Friends often physically contest to reach the cashier counter first or quietly settle the tab before the meal finishes.',
    etiquetteTip: 'If someone insists on treating you, express polite protest 2-3 times ("下次一定我来请！" - Next time is definitely on me!), and follow through by hosting them on a future occasion.',
    historicalOrigin: 'Rooted in the ancient concept of 礼尚往来 (Propriety suggests reciprocity) from the Book of Rites (礼记).'
  },
  {
    id: 'hongbao',
    topic: 'Lucky Money & Red Envelopes (红包与压岁钱)',
    chineseTitle: '压岁钱与人情往来',
    category: 'tradition',
    categoryBadge: '🧧 传统节庆',
    matchedKeywords: ['红包', '压岁钱', '给红包', '过年', '拜年', '压祟'],
    summary: 'Red envelopes containing monetary gifts given during Spring Festival, weddings, and milestones.',
    culturalSubtext: 'Money in red envelopes must always be crisp new banknotes. Amounts must never involve the number 4 (四 sì sounds like 死 sǐ death), and favor even numbers like 6 (六六大顺) and 8 (发财).',
    etiquetteTip: 'Always receive a red envelope with both hands, bow slightly, and thank the giver warmly. Never open a red envelope in front of the person who gave it to you.',
    historicalOrigin: 'Originally called 压祟钱 (Money to suppress evil spirits). Folk legend held that an evil spirit named "Sui" terrified children on New Year’s Eve until coins wrapped in red paper repelled it.'
  },
  {
    id: 'chadao_kouzhili',
    topic: 'Tea Etiquette & Finger Tapping (茶道与叩指礼)',
    chineseTitle: '茶道礼仪与叩指礼',
    category: 'etiquette',
    categoryBadge: '🍵 茶礼民俗',
    matchedKeywords: ['倒茶', '喝茶', '沏茶', '品茗', '茶馆', '叩指', '敬茶', '以茶代酒'],
    summary: 'Tea service is central to Chinese hospitality, carrying silent body language and respectful gestures.',
    culturalSubtext: 'When someone pours tea for you, gently tap the table with your index and middle finger knuckles bent. This silent "finger kowtow" (叩指礼) thanks the server without interrupting their speech.',
    etiquetteTip: 'Never point the spout of a teapot directly at anyone seated at the table; pointing the spout is historically equated with wishing someone away or hostility. Fill teacups only 70% full (茶七酒八, "seven for tea, eight for wine").',
    historicalOrigin: 'Folk legend attributes this to Qing Emperor Qianlong traveling incognito in Jiangnan, who poured tea for his servant; the servant bent his fingers to kowtow secretly without blowing the Emperor’s cover.'
  },
  {
    id: 'taboo_gifting',
    topic: 'Gift-Giving Taboos & Homophonic Superstitions (送礼禁忌)',
    chineseTitle: '送礼禁忌与谐音避讳',
    category: 'taboo',
    categoryBadge: '⚠️ 社交避讳',
    matchedKeywords: ['送礼', '送钟', '雨伞', '绿帽子', '送梨', '送伞', '钟表'],
    summary: 'Gift giving is an art in Chinese culture with strict taboos derived from linguistic puns (谐音).',
    culturalSubtext: 'Never gift a clock (送钟 sòng zhōng sounds identical to 送终 attending a funeral), never gift pears to a couple (分梨 fēn lí sounds like 分离 separation), and never gift umbrellas (伞 sǎn sounds like 散 scatter).',
    etiquetteTip: 'Wrap gifts in auspicious red or gold paper. Avoid plain white or black wrapping as they symbolize mourning. Give gifts in pairs (好事成双) rather than odd numbers.',
    historicalOrigin: 'Mandarin’s immense abundance of homophones (同音字) gave rise to profound linguistic superstition in folk commerce and life rituals.'
  },
  {
    id: 'kuaizi_taboos',
    topic: 'Chopstick Etiquette & Taboos (筷子避讳)',
    chineseTitle: '筷子礼仪与民俗禁忌',
    category: 'taboo',
    categoryBadge: '🥢 饮食禁忌',
    matchedKeywords: ['筷子', '插在饭里', '敲碗', '夹菜', '用筷'],
    summary: 'Chopsticks are considered an extension of fingers and must be handled with dining respect.',
    culturalSubtext: 'Never stick chopsticks upright in a bowl of rice (插筷). This mimics burning incense sticks at ancestral graves or funeral altars (祭拜亡者) and is considered deeply inauspicious.',
    etiquetteTip: 'Never drum your chopsticks against the side of a bowl; historically only beggars banged bowls to solicit coins. Never use chopsticks to point directly at another diner.',
    historicalOrigin: 'Recorded in the ancient Han Dynasty treatises on table manners as part of filial respect and spiritual reverence.'
  },
  {
    id: 'qianxu_modesty',
    topic: 'Humility & Declining Compliments (谦虚与受宠若惊)',
    chineseTitle: '谦逊文化与应对赞美',
    category: 'linguistic_subtext',
    categoryBadge: '🗣️ 言语智慧',
    matchedKeywords: ['哪里哪里', '不敢当', '过奖', '见笑', '拙作', '寒舍', '惭愧', '您抬举了'],
    summary: 'Self-effacing humility is celebrated as a hallmark of noble character (君子) in traditional Chinese thought.',
    culturalSubtext: 'When receiving a compliment, immediately replying "谢谢" can sometimes seem boastful to older native speakers. The canonical response is "哪里哪里" (Where? Oh, not at all) or "您过奖了" (You flatter me too much).',
    etiquetteTip: 'A balanced modern response is smiling and saying "谢谢您的夸奖，我还要多向您学习！" (Thank you for your kind words, I still have much to learn from you!).',
    historicalOrigin: 'Derived from Daoist and Confucian philosophy: "满招损，谦受益" (Complacency brings detriment, while humility reaps benefit) from the Shangshu (尚书).'
  },
  {
    id: 'yangsheng_reshui',
    topic: 'Drinking Hot Water & Wellness (多喝热水与养生)',
    chineseTitle: '温水文化与阴阳养生',
    category: 'tradition',
    categoryBadge: '🍵 生活民俗',
    matchedKeywords: ['喝热水', '热水', '多喝水', '着凉', '上火', '养生', '寒气'],
    summary: '"多喝热水" (Drink more hot water) is the ubiquitous Chinese expression of care, comfort, and restorative wellness.',
    culturalSubtext: 'Traditional Chinese Medicine (TCM) categorizes foods and bodily states into Yin (cold) and Yang (hot). Cold drinks are believed to shock the stomach and spleen Qi, while warm water supports internal circulation.',
    etiquetteTip: 'Always offer hot or warm water (温开水) to visiting guests, especially on cold days or when they feel unwell. It conveys sincere, warm attentiveness.',
    historicalOrigin: 'Expanded during 1930s public health campaigns advocating boiled water for hygiene, interweaving with thousands of years of TCM thermal balance philosophy.'
  }
];

export class CulturalContextEngine {
  /**
   * Scans a text for cultural keywords and returns matched explanatory cultural notes
   */
  public static analyzeText(text: string): CulturalContextNote[] {
    if (!text || text.trim().length === 0) return [];

    const matched: CulturalContextNote[] = [];
    const seenIds = new Set<string>();

    for (const note of CULTURAL_KNOWLEDGE_BASE) {
      const hasMatch = note.matchedKeywords.some(keyword => text.includes(keyword));
      if (hasMatch && !seenIds.has(note.id)) {
        seenIds.add(note.id);
        matched.push(note);
      }
    }

    return matched;
  }

  /**
   * Checks if a specific character or short word triggers a cultural concept
   */
  public static getNoteForWord(word: string): CulturalContextNote | null {
    if (!word) return null;
    return CULTURAL_KNOWLEDGE_BASE.find(note => 
      note.matchedKeywords.some(k => k.includes(word) || word.includes(k))
    ) || null;
  }
}
