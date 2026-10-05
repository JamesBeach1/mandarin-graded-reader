import type { LanguageIsland, IslandSentence, DailyIslandRoutine, IslandMasteryLevel } from '../types/Island';

const DB_NAME = 'MoyunIslandDB';
const DB_VERSION = 1;

const STARTER_ISLANDS: LanguageIsland[] = [
  {
    id: 'island-morning-life',
    title: 'Morning Routine & Daily Life',
    chineseTitle: '晨间习惯与日常生活',
    icon: 'Sun',
    category: 'daily',
    description: 'Sentences you speak while getting ready, making breakfast, and starting your day.',
    colorTheme: '#e67e22',
    isCustom: false,
    createdAt: Date.now() - 1000000,
    updatedAt: Date.now()
  },
  {
    id: 'island-work-meetings',
    title: 'Work, Office & Remote Life',
    chineseTitle: '职场沟通与远程工作',
    icon: 'Briefcase',
    category: 'work',
    description: 'Realistic phrases for meetings, deadlines, emails, and daily workplace interactions.',
    colorTheme: '#3498db',
    isCustom: false,
    createdAt: Date.now() - 900000,
    updatedAt: Date.now()
  },
  {
    id: 'island-dining-coffee',
    title: 'Coffee Shops & Restaurants',
    chineseTitle: '咖啡馆与餐厅点单',
    icon: 'Coffee',
    category: 'daily',
    description: 'Ordering drinks, food preferences, asking for the bill, and dietary requirements.',
    colorTheme: '#d35400',
    isCustom: false,
    createdAt: Date.now() - 800000,
    updatedAt: Date.now()
  },
  {
    id: 'island-opinions-banter',
    title: 'Opinions, Feelings & Complaints',
    chineseTitle: '观点表达与日常吐槽',
    icon: 'MessageSquare',
    category: 'opinions',
    description: 'Expressing real feelings, personal stances, venting frustrations, and candid conversation.',
    colorTheme: '#9b59b6',
    isCustom: false,
    createdAt: Date.now() - 700000,
    updatedAt: Date.now()
  },
  {
    id: 'island-transit-city',
    title: 'Transit, Getting Around & City',
    chineseTitle: '城市交通与出行问路',
    icon: 'Compass',
    category: 'travel',
    description: 'Subways, taxis, asking directions, battery emergencies, and finding your way.',
    colorTheme: '#27ae60',
    isCustom: false,
    createdAt: Date.now() - 600000,
    updatedAt: Date.now()
  }
];

const STARTER_SENTENCES: IslandSentence[] = [
  // Morning Life
  {
    id: 'sent-morn-1',
    islandId: 'island-morning-life',
    english: "I'm going to have eggs and black coffee this morning.",
    chinese: "我今天早上打算吃鸡蛋和黑咖啡。",
    pinyin: "Wǒ jīntiān zǎoshang dǎsuàn chī jīdàn hé hēi kāfēi.",
    notes: "打算 (dǎsuàn) = intend/plan to; 黑咖啡 = black coffee",
    hskLevel: 2,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 500000
  },
  {
    id: 'sent-morn-2',
    islandId: 'island-morning-life',
    english: "I didn't sleep well last night, so I feel a bit tired today.",
    chinese: "我昨晚没睡好，所以今天感觉有点累。",
    pinyin: "Wǒ zuówǎn méi shuì hǎo, suǒyǐ jīntiān gǎnjué yǒudiǎn lèi.",
    notes: "没睡好 = didn't sleep well (result complement); 有点累 = a bit tired",
    hskLevel: 2,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 490000
  },
  {
    id: 'sent-morn-3',
    islandId: 'island-morning-life',
    english: "I need to leave the house in ten minutes or I'll be late.",
    chinese: "我必须十分钟后出门，否则就要迟到了。",
    pinyin: "Wǒ bìxū shí fēnzhōng hòu chūmén, fǒuzé jiù yào chídào le.",
    notes: "出门 = leave home/go out; 否则 (fǒuzé) = otherwise; 迟到 = be late",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 480000
  },
  {
    id: 'sent-morn-4',
    islandId: 'island-morning-life',
    english: "Where did I put my keys and phone? I can't find them.",
    chinese: "我把钥匙和手机放哪儿了？我找不到了。",
    pinyin: "Wǒ bǎ yàoshi hé shǒujī fàng nǎr le? Wǒ zhǎobudào le.",
    notes: "把 structure for location; 找不到 = potential complement (cannot find)",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 470000
  },
  {
    id: 'sent-morn-5',
    islandId: 'island-morning-life',
    english: "The weather looks pretty gloomy today, I should bring an umbrella.",
    chinese: "今天天气看起来很阴，我最好带一把伞。",
    pinyin: "Jīntiān tiānqì kàn qǐlái hěn yīn, wǒ zuìhǎo dài yī bǎ sǎn.",
    notes: "看起来 (kàn qǐlái) = looks like; 阴 = overcast; 最好 = had better",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 460000
  },

  // Work & Meetings
  {
    id: 'sent-work-1',
    islandId: 'island-work-meetings',
    english: "This meeting really could have been an email.",
    chinese: "这个会其实完全可以发邮件解决的。",
    pinyin: "Zhège huì qíshí wánquán kěyǐ fā yóujiàn jiějué de.",
    notes: "完全可以 (wánquán kěyǐ) = completely could; 发邮件解决 = resolve via email",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 450000
  },
  {
    id: 'sent-work-2',
    islandId: 'island-work-meetings',
    english: "Let me check my calendar and get back to you later this afternoon.",
    chinese: "我看一下日程，今天下午晚点回复你。",
    pinyin: "Wǒ kàn yíxià rìchéng, jīntiān xiàwǔ wǎndiǎn huífù nǐ.",
    notes: "日程 (rìchéng) = schedule/calendar; 晚点 = a bit later; 回复 = reply",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 440000
  },
  {
    id: 'sent-work-3',
    islandId: 'island-work-meetings',
    english: "Could you send me the latest document when you have a minute?",
    chinese: "你有空的时候能不能把最新的文件发给我？",
    pinyin: "Nǐ yǒu kòng de shíhou néng bu néng bǎ zuìxīn de wénjiàn fā gěi wǒ?",
    notes: "有空的时候 = when free; 能不能 = affirmative-negative question",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 430000
  },
  {
    id: 'sent-work-4',
    islandId: 'island-work-meetings',
    english: "I have to finish this presentation before five o'clock today.",
    chinese: "我今天下午五点之前必须把这份简报做完。",
    pinyin: "Wǒ jīntiān xiàwǔ wǔ diǎn zhīqián bìxū bǎ zhè fèn jiǎnbào zuò wán.",
    notes: "之前 = before; 把...做完 = finish doing (result complement)",
    hskLevel: 4,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 420000
  },
  {
    id: 'sent-work-5',
    islandId: 'island-work-meetings',
    english: "Sorry, I was on mute just now. What did you ask?",
    chinese: "抱歉，我刚才静音了。你刚才问了什么？",
    pinyin: "Bàoqiàn, wǒ gāngcái jìngyīn le. Nǐ gāngcái wèn le shénme?",
    notes: "静音 (jìngyīn) = mute; 刚才 = just now",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 410000
  },

  // Coffee & Dining
  {
    id: 'sent-dine-1',
    islandId: 'island-dining-coffee',
    english: "Can I get an iced Americano with no sugar and oat milk?",
    chinese: "你好，请给我一杯冰美式，不加糖，换燕麦奶。",
    pinyin: "Nǐ hǎo, qǐng gěi wǒ yī bēi bīng měishì, bù jiā táng, huàn yànmài nǎi.",
    notes: "冰美式 = Iced Americano; 燕麦奶 = Oat milk",
    hskLevel: 2,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 400000
  },
  {
    id: 'sent-dine-2',
    islandId: 'island-dining-coffee',
    english: "Is this dish very spicy? Can you make it mild spicy for us?",
    chinese: "请问这个菜很辣吗？可以帮我们做微辣吗？",
    pinyin: "Qǐngwèn zhège cài hěn là ma? Kěyǐ bāng wǒmen zuò wēilà ma?",
    notes: "微辣 (wēilà) = mild spicy; 中辣 = medium; 特辣 = extra spicy",
    hskLevel: 2,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 390000
  },
  {
    id: 'sent-dine-3',
    islandId: 'island-dining-coffee',
    english: "Could we have the bill, please? We would like to pay separately.",
    chinese: "买单，谢谢！我们想分开付。",
    pinyin: "Mǎidān, xièxie! Wǒmen xiǎng fēnkāi fù.",
    notes: "买单 = check/bill; 分开付 = pay separately (split the bill)",
    hskLevel: 2,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 380000
  },
  {
    id: 'sent-dine-4',
    islandId: 'island-dining-coffee',
    english: "What do you recommend here? What is your house specialty?",
    chinese: "你们这里有什么推荐的吗？有什么招牌菜？",
    pinyin: "Nǐmen zhèlǐ yǒu shénme tuījiàn de ma? Yǒu shénme zhāopái cài?",
    notes: "推荐 (tuījiàn) = recommend; 招牌菜 (zhāopái cài) = signature dish",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 370000
  },

  // Opinions & Venting
  {
    id: 'sent-opin-1',
    islandId: 'island-opinions-banter',
    english: "To be completely honest, I don't agree with their proposal at all.",
    chinese: "说实话，我完全不同意他们的方案。",
    pinyin: "Shuō shíhuà, wǒ wánquán bù tóngyì tāmen de fāng'àn.",
    notes: "说实话 (shuō shíhuà) = to tell the truth / honestly; 方案 = plan/proposal",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 360000
  },
  {
    id: 'sent-opin-2',
    islandId: 'island-opinions-banter',
    english: "It's way too noisy and crowded here, let's find a quieter spot.",
    chinese: "这里实在太吵太挤了，我们找个安静点的地方吧。",
    pinyin: "Zhèlǐ shízài tài chǎo tài jǐ le, wǒmen zhǎo ge ānjìng diǎn de dìfang ba.",
    notes: "实在太...了 = really too...; 挤 (jǐ) = crowded; 安静点 = a bit quieter",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 350000
  },
  {
    id: 'sent-opin-3',
    islandId: 'island-opinions-banter',
    english: "I have been feeling really overwhelmed with work lately.",
    chinese: "我最近工作压力实在太大了，感觉有点吃不消。",
    pinyin: "Wǒ zuìjìn gōngzuò yālì shízài tài dà le, gǎnjué yǒudiǎn chībuxiāo.",
    notes: "吃不消 (chībuxiāo) = can't handle it / overwhelmed (authentic colloquial)",
    hskLevel: 4,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 340000
  },

  // Transit & City
  {
    id: 'sent-tran-1',
    islandId: 'island-transit-city',
    english: "Excuse me, which subway line do I need to take to get to the airport?",
    chinese: "请问去机场需要换乘几号线地铁？",
    pinyin: "Qǐngwèn qù jīchǎng xūyào huànchéng jǐ hào xiàn dìtiě?",
    notes: "换乘 (huànchéng) = transfer lines; 几号线 = which line number",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 330000
  },
  {
    id: 'sent-tran-2',
    islandId: 'island-transit-city',
    english: "My phone battery is almost dead, do you have a portable power bank?",
    chinese: "我手机快没电了，你带充电宝了吗？",
    pinyin: "Wǒ shǒujī kuài méi diàn le, nǐ dài chōngdiànbǎo le ma?",
    notes: "快没电了 = about to run out of battery; 充电宝 = portable power bank",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 320000
  },
  {
    id: 'sent-tran-3',
    islandId: 'island-transit-city',
    english: "Please pull over and drop me off near the convenience store ahead.",
    chinese: "麻烦在前面便利店附近靠边停一下，谢谢师傅。",
    pinyin: "Máfan zài qiánmian biànlìdiàn fùjìn kàobiān tíng yíxià, xièxie shīfu.",
    notes: "靠边停 (kàobiān tíng) = pull over to the side; 师傅 = driver/master",
    hskLevel: 3,
    masteryLevel: 0,
    timesReviewed: 0,
    struggleCount: 0,
    createdAt: Date.now() - 310000
  }
];

class IslandStoreService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isFallbackMode = false;

  private async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      this.isFallbackMode = true;
      throw new Error('IndexedDB not supported, using fallback');
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('islands')) {
          db.createObjectStore('islands', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sentences')) {
          const sentStore = db.createObjectStore('sentences', { keyPath: 'id' });
          sentStore.createIndex('islandId', 'islandId', { unique: false });
          sentStore.createIndex('masteryLevel', 'masteryLevel', { unique: false });
        }
        if (!db.objectStoreNames.contains('routines')) {
          db.createObjectStore('routines', { keyPath: 'date' });
        }
        if (!db.objectStoreNames.contains('audioRecordings')) {
          db.createObjectStore('audioRecordings', { keyPath: 'sentenceId' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        this.isFallbackMode = true;
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  // Fallback helpers
  private getLocalIslands(): LanguageIsland[] {
    try {
      const data = localStorage.getItem('moyun_islands_data');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalIslands(islands: LanguageIsland[]) {
    try {
      localStorage.setItem('moyun_islands_data', JSON.stringify(islands));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private getLocalSentences(): IslandSentence[] {
    try {
      const data = localStorage.getItem('moyun_island_sentences_data');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalSentences(sentences: IslandSentence[]) {
    try {
      localStorage.setItem('moyun_island_sentences_data', JSON.stringify(sentences));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // --- INITIALIZATION ---
  public async initialize(): Promise<void> {
    try {
      const islands = await this.getAllIslands();
      if (islands.length === 0) {
        // Pre-populate starter islands & sentences
        for (const island of STARTER_ISLANDS) {
          await this.saveIsland(island);
        }
        for (const sent of STARTER_SENTENCES) {
          await this.saveSentence(sent);
        }
      }
    } catch (err) {
      console.warn('Island store initialization error:', err);
    }
  }

  // --- ISLAND OPERATIONS ---
  public async getAllIslands(): Promise<LanguageIsland[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('islands', 'readonly');
        const store = tx.objectStore('islands');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      let local = this.getLocalIslands();
      if (local.length === 0) {
        local = STARTER_ISLANDS;
        this.saveLocalIslands(local);
      }
      return local;
    }
  }

  public async saveIsland(island: LanguageIsland): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('islands', 'readwrite');
        const store = tx.objectStore('islands');
        const req = store.put(island);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const islands = this.getLocalIslands();
      const idx = islands.findIndex(i => i.id === island.id);
      if (idx >= 0) islands[idx] = island;
      else islands.push(island);
      this.saveLocalIslands(islands);
    }
  }

  public async deleteIsland(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      // Delete island and associated sentences
      const tx = db.transaction(['islands', 'sentences'], 'readwrite');
      tx.objectStore('islands').delete(id);
      
      const sentStore = tx.objectStore('sentences');
      const index = sentStore.index('islandId');
      const req = index.getAllKeys(id);
      req.onsuccess = () => {
        const keys = req.result;
        for (const k of keys) {
          sentStore.delete(k);
        }
      };
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      let islands = this.getLocalIslands().filter(i => i.id !== id);
      this.saveLocalIslands(islands);
      let sents = this.getLocalSentences().filter(s => s.islandId !== id);
      this.saveLocalSentences(sents);
    }
  }

  // --- SENTENCE OPERATIONS ---
  public async getSentencesByIsland(islandId: string): Promise<IslandSentence[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sentences', 'readonly');
        const store = tx.objectStore('sentences');
        const index = store.index('islandId');
        const req = index.getAll(islandId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      let sents = this.getLocalSentences();
      if (sents.length === 0) {
        sents = STARTER_SENTENCES;
        this.saveLocalSentences(sents);
      }
      return sents.filter(s => s.islandId === islandId);
    }
  }

  public async getAllSentences(): Promise<IslandSentence[]> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sentences', 'readonly');
        const store = tx.objectStore('sentences');
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch {
      let sents = this.getLocalSentences();
      if (sents.length === 0) {
        sents = STARTER_SENTENCES;
        this.saveLocalSentences(sents);
      }
      return sents;
    }
  }

  public async saveSentence(sentence: IslandSentence): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('sentences', 'readwrite');
        const store = tx.objectStore('sentences');
        const req = store.put(sentence);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const sents = this.getLocalSentences();
      const idx = sents.findIndex(s => s.id === sentence.id);
      if (idx >= 0) sents[idx] = sentence;
      else sents.push(sentence);
      this.saveLocalSentences(sents);
    }
  }

  public async batchAddSentences(sentences: IslandSentence[]): Promise<void> {
    for (const sent of sentences) {
      await this.saveSentence(sent);
    }
  }

  public async deleteSentence(id: string): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(['sentences', 'audioRecordings'], 'readwrite');
        tx.objectStore('sentences').delete(id);
        tx.objectStore('audioRecordings').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      const sents = this.getLocalSentences().filter(s => s.id !== id);
      this.saveLocalSentences(sents);
    }
  }

  // --- ACTIVE RECALL & FRICTION METRICS ---
  /**
   * Record outcome of active recall drill:
   * - 'missed': struggle/blanked -> mastery decreases or resets to 1, struggleCount + 1
   * - 'hesitated': friction/partial -> stays at familiar (1 or 2), timesReviewed + 1
   * - 'fluent': instant automatic production -> mastery increases towards 4
   */
  public async recordRecallAttempt(
    sentenceId: string,
    outcome: 'missed' | 'hesitated' | 'fluent'
  ): Promise<IslandSentence | null> {
    const all = await this.getAllSentences();
    const target = all.find(s => s.id === sentenceId);
    if (!target) return null;

    target.timesReviewed = (target.timesReviewed || 0) + 1;
    target.lastReviewedAt = Date.now();

    if (outcome === 'missed') {
      target.struggleCount = (target.struggleCount || 0) + 1;
      target.masteryLevel = 1;
    } else if (outcome === 'hesitated') {
      target.masteryLevel = Math.max(1, Math.min(2, target.masteryLevel)) as IslandMasteryLevel;
    } else if (outcome === 'fluent') {
      target.masteryLevel = Math.min(4, target.masteryLevel + 1) as IslandMasteryLevel;
    }

    await this.saveSentence(target);
    await this.logDailyActivity('recall', 1, 1);
    return target;
  }

  // --- AUDIO RECORDINGS (SHADOWING COMPARISON) ---
  public async saveShadowingAudio(sentenceId: string, audioBlob: Blob): Promise<void> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('audioRecordings', 'readwrite');
        const store = tx.objectStore('audioRecordings');
        const req = store.put({ sentenceId, blob: audioBlob, updatedAt: Date.now() });
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // In localStorage mode, storing large audio blobs is not supported
    }
  }

  public async getShadowingAudio(sentenceId: string): Promise<Blob | null> {
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('audioRecordings', 'readonly');
        const store = tx.objectStore('audioRecordings');
        const req = store.get(sentenceId);
        req.onsuccess = () => resolve(req.result ? req.result.blob : null);
        req.onerror = () => reject(req.error);
      });
    } catch {
      return null;
    }
  }

  // --- DAILY ROUTINE TRACKER ---
  public async getDailyRoutine(dateString?: string): Promise<DailyIslandRoutine> {
    const today = dateString || new Date().toISOString().slice(0, 10);
    try {
      const db = await this.getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction('routines', 'readonly');
        const store = tx.objectStore('routines');
        const req = store.get(today);
        req.onsuccess = () => {
          resolve(req.result || {
            date: today,
            floodingMinutes: 0,
            shadowingMinutes: 0,
            recallMinutes: 0,
            recallSentencesCount: 0
          });
        };
        req.onerror = () => reject(req.error);
      });
    } catch {
      const key = `moyun_island_routine_${today}`;
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {
        date: today,
        floodingMinutes: 0,
        shadowingMinutes: 0,
        recallMinutes: 0,
        recallSentencesCount: 0
      };
    }
  }

  public async logDailyActivity(
    type: 'flooding' | 'shadowing' | 'recall',
    minutes: number,
    sentencesCount: number = 0
  ): Promise<DailyIslandRoutine> {
    const today = new Date().toISOString().slice(0, 10);
    const routine = await this.getDailyRoutine(today);

    if (type === 'flooding') routine.floodingMinutes += minutes;
    if (type === 'shadowing') routine.shadowingMinutes += minutes;
    if (type === 'recall') {
      routine.recallMinutes += minutes;
      routine.recallSentencesCount += sentencesCount;
    }

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction('routines', 'readwrite');
        const store = tx.objectStore('routines');
        const req = store.put(routine);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const key = `moyun_island_routine_${today}`;
      localStorage.setItem(key, JSON.stringify(routine));
    }

    return routine;
  }
}

export const IslandStore = new IslandStoreService();
