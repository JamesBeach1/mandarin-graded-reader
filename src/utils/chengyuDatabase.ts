/**
 * Chengyu (Chinese Four-Character Idioms 成语) Knowledge Base
 * Catalogs curated, high-yield idioms with literal translations, figurative meanings,
 * pinyin, and historical allusions / story origins (典故).
 */

export interface ChengyuEntry {
  idiom: string;
  pinyin: string;
  literalTranslation: string;
  figurativeMeaning: string;
  allusion: string; // Historical origin / story background (典故)
  hskLevel?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
}

export const CHENGYU_DICTIONARY: Record<string, ChengyuEntry> = {
  '守株待兔': {
    idiom: '守株待兔',
    pinyin: 'shǒu zhū dài tù',
    literalTranslation: 'To stand by a tree stump waiting for a hare to bump into it',
    figurativeMeaning: 'Trusting to luck rather than effort; waiting foolishly for windfalls without working for them.',
    allusion: 'From 《韩非子·五蠹》 (Han Feizi). A Song Dynasty farmer saw a running hare crash into a tree stump and break its neck. Delighted with free meat, he abandoned his plow and guarded the tree daily, waiting for another hare. The entire state laughed at his foolishness.',
    hskLevel: '5',
    exampleSentence: '我们必须主动寻找机会，不能守株待兔。',
    exampleTranslation: 'We must proactively seek opportunities and not just sit around waiting for luck.'
  },
  '井底之蛙': {
    idiom: '井底之蛙',
    pinyin: 'jǐng dǐ zhī wā',
    literalTranslation: 'A frog at the bottom of a well',
    figurativeMeaning: 'A person of narrow vision and limited experience who falsely believes they understand the whole universe.',
    allusion: 'From 《庄子·秋水》 (Zhuangzi). A frog living inside an abandoned well bragged to a giant sea turtle about having the greatest pond in existence. The sea turtle described the boundless depths of the Eastern Ocean, leaving the frog speechless and humiliated.',
    hskLevel: '4',
    exampleSentence: '多出去走走看看，才不会成为井底之蛙。',
    exampleTranslation: 'Travel more and see the world, so you won\'t become a frog in a well.'
  },
  '盲人摸象': {
    idiom: '盲人摸象',
    pinyin: 'máng rén mō xiàng',
    literalTranslation: 'Blind men feeling an elephant',
    figurativeMeaning: 'Mistaking a partial observation for the complete truth; taking a one-sided perspective.',
    allusion: 'From the Buddhist Nirvana Sutra. Several blind men touched different parts of an elephant: one felt the leg and said it was a pillar, another felt the tail and said it was a rope, another touched the trunk and called it a snake. None could comprehend the whole creature.',
    hskLevel: '4',
    exampleSentence: '如果不做全面调研，只看表面数据无异于盲人摸象。',
    exampleTranslation: 'Without comprehensive research, relying on isolated data is like blind men feeling an elephant.'
  },
  '画蛇添足': {
    idiom: '画蛇添足',
    pinyin: 'huà shé tiān zú',
    literalTranslation: 'To draw a snake and add feet to it',
    figurativeMeaning: 'Ruining a good thing by adding unnecessary details; superfluous overdoing.',
    allusion: 'From 《战国策·齐策二》 (Stratagems of the Warring States). Servants in Chu competed in a drawing contest for a flagon of wine: the first to finish a snake gets to drink. One man finished first, but proudly decided to add feet to his snake. Meanwhile, the second finished and took the wine, declaring: "Snakes have no feet!"',
    hskLevel: '4',
    exampleSentence: '这篇文章本来言简意赅，多加这段分析简直是画蛇添足。',
    exampleTranslation: 'This essay was originally concise; adding this extra section was completely superfluous.'
  },
  '半途而废': {
    idiom: '半途而废',
    pinyin: 'bàn tú ér fèi',
    literalTranslation: 'To give up halfway along the path',
    figurativeMeaning: 'To abandon an undertaking before completion; lacking perseverance.',
    allusion: 'From 《礼记·中庸》 and the story of Yue Yangzi in 《后汉书》. Yue Yangzi left home to study ancient books. A year later he visited home missing his wife. His wife took a pair of scissors to her loom and cut the half-woven silk, teaching him that leaving studies unfinished is just like ruining precious woven cloth.',
    hskLevel: '4',
    exampleSentence: '学汉语贵在坚持，切不可半途而废。',
    exampleTranslation: 'Learning Chinese requires persistence; you must never give up halfway.'
  },
  '一心一意': {
    idiom: '一心一意',
    pinyin: 'yī xīn yī yì',
    literalTranslation: 'One heart, one mind',
    figurativeMeaning: 'Single-minded devotion; wholehearted concentration.',
    allusion: 'From classical rhetoric describing unshakeable intent and undivided dedication to an art, craft, or companion.',
    hskLevel: '3',
    exampleSentence: '他一心一意想考上理想的大学。',
    exampleTranslation: 'He is wholeheartedly devoted to getting accepted into his dream university.'
  },
  '三心二意': {
    idiom: '三心二意',
    pinyin: 'sān xīn èr yì',
    literalTranslation: 'Three hearts and two minds',
    figurativeMeaning: 'Indecisive, fickle, half-hearted; constantly distracted.',
    allusion: 'Popular proverb contrasting with 一心一意, famously depicted in folk tales about the little kitten catching fish while constantly chasing dragonflies and butterflies.',
    hskLevel: '3',
    exampleSentence: '做作业时不要三心二意，专心才能学好。',
    exampleTranslation: 'Don\'t be distracted when doing your homework; only focus leads to mastery.'
  },
  '自相矛盾': {
    idiom: '自相矛盾',
    pinyin: 'zì xiāng máo dùn',
    literalTranslation: 'One\'s spear against one\'s own shield',
    figurativeMeaning: 'Self-contradictory; incompatible claims.',
    allusion: 'From 《韩非子·难一》. A merchant sold both spears and shields. He boasted his shields could pierce nothing, then claimed his spears could pierce everything. An onlooker asked: "What happens if your spear strikes your shield?" The merchant was speechless. The Chinese word for contradiction (矛盾) stems from this.',
    hskLevel: '5',
    exampleSentence: '他刚才说的和昨天的说法自相矛盾。',
    exampleTranslation: 'What he just said contradicts his statement from yesterday.'
  },
  '掩耳盗铃': {
    idiom: '掩耳盗铃',
    pinyin: 'yǎn ěr dào líng',
    literalTranslation: 'Plugging one\'s own ears while stealing a bronze bell',
    figurativeMeaning: 'Deceiving oneself; burying one\'s head in the sand.',
    allusion: 'From 《吕氏春秋·自知》. A thief wanted to steal a heavy bell, but it was too big to carry. He tried smashing it with a hammer, but it rang loudly. Terrified of getting caught, he plugged his ears, believing that if he couldn\'t hear it, nobody else could either.',
    hskLevel: '5',
    exampleSentence: '逃避现实只是掩耳盗铃，问题依然存在。',
    exampleTranslation: 'Escaping reality is just burying your head in the sand; the problem still remains.'
  },
  '对牛弹琴': {
    idiom: '对牛弹琴',
    pinyin: 'duì niú tán qín',
    literalTranslation: 'Playing the lute to an ox',
    figurativeMeaning: 'Speaking to an unsympathetic or unappreciative audience; casting pearls before swine.',
    allusion: 'From the Eastern Han collection 《弘明集》. The master musician Gongming Yi played exquisite classical tunes to a grazing cow. The cow ignored him and continued chewing grass. He then mimicked buzzing insects and whining calves on his strings, and the cow immediately perked up its ears.',
    hskLevel: '4',
    exampleSentence: '跟一个不懂技术的人谈代码，简直是对牛弹琴。',
    exampleTranslation: 'Talking code with someone who knows nothing of technology is like playing lute to an ox.'
  },
  '亡羊补牢': {
    idiom: '亡羊补牢',
    pinyin: 'wáng yáng bǔ láo',
    literalTranslation: 'Mending the sheep pen after the sheep is lost',
    figurativeMeaning: 'Better late than never; taking corrective action after suffering a loss to prevent further damage.',
    allusion: 'From 《战国策·楚策四》: "亡羊而补牢，未为迟也" (It is not too late to mend the fold even after a sheep has been lost). Lord Xiang of Chu recovered his state after taking wise advice following military defeat.',
    hskLevel: '4',
    exampleSentence: '虽然这次考试考砸了，但亡羊补牢，现在抓紧复习还来得及。',
    exampleTranslation: 'Although you did poorly on this exam, it is not too late to catch up and revise now.'
  },
  '拔苗助长': {
    idiom: '拔苗助长',
    pinyin: 'bá miáo zhù zhǎng',
    literalTranslation: 'Pulling up shoots to help them grow',
    figurativeMeaning: 'Spoiling things through over-eagerness; forcing premature growth that violates nature.',
    allusion: 'From 《孟子·公孙丑上》 (Mencius). A foolish farmer in Song was frustrated that his rice shoots were growing too slowly. He spent an exhausting day pulling each seedling upward an inch. He returned home telling his family: "I helped the crops grow today!" His son ran to the field and found every shoot withered and dead.',
    hskLevel: '5',
    exampleSentence: '让小孩子提前学高年级的知识，往往是拔苗助长。',
    exampleTranslation: 'Pushing young children into advanced academic curriculums often does more harm than good.'
  },
  '走马观花': {
    idiom: '走马观花',
    pinyin: 'zǒu mǎ guān huā',
    literalTranslation: 'Viewing flowers from galloping horseback',
    figurativeMeaning: 'Giving only a quick, superficial glance; hasty browsing without depth.',
    allusion: 'From Tang dynasty poet Meng Jiao\'s (孟郊) poem 《登科后》 celebrating passing the rigorous imperial exams: "春风得意马蹄疾，一日看尽长安花" (Riding swift hooves in the spring breeze, I view all Chang\'an flowers in a day). Today used to denote glancing through an exhibit or tourist spot.',
    hskLevel: '5',
    exampleSentence: '这次旅行时间太紧，我们只是走马观花地逛了一圈。',
    exampleTranslation: 'Our itinerary was so tight that we only had time for a whirlwind superficial visit.'
  },
  '胸有成竹': {
    idiom: '胸有成竹',
    pinyin: 'xiōng yǒu chéng zhú',
    literalTranslation: 'Having the whole bamboo complete in one\'s mind before drawing',
    figurativeMeaning: 'Having a well-thought-out plan in advance; calm confidence based on foresight.',
    allusion: 'From Song Dynasty scholar Su Shi\'s (苏轼) praise of painter Wen Tong (文同). When asked why his ink bamboo looked so lifelike, Su Shi remarked that Wen Tong never drew joint by joint; he already envisioned the fully grown bamboo rooted in his chest before dipping his brush in ink.',
    hskLevel: '5',
    exampleSentence: '对于明天的面试，他早已胸有成竹。',
    exampleTranslation: 'He is fully prepared and confident for tomorrow\'s interview.'
  },
  '狐假虎威': {
    idiom: '狐假虎威',
    pinyin: 'hú jiǎ hǔ wēi',
    literalTranslation: 'The fox borrowing the tiger\'s ferocity',
    figurativeMeaning: 'Intimidating others by flaunting powerful connections; bullying under borrowed authority.',
    allusion: 'From 《战国策·楚策一》. A tiger caught a fox. The fox said: "Heaven made me ruler of all beasts; eat me and you defy Heaven! Walk behind me and see for yourself." The tiger followed, and all animals fled in terror. The tiger did not realize the beasts were terrified of him, not the fox.',
    hskLevel: '4',
    exampleSentence: '他不过是狐假虎威，仗着老板的信任对同事指手画脚。',
    exampleTranslation: 'He\'s merely leaning on borrowed authority, using the boss\'s trust to boss his peers around.'
  },
  '卧薪尝胆': {
    idiom: '卧薪尝胆',
    pinyin: 'wò xīn cháng dǎn',
    literalTranslation: 'Sleeping on firewood and tasting gall',
    figurativeMeaning: 'Enduring harsh self-discipline and hardships to achieve vengeance or long-term triumph.',
    allusion: 'From 《史记·越王勾践世家》. King Goujian of Yue was defeated and enslaved by King Fuchai of Wu. Upon release, Goujian slept on prickly brushwood and hung a bitter gall bladder over his head, tasting it every morning to never forget his national humiliation until he rebuilt Yue and defeated Wu.',
    hskLevel: '6',
    exampleSentence: '创业初期极其艰难，团队卧薪尝胆，终于迎来了突破。',
    exampleTranslation: 'The startup phase was grueling; the team persevered through immense hardships until reaching their breakthrough.'
  },
  '纸上谈兵': {
    idiom: '纸上谈兵',
    pinyin: 'zhǐ shàng tán bīng',
    literalTranslation: 'Discussing military strategy solely on paper',
    figurativeMeaning: 'Armchair theorizing; impractical ideas devoid of real-world battlefield experience.',
    allusion: 'From 《史记·廉颇蔺相如列传》. Zhao Kuo could recite all military treatises by heart from boyhood, but knew nothing of real tactical command. When placed in command at the Battle of Changping (260 BC), his rigid textbook maneuvers led to the total encirclement and slaughter of 400,000 Zhao soldiers.',
    hskLevel: '5',
    exampleSentence: '光有理论不行，缺乏实操就是纸上谈兵。',
    exampleTranslation: 'Theory alone isn\'t enough; without actual practice, it\'s just armchair strategizing.'
  },
  '四面楚歌': {
    idiom: '四面楚歌',
    pinyin: 'sì miàn chǔ gē',
    literalTranslation: 'Chu songs singing from all four directions',
    figurativeMeaning: 'Surrounded by enemies on all sides; isolated in an utterly hopeless predicament.',
    allusion: 'From 《史记·项羽本纪》. At the Battle of Gaixia, Xiang Yu\'s Chu army was besieged by Liu Bang\'s Han forces. At night, Han troops sang the folk songs of Chu from all perimeter camps. Hearing his homeland\'s songs, Xiang Yu wept, believing all of Chu had already surrendered.',
    hskLevel: '6',
    exampleSentence: '这家公司陷入资金危机，四面楚歌，濒临倒闭。',
    exampleTranslation: 'Trapped in a financial crisis and besieged on all sides, the company is on the brink of collapse.'
  },
  '同舟共济': {
    idiom: '同舟共济',
    pinyin: 'tóng zhōu gòng jì',
    literalTranslation: 'Crossing the river in the same boat',
    figurativeMeaning: 'Sharing common peril; pulling together through hardship in solidarity.',
    allusion: 'From Sunzi\'s 《孙子兵法·九地》 (The Art of War). Sunzi observed that even bitter enemies from Wu and Yue, when caught in a storm on the same boat, would rescue one another just like a man\'s left and right hands cooperate.',
    hskLevel: '5',
    exampleSentence: '面对全球经济挑战，各国应当同舟共济。',
    exampleTranslation: 'Facing global economic challenges, all nations should work together in solidarity.'
  },
  '马到成功': {
    idiom: '马到成功',
    pinyin: 'mǎ dào chéng gōng',
    literalTranslation: 'Success arrives the moment the warhorse reaches the front',
    figurativeMeaning: 'Instant victory; wishing someone immediate success upon undertaking a task.',
    allusion: 'From Yuan Dynasty playwright Guan Hanqing\'s 《五侯宴》. In ancient cavalry battles, the arrival of elite vanguard steeds signaled swift, decisive victory.',
    hskLevel: '4',
    exampleSentence: '祝你在新的岗位上马到成功！',
    exampleTranslation: 'Wishing you immediate success and triumph in your new position!'
  }
};

/**
 * Checks if a string is a known Chengyu
 */
export function getChengyu(text: string): ChengyuEntry | undefined {
  return CHENGYU_DICTIONARY[text];
}

/**
 * Returns all recognized chengyu 4-grams in a text
 */
export function scanChengyu(text: string): { idiom: string; index: number; entry: ChengyuEntry }[] {
  const results: { idiom: string; index: number; entry: ChengyuEntry }[] = [];
  const idioms = Object.keys(CHENGYU_DICTIONARY);

  for (const idiom of idioms) {
    let pos = 0;
    while ((pos = text.indexOf(idiom, pos)) !== -1) {
      results.push({
        idiom,
        index: pos,
        entry: CHENGYU_DICTIONARY[idiom]
      });
      pos += idiom.length;
    }
  }

  return results.sort((a, b) => a.index - b.index);
}
