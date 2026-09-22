/**
 * IndexedDB Course Store for the Adaptive Odyssey Engine
 * Database: MandarinGradedReaderCourses
 * Store: courses
 * Provides full course campaign persistence, node unlocking, mastery tracking, and default seed campaigns.
 */

import type { Course, Chapter, CourseNode } from '../types/Course';
import { SyllabusGenerator } from './syllabusGenerator';

const DB_NAME = 'MandarinGradedReaderCourses';
const DB_VERSION = 1;
const STORE_NAME = 'courses';
const ACTIVE_COURSE_KEY = 'moyun_active_course_id';

function openCourseDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this environment.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const db = await openCourseDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        let courses = (req.result as Course[]) || [];
        const defaultIndex = courses.findIndex(c => c.id === 'campaign-taipei-expedition');
        // If empty, seed with the full DAG campaign
        if (courses.length === 0) {
          const seed = createDefaultTaipeiCampaign();
          saveCourse(seed).then(() => resolve([seed])).catch(() => resolve([seed]));
          return;
        }
        if (defaultIndex !== -1 && (courses[defaultIndex]?.chapters[0]?.nodes?.length || 0) < 6) {
          const seed = createDefaultTaipeiCampaign();
          courses[defaultIndex] = seed;
          saveCourse(seed).catch(() => {});
        }

        // Auto-normalize and expand any course where any chapter has < 4 nodes
        courses = courses.map(course => {
          const hasSparseChapter = course.chapters.some(ch => (ch.nodes?.length || 0) < 4);
          if (hasSparseChapter) {
            const normalized = SyllabusGenerator.normalizeCourseDAG(course);
            saveCourse(normalized).catch(() => {});
            return normalized;
          }
          return SyllabusGenerator.normalizeCourseDAG(course);
        });

        resolve(courses);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [createDefaultTaipeiCampaign()];
  }
}

export async function getCourse(id: string): Promise<Course | null> {
  try {
    const db = await openCourseDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        let result = (req.result as Course) || null;
        if (result) {
          if (result.id === 'campaign-taipei-expedition' && (result.chapters[0]?.nodes?.length || 0) < 6) {
            result = createDefaultTaipeiCampaign();
            saveCourse(result).catch(() => {});
          } else if (result.chapters.some(ch => (ch.nodes?.length || 0) < 4)) {
            result = SyllabusGenerator.normalizeCourseDAG(result);
            saveCourse(result).catch(() => {});
          }
        }
        resolve(result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveCourse(course: Course): Promise<void> {
  const db = await openCourseDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    course.updatedAt = Date.now();
    const req = store.put(course);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCourse(id: string): Promise<void> {
  const db = await openCourseDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

export function getActiveCourseId(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(ACTIVE_COURSE_KEY);
}

export function setActiveCourseId(id: string) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(ACTIVE_COURSE_KEY, id);
  }
}

/**
 * Updates a node's completion status, unlocks DAG branching nodes in the campaign path,
 * updates global mastery confidence scores, and records identified weaknesses.
 */
export async function updateNodeProgress(
  courseId: string,
  nodeId: string,
  score: number,
  stars: number,
  masteryUpdates: Record<string, number>,
  newWeaknesses: string[] = []
): Promise<Course> {
  const course = await getCourse(courseId) || createDefaultTaipeiCampaign();
  
  // 1. Update mastery confidence scores
  for (const [key, val] of Object.entries(masteryUpdates)) {
    const current = course.globalMasteryStats[key] || 50;
    course.globalMasteryStats[key] = Math.min(100, Math.max(0, Math.round(current * 0.4 + val * 0.6)));
  }

  // 2. Accumulate weaknesses
  for (const w of newWeaknesses) {
    if (!course.weaknesses.includes(w)) {
      course.weaknesses.push(w);
    }
  }

  // 3. Award XP & calculate rank
  const earnedXp = Math.round(score * 10 * (stars || 1));
  course.totalXp = (course.totalXp || 0) + earnedXp;

  if (course.totalXp > 3000) course.currentRank = 'Grandmaster Scholar (宗师)';
  else if (course.totalXp > 1500) course.currentRank = 'Imperial Scribe (翰林)';
  else if (course.totalXp > 600) course.currentRank = 'Disciple of Moyun (生员)';
  else course.currentRank = 'Initiate Apprentice (学童)';

  // 4. Update node status and unlock DAG destination nodes
  let targetNodeFound = false;

  for (let cIdx = 0; cIdx < course.chapters.length; cIdx++) {
    const chapter = course.chapters[cIdx];
    for (let nIdx = 0; nIdx < chapter.nodes.length; nIdx++) {
      const node = chapter.nodes[nIdx];
      if (node.id === nodeId) {
        node.status = 'completed';
        node.score = Math.max(node.score || 0, score);
        node.stars = Math.max(node.stars || 0, stars);
        targetNodeFound = true;

        // Unlock all DAG destination nodes in connectedTo
        if (node.connectedTo && node.connectedTo.length > 0) {
          for (const targetId of node.connectedTo) {
            for (const ch of course.chapters) {
              const targetNode = ch.nodes.find(n => n.id === targetId);
              if (targetNode && targetNode.status === 'locked') {
                targetNode.status = 'active';
              }
            }
          }
        } else if (nIdx + 1 < chapter.nodes.length) {
          // Fallback sequential unlock
          const nextNode = chapter.nodes[nIdx + 1];
          if (nextNode.status === 'locked') {
            nextNode.status = 'active';
          }
        }

        // If this was a chapter boss battle, unlock the subsequent chapter!
        if (node.type === 'boss_capstone' && cIdx + 1 < course.chapters.length) {
          const nextChapter = course.chapters[cIdx + 1];
          nextChapter.isUnlocked = true;
          if (nextChapter.nodes.length > 0 && nextChapter.nodes[0].status === 'locked') {
            nextChapter.nodes[0].status = 'active';
          }
        }
        break;
      }
    }
    if (targetNodeFound) break;
  }

  await saveCourse(course);
  return course;
}

/**
 * Creates the flagship default 3-chapter, 10-node "Taipei Night Market & Transit Expedition"
 * Features mountains, city, and forest biomes with boss battles, ambushes, and 10-stage exercises.
 */
export function createDefaultTaipeiCampaign(): Course {
  return {
    id: 'campaign-taipei-expedition',
    title: 'Taipei Night Market & Transit Expedition',
    targetGoal: 'Master navigation, dining, asking directions, and transactions for travel across Taiwan',
    level: 'HSK 2 - 3',
    globalMasteryStats: {
      '捷运': 70,
      '买': 85,
      '卖': 50,
      '多少钱': 90,
      '牛肉面': 80
    },
    weaknesses: ['Minimal pair: mǎi vs mài', '4th tone sandhi'],
    totalXp: 450,
    currentRank: 'Disciple of Moyun (生员)',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    chapters: [
      {
        id: 'ch-1',
        title: 'Chapter 1: Airport Arrival & Metro Transit',
        description: 'Navigate Taoyuan International Airport, buy an EasyCard, and board the Taipei MRT.',
        themeBiome: 'city',
        isUnlocked: true,
        nodes: [
          {
            id: 'node-1-1',
            chapterId: 'ch-1',
            title: 'Airport Customs & Arrival',
            description: 'Clear immigration and exchange currency at the terminal.',
            type: 'learning',
            branchType: 'main',
            status: 'active',
            mapCoordinates: { x: 50, y: 7 },
            connectedTo: ['node-1-2', 'node-1-b1'],
            hskLevel: '2',
            targetVocabulary: ['机场', '护照', '换钱'],
            exercises: [
              {
                id: 'ex-1-1-1',
                type: 'vocab_intro',
                title: 'Arrival Vocabulary',
                instructions: 'Listen and familiarize yourself with airport customs vocabulary.',
                payload: {
                  words: [
                    { character: '机场', pinyin: 'jī chǎng', definition: 'airport', exampleSentence: '我在桃园机场等你。', exampleTranslation: 'I will wait for you at Taoyuan Airport.' },
                    { character: '护照', pinyin: 'hù zhào', definition: 'passport', exampleSentence: '请出示您的护照。', exampleTranslation: 'Please show your passport.' },
                    { character: '换钱', pinyin: 'huàn qián', definition: 'to exchange money', exampleSentence: '哪里可以换钱？', exampleTranslation: 'Where can I exchange money?' }
                  ]
                }
              },
              {
                id: 'ex-1-1-2',
                type: 'blind_dictation',
                title: 'Blind Dictation (听写)',
                instructions: 'Listen to the audio without text and type what you hear in Pinyin or Hanzi.',
                payload: {
                  audioText: '请出示护照',
                  pinyin: 'qǐng chū shì hù zhào',
                  englishTranslation: 'Please show your passport',
                  acceptedAnswers: ['请出示护照', '护照', 'huzhao', 'hùzhào', 'qing chu shi hu zhao']
                }
              }
            ]
          },
          {
            id: 'node-1-b1',
            chapterId: 'ch-1',
            title: 'Side Branch: Currency & ATM Slang',
            description: 'Optional bonus side quest: master Taiwanese currency slang and ATM operations.',
            type: 'learning',
            branchType: 'side_quest',
            status: 'active',
            mapCoordinates: { x: 78, y: 20 },
            connectedTo: ['node-1-3'],
            hskLevel: '2',
            targetVocabulary: ['台币', '现金', '取款机'],
            exercises: [
              {
                id: 'ex-1-b1-1',
                type: 'vocab_intro',
                title: 'Currency Expressions',
                instructions: 'Learn how locals refer to cash, ATMs, and currency.',
                payload: {
                  words: [
                    { character: '台币', pinyin: 'tái bì', definition: 'New Taiwan Dollar (NTD)', exampleSentence: '请给我台币。', exampleTranslation: 'Please give me NTD.' },
                    { character: '现金', pinyin: 'xiàn jīn', definition: 'cash', exampleSentence: '只收现金吗？', exampleTranslation: 'Cash only?' },
                    { character: '取款机', pinyin: 'qǔ kuǎn jī', definition: 'ATM cash machine', exampleSentence: '附近有取款机吗？', exampleTranslation: 'Is there an ATM nearby?' }
                  ]
                }
              },
              {
                id: 'ex-1-b1-2',
                type: 'multiple_choice',
                title: 'Currency Nuance Quiz',
                instructions: 'What do Taiwanese locals informally call NTD coins and notes?',
                payload: {
                  question: '“请给我台币现金”是什么意思？',
                  options: ['Please give me Taiwan Dollar cash', 'Can I pay with credit card?', 'Where is the ATM?', 'I need to exchange USD'],
                  correctAnswer: 'Please give me Taiwan Dollar cash',
                  explanation: '台币 (táibì = NTD) + 现金 (xiànjīn = cash).'
                }
              }
            ]
          },
          {
            id: 'node-1-2',
            chapterId: 'ch-1',
            title: 'Terminal Signs & MRT Gates',
            description: 'Follow signs to find the Airport MRT station and baggage claim.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 28, y: 23 },
            connectedTo: ['node-1-3'],
            hskLevel: '2',
            targetVocabulary: ['行李', '出口', '捷运'],
            exercises: [
              {
                id: 'ex-1-2-1',
                type: 'vocab_intro',
                title: 'Signage Vocabulary',
                instructions: 'Identify key transit and terminal markers.',
                payload: {
                  words: [
                    { character: '行李', pinyin: 'xíng li', definition: 'luggage / baggage', exampleSentence: '请去一号转盘取行李。', exampleTranslation: 'Please claim baggage at carousel 1.' },
                    { character: '出口', pinyin: 'chū kǒu', definition: 'exit', exampleSentence: '捷运站在哪个出口？', exampleTranslation: 'Which exit is the MRT station at?' }
                  ]
                }
              },
              {
                id: 'ex-1-2-2',
                type: 'minimal_pair_triage',
                title: 'Acoustic Tone Triage',
                instructions: 'Quickly distinguish between similar sounding tones under the countdown timer.',
                payload: {
                  promptAudioText: '机场',
                  contrastCategory: 'tone',
                  explanation: '机场 (jīchǎng - airport) starts with 1st tone (high flat), not 2nd tone.',
                  timeLimitSeconds: 8,
                  options: [
                    { text: '机场 (jī chǎng)', pinyin: 'jī chǎng', meaning: 'Airport', isCorrect: true },
                    { text: '集长 (jí cháng)', pinyin: 'jí cháng', meaning: 'Market chief', isCorrect: false }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-1-3',
            chapterId: 'ch-1',
            title: 'Buying the EasyCard (悠游卡)',
            description: 'Top up the transit card and navigate the station ticket gates.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 50, y: 39 },
            connectedTo: ['node-1-4', 'node-1-b2'],
            hskLevel: '2',
            targetVocabulary: ['捷运', '悠游卡', '一张'],
            exercises: [
              {
                id: 'ex-1-3-1',
                type: 'vocab_intro',
                title: 'Transit Card Essentials',
                instructions: 'Learn how to ask for the metro transit card.',
                payload: {
                  words: [
                    { character: '捷运', pinyin: 'jié yùn', definition: 'rapid transit / MRT', exampleSentence: '台北的捷运非常方便。', exampleTranslation: 'Taipei MRT is very convenient.' },
                    { character: '悠游卡', pinyin: 'yōu yóu kǎ', definition: 'EasyCard (Taiwan transit pass)', exampleSentence: '我想买一张悠游卡。', exampleTranslation: 'I would like to buy an EasyCard.' }
                  ]
                }
              },
              {
                id: 'ex-1-3-2',
                type: 'pitch_shadowing',
                title: 'Acoustic Pitch Shadowing',
                instructions: 'Listen to the native reference audio, then speak and match the pitch contour.',
                payload: {
                  sentence: '请问去捷运站怎么走？',
                  pinyin: 'qǐng wèn qù jié yùn zhàn zěn me zǒu?',
                  translation: 'Excuse me, how do I get to the MRT station?'
                }
              }
            ]
          },
          {
            id: 'node-1-b2',
            chapterId: 'ch-1',
            title: 'Side Branch: Tonal Reflex mǎi vs mài',
            description: 'Bonus challenge: master the high-stakes tone distinction between Buy and Sell.',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 22, y: 55 },
            connectedTo: ['node-1-5'],
            hskLevel: '2',
            targetVocabulary: ['买', '卖'],
            exercises: [
              {
                id: 'ex-1-b2-1',
                type: 'minimal_pair_triage',
                title: 'Acoustic Triage: Buy vs Sell',
                instructions: 'Did the speaker say Buy (3rd tone) or Sell (4th tone)?',
                payload: {
                  promptAudioText: '买',
                  contrastCategory: 'tone',
                  explanation: '买 (mǎi) is 3rd dipping tone (to buy). 卖 (mài) is 4th sharp falling tone (to sell).',
                  timeLimitSeconds: 7,
                  options: [
                    { text: '买 (mǎi)', pinyin: 'mǎi', meaning: 'To Buy (Low Dipping)', isCorrect: true },
                    { text: '卖 (mài)', pinyin: 'mài', meaning: 'To Sell (Sharp Falling)', isCorrect: false }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-1-4',
            chapterId: 'ch-1',
            title: 'Card Reload & Balance (充值)',
            description: 'Top up credit onto the transit card at the ticket machine.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 74, y: 57 },
            connectedTo: ['node-1-5'],
            hskLevel: '2',
            targetVocabulary: ['充值', '五百元', '帮忙'],
            exercises: [
              {
                id: 'ex-1-4-1',
                type: 'sentence_builder_distractors',
                title: 'Sentence Assembly with Distractors',
                instructions: 'Build the target sentence. Watch out for grammatical and character distractors!',
                payload: {
                  targetSentence: '请帮我的悠游卡充值五百元',
                  pinyin: 'qǐng bāng wǒ de yōu yóu kǎ chōng zhí wǔ bǎi yuán',
                  englishTranslation: 'Please help top up my EasyCard by 500 dollars',
                  validChips: ['请帮', '我的', '悠游卡', '充值', '五百元'],
                  distractorChips: ['己的', '成了', '卖'],
                  explanation: 'Use 帮 (help) + object + verb. Beware of 己 vs 已 distractors!'
                }
              }
            ]
          },
          {
            id: 'node-1-5',
            chapterId: 'ch-1',
            title: 'Ambush: Transit Retention Check',
            description: 'Surprise checkpoint! Rapid spaced review of airport and transit terms.',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 50, y: 73 },
            connectedTo: ['node-1-6'],
            hskLevel: '2',
            targetVocabulary: ['捷运', '换钱', '护照'],
            exercises: [
              {
                id: 'ex-1-5-1',
                type: 'srs_ambush',
                title: 'Checkpoint Ambush: Transit Mastery',
                instructions: 'Review these prioritized cards from Chapter 1 before the Boss Battle.',
                payload: {
                  ambushTitle: 'Transit Retention Check',
                  reason: 'Reinforce these words before attempting the Chapter 1 Capstone Boss.',
                  cards: [
                    { character: '捷运', pinyin: 'jié yùn', definition: 'MRT / subway system', hskLevel: '2' },
                    { character: '换钱', pinyin: 'huàn qián', definition: 'to exchange currency', hskLevel: '2' },
                    { character: '护照', pinyin: 'hù zhào', definition: 'passport', hskLevel: '2' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-1-6',
            chapterId: 'ch-1',
            title: 'Boss Battle: Taoyuan Station Breakout',
            description: 'Capstone challenge! Prove mastery of airport and transit survival before entering the city.',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 90 },
            hskLevel: '2',
            targetVocabulary: ['捷运', '机场', '护照', '悠游卡'],
            exercises: [
              {
                id: 'ex-1-6-1',
                type: 'speed_reading_sprint',
                title: 'Paced Transit Sprint',
                instructions: 'Read the airport departure announcement before time runs out, then answer the question.',
                payload: {
                  passage: '欢迎来到桃园机场！旅客搭乘捷运前往台北车站，请在地下二楼搭乘紫色直达车，全程大约三十五分钟。请准备好您的悠游卡。',
                  timeLimitSeconds: 16,
                  targetCPM: 150,
                  question: '直达车去台北车站需要多长时间？',
                  options: ['大约十五分钟', '大约三十五分钟', '大约一个小时', '大约两个小时'],
                  correctAnswer: '大约三十五分钟',
                  explanation: 'Passage mentions: 全程大约三十五分钟 (The entire journey takes about 35 minutes).'
                }
              },
              {
                id: 'ex-1-6-2',
                type: 'roleplay_dialogue',
                title: 'Interactive Ticket Window Roleplay',
                instructions: 'Converse with the station attendant. You must buy an EasyCard and top it up.',
                payload: {
                  scenarioTitle: 'MRT Station Counter',
                  contextDescription: 'You are at the Taipei Main Station customer service window.',
                  requiredKeywords: ['悠游卡', '充值'],
                  initialPrompt: '您好！请问需要买票还是办卡？',
                  initialPromptPinyin: 'Nín hǎo! Qǐng wèn xū yào mǎi piào hái shì bàn kǎ?',
                  initialPromptTranslation: 'Hello! Would you like to buy a ticket or get a card?',
                  sampleReplies: ['我想买一张悠游卡，再充值五百元。', '请给我一张悠游卡。']
                }
              }
            ]
          }
        ]
      },
      {
        id: 'ch-2',
        title: 'Chapter 2: Shilin Night Market Food Hunt',
        description: 'Explore the bustling street food alleys, decipher menus, order specialties, and negotiate prices.',
        themeBiome: 'forest',
        isUnlocked: false,
        nodes: [
          {
            id: 'node-2-1',
            chapterId: 'ch-2',
            title: 'SRS Ambush: Transit Flashback',
            description: 'Surprise spaced repetition drill on previous transit vocabulary before street food intro.',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 50, y: 10 },
            connectedTo: ['node-2-2', 'node-2-b1'],
            hskLevel: '2',
            targetVocabulary: ['捷运', '换钱'],
            exercises: [
              {
                id: 'ex-2-1-1',
                type: 'srs_ambush',
                title: 'Ambush Review: Transit Mastery',
                instructions: 'Review these prioritized cards from Chapter 1 before diving into the night market.',
                payload: {
                  ambushTitle: 'Transit Retention Check',
                  reason: 'These key transit words are due for memory reinforcement today.',
                  cards: [
                    { character: '捷运', pinyin: 'jié yùn', definition: 'MRT / subway system', hskLevel: '2' },
                    { character: '换钱', pinyin: 'huàn qián', definition: 'to exchange currency', hskLevel: '2' },
                    { character: '护照', pinyin: 'hù zhào', definition: 'passport', hskLevel: '2' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-2-b1',
            chapterId: 'ch-2',
            title: 'Side Branch: Stinky Tofu Slang (臭豆腐)',
            description: 'Optional side quest: learn local night market street delicacies and spicy ratings.',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 78, y: 28 },
            connectedTo: ['node-2-3'],
            hskLevel: '2',
            targetVocabulary: ['臭豆腐', '加辣', '特别'],
            exercises: [
              {
                id: 'ex-2-b1-1',
                type: 'vocab_intro',
                title: 'Delicacies Lexicon',
                instructions: 'Learn slang for famous Taiwanese street snacks.',
                payload: {
                  words: [
                    { character: '臭豆腐', pinyin: 'chòu dòu fu', definition: 'stinky tofu', exampleSentence: '台湾的臭豆腐很香。', exampleTranslation: 'Taiwanese stinky tofu is fragrant.' },
                    { character: '加辣', pinyin: 'jiā là', definition: 'add spice / chili', exampleSentence: '请帮我加一点辣。', exampleTranslation: 'Please add a little spice for me.' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-2-2',
            chapterId: 'ch-2',
            title: 'Ordering Xiao Chi (小吃)',
            description: 'Order beef noodles and dumplings directly at vendor stalls.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 28, y: 30 },
            connectedTo: ['node-2-3'],
            hskLevel: '2',
            targetVocabulary: ['老板', '小吃', '来一碗'],
            exercises: [
              {
                id: 'ex-2-2-1',
                type: 'vocab_intro',
                title: 'Street Food Lexicon',
                instructions: 'Master the core vocabulary for addressing vendors and ordering food.',
                payload: {
                  words: [
                    { character: '老板', pinyin: 'lǎo bǎn', definition: 'boss / vendor shopkeeper', exampleSentence: '老板，来一碗牛肉面！', exampleTranslation: 'Boss, give me a bowl of beef noodles!' },
                    { character: '小吃', pinyin: 'xiǎo chī', definition: 'street snacks / local delicacy', exampleSentence: '夜市有很多台湾小吃。', exampleTranslation: 'The night market has many Taiwanese street snacks.' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-2-3',
            chapterId: 'ch-2',
            title: 'Bubble Tea Customization (珍珠奶茶)',
            description: 'Specify custom ice level and sugar ratio like a pro.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 50, y: 48 },
            connectedTo: ['node-2-4', 'node-2-b2'],
            hskLevel: '2',
            targetVocabulary: ['珍珠奶茶', '半糖', '少冰'],
            exercises: [
              {
                id: 'ex-2-3-1',
                type: 'vocab_intro',
                title: 'Boba Customization Formulas',
                instructions: 'Learn sweetness and ice levels for milk tea.',
                payload: {
                  words: [
                    { character: '珍珠奶茶', pinyin: 'zhēn zhū nǎi chá', definition: 'pearl milk tea / boba', exampleSentence: '我要一杯珍珠奶茶。', exampleTranslation: 'I want a cup of pearl milk tea.' },
                    { character: '半糖', pinyin: 'bàn táng', definition: 'half sugar (50%)', exampleSentence: '请做半糖。', exampleTranslation: 'Please make it half sugar.' },
                    { character: '少冰', pinyin: 'shǎo bīng', definition: 'less ice', exampleSentence: '少冰谢谢。', exampleTranslation: 'Less ice thank you.' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-2-b2',
            chapterId: 'ch-2',
            title: 'Side Branch: Stroke Quiz 甜 & 冰',
            description: 'Master drawing the radical and strokes for Sweet and Ice.',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 22, y: 66 },
            connectedTo: ['node-2-5'],
            hskLevel: '2',
            targetVocabulary: ['甜', '冰'],
            exercises: [
              {
                id: 'ex-2-b2-1',
                type: 'stroke_order_quiz',
                title: 'Character Stroke Precision: 冰',
                instructions: 'Form the ice radical and character from memory.',
                payload: {
                  character: '冰',
                  pinyin: 'bīng',
                  definition: 'ice / cold',
                  radical: '冫',
                  strokeCount: 6
                }
              }
            ]
          },
          {
            id: 'node-2-4',
            chapterId: 'ch-2',
            title: 'Bill Settlement & Takeaway (打包)',
            description: 'Ask for the bill, request takeaway boxes, and thank the shopkeeper.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 74, y: 68 },
            connectedTo: ['node-2-5'],
            hskLevel: '2',
            targetVocabulary: ['打包', '买单', '一共'],
            exercises: [
              {
                id: 'ex-2-4-1',
                type: 'sentence_builder_distractors',
                title: 'Takeaway Sentence Assembly',
                instructions: 'Build the polite takeaway request.',
                payload: {
                  targetSentence: '老板请帮我打包带走',
                  pinyin: 'lǎo bǎn qǐng bāng wǒ dǎ bāo dài zǒu',
                  englishTranslation: 'Boss, please help pack this to take away',
                  validChips: ['老板', '请帮我', '打包', '带走'],
                  distractorChips: ['卖', '己', '充值'],
                  explanation: '打包 (dǎbāo = pack up) + 带走 (dàizǒu = take away).'
                }
              }
            ]
          },
          {
            id: 'node-2-5',
            chapterId: 'ch-2',
            title: 'Boss Battle: Night Market Gourmet Master',
            description: 'Order a full meal with custom spiciness and sugar levels under vendor pressure!',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 88 },
            hskLevel: '3',
            targetVocabulary: ['老板', '打包', '辣', '甜'],
            exercises: [
              {
                id: 'ex-2-5-1',
                type: 'roleplay_dialogue',
                title: 'Milk Tea Stand Showdown',
                instructions: 'Order a bubble tea specifying ice and sweetness level.',
                payload: {
                  scenarioTitle: 'Night Market Tea Stall',
                  contextDescription: 'The vendor asks how sweet you want your tea.',
                  requiredKeywords: ['冰', '糖'],
                  initialPrompt: '帅哥美女，要喝什么？甜度和冰块怎么做？',
                  initialPromptPinyin: 'Shuài gē měi nǚ, yào hē shén me? Tián dù hé bīng kuài zěn me zuò?',
                  initialPromptTranslation: 'Hello handsome/beauty, what would you like? What sweetness and ice level?',
                  sampleReplies: ['我要一杯珍珠奶茶，半糖少冰。', '来一杯红茶，微冰微糖。']
                }
              }
            ]
          }
        ]
      },
      {
        id: 'ch-3',
        title: 'Chapter 3: Historic Dihua Street & Tea Culture',
        description: 'Venture through vintage traditional apothecaries, tea houses, and cultural monuments.',
        themeBiome: 'mountains',
        isUnlocked: false,
        nodes: [
          {
            id: 'node-3-1',
            chapterId: 'ch-3',
            title: 'Tea Culture & Tasting',
            description: 'Learn vocabulary for high mountain oolong, brewing utensils, and aromas.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 50, y: 12 },
            connectedTo: ['node-3-2', 'node-3-b1'],
            hskLevel: '3',
            targetVocabulary: ['乌龙茶', '香味', '品尝'],
            exercises: [
              {
                id: 'ex-3-1-1',
                type: 'vocab_intro',
                title: 'Tea Masters Lexicon',
                instructions: 'Learn classic tea ceremony terminology.',
                payload: {
                  words: [
                    { character: '乌龙茶', pinyin: 'wū lóng chá', definition: 'Oolong tea', exampleSentence: '台湾的高山乌龙茶很有名。', exampleTranslation: 'Taiwan high mountain oolong tea is famous.' },
                    { character: '香味', pinyin: 'xiāng wèi', definition: 'aroma / fragrance', exampleSentence: '这种茶的香味很清淡。', exampleTranslation: 'The aroma of this tea is very delicate.' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-3-b1',
            chapterId: 'ch-3',
            title: 'Side Branch: Brewing Utensils & Heritage',
            description: 'Optional cultural branch: learn terms for teapots, cups, and brewing steps.',
            type: 'learning',
            branchType: 'side_quest',
            status: 'locked',
            mapCoordinates: { x: 78, y: 34 },
            connectedTo: ['node-3-3'],
            hskLevel: '3',
            targetVocabulary: ['茶壶', '茶杯', '开水'],
            exercises: [
              {
                id: 'ex-3-b1-1',
                type: 'vocab_intro',
                title: 'Utensils Lexicon',
                instructions: 'Study the names of traditional tea ware.',
                payload: {
                  words: [
                    { character: '茶壶', pinyin: 'chá hú', definition: 'teapot', exampleSentence: '这个紫砂茶壶很精致。', exampleTranslation: 'This clay teapot is very exquisite.' },
                    { character: '茶杯', pinyin: 'chá bēi', definition: 'teacup', exampleSentence: '请用这个茶杯品茶。', exampleTranslation: 'Please use this cup to taste the tea.' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-3-2',
            chapterId: 'ch-3',
            title: 'Oolong Lore & Mountain Harvest',
            description: 'Discover how Alpine elevations create sweet aftertastes.',
            type: 'learning',
            branchType: 'main',
            status: 'locked',
            mapCoordinates: { x: 26, y: 36 },
            connectedTo: ['node-3-3'],
            hskLevel: '3',
            targetVocabulary: ['高山', '甘甜', '回味'],
            exercises: [
              {
                id: 'ex-3-2-1',
                type: 'pitch_shadowing',
                title: 'Tea Poetry Shadowing',
                instructions: 'Shadow this cultural line celebrating high mountain tea.',
                payload: {
                  sentence: '高山出好茶，茶香引客来。',
                  pinyin: 'gāo shān chū hǎo chá, chá xiāng yǐn kè lái.',
                  translation: 'High mountains produce fine tea; the tea aroma draws guests.'
                }
              }
            ]
          },
          {
            id: 'node-3-3',
            chapterId: 'ch-3',
            title: 'Ambush: Heritage Apothecary Check',
            description: 'Surprise checkpoint before the Grand Finale Boss.',
            type: 'review_ambush',
            branchType: 'ambush',
            status: 'locked',
            mapCoordinates: { x: 50, y: 60 },
            connectedTo: ['node-3-4'],
            hskLevel: '3',
            targetVocabulary: ['乌龙茶', '香味', '捷运'],
            exercises: [
              {
                id: 'ex-3-3-1',
                type: 'srs_ambush',
                title: 'Sovereign Retention Guard',
                instructions: 'Review these prioritized expressions before attempting the ultimate crucible.',
                payload: {
                  ambushTitle: 'Grand Mastery Ambush',
                  reason: 'Comprehensive check across all three biomes.',
                  cards: [
                    { character: '乌龙茶', pinyin: 'wū lóng chá', definition: 'Oolong tea', hskLevel: '3' },
                    { character: '香味', pinyin: 'xiāng wèi', definition: 'aroma / scent', hskLevel: '3' },
                    { character: '捷运', pinyin: 'jié yùn', definition: 'MRT transit', hskLevel: '2' }
                  ]
                }
              }
            ]
          },
          {
            id: 'node-3-4',
            chapterId: 'ch-3',
            title: 'Grand Finale: The Tea Master\'s Crucible',
            description: 'The ultimate Boss Battle synthesizing language, culture, and fluency.',
            type: 'boss_capstone',
            branchType: 'boss',
            status: 'locked',
            mapCoordinates: { x: 50, y: 88 },
            hskLevel: '3',
            targetVocabulary: ['乌龙茶', '香味', '老板', '捷运'],
            exercises: [
              {
                id: 'ex-3-4-1',
                type: 'speed_reading_sprint',
                title: 'Traditional Tea House Lore',
                instructions: 'Read this historical chronicle of tea cultivation in Taiwan before the timer runs out.',
                payload: {
                  passage: '迪化街是台北最古老的商业街之一。两百年前，茶商们在这里把台湾乌龙茶销往全世界。品茶时，先闻其香，再观其色，最后细细品尝回甘。',
                  timeLimitSeconds: 18,
                  targetCPM: 140,
                  question: '品茶的正确顺序是什么？',
                  options: ['先闻香，再观色，最后品尝', '先喝完，再看颜色', '先加糖，再搅拌', '先闻香，立即大口喝下'],
                  correctAnswer: '先闻香，再观色，最后品尝',
                  explanation: 'Passage explicitly states: 先闻其香，再观其色，最后细细品尝回甘。'
                }
              }
            ]
          }
        ]
      }
    ]
  };
}
