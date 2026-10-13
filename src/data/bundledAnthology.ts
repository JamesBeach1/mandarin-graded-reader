/**
 * Bundled Masterpiece Anthology (NONLLM-001)
 *
 * Rich offline anthology containing 50+ curated, graded Chinese stories
 * across HSK 1 through HSK 6. Seeded directly into IndexedDB on initial mount.
 * Provides instant reading material on day one without requiring network connectivity
 * or external LLM API keys.
 */

export interface BundledStory {
  id: string;
  title: string;
  hskLevel: string;
  category: 'daily' | 'fable' | 'chengyu' | 'history' | 'culture' | 'literature';
  categoryLabel: string;
  summary: string;
  text: string;
  lineTranslations?: Array<{ zh: string; en: string }>;
}

export const BUNDLED_ANTHOLOGY: BundledStory[] = [
  // HSK 1: Daily & Elementary
  {
    id: 'anthology_hsk1_01',
    title: '我的小猫咪 (My Little Cat)',
    hskLevel: '1',
    category: 'daily',
    categoryLabel: '日常生活 Daily Life',
    summary: 'A simple story about an affectionate white cat and daily habits.',
    text: '我家有一只白色的猫。它的名字叫小白。小白很喜欢喝牛奶，也喜欢在阳光下睡觉。每天早上，它都走过来看着我，喵喵叫。我觉得它很可爱。'
  },
  {
    id: 'anthology_hsk1_02',
    title: '去茶馆喝茶 (At the Teahouse)',
    hskLevel: '1',
    category: 'daily',
    categoryLabel: '日常生活 Daily Life',
    summary: 'Ordering hot tea with a friend on a pleasant afternoon.',
    text: '今天下午天气很好。我和朋友一起去茶馆。茶馆里人不多，很安静。服务员走过来问我们想喝什么。我说我想喝一杯热绿茶。朋友想喝乌龙茶。茶很香，我们都很高兴。'
  },
  {
    id: 'anthology_hsk1_03',
    title: '明天去北京 (Going to Beijing Tomorrow)',
    hskLevel: '1',
    category: 'daily',
    categoryLabel: '日常生活 Daily Life',
    summary: 'Preparing luggage and tickets for an upcoming trip.',
    text: '明天早上八点，我要坐高铁去北京。我的行李箱里有三件衣服、一本书和一个苹果。爸爸开车送我去火车站。北京很大，有很多好吃的中国菜。我很想去故宫看看。'
  },
  {
    id: 'anthology_hsk1_04',
    title: '买水果 (Buying Fruit)',
    hskLevel: '1',
    category: 'daily',
    categoryLabel: '日常生活 Daily Life',
    summary: 'A friendly transaction at the neighborhood fruit stall.',
    text: '今天下午，我和妈妈去超市买水果。超市里的水果很多，有红色的苹果、黄色的香蕉和甜甜的西瓜。妈妈买了五个苹果和一把香蕉。一共二十块钱。阿姨笑着对我们说欢迎下次再来。'
  },
  {
    id: 'anthology_hsk1_05',
    title: '在图书馆看书 (Reading at the Library)',
    hskLevel: '1',
    category: 'daily',
    categoryLabel: '日常生活 Daily Life',
    summary: 'A quiet morning discovering new books.',
    text: '周末我不喜欢在家里睡觉。我常常去学校的图书馆看书。图书馆里有很多中国历史和文化方面的书。这里很安静，大家都在认真学习。我借了两本汉字书，准备带回家看。'
  },

  // HSK 2: Everyday Scenarios & Expanded Situations
  {
    id: 'anthology_hsk2_01',
    title: '雨天的雨伞 (The Rainy Day Umbrella)',
    hskLevel: '2',
    category: 'daily',
    categoryLabel: '温情故事 Heartwarming',
    summary: 'Sharing an umbrella on a sudden stormy evening.',
    text: '下班的时候，外面突然下起了大雨。我没有带伞，站在公司门口不知所措。这时，隔壁部门的李明走了过来，他微笑着把手里的黑伞分给了我一半。“我们顺路，一起走吧。”虽然路上风很大，但因为这把伞，我的心里觉得特别温暖。'
  },
  {
    id: 'anthology_hsk2_02',
    title: '第一次做西红柿炒鸡蛋 (First Time Cooking Tomato Scrambled Eggs)',
    hskLevel: '2',
    category: 'daily',
    categoryLabel: '家常美食 Home Cooking',
    summary: 'Learning to cook China\'s national soul food.',
    text: '西红柿炒鸡蛋是中国人最喜欢的一道家常菜。今天是我第一次学做这道菜。妈妈先教我把鸡蛋打在碗里，用筷子搅拌均匀。然后把红色的西红柿切成小块。热油下锅，金黄色的鸡蛋立刻膨胀起来。最后放一点糖和盐。尝了一口，味道真是棒极了！'
  },
  {
    id: 'anthology_hsk2_03',
    title: '晨跑与早市 (Morning Jog and the Morning Market)',
    hskLevel: '2',
    category: 'daily',
    categoryLabel: '城市生活 City Life',
    summary: 'Discovering the lively vitality of a neighborhood early market.',
    text: '清晨六点，公园里的空气十分新鲜。很多老人已经在那里打太极拳了。我绕着湖边慢跑了半个小时，出了一身汗。跑完步后，我走进旁边的早市。热腾腾的豆浆和油条散发着诱人的香味，小贩们热情地叫卖着刚采摘的蔬菜。这就是城市最真实的烟火气。'
  },
  {
    id: 'anthology_hsk2_04',
    title: '火车站的送别 (Farewell at the Station)',
    hskLevel: '2',
    category: 'daily',
    categoryLabel: '情感记忆 Emotional Ties',
    summary: 'Saying goodbye before studying abroad.',
    text: '站台上人来人往，广播里播送着列车即将出发的提示音。朋友背着厚重的行囊，马上要坐车去远方的城市读大学。我们紧紧拥抱在一起。他说：“不要难过，放假的时候我一定会回来看你们的。”列车缓缓开动，他在窗口用力地向我们挥手，直到车身消失在视线的尽头。'
  },
  {
    id: 'anthology_hsk2_05',
    title: '拾金不昧的小学生 (The Honest Schoolboy)',
    hskLevel: '2',
    category: 'daily',
    categoryLabel: '道德美德 Morals',
    summary: 'A child finds a lost wallet and waits for its owner.',
    text: '放学回家的路上，小华在长椅上捡到了一个黑色的皮夹。打开一看，里面不仅有很多现金，还有身份证和银行卡。小华没有离开，而是坐在长椅旁耐心等待失主。过了半小时，一位叔叔满头大汗地跑了过来。确认身份后，小华把皮夹还给了他。叔叔感激地夸奖他是一个诚实的好孩子。'
  },

  // HSK 3: Idioms, Fables & Clever Thinking
  {
    id: 'anthology_hsk3_01',
    title: '守株待兔 (Waiting by the Stump for a Hare)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Idiom Fables',
    summary: 'The classic warning against relying on accidental fortune instead of honest effort.',
    text: '从前，宋国有一个农夫，每天都在田地里辛勤地劳作。有一天，一只飞奔的野兔不小心撞在了田边的大树桩上，折断了脖子死掉了。农夫高兴极了，捡起兔子美美地吃了一顿。从此以后，他放下锄头，整天守在树桩旁，希望再有兔子撞上来。结果田里的庄稼全都枯死了，他也成为了全天下的笑柄。'
  },
  {
    id: 'anthology_hsk3_02',
    title: '掩耳盗铃 (Plugging One\'s Ears to Steal a Bell)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Idiom Fables',
    summary: 'The folly of self-deception and wishful thinking.',
    text: '春秋时期，有一个小偷看中了范氏家族门前悬挂的一口精美大钟。钟太重了，小偷根本搬不动。于是他想用铁锤把钟砸碎后再搬走。但他一砸，钟声便响彻云霄。小偷慌乱中想出一个“聪明”的办法：他找来两团棉花塞住自己的耳朵。他心想：“只要我听不见，别人肯定也听不见了！”当他再次举起铁锤时，周围的人立刻冲上来抓住了他。'
  },
  {
    id: 'anthology_hsk3_03',
    title: '盲人摸象 (The Blind Men and the Elephant)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '古代智慧 Ancient Wisdom',
    summary: 'How limited perspectives produce biased conclusions.',
    text: '四个盲人听说大象是一种庞大而神奇的动物，便决定去亲手摸一摸。摸到象牙的盲人说：“大象就像一根光滑坚硬的萝卜！”摸到象耳朵的盲人反驳道：“不对，大象明明是一把巨大的蒲扇！”摸到大象粗腿的盲人喊道：“你们都错了，大象分明是一根大柱子！”摸到大象尾巴的盲人则坚信大象就是一根细绳子。他们争吵不休，谁也不肯承认自己只看到了片面的真相。'
  },
  {
    id: 'anthology_hsk3_04',
    title: '南辕北辙 (Driving South to Reach the North)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Idiom Fables',
    summary: 'When actions directly contradict goals.',
    text: '魏国的大臣季梁在路上遇到一个乘车的人。那人告诉季梁，他打算去北方的楚国。季梁惊讶地问：“楚国明明在南方，你为什么要往北走呢？”那人得意地拍着胸脯回答：“没关系，我的马跑得飞快，车夫经验丰富，随身带的盘缠也十分充足！”季梁叹了口气说：“你的条件越好，离你的真正目标反而会越来越远啊。”'
  },
  {
    id: 'anthology_hsk3_05',
    title: '画蛇添足 (Adding Feet to a Snake)',
    hskLevel: '3',
    category: 'chengyu',
    categoryLabel: '成语寓言 Idiom Fables',
    summary: 'Ruining success through unnecessary superfluous embellishments.',
    text: '楚国的一位贵族祭祀完祖先，把一壶美酒赏赐给门客。门客们商量说：“一壶酒大家分着喝不够，不如我们在地上画蛇，谁先画好谁就独享这壶酒。”其中一人运笔如飞，很快就画完了一条栩栩如生的小蛇。他左手端起酒壶，右手握着树枝得意地说：“我还能给蛇添上四只脚呢！”然而，当他还在给蛇画脚的时候，另一个人已经画完了，夺过酒壶笑道：“蛇本来就没有脚，你怎么能给它画脚呢？”说完便把酒一饮而尽。'
  },

  // HSK 4: Historical Figures & Cultural Deep Dives
  {
    id: 'anthology_hsk4_01',
    title: '司马光砸缸 (Sima Guang Breaks the Water Vat)',
    hskLevel: '4',
    category: 'history',
    categoryLabel: '历史名人 Historical Legends',
    summary: 'Quick thinking in childhood saves a drowning friend.',
    text: '北宋时期，司马光幼年时就表现出过人的聪颖与冷静。有一天，他和一群小伙伴在庭院里玩捉迷藏。庭院中有一口装满水的大水缸。一个顽皮的孩子爬上缸沿玩耍，不慎失足跌落到缸中。深水立刻淹没了他的头顶，其他小孩吓得面无人色，有的放声大哭，有的跑去找大人求救。唯独年幼的司马光临危不乱，他在四周迅速搬起一块巨大的石头，使出全身力气砸向水缸。水缸破裂，水流奔涌而出，落水的孩子终于平安获救。'
  },
  {
    id: 'anthology_hsk4_02',
    title: '茶道的源流与心境 (The Spirit of the Chinese Tea Ceremony)',
    hskLevel: '4',
    category: 'culture',
    categoryLabel: '传统文化 Cultural Arts',
    summary: 'The philosophical intersection of tea, nature, and inner peace.',
    text: '中国茶文化源远流长，早在唐代陆羽撰写《茶经》时，饮茶就已超越了单纯的解渴需求，升华成为一种修身养性的艺术。泡茶讲究水温、器具与心境的和谐统一。将沸水注入紫砂壶中，茶叶在水中舒展翻滚，散发出淡淡的幽香。端起温热的茶杯，轻抿一口，初品微苦，回味甘甜。古人讲究“和敬清寂”，正是希望人们在繁忙喧嚣的尘世之中，通过一杯清茶找回内心的宁静与澄明。'
  },
  {
    id: 'anthology_hsk4_03',
    title: '万里长城的建造奇迹 (The Miracle of the Great Wall)',
    hskLevel: '4',
    category: 'history',
    categoryLabel: '名胜古迹 World Heritage',
    summary: 'Architectural perseverance across millennia.',
    text: '蜿蜒起伏在崇山峻岭之间的万里长城，是人类建筑史上的伟大奇迹。从秦始皇下令连接各国城墙起，数以百万计的古代工匠用汗水与生命铸就了这道坚不可摧的国防防线。在没有现代机械的年代，重达数百斤的花岗岩条石完全依靠人力、滚木以及山羊驮运至陡峭的山顶。长城不仅见证了无数烽火连天的战争岁月，更凝聚了中华民族坚韧不拔的意志与对和平的渴望。'
  },
  {
    id: 'anthology_hsk4_04',
    title: '中秋望月与团圆文化 (Mid-Autumn Moon and Reunion)',
    hskLevel: '4',
    category: 'culture',
    categoryLabel: '民俗节庆 Folk Festivals',
    summary: 'The symbolism of the full moon in Chinese poetry and family lore.',
    text: '每年农历八月十五，秋高气爽，夜空中的明月分外皎洁圆润。在中华传统文化中，圆月象征着圆满与团圆。这一夜，无论身处何方的游子，都会尽力赶回家中与亲人围坐在一起，品尝香甜的月饼，分享一年的欢喜与思念。苏轼在著名的词作中写道：“但愿人长久，千里共婵娟。”正是将人类对亲情与爱情的深挚祝福，寄托给了千古流转的明月。'
  },
  {
    id: 'anthology_hsk4_05',
    title: '文房四宝的雅趣 (The Four Treasures of the Study)',
    hskLevel: '4',
    category: 'culture',
    categoryLabel: '文人雅集 Literary Arts',
    summary: 'The tools of classical Chinese calligraphy and painting.',
    text: '笔、墨、纸、砚被古人亲切地誉为“文房四宝”。湖州的羊毫毛笔柔软而富有弹性，徽州的松烟墨香气清雅、落纸如漆，宣城的宣纸吸水适度、千年不腐，端州的端砚石质细腻、发墨如油。文人墨客在案几前研墨挥毫，无论是书写行云流水的草书，还是描摹气韵生动的山水，四宝都是不可或缺的灵魂载体，展现了东方艺术独特的审美情趣。'
  },

  // HSK 5: Philosophical Essays & Classical Literature
  {
    id: 'anthology_hsk5_01',
    title: '塞翁失马，焉知非福 (The Old Man of the Frontier Loses His Horse)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '道家哲学 Daoist Philosophy',
    summary: 'The cyclical nature of blessing and misfortune from the Huainanzi.',
    text: '靠近长城边境的地方住着一位精通术数的老人。有一天，老人家里的骏马无缘无故逃入了北方胡人的领地。邻居们纷纷跑来安慰他，老人却平静地说：“这怎么就不能是一件好事呢？”过了几个月，那匹马不仅自己跑了回来，还带回了一群胡人的良驹。邻居们前来祝贺，老人反倒叹息道：“白白得到这么多良马，也许会带来祸患。”果然，老人的儿子喜爱骑马，不慎从疾驰的马上摔下来摔断了大腿。邻里再次前来探望，老人依然淡然处之：“腿虽然断了，难道不能转化为福气吗？”一年后，胡人大举入侵边境，身强力壮的青年男子都被征召参军，战死者十之八九。唯独老人的儿子因为跛脚免于征兵，父子俩得以保全性命。'
  },
  {
    id: 'anthology_hsk5_02',
    title: '醉翁之意不在酒 (The Drunkard\'s Intent Lies Not in Wine)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '宋代散文 Classical Prose',
    summary: 'Ouyang Xiu\'s celebration of nature and communion with common citizens.',
    text: '环滁皆山也。其西南诸峰，林壑尤美。宋代文学家欧阳修被贬为滁州知州时，自号“醉翁”，在滁州的琅琊山间建造了一座小亭，名为醉翁亭。智者游山玩水，并非贪恋杯中之酒，而是陶醉于山水泉石之间奇妙变幻的景色。“醉翁之意不在酒，在乎山水之间也。山水之乐，得之心而寓之酒也。”当太守与滁州的平民百姓一同登高野餐、击掌行令时，他体察到了天地万物最本真的欢愉，留下了千古传诵的文学绝唱。'
  },
  {
    id: 'anthology_hsk5_03',
    title: '桃花源记（改写版）(The Peach Blossom Spring - Adapted)',
    hskLevel: '5',
    category: 'literature',
    categoryLabel: '田园理想 Utopian Classic',
    summary: 'Tao Yuanming\'s immortal vision of peace untouched by worldly strife.',
    text: '东晋时期，武陵有一位打鱼的渔人，乘船顺着溪流前行，渐渐忘却了路途的远近。忽然间，眼前出现了一片茂密的桃花林，两岸数里之内没有杂树，芬芳的花瓣在空中飞舞。渔人惊叹于眼前的美景，便划船穿过隐蔽的山洞。山洞豁然开朗，眼前呈现出一幅宁静祥和的田园画卷：平坦的土地上错落着整齐的农舍，肥沃的田地与碧绿的池塘交相辉映，男女老少在田间安居乐业，怡然自得。原来这里的居民是为了躲避秦朝战乱来到此地，与外界隔绝了数百年。'
  },

  // HSK 6: Masterpiece Depth & Advanced Thought
  {
    id: 'anthology_hsk6_01',
    title: '庄周梦蝶与万物齐一 (Zhuangzi\'s Butterfly Dream)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '先秦玄学 Metaphysics',
    summary: 'The blurring boundaries between illusion and reality.',
    text: '昔者庄周梦为胡蝶，栩栩然胡蝶也，自喻适志与！不知周也。俄然觉，则蘧蘧然周也。不知周之梦为胡蝶与，胡蝶之梦为周与？战国时期的哲学家庄子以此精妙的寓言，阐发了其“万物齐一”与“物化”的本体论深思。在梦境与觉醒的交错之间，主观的自我与客观的外物边界逐渐消融。庄子藉此启迪世人，若能超脱现实功名利禄的束缚，以更广袤超然的宇宙视角审视生死与变迁，方能臻至逍遥游之精神至境。'
  },
  {
    id: 'anthology_hsk6_02',
    title: '红楼梦之宝黛初见 (Bao-yu Meets Dai-yu in Dream of the Red Chamber)',
    hskLevel: '6',
    category: 'literature',
    categoryLabel: '古典名著 The Chinese Classic',
    summary: 'The destined first encounter between Jia Baoyu and Lin Daiyu.',
    text: '贾宝玉一见林黛玉，便笑道：“这个妹妹我曾见过的。”贾母笑道：“可又是胡说，你何曾见过她？”宝玉道：“虽没见过，却看着面善，心里倒像是远别重逢的一般。”曹雪芹笔下的这一瞬初会，不仅定格了中国古典小说中最凄美动人的命运悲剧序幕，更将前世西方灵河岸上“绛珠仙草”与“神瑛侍者”以甘露与眼泪相报还的宿命因果，织就成现实世界中对封建礼教无声而深沉的抗争。'
  }
];

import { EXPANDED_CLASSICAL_STORIES } from './expandedAnthology';
import { GRAND_CHINESE_COLLECTION } from './grandAnthology';
import { COMPLETE_BOOK_COLLECTION } from './completeBookCollection';

/**
 * Complete consolidated anthology containing foundational daily readers,
 * idiom fables, classical masterpieces, Buddhist teachings, children's classics,
 * folk legends, and complete books/novellas across HSK 1–6.
 */
export const ALL_ANTHOLOGY_STORIES: BundledStory[] = [
  ...BUNDLED_ANTHOLOGY,
  ...EXPANDED_CLASSICAL_STORIES,
  ...GRAND_CHINESE_COLLECTION,
  ...COMPLETE_BOOK_COLLECTION
];

export const AnthologyService = {
  /**
   * Get all bundled stories
   */
  getAll(): BundledStory[] {
    return ALL_ANTHOLOGY_STORIES;
  },

  /**
   * Filter stories by HSK level
   */
  getByHsk(hsk: string): BundledStory[] {
    return ALL_ANTHOLOGY_STORIES.filter(s => s.hskLevel === hsk);
  },

  /**
   * Get a story by ID
   */
  getById(id: string): BundledStory | undefined {
    return ALL_ANTHOLOGY_STORIES.find(s => s.id === id);
  }
};
