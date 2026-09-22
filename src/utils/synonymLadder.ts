/**
 * Synonym Ladder Engine (AIM-004: Vocabulary Difficulty Slider & Real-Time Simplifier)
 * Performs instantaneous in-memory vocabulary substitution scaling text difficulty
 * up or down across HSK levels 1–6 without LLM latency.
 */

export interface SynonymTier {
  hsk: number; // 1 to 6
  word: string;
}

export interface SynonymLadder {
  id: string;
  category: string;
  tiers: SynonymTier[];
}

export interface SubstitutionRecord {
  fromWord: string;
  toWord: string;
  fromHsk: number;
  toHsk: number;
  index: number;
}

export const SYNONYM_LADDERS: SynonymLadder[] = [
  {
    id: 'very',
    category: 'adverb',
    tiers: [
      { hsk: 1, word: '很' },
      { hsk: 2, word: '非常' },
      { hsk: 4, word: '十分' },
      { hsk: 6, word: '甚是' }
    ]
  },
  {
    id: 'buy',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '买' },
      { hsk: 3, word: '购买' },
      { hsk: 5, word: '购置' }
    ]
  },
  {
    id: 'look-watch',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '看' },
      { hsk: 3, word: '观看' },
      { hsk: 5, word: '观赏' },
      { hsk: 6, word: '审视' }
    ]
  },
  {
    id: 'say-speak',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '说' },
      { hsk: 3, word: '谈论' },
      { hsk: 4, word: '叙述' },
      { hsk: 6, word: '阐述' }
    ]
  },
  {
    id: 'arrive',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '到' },
      { hsk: 3, word: '到达' },
      { hsk: 5, word: '抵达' },
      { hsk: 6, word: '莅临' }
    ]
  },
  {
    id: 'eat',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '吃' },
      { hsk: 4, word: '食用' },
      { hsk: 5, word: '享用' }
    ]
  },
  {
    id: 'drink',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '喝' },
      { hsk: 4, word: '饮用' }
    ]
  },
  {
    id: 'tired',
    category: 'adjective',
    tiers: [
      { hsk: 2, word: '累' },
      { hsk: 4, word: '疲劳' },
      { hsk: 5, word: '疲惫' }
    ]
  },
  {
    id: 'fast-quick',
    category: 'adverb',
    tiers: [
      { hsk: 1, word: '快' },
      { hsk: 3, word: '赶快' },
      { hsk: 4, word: '迅速' },
      { hsk: 6, word: '疾速' }
    ]
  },
  {
    id: 'help',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '帮助' },
      { hsk: 4, word: '协助' },
      { hsk: 6, word: '襄助' }
    ]
  },
  {
    id: 'hope-desire',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '想' },
      { hsk: 3, word: '希望' },
      { hsk: 4, word: '渴望' },
      { hsk: 6, word: '希冀' }
    ]
  },
  {
    id: 'if',
    category: 'conjunction',
    tiers: [
      { hsk: 2, word: '要是' },
      { hsk: 3, word: '如果' },
      { hsk: 4, word: '假使' },
      { hsk: 5, word: '倘若' }
    ]
  },
  {
    id: 'search-find',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '找' },
      { hsk: 4, word: '寻找' },
      { hsk: 6, word: '寻觅' }
    ]
  },
  {
    id: 'huge-large',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '很大' },
      { hsk: 4, word: '巨大' },
      { hsk: 5, word: '庞大' },
      { hsk: 6, word: '硕大' }
    ]
  },
  {
    id: 'begin-start',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '开始' },
      { hsk: 4, word: '起初' },
      { hsk: 6, word: '肇始' }
    ]
  },
  {
    id: 'finish-end',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '结束' },
      { hsk: 4, word: '完毕' },
      { hsk: 6, word: '告终' }
    ]
  },
  {
    id: 'suddenly',
    category: 'adverb',
    tiers: [
      { hsk: 3, word: '突然' },
      { hsk: 4, word: '忽然' },
      { hsk: 6, word: '骤然' }
    ]
  },
  {
    id: 'give-gift',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '送' },
      { hsk: 4, word: '赠送' },
      { hsk: 6, word: '奉送' }
    ]
  },
  {
    id: 'listen',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '听' },
      { hsk: 4, word: '倾听' },
      { hsk: 6, word: '聆听' }
    ]
  },
  {
    id: 'rest',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '休息' },
      { hsk: 5, word: '休整' },
      { hsk: 6, word: '休憩' }
    ]
  },
  {
    id: 'discuss',
    category: 'verb',
    tiers: [
      { hsk: 3, word: '讨论' },
      { hsk: 4, word: '商量' },
      { hsk: 6, word: '商榷' }
    ]
  },
  {
    id: 'sick-ill',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '生病' },
      { hsk: 4, word: '患病' },
      { hsk: 6, word: '染疾' }
    ]
  },
  {
    id: 'go-travel',
    category: 'verb',
    tiers: [
      { hsk: 1, word: '去' },
      { hsk: 4, word: '前往' },
      { hsk: 6, word: '奔赴' }
    ]
  },
  {
    id: 'give',
    category: 'verb',
    tiers: [
      { hsk: 2, word: '给' },
      { hsk: 4, word: '给予' },
      { hsk: 6, word: '赐予' }
    ]
  },
  {
    id: 'friend',
    category: 'noun',
    tiers: [
      { hsk: 1, word: '朋友' },
      { hsk: 4, word: '友人' },
      { hsk: 6, word: '挚友' }
    ]
  },
  {
    id: 'happy',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '高兴' },
      { hsk: 3, word: '快乐' },
      { hsk: 5, word: '欣喜' },
      { hsk: 6, word: '欢愉' }
    ]
  },
  {
    id: 'sad',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '难过' },
      { hsk: 3, word: '伤心' },
      { hsk: 5, word: '悲痛' },
      { hsk: 6, word: '凄怆' }
    ]
  },
  {
    id: 'fear-scared',
    category: 'adjective',
    tiers: [
      { hsk: 2, word: '害怕' },
      { hsk: 4, word: '恐惧' },
      { hsk: 6, word: '惊惶' }
    ]
  },
  {
    id: 'many-much',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '多' },
      { hsk: 3, word: '许多' },
      { hsk: 5, word: '众多' },
      { hsk: 6, word: '繁多' }
    ]
  },
  {
    id: 'few-rare',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '少' },
      { hsk: 3, word: '很少' },
      { hsk: 5, word: '稀少' },
      { hsk: 6, word: '寥寥' }
    ]
  },
  {
    id: 'beautiful',
    category: 'adjective',
    tiers: [
      { hsk: 1, word: '漂亮' },
      { hsk: 4, word: '美丽' },
      { hsk: 6, word: '绚丽' }
    ]
  }
];

export class SynonymLadderEngine {
  /**
   * Scales text difficulty to a target HSK level (1 to 6).
   * Sorts matches by word length (longest matches first) to prevent partial substring collisions.
   */
  public static scaleDifficulty(
    text: string,
    targetHsk: number
  ): {
    scaledText: string;
    substitutions: SubstitutionRecord[];
  } {
    let result = text;
    const substitutions: SubstitutionRecord[] = [];

    // Flatten all tiers into a lookup sorted by descending word length
    const wordsWithTiers: Array<{
      word: string;
      hsk: number;
      ladder: SynonymLadder;
    }> = [];

    for (const ladder of SYNONYM_LADDERS) {
      for (const tier of ladder.tiers) {
        wordsWithTiers.push({
          word: tier.word,
          hsk: tier.hsk,
          ladder
        });
      }
    }

    wordsWithTiers.sort((a, b) => b.word.length - a.word.length);

    for (const entry of wordsWithTiers) {
      if (!result.includes(entry.word)) continue;

      // Find the closest tier matching targetHsk
      // If targetHsk <= entry.hsk, we simplify (pick tier with highest hsk <= targetHsk)
      // If targetHsk > entry.hsk, we enrich (pick tier with lowest hsk >= targetHsk)
      const sortedTiers = [...entry.ladder.tiers].sort((a, b) => a.hsk - b.hsk);
      let targetTier: SynonymTier | null = null;

      if (targetHsk < entry.hsk) {
        // Simplifying: choose highest available tier that is <= targetHsk
        for (let i = sortedTiers.length - 1; i >= 0; i--) {
          if (sortedTiers[i].hsk <= targetHsk) {
            targetTier = sortedTiers[i];
            break;
          }
        }
        if (!targetTier && sortedTiers.length > 0) {
          targetTier = sortedTiers[0]; // fallback to simplest
        }
      } else if (targetHsk > entry.hsk) {
        // Enriching: choose lowest available tier that is >= targetHsk or closest
        for (let i = 0; i < sortedTiers.length; i++) {
          if (sortedTiers[i].hsk >= targetHsk) {
            targetTier = sortedTiers[i];
            break;
          }
        }
        if (!targetTier && sortedTiers.length > 0) {
          targetTier = sortedTiers[sortedTiers.length - 1]; // fallback to most advanced
        }
      }

      if (targetTier && targetTier.word !== entry.word) {
        let searchIndex = 0;
        while (true) {
          const idx = result.indexOf(entry.word, searchIndex);
          if (idx === -1) break;

          result = result.substring(0, idx) + targetTier.word + result.substring(idx + entry.word.length);
          substitutions.push({
            fromWord: entry.word,
            toWord: targetTier.word,
            fromHsk: entry.hsk,
            toHsk: targetTier.hsk,
            index: idx
          });
          searchIndex = idx + targetTier.word.length;
        }
      }
    }

    return { scaledText: result, substitutions };
  }

  /**
   * Retrieves all synonym tiers for a given word.
   */
  public static getLadderForWord(word: string): SynonymLadder | null {
    return SYNONYM_LADDERS.find(l => l.tiers.some(t => t.word === word)) || null;
  }
}
