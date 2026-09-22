/**
 * Adventure Branch Engine (GTU-007)
 * Synthesizes 2-3 grammatically constrained branching story choices
 * appropriate for the reader's current HSK level.
 */

export interface AdventureBranchChoice {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  tone: 'cautious' | 'bold' | 'curious' | 'humorous';
  hskLevel: number;
}

export function generateAdventureBranches(
  currentText: string,
  hskLevel: number
): AdventureBranchChoice[] {
  // Context-aware dynamic choices matching common narrative situations
  const lowerText = currentText.toLowerCase();

  // Scenario 1: Food / Dining / Teahouse / Restaurant
  if (currentText.includes('饭') || currentText.includes('吃') || currentText.includes('茶') || currentText.includes('菜') || currentText.includes('店')) {
    if (hskLevel <= 2) {
      return [
        {
          id: 'branch-food-1',
          chinese: '他想喝一杯热茶，然后离开。',
          pinyin: 'Tā xiǎng hē yì bēi rè chá, ránhòu líkāi.',
          english: 'He wants to drink a cup of hot tea, and then leave.',
          tone: 'cautious',
          hskLevel
        },
        {
          id: 'branch-food-2',
          chinese: '他问服务员：“这个菜好吃吗？”',
          pinyin: 'Tā wèn fúwùyuán: "Zhèige cài hǎochī ma?"',
          english: 'He asks the waiter: "Is this dish delicious?"',
          tone: 'curious',
          hskLevel
        },
        {
          id: 'branch-food-3',
          chinese: '一个老朋友突然走进了餐厅。',
          pinyin: 'Yí ge lǎo péngyou tūrán zǒujìn le cāntīng.',
          english: 'An old friend suddenly walked into the restaurant.',
          tone: 'bold',
          hskLevel
        }
      ];
    } else {
      return [
        {
          id: 'branch-food-adv-1',
          chinese: '他向店主请教这道传统招牌菜的秘方与烹饪历史。',
          pinyin: 'Tā xiàng diànzhǔ qǐngjiào zhè dào chuántǒng zhāopai cài de mìfāng yǔ pēngrèn lìshǐ.',
          english: 'He consults the owner about the secret recipe and culinary history.',
          tone: 'curious',
          hskLevel
        },
        {
          id: 'branch-food-adv-2',
          chinese: '邻桌的客人们正在热烈争论一件城里的离奇传闻。',
          pinyin: 'Lín zhuō de kèrénmen zhèngzài rèliè zhēnglùn yí jiàn chénglǐ de líqí chuánwén.',
          english: 'The neighboring table is passionately arguing about an uncanny rumor in town.',
          tone: 'bold',
          hskLevel
        },
        {
          id: 'branch-food-adv-3',
          chinese: '他付了账单，决定趁着夜色去附近的夜市一探究竟。',
          pinyin: 'Tā fù le zhàngdān, juédìng chèn zhe yèsè qù fùjìn de yèshì yítàn jiūjìng.',
          english: 'He pays the bill and decides to investigate the nearby night market under cover of night.',
          tone: 'cautious',
          hskLevel
        }
      ];
    }
  }

  // Scenario 2: Travel / City / Train / Streets / Transit
  if (currentText.includes('路') || currentText.includes('车') || currentText.includes('站') || currentText.includes('走') || currentText.includes('看')) {
    if (hskLevel <= 2) {
      return [
        {
          id: 'branch-travel-1',
          chinese: '他在路边买了一张地图，继续往前走。',
          pinyin: 'Tā zài lùbiān mǎi le yì zhāng dìtú, jìxù wǎng qián zǒu.',
          english: 'He bought a map by the roadside and continued forward.',
          tone: 'cautious',
          hskLevel
        },
        {
          id: 'branch-travel-2',
          chinese: '一个热情的出租车司机停在他面前打招呼。',
          pinyin: 'Yí ge rèqíng de chūzūchē sījī tíng zài tā miànqián dǎ zhāohu.',
          english: 'A friendly taxi driver pulled up and waved at him.',
          tone: 'curious',
          hskLevel
        },
        {
          id: 'branch-travel-3',
          chinese: '天空突然下起了大雨，他跑进了一座古老的建筑避雨。',
          pinyin: 'Tiānkōng tūrán xiàqǐ le dàyǔ, tā pǎojìn le yí zuò gǔlǎo de jiànzhù bìyǔ.',
          english: 'Heavy rain suddenly began to pour, and he ran into an old building for shelter.',
          tone: 'bold',
          hskLevel
        }
      ];
    } else {
      return [
        {
          id: 'branch-travel-adv-1',
          chinese: '他发现一位神秘老者在石桥边留下了带有暗号的信封。',
          pinyin: 'Tā fāxiàn yí wèi shénmì lǎozhě zài shíqiáo biān liúxià le dài yǒu ànhào de xìnfēng.',
          english: 'He notices an elderly stranger leaving an envelope coded with ciphers by the stone bridge.',
          tone: 'bold',
          hskLevel
        },
        {
          id: 'branch-travel-adv-2',
          chinese: '为了避免引起注意，他拐进了一条幽深而宁静的小巷。',
          pinyin: 'Wèile bìmiǎn yǐnqǐ zhùyì, tā guǎijìn le yì tiáo yōushēn ér níngjìng de xiǎoxiàng.',
          english: 'To avoid drawing attention, he turned into a quiet, secluded alleyway.',
          tone: 'cautious',
          hskLevel
        },
        {
          id: 'branch-travel-adv-3',
          chinese: '他掏出随身携带的日记本，仔细记录刚才发生的一切异常。',
          pinyin: 'Tā tāochū suíshēn xiédài de rìjìběn, zǐxì jìlù gāngcái fāshēng de yíqiè yìcháng.',
          english: 'He pulled out his pocket diary and meticulously documented all anomalies.',
          tone: 'curious',
          hskLevel
        }
      ];
    }
  }

  // Default General Adventure Branch Archetypes
  if (hskLevel <= 2) {
    return [
      {
        id: 'branch-gen-1',
        chinese: '他决定回去找他的朋友，商量下一步该怎么做。',
        pinyin: 'Tā juédìng huíqù zhǎo tā de péngyou, shāngliang xià yí bù gāi zěnme zuò.',
        english: 'He decided to return to his friend and discuss the next step.',
        tone: 'cautious',
        hskLevel
      },
      {
        id: 'branch-gen-2',
        chinese: '他推开了那扇紧闭的红色木门。',
        pinyin: 'Tā tuīkāi le nà shàn jǐnbì de hóngsè mùmén.',
        english: 'He pushed open the tightly closed red wooden door.',
        tone: 'bold',
        hskLevel
      },
      {
        id: 'branch-gen-3',
        chinese: '忽然，手机响了起来，是一个陌生人的电话。',
        pinyin: 'Hūrán, shǒujī xiǎng le qǐlái, shì yí ge mòshēngrén de diànhuà.',
        english: 'Suddenly his phone rang—it was a call from a stranger.',
        tone: 'curious',
        hskLevel
      }
    ];
  }

  return [
    {
      id: 'branch-adv-1',
      chinese: '经过深思熟虑，他决定铤而走险，揭开背后隐藏的真相。',
      pinyin: 'Jīngguò shēnsī shúlǜ, tā juédìng tǐng ér zǒu xiǎn, jiēkāi bèihòu yǐncáng de zhēnxiàng.',
      english: 'After deep deliberation, he decided to take the risk and uncover the hidden truth.',
      tone: 'bold',
      hskLevel
    },
    {
      id: 'branch-adv-2',
      chinese: '他假装若无其事，不动声色地观察周围人们的一举一动。',
      pinyin: 'Tā jiǎzhuāng ruò wú qí shì, búdòng shēngsè de guānchá zhōuwéi rénmen de yì jǔ yí dòng.',
      english: 'He pretended nothing happened, calmly observing every movement around him.',
      tone: 'cautious',
      hskLevel
    },
    {
      id: 'branch-adv-3',
      chinese: '出人意料的是，一封没有署名的匿名邀请函突然送到了他的手中。',
      pinyin: 'Chūrén yìliào de shì, yì fēng méiyǒu shǔmíng de nìmíng yāoqǐnghán tūrán sòngdào le tā de shǒuzhōng.',
      english: 'Unexpectedly, an unsigned anonymous invitation was delivered right into his hands.',
      tone: 'curious',
      hskLevel
    }
  ];
}
