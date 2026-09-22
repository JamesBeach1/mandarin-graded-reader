/**
 * Grammar Pattern SRS (Cloze Syntax Cards) Database (SRS-002)
 * Tests connective structures, correlative conjunctions, and grammatical particles
 */

export interface GrammarSrsCard {
  id: string;
  patternName: string;
  hskLevel: number;
  formula: string;
  fullSentence: string;
  pinyin: string;
  translation: string;
  // Blanked target connectors
  connectors: string[]; // e.g., ["虽然", "但是"]
  clozeSentence: string; // e.g., "[___] 今天下雨，[___] 我们还是去公园。"
  options: string[][]; // Distractor options for multiple choice
  explanation: string;
  // SM-2 SRS Scheduling state
  interval?: number;
  easeFactor?: number;
  nextReviewDate?: number;
}

export const DEFAULT_GRAMMAR_SRS_CARDS: GrammarSrsCard[] = [
  {
    id: 'g-srs-01',
    patternName: '虽然...但是... (Although... yet...)',
    hskLevel: 2,
    formula: '虽然 + Clause 1，但是 + Clause 2',
    fullSentence: '虽然今天下雨，但是我们还是去了公园。',
    pinyin: 'Suīrán jīntiān xiàyǔ, dànshì wǒmen háishì qùle gōngyuán.',
    translation: 'Although it rained today, we still went to the park.',
    connectors: ['虽然', '但是'],
    clozeSentence: '[___] 今天下雨，[___] 我们还是去了公园。',
    options: [
      ['虽然', '但是'],
      ['因为', '所以'],
      ['不仅', '而且'],
      ['只要', '就']
    ],
    explanation: 'Expresses concessive contrast: "虽然" introduces the acknowledged fact, and "但是" introduces the counter-expectation.'
  },
  {
    id: 'g-srs-02',
    patternName: '因为...所以... (Because... therefore...)',
    hskLevel: 2,
    formula: '因为 + Reason，所以 + Result',
    fullSentence: '因为他身体不舒服，所以今天请假了。',
    pinyin: 'Yīnwèi tā shēntǐ bù shūfu, suǒyǐ jīntiān qǐngjià le.',
    translation: 'Because he is unwell, he took leave today.',
    connectors: ['因为', '所以'],
    clozeSentence: '[___] 他身体不舒服，[___] 今天请假了。',
    options: [
      ['因为', '所以'],
      ['虽然', '但是'],
      ['即使', '也'],
      ['与其', '不如']
    ],
    explanation: 'Standard causal structure stating the cause first with "因为", then consequence with "所以".'
  },
  {
    id: 'g-srs-03',
    patternName: '不但...而且... (Not only... but also...)',
    hskLevel: 3,
    formula: '不但 + Quality A，而且 + Quality B',
    fullSentence: '他不但汉语说得流利，而且还会写汉字。',
    pinyin: 'Tā bùdàn hànyǔ shuō de liúlì, érqiě hái huì xiě hànzì.',
    translation: 'Not only does he speak Chinese fluently, but he can also write characters.',
    connectors: ['不但', '而且'],
    clozeSentence: '他 [___] 汉语说得流利，[___] 还会写汉字。',
    options: [
      ['不但', '而且'],
      ['虽然', '但是'],
      ['一边', '一边'],
      ['如果', '就']
    ],
    explanation: 'Progressive intensification connecting two positive or complementary attributes.'
  },
  {
    id: 'g-srs-04',
    patternName: '一边...一边... (Simultaneous actions)',
    hskLevel: 2,
    formula: '一边 + Action 1，一边 + Action 2',
    fullSentence: '爷爷喜欢一边喝茶，一边看报纸。',
    pinyin: 'Yéye xǐhuan yībiān hēchá, yībiān kàn bàozhǐ.',
    translation: 'Grandfather likes to drink tea while reading the newspaper.',
    connectors: ['一边', '一边'],
    clozeSentence: '爷爷喜欢 [___] 喝茶，[___] 看报纸。',
    options: [
      ['一边', '一边'],
      ['又', '又'],
      ['先', '再'],
      ['不仅', '而且']
    ],
    explanation: 'Indicates two parallel actions performed simultaneously by the same subject.'
  },
  {
    id: 'g-srs-05',
    patternName: '只要...就... (As long as... then...)',
    hskLevel: 3,
    formula: '只要 + Condition，就 + Result',
    fullSentence: '只要坚持努力，你就能学好中文。',
    pinyin: 'Zhǐyào jiānchí nǔlì, nǐ jiù néng xuéhǎo zhōngwén.',
    translation: 'As long as you persist and work hard, you will master Chinese.',
    connectors: ['只要', '就'],
    clozeSentence: '[___] 坚持努力，你 [___] 能学好中文。',
    options: [
      ['只要', '就'],
      ['只有', '才'],
      ['如果', '那么'],
      ['无论', '都']
    ],
    explanation: 'Sufficient condition: meeting this single condition is enough to bring about the result.'
  },
  {
    id: 'g-srs-06',
    patternName: '只有...才... (Only if... then...)',
    hskLevel: 3,
    formula: '只有 + Sole Condition，才 + Result',
    fullSentence: '只有通过这次考试，才能拿到毕业证书。',
    pinyin: 'Zhǐyǒu tōngguò zhè cì kǎoshì, cái néng nádào bìyè zhèngshū.',
    translation: 'Only by passing this exam can you receive the graduation diploma.',
    connectors: ['只有', '才'],
    clozeSentence: '[___] 通过这次考试，[___] 能拿到毕业证书。',
    options: [
      ['只有', '才'],
      ['只要', '就'],
      ['即使', '也'],
      ['虽然', '但是']
    ],
    explanation: 'Necessary exclusive condition: the result cannot happen without this specific condition.'
  },
  {
    id: 'g-srs-07',
    patternName: '除了...以外 (Besides / In addition to...)',
    hskLevel: 3,
    formula: '除了 + Scope + 以外，还 / 也 + Additional',
    fullSentence: '除了苹果以外，我还买了香蕉和西瓜。',
    pinyin: 'Chúle píngguǒ yǐwài, wǒ hái mǎile xiāngjiāo hé xīguā.',
    translation: 'Besides apples, I also bought bananas and watermelon.',
    connectors: ['除了', '以外'],
    clozeSentence: '[___] 苹果 [___]，我还买了香蕉和西瓜。',
    options: [
      ['除了', '以外'],
      ['对于', '来说'],
      ['从', '开始'],
      ['在', '中间']
    ],
    explanation: 'Additive or exclusive prepositional frame marking the scope before the main clause.'
  },
  {
    id: 'g-srs-08',
    patternName: '越...越... (The more... the more...)',
    hskLevel: 2,
    formula: '越 + Condition A，越 + Outcome B',
    fullSentence: '这本书越看越有意思。',
    pinyin: 'Zhè běn shū yuè kàn yuè yǒuyìsi.',
    translation: 'The more you read this book, the more interesting it gets.',
    connectors: ['越', '越'],
    clozeSentence: '这本书 [___] 看 [___] 有意思。',
    options: [
      ['越', '越'],
      ['又', '又'],
      ['也', '也'],
      ['太', '了']
    ],
    explanation: 'Correlative degree marker showing that an outcome increases in direct proportion to the condition.'
  }
];

const GRAMMAR_STORAGE_KEY = 'moyun_grammar_srs_user_deck';

export function getGrammarSrsCards(): GrammarSrsCard[] {
  try {
    const raw = localStorage.getItem(GRAMMAR_STORAGE_KEY);
    if (!raw) return DEFAULT_GRAMMAR_SRS_CARDS;
    const parsed: GrammarSrsCard[] = JSON.parse(raw);
    return parsed.length > 0 ? parsed : DEFAULT_GRAMMAR_SRS_CARDS;
  } catch {
    return DEFAULT_GRAMMAR_SRS_CARDS;
  }
}

export function saveGrammarSrsCards(cards: GrammarSrsCard[]): void {
  localStorage.setItem(GRAMMAR_STORAGE_KEY, JSON.stringify(cards));
}
