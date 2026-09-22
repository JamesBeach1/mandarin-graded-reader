/**
 * Contextual Polyphone (多音字) & Homophone (同音字) Detector (SRS-009)
 * Flags characters with multiple pronunciations or easily confusable same-sound counterparts.
 */

// ==========================================
// 1. POLYPHONE (多音字) ENGINE
// ==========================================

export interface PolyphoneReading {
  pinyin: string;
  meaning: string;
  example: string;
}

export interface PolyphoneEntry {
  character: string;
  readings: PolyphoneReading[];
}

export const COMMON_POLYPHONES: Record<string, PolyphoneEntry> = {
  '得': {
    character: '得',
    readings: [
      { pinyin: 'de', meaning: 'Structural complement particle', example: '跑得很快 (runs fast)' },
      { pinyin: 'děi', meaning: 'Must / have to (modal verb)', example: '你得快点 (you must hurry)' },
      { pinyin: 'dé', meaning: 'To acquire / obtain', example: '得到认可 (gain approval)' }
    ]
  },
  '行': {
    character: '行',
    readings: [
      { pinyin: 'xíng', meaning: 'Okay / capable / to walk', example: '行人 (pedestrian), 不行 (not okay)' },
      { pinyin: 'háng', meaning: 'Profession / row / bank', example: '银行 (bank), 行业 (industry)' }
    ]
  },
  '重': {
    character: '重',
    readings: [
      { pinyin: 'zhòng', meaning: 'Heavy / important', example: '重要 (important), 重量 (weight)' },
      { pinyin: 'chóng', meaning: 'Again / duplicate', example: '重复 (repeat), 重写 (rewrite)' }
    ]
  },
  '地': {
    character: '地',
    readings: [
      { pinyin: 'de', meaning: 'Adverbial particle (-ly)', example: '高兴地跳 (jumped happily)' },
      { pinyin: 'dì', meaning: 'Earth / ground / place', example: '地方 (place), 地球 (earth)' }
    ]
  },
  '发': {
    character: '发',
    readings: [
      { pinyin: 'fā', meaning: 'To send / emit / develop', example: '发现 (discover), 发送 (send)' },
      { pinyin: 'fà', meaning: 'Hair', example: '头发 (hair)' }
    ]
  },
  '会': {
    character: '会',
    readings: [
      { pinyin: 'huì', meaning: 'Can / will / meeting', example: '学会 (learn), 开会 (hold meeting)' },
      { pinyin: 'kuài', meaning: 'Accounting / calculate', example: '会计 (accounting)' }
    ]
  },
  '觉': {
    character: '觉',
    readings: [
      { pinyin: 'jué', meaning: 'Feel / perceive / sense', example: '觉得 (feel), 感觉 (perception)' },
      { pinyin: 'jiào', meaning: 'Sleep / nap', example: '睡觉 (go to sleep)' }
    ]
  },
  '长': {
    character: '长',
    readings: [
      { pinyin: 'cháng', meaning: 'Long (spatial or temporal)', example: '长城 (Great Wall), 长江 (Yangtze River)' },
      { pinyin: 'zhǎng', meaning: 'Grow / elder / chief', example: '长大 (grow up), 校长 (principal)' }
    ]
  },
  '乐': {
    character: '乐',
    readings: [
      { pinyin: 'lè', meaning: 'Happy / cheerful', example: '快乐 (happy), 乐趣 (delight)' },
      { pinyin: 'yuè', meaning: 'Music / acoustics', example: '音乐 (music), 乐器 (musical instrument)' }
    ]
  },
  '和': {
    character: '和',
    readings: [
      { pinyin: 'hé', meaning: 'And / harmony / peace', example: '和平 (peace), 你和我 (you and me)' },
      { pinyin: 'huó', meaning: 'Knead (dough)', example: '和面 (knead dough)' },
      { pinyin: 'hè', meaning: 'Join in singing / harmony', example: '附和 (chime in)' }
    ]
  }
};

export function checkPolyphone(character: string): PolyphoneEntry | null {
  return COMMON_POLYPHONES[character] || null;
}

// ==========================================
// 2. HOMOPHONE (同音字) WARNING ENGINE (SRS-009)
// ==========================================

export interface ConfusableChar {
  char: string;
  pinyin: string;
  meaning: string;
  example: string;
}

export interface HomophoneEntry {
  character: string;
  pinyin: string;
  targetMeaning: string;
  warning: string;
  confusables: ConfusableChar[];
}

/**
 * High-frequency confusable homophone clusters with pedagogical distinctions.
 */
export const COMMON_HOMOPHONES: Record<string, HomophoneEntry> = {
  '在': {
    character: '在',
    pinyin: 'zài',
    targetMeaning: 'at, in, existing, ongoing progressive action (在做)',
    warning: 'Confusable with 再 (again/later). Use 在 for location or ongoing actions: 我在家 (I am at home), 我在看书 (I am reading).',
    confusables: [
      { char: '再', pinyin: 'zài', meaning: 'again, once more, future repetition', example: '再见 (goodbye), 再看一次 (look once more)' }
    ]
  },
  '再': {
    character: '再',
    pinyin: 'zài',
    targetMeaning: 'again, once more, later continuation',
    warning: 'Confusable with 在 (at/in/current). Use 再 for future repetitions: 再见 (see you again), 下次再去 (go again next time).',
    confusables: [
      { char: '在', pinyin: 'zài', meaning: 'at, in, located at, currently doing', example: '在学校 (at school), 正在吃 (currently eating)' }
    ]
  },
  '做': {
    character: '做',
    pinyin: 'zuò',
    targetMeaning: 'to make, create, produce, physically do',
    warning: 'Confusable with 作 (compose/work) and 坐 (sit). Use 做 for tangible actions: 做饭 (cook meal), 做好 (finish doing).',
    confusables: [
      { char: '作', pinyin: 'zuò', meaning: 'literary composition, work, write', example: '工作 (work), 作文 (essay), 作用 (effect)' },
      { char: '坐', pinyin: 'zuò', meaning: 'to sit, take transportation', example: '坐下 (sit down), 坐火车 (take train)' },
      { char: '座', pinyin: 'zuò', meaning: 'seat, pedestal, classifier for buildings/mountains', example: '座位 (seat), 一座山 (a mountain)' }
    ]
  },
  '作': {
    character: '作',
    pinyin: 'zuò',
    targetMeaning: 'work, compose, create abstractly',
    warning: 'Confusable with 做 (physically do) and 坐 (sit). Used in compounds like 工作, 作家, 作曲.',
    confusables: [
      { char: '做', pinyin: 'zuò', meaning: 'to do, make, manufacture', example: '做事 (do chores), 做朋友 (make friends)' },
      { char: '坐', pinyin: 'zuò', meaning: 'to sit down', example: '请坐 (please sit)' }
    ]
  },
  '坐': {
    character: '坐',
    pinyin: 'zuò',
    targetMeaning: 'to sit, travel by vehicle',
    warning: 'Confusable with 座 (seat/noun) and 做 (do). 坐 is a verb (action of sitting).',
    confusables: [
      { char: '座', pinyin: 'zuò', meaning: 'seat (noun), pedestal', example: '座位 (seat), 让座 (give up seat)' },
      { char: '做', pinyin: 'zuò', meaning: 'to make / do', example: '做事 (do tasks)' }
    ]
  },
  '座': {
    character: '座',
    pinyin: 'zuò',
    targetMeaning: 'seat (noun), monument, classifier',
    warning: 'Confusable with 坐 (verb: to sit). 座 is a noun or measure word: 你的座在哪儿？',
    confusables: [
      { char: '坐', pinyin: 'zuò', meaning: 'verb: to sit down', example: '坐车 (ride car), 坐下来 (sit down)' }
    ]
  },
  '的': {
    character: '的',
    pinyin: 'de',
    targetMeaning: 'possessive or descriptive noun modifier particle',
    warning: 'One of the Three "De"s (的, 得, 地). Use 的 before nouns: 我的电脑 (my computer), 漂亮的花 (beautiful flower).',
    confusables: [
      { char: '得', pinyin: 'de', meaning: 'verbal complement particle (Verb + 得 + Adjective)', example: '跑得快 (runs fast), 睡得好 (slept well)' },
      { char: '地', pinyin: 'de', meaning: 'adverbial marker (Adjective + 地 + Verb)', example: '慢慢地走 (walk slowly), 高兴地笑 (laughed happily)' }
    ]
  },
  '得': {
    character: '得',
    pinyin: 'de',
    targetMeaning: 'structural complement particle connecting verbs to descriptions',
    warning: 'Use 得 after verbs to describe manner: 跑得很快 (runs fast), 讲得很清楚 (explains clearly).',
    confusables: [
      { char: '的', pinyin: 'de', meaning: 'noun modifier: 我的 (mine)', example: '好吃的 (delicious food)' },
      { char: '地', pinyin: 'de', meaning: 'adverbial particle before verbs', example: '认真地听 (listen attentively)' }
    ]
  },
  '地': {
    character: '地',
    pinyin: 'de',
    targetMeaning: 'adverbial particle modifying verbs (-ly)',
    warning: 'Use 地 before verbs like English "-ly": 仔细地检查 (examine carefully), 飞快地跑 (run rapidly).',
    confusables: [
      { char: '的', pinyin: 'de', meaning: 'noun modifier', example: '红色的书 (red book)' },
      { char: '得', pinyin: 'de', meaning: 'post-verbal complement', example: '走得慢 (walk slowly)' }
    ]
  },
  '他': {
    character: '他',
    pinyin: 'tā',
    targetMeaning: 'he, him (male/general third person)',
    warning: 'Shares sound "tā" with 她 (she) and 它 (it). Distinguish by radical: 人 (person) vs 女 (female) vs 宀 (roof/thing).',
    confusables: [
      { char: '她', pinyin: 'tā', meaning: 'she, her', example: '她是老师 (she is a teacher)' },
      { char: '它', pinyin: 'tā', meaning: 'it (animal/inanimate)', example: '它是一只小猫 (it is a kitten)' }
    ]
  },
  '她': {
    character: '她',
    pinyin: 'tā',
    targetMeaning: 'she, her (female third person)',
    warning: 'Has female radical 女. Distinguish from 他 (he) and 它 (it).',
    confusables: [
      { char: '他', pinyin: 'tā', meaning: 'he, him', example: '他是医生 (he is a doctor)' },
      { char: '它', pinyin: 'tā', meaning: 'it', example: '它是新书 (it is a new book)' }
    ]
  },
  '它': {
    character: '它',
    pinyin: 'tā',
    targetMeaning: 'it, non-human entities and animals',
    warning: 'Has roof radical 宀. Used for non-human subjects.',
    confusables: [
      { char: '他', pinyin: 'tā', meaning: 'he / him', example: '他的狗 (his dog)' },
      { char: '她', pinyin: 'tā', meaning: 'she / her', example: '她的家 (her home)' }
    ]
  },
  '进': {
    character: '进',
    pinyin: 'jìn',
    targetMeaning: 'to enter, move forward, advance',
    warning: 'Confusable with 近 (near/close). 进 has movement radical 辶 (enter room: 进门).',
    confusables: [
      { char: '近', pinyin: 'jìn', meaning: 'near, close in distance or time', example: '很近 (very close), 最近 (recently)' }
    ]
  },
  '近': {
    character: '近',
    pinyin: '近',
    targetMeaning: 'near, close in distance, recent in time',
    warning: 'Confusable with 进 (enter). 近 indicates proximity: 我家很近 (my house is very close).',
    confusables: [
      { char: '进', pinyin: 'jìn', meaning: 'to enter / step inside', example: '进来 (come in), 进步 (progress)' }
    ]
  },
  '快': {
    character: '快',
    pinyin: 'kuài',
    targetMeaning: 'fast, rapid, soon, joyful',
    warning: 'Confusable with 块 (piece/chunk/currency yuan). 快 has heart radical 忄: 快乐 (happy), 快速 (fast).',
    confusables: [
      { char: '块', pinyin: 'kuài', meaning: 'piece, block, measure word for currency', example: '五块钱 (5 yuan), 一块蛋糕 (a slice of cake)' }
    ]
  },
  '块': {
    character: '块',
    pinyin: 'kuài',
    targetMeaning: 'piece, chunk, yuan/buck',
    warning: 'Has earth radical 土. Used for solid chunks or money: 一块钱, 一块手表.',
    confusables: [
      { char: '快', pinyin: 'kuài', meaning: 'fast, quick, cheerful', example: '跑得快 (run quickly), 愉快 (cheerful)' }
    ]
  },
  '带': {
    character: '带',
    pinyin: 'dài',
    targetMeaning: 'to bring, take along, belt, zone',
    warning: 'Confusable with 戴 (wear accessories). Use 带 for bringing things: 别忘了带伞 (don\'t forget to bring umbrella).',
    confusables: [
      { char: '戴', pinyin: 'dài', meaning: 'to wear on head, face, or hands', example: '戴眼镜 (wear glasses), 戴帽子 (wear hat)' }
    ]
  },
  '戴': {
    character: '戴',
    pinyin: 'dài',
    targetMeaning: 'to wear (hat, glasses, watch, scarf)',
    warning: 'Confusable with 带 (carry/bring) and 穿 (wear clothes). 戴 is specifically for accessories on the head/limbs.',
    confusables: [
      { char: '带', pinyin: 'dài', meaning: 'to bring / carry with you', example: '带手机 (bring phone)' },
      { char: '穿', pinyin: 'chuān', meaning: 'to put on clothes or shoes', example: '穿衣服 (wear clothes)' }
    ]
  },
  '完': {
    character: '完',
    pinyin: 'wán',
    targetMeaning: 'to finish, complete, end',
    warning: 'Confusable with 玩 (to play/have fun). 完 indicates completion: 看完了 (finished reading).',
    confusables: [
      { char: '玩', pinyin: 'wán', meaning: 'to play, amuse, enjoy', example: '去玩吧 (go play!), 玩具 (toy)' }
    ]
  },
  '玩': {
    character: '玩',
    pinyin: 'wán',
    targetMeaning: 'to play, fool around with, enjoy',
    warning: 'Has jade radical 王. Distinguish from 完 (finish).',
    confusables: [
      { char: '完', pinyin: 'wán', meaning: 'to complete / exhausted', example: '做完了 (finished doing)' }
    ]
  },
  '元': {
    character: '元',
    pinyin: 'yuán',
    targetMeaning: 'primary, currency unit (RMB/Yuan)',
    warning: 'Shares pronunciation "yuán" with 圆 (round), 园 (garden), 原 (original), 员 (personnel).',
    confusables: [
      { char: '圆', pinyin: 'yuán', meaning: 'round, circular', example: '圆桌 (round table), 团圆 (reunion)' },
      { char: '园', pinyin: 'yuán', meaning: 'garden, park', example: '公园 (park), 校园 (campus)' },
      { char: '原', pinyin: 'yuán', meaning: 'original, raw, meadow', example: '原因 (reason), 原来 (originally)' },
      { char: '员', pinyin: 'yuán', meaning: 'member, worker', example: '服务员 (waiter), 职员 (staff)' }
    ]
  },
  '圆': {
    character: '圆',
    pinyin: 'yuán',
    targetMeaning: 'round, circle, spherical',
    warning: 'Confusable with 元 (currency) and 园 (garden). Used for circular shape: 太阳是圆的.',
    confusables: [
      { char: '元', pinyin: 'yuán', meaning: 'currency unit yuan', example: '十元 (ten yuan)' },
      { char: '园', pinyin: 'yuán', meaning: 'garden / public park', example: '花园 (flower garden)' }
    ]
  },
  '话': {
    character: '话',
    pinyin: 'huà',
    targetMeaning: 'spoken words, dialect, story',
    warning: 'Confusable with 画 (draw/painting) and 化 (transform). 话 has speech radical 讠: 说话, 电话.',
    confusables: [
      { char: '画', pinyin: 'huà', meaning: 'to draw, paint, painting', example: '画画 (paint pictures), 一幅画 (a painting)' },
      { char: '化', pinyin: 'huà', meaning: 'to transform, melt, -ization', example: '变化 (change), 文化 (culture)' }
    ]
  },
  '画': {
    character: '画',
    pinyin: 'huà',
    targetMeaning: 'to draw, paint; painting, drawing',
    warning: 'Confusable with 话 (speech). 说话 (talk) vs 画画 (draw).',
    confusables: [
      { char: '话', pinyin: 'huà', meaning: 'speech / words', example: '讲故事 (tell stories), 普通话 (Mandarin)' }
    ]
  },
  '生': {
    character: '生',
    pinyin: 'shēng',
    targetMeaning: 'to give birth, live, student, raw',
    warning: 'Confusable with 声 (sound/voice) and 升 (rise/liter).',
    confusables: [
      { char: '声', pinyin: 'shēng', meaning: 'sound, voice, tone', example: '声音 (sound), 四声 (four tones)' },
      { char: '升', pinyin: 'shēng', meaning: 'to ascend, rise up, liter', example: '上升 (ascend), 升学 (advance to higher school)' }
    ]
  },
  '声': {
    character: '声',
    pinyin: 'shēng',
    targetMeaning: 'sound, acoustic voice, pronunciation tone',
    warning: 'Confusable with 生 (life) and 升 (ascend). Used in 声音 (voice), 大声 (loud).',
    confusables: [
      { char: '生', pinyin: 'shēng', meaning: 'living / student', example: '生活 (daily life), 学生 (student)' }
    ]
  },
  '像': {
    character: '像',
    pinyin: 'xiàng',
    targetMeaning: 'resemble, look like, statue, portrait',
    warning: 'Confusable with 向 (direction/towards) and 相 (appearance/mutual). 像 has person radical 亻.',
    confusables: [
      { char: '向', pinyin: 'xiàng', meaning: 'towards, direction', example: '向前走 (walk forward), 方向 (direction)' },
      { char: '相', pinyin: 'xiàng', meaning: 'appearance, photo', example: '相片 (photograph), 照相机 (camera)' },
      { char: '象', pinyin: 'xiàng', meaning: 'elephant, shape, symbol', example: '大象 (elephant), 现象 (phenomenon)' }
    ]
  },
  '向': {
    character: '向',
    pinyin: 'xiàng',
    targetMeaning: 'towards, facing, direction',
    warning: 'Confusable with 像 (resemble). 向 points direction: 向右转 (turn right).',
    confusables: [
      { char: '像', pinyin: 'xiàng', meaning: 'resemble / like', example: '像父亲 (looks like father)' }
    ]
  }
};

/**
 * Checks if a character has known confusable homophones.
 */
export function checkHomophone(character: string, _pinyin?: string): HomophoneEntry | null {
  if (!character) return null;
  return COMMON_HOMOPHONES[character] || null;
}
