/**
 * Moyun (墨韵) Compound Word Dictionary & Decomposition Service
 * Resolves multi-character Chinese words, idiomatic compounds, and spoken phrases.
 * Eliminates disjointed character-by-character reading by providing coherent compound definitions,
 * constituent character breakdown, and zero-latency persistent caching.
 */

import { StorageService, STORAGE_KEYS } from './storage';
import type { HanziItem } from '../types/HanziItem';

export interface ConstituentCharacterInfo {
  char: string;
  pinyin: string;
  definition: string;
  radical?: string;
  strokes?: string;
}

export interface CompoundWordEntry {
  word: string;
  pinyin: string;
  definition: string;
  hskLevel?: string;
  source: 'lexicon' | 'override' | 'cache' | 'google' | 'synthesis';
  constituentChars?: ConstituentCharacterInfo[];
}

/**
 * High-frequency built-in conversational lexicon for modern daily life, food/drink,
 * health, transit, housing, and social interactions.
 */
export const BUILTIN_COMPOUND_LEXICON: Record<string, { pinyin: string; definition: string; hsk?: string }> = {
  // Food, Drinks & Ordering
  '燕麦奶': { pinyin: 'yàn mài nǎi', definition: 'oat milk', hsk: '3' },
  '拿铁': { pinyin: 'ná tiě', definition: 'latte (coffee)', hsk: '3' },
  '红茶拿铁': { pinyin: 'hóng chá ná tiě', definition: 'black tea latte', hsk: '3' },
  '红茶': { pinyin: 'hóng chá', definition: 'black tea', hsk: '2' },
  '绿茶': { pinyin: 'lǜ chá', definition: 'green tea', hsk: '2' },
  '奶茶': { pinyin: 'nǎi chá', definition: 'milk tea; boba tea', hsk: '2' },
  '波霸': { pinyin: 'bō bà', definition: 'large boba tapioca pearls', hsk: '3' },
  '珍珠': { pinyin: 'zhēn zhū', definition: 'pearls (in bubble tea); pearl', hsk: '3' },
  '美式': { pinyin: 'měi shì', definition: 'Americano (coffee); American style', hsk: '2' },
  '卡布奇诺': { pinyin: 'kǎ bù qí nuò', definition: 'cappuccino', hsk: '4' },
  '微糖': { pinyin: 'wēi táng', definition: 'light sugar (approx. 30% sweetness)', hsk: '2' },
  '半糖': { pinyin: 'bàn táng', definition: 'half sugar (50% sweetness)', hsk: '2' },
  '少糖': { pinyin: 'shǎo táng', definition: 'less sugar (approx. 70% sweetness)', hsk: '2' },
  '无糖': { pinyin: 'wú táng', definition: 'sugar-free; zero sugar', hsk: '2' },
  '全糖': { pinyin: 'quán táng', definition: 'full sugar (100% sweetness)', hsk: '2' },
  '少冰': { pinyin: 'shǎo bīng', definition: 'light ice; less ice', hsk: '2' },
  '去冰': { pinyin: 'qù bīng', definition: 'no ice; ice removed', hsk: '2' },
  '常温': { pinyin: 'cháng wēn', definition: 'room temperature', hsk: '2' },
  '热饮': { pinyin: 'rè yǐn', definition: 'hot drink', hsk: '2' },
  '大杯': { pinyin: 'dà bēi', definition: 'large cup / size', hsk: '1' },
  '中杯': { pinyin: 'zhōng bēi', definition: 'medium cup / size', hsk: '1' },
  '小杯': { pinyin: 'xiǎo bēi', definition: 'small cup / size', hsk: '1' },
  '打包': { pinyin: 'dǎ bāo', definition: 'take out; to-go; pack up leftovers', hsk: '2' },
  '堂食': { pinyin: 'táng shí', definition: 'dine in; eat on-site', hsk: '3' },
  '带走': { pinyin: 'dài zǒu', definition: 'take away; to-go', hsk: '2' },
  '香菜': { pinyin: 'xiāng cài', definition: 'cilantro; coriander', hsk: '3' },
  '过敏': { pinyin: 'guò mǐn', definition: 'allergic; allergy', hsk: '3' },
  '花生': { pinyin: 'huā shēng', definition: 'peanut', hsk: '2' },
  '海鲜': { pinyin: 'hǎi xiān', definition: 'seafood', hsk: '3' },
  '牛肉': { pinyin: 'niú ròu', definition: 'beef', hsk: '2' },
  '猪肉': { pinyin: 'zhū ròu', definition: 'pork', hsk: '2' },
  '鸡肉': { pinyin: 'jī ròu', definition: 'chicken meat', hsk: '2' },
  '羊肉': { pinyin: 'yáng ròu', definition: 'lamb; mutton', hsk: '2' },
  '素食': { pinyin: 'sù shí', definition: 'vegetarian food', hsk: '3' },
  '忌口': { pinyin: 'jì kǒu', definition: 'dietary restriction; foods to avoid', hsk: '4' },
  '筷子': { pinyin: 'kuài zi', definition: 'chopsticks', hsk: '2' },
  '勺子': { pinyin: 'sháo zi', definition: 'spoon', hsk: '2' },
  '纸巾': { pinyin: 'zhǐ jīn', definition: 'tissue; napkin', hsk: '2' },
  '买单': { pinyin: 'mǎi dān', definition: 'pay the bill; check please', hsk: '2' },
  '结账': { pinyin: 'jié zhàng', definition: 'settle the bill; pay account', hsk: '3' },
  '扫码': { pinyin: 'sǎo mǎ', definition: 'scan QR code', hsk: '2' },
  '微信': { pinyin: 'wēi xìn', definition: 'WeChat', hsk: '2' },
  '支付宝': { pinyin: 'zhī fù bǎo', definition: 'Alipay', hsk: '2' },
  '现金': { pinyin: 'xiàn jīn', definition: 'cash', hsk: '3' },
  '发票': { pinyin: 'fā piào', definition: 'official tax invoice / receipt', hsk: '3' },
  '收据': { pinyin: 'shōu jù', definition: 'receipt', hsk: '3' },
  '打折': { pinyin: 'dǎ zhé', definition: 'give discount; on sale', hsk: '3' },
  '优惠': { pinyin: 'yōu huì', definition: 'discount; preferential offer', hsk: '3' },
  '特价': { pinyin: 'tè jià', definition: 'special price; sale', hsk: '2' },

  // Healthcare, Dentist & Veterinary
  '牙医': { pinyin: 'yá yī', definition: 'dentist', hsk: '3' },
  '补牙': { pinyin: 'bǔ yá', definition: 'tooth filling; repair a tooth', hsk: '3' },
  '拔牙': { pinyin: 'bá yá', definition: 'tooth extraction', hsk: '3' },
  '牙齿': { pinyin: 'yá chǐ', definition: 'tooth; teeth', hsk: '3' },
  '蛀牙': { pinyin: 'zhù yá', definition: 'cavity; tooth decay', hsk: '3' },
  '智齿': { pinyin: 'zhì chǐ', definition: 'wisdom tooth', hsk: '4' },
  '洗牙': { pinyin: 'xǐ yá', definition: 'dental cleaning', hsk: '3' },
  '就诊': { pinyin: 'jiù zhěn', definition: 'seek medical advice; see a doctor', hsk: '4' },
  '检查': { pinyin: 'jiǎn chá', definition: 'check up; inspect; examine', hsk: '2' },
  '复查': { pinyin: 'fù chá', definition: 'follow-up check; re-examine', hsk: '3' },
  '挂号': { pinyin: 'guà hào', definition: 'register at a clinic / hospital', hsk: '3' },
  '看病': { pinyin: 'kàn bìng', definition: 'see a doctor; treat an illness', hsk: '2' },
  '医院': { pinyin: 'yī yuàn', definition: 'hospital', hsk: '1' },
  '诊所': { pinyin: 'zhěn suǒ', definition: 'clinic', hsk: '3' },
  '医生': { pinyin: 'yī shēng', definition: 'doctor', hsk: '1' },
  '护士': { pinyin: 'hù shi', definition: 'nurse', hsk: '3' },
  '感冒': { pinyin: 'gǎn mào', definition: 'catch a cold; common cold', hsk: '2' },
  '发烧': { pinyin: 'fā shāo', definition: 'have a fever', hsk: '2' },
  '咳嗽': { pinyin: 'ké sou', definition: 'cough', hsk: '2' },
  '头疼': { pinyin: 'tóu téng', definition: 'headache', hsk: '2' },
  '肚子疼': { pinyin: 'dù zi téng', definition: 'stomachache', hsk: '2' },
  '恶心': { pinyin: 'ě xin', definition: 'nauseous; sick', hsk: '3' },
  '呕吐': { pinyin: 'ǒu tù', definition: 'vomit', hsk: '3' },
  '拉肚子': { pinyin: 'lā dù zi', definition: 'have diarrhea', hsk: '2' },
  '吃药': { pinyin: 'chī yào', definition: 'take medicine', hsk: '2' },
  '打针': { pinyin: 'dǎ zhēn', definition: 'give or get an injection', hsk: '2' },
  '输液': { pinyin: 'shū yè', definition: 'IV infusion / drip', hsk: '4' },
  '血常规': { pinyin: 'xuè cháng guī', definition: 'routine blood test', hsk: '4' },
  '留院': { pinyin: 'liú yuàn', definition: 'hospitalize; stay at hospital', hsk: '4' },
  '宠物': { pinyin: 'chǒng wù', definition: 'pet', hsk: '3' },
  '兽医': { pinyin: 'shòu yī', definition: 'veterinarian; vet', hsk: '3' },
  '疫苗': { pinyin: 'yì miáo', definition: 'vaccine', hsk: '4' },
  '罐头': { pinyin: 'guàn tou', definition: 'canned food', hsk: '3' },

  // Housing, Apartments & Landlord
  '房东': { pinyin: 'fáng dōng', definition: 'landlord; landlady', hsk: '3' },
  '租房': { pinyin: 'zū fáng', definition: 'rent a house or apartment', hsk: '3' },
  '房租': { pinyin: 'fáng zū', definition: 'rent money', hsk: '3' },
  '押金': { pinyin: 'yā jīn', definition: 'security deposit', hsk: '3' },
  '合同': { pinyin: 'hé tong', definition: 'contract; agreement', hsk: '3' },
  '水管': { pinyin: 'shuǐ guǎn', definition: 'water pipe', hsk: '3' },
  '漏水': { pinyin: 'lòu shuǐ', definition: 'leak water; water leakage', hsk: '3' },
  '堵塞': { pinyin: 'dǔ sè', definition: 'clogged; blocked', hsk: '4' },
  '地漏': { pinyin: 'dì lòu', definition: 'floor drain', hsk: '3' },
  '修理': { pinyin: 'xiū lǐ', definition: 'repair; fix', hsk: '3' },
  '维修': { pinyin: 'wéi xiū', definition: 'maintenance; repair service', hsk: '4' },
  '师傅': { pinyin: 'shī fu', definition: 'master worker; technician; driver', hsk: '3' },
  '物业': { pinyin: 'wù yè', definition: 'property management', hsk: '4' },
  '电梯': { pinyin: 'diàn tī', definition: 'elevator; lift', hsk: '3' },
  '钥匙': { pinyin: 'yào shi', definition: 'key', hsk: '3' },
  '门禁卡': { pinyin: 'mén jìn kǎ', definition: 'access card; key card', hsk: '3' },
  '空调': { pinyin: 'kōng tiáo', definition: 'air conditioner', hsk: '3' },
  '暖气': { pinyin: 'nuǎn qì', definition: 'central heating; radiator', hsk: '3' },
  '热水器': { pinyin: 'rè shuǐ qì', definition: 'water heater', hsk: '3' },
  '洗手间': { pinyin: 'xǐ shǒu jiān', definition: 'washroom; bathroom', hsk: '2' },
  '厕所': { pinyin: 'cè suǒ', definition: 'toilet; restroom', hsk: '2' },

  // Transit, Airport & Travel
  '地铁': { pinyin: 'dì tiě', definition: 'subway; metro', hsk: '2' },
  '公交车': { pinyin: 'gōng jiāo chē', definition: 'public bus', hsk: '2' },
  '出租车': { pinyin: 'chū zū chē', definition: 'taxi; cab', hsk: '2' },
  '网约车': { pinyin: 'wǎng yuē chē', definition: 'ride-hailing car (Didi/Uber)', hsk: '3' },
  '滴滴': { pinyin: 'dī dī', definition: 'Didi (ride-hailing app)', hsk: '2' },
  '高铁': { pinyin: 'gāo tiě', definition: 'high-speed rail train', hsk: '3' },
  '火车站': { pinyin: 'huǒ chē zhàn', definition: 'train station', hsk: '2' },
  '飞机场': { pinyin: 'fēi jī chǎng', definition: 'airport', hsk: '2' },
  '航班': { pinyin: 'háng bān', definition: 'flight; scheduled flight', hsk: '3' },
  '登机牌': { pinyin: 'dēng jī pái', definition: 'boarding pass', hsk: '3' },
  '安检': { pinyin: 'ān jiǎn', definition: 'security check', hsk: '3' },
  '行李': { pinyin: 'xíng li', definition: 'luggage; baggage', hsk: '3' },
  '托运': { pinyin: 'tuō yùn', definition: 'check in baggage; consign', hsk: '4' },
  '导航': { pinyin: 'dǎo háng', definition: 'GPS navigation', hsk: '3' },
  '堵车': { pinyin: 'dǔ chē', definition: 'traffic jam', hsk: '3' },
  '找零': { pinyin: 'zhǎo líng', definition: 'give small change', hsk: '2' },

  // Everyday Spoken Connectives & Politeness
  '请问': { pinyin: 'qǐng wèn', definition: 'excuse me; may I ask', hsk: '1' },
  '不好意思': { pinyin: 'bù hǎo yì si', definition: 'excuse me; sorry to bother', hsk: '2' },
  '麻烦您': { pinyin: 'má fan nín', definition: 'sorry to trouble you; could you please', hsk: '2' },
  '没关系': { pinyin: 'méi guān xi', definition: 'no problem; it doesn\'t matter', hsk: '1' },
  '不客气': { pinyin: 'bù kè qi', definition: 'you are welcome', hsk: '1' },
  '稍微': { pinyin: 'shāo wēi', definition: 'a little bit; slightly', hsk: '3' },
  '稍等': { pinyin: 'shāo děng', definition: 'wait a moment; just a sec', hsk: '2' },
  '等等': { pinyin: 'děng děng', definition: 'wait a minute; and so on', hsk: '1' },
  '马上': { pinyin: 'mǎ shàng', definition: 'immediately; right away', hsk: '2' },
  '可以': { pinyin: 'kě yǐ', definition: 'can; may; able to', hsk: '1' },
  '换成': { pinyin: 'huàn chéng', definition: 'change into; switch to', hsk: '2' },
  '准备': { pinyin: 'zhǔn bèi', definition: 'prepare; plan to', hsk: '2' },
  '特别': { pinyin: 'tè bié', definition: 'especially; special', hsk: '2' },
  '比较': { pinyin: 'bǐ jiào', definition: 'relatively; compare', hsk: '2' },
  '觉得': { pinyin: 'jué de', definition: 'feel; think', hsk: '2' },
  '认为': { pinyin: 'rèn wéi', definition: 'consider; believe', hsk: '3' },
  '希望': { pinyin: 'xī wàng', definition: 'hope; wish', hsk: '2' },
  '需要': { pinyin: 'xū yào', definition: 'need; require', hsk: '2' },
  '应该': { pinyin: 'yīng gāi', definition: 'should; ought to', hsk: '2' },
  '必须': { pinyin: 'bì xū', definition: 'must; have to', hsk: '3' },
  '因为': { pinyin: 'yīn wèi', definition: 'because', hsk: '2' },
  '所以': { pinyin: 'suǒ yǐ', definition: 'therefore; so', hsk: '2' },
  '虽然': { pinyin: 'suī rán', definition: 'although; even though', hsk: '2' },
  '但是': { pinyin: 'dàn shì', definition: 'but; however', hsk: '2' },
  '如果': { pinyin: 'rú guǒ', definition: 'if; in case', hsk: '2' },
  '不仅': { pinyin: 'bù jǐn', definition: 'not only', hsk: '3' },
  '而且': { pinyin: 'ér qiě', definition: 'but also; moreover', hsk: '3' },
  '大概': { pinyin: 'dà gài', definition: 'probably; roughly; approximately', hsk: '3' },
  '什么时候': { pinyin: 'shén me shí hou', definition: 'when; what time', hsk: '1' },
  '怎么': { pinyin: 'zěn me', definition: 'how; why', hsk: '1' },
  '怎么样': { pinyin: 'zěn me yàng', definition: 'how about; how is it', hsk: '1' },
  '为什么': { pinyin: 'wèi shén me', definition: 'why', hsk: '1' },
  '没问题': { pinyin: 'méi wèn tí', definition: 'no problem', hsk: '1' },
  '太好了': { pinyin: 'tài hǎo le', definition: 'great; wonderful', hsk: '1' },
  '放心': { pinyin: 'fàng xīn', definition: 'rest assured; don\'t worry', hsk: '2' },
  '厉害': { pinyin: 'lì hai', definition: 'impressive; fierce; awesome', hsk: '3' }
};

// In-memory runtime cache for resolved compounds
const runtimeCompoundCache = new Map<string, CompoundWordEntry>();

export class CompoundDictionaryService {
  /**
   * Initializes runtime cache from localStorage
   */
  public static getCachedCompounds(): Record<string, CompoundWordEntry> {
    return StorageService.getJson<Record<string, CompoundWordEntry>>(STORAGE_KEYS.COMPOUND_WORDS_CACHE, {});
  }

  /**
   * Decomposes a multi-character compound word into its individual constituent characters
   * with their respective pinyin, definition, radical, and stroke count.
   */
  public static decomposeCompound(
    word: string,
    hanziMap?: Map<string, HanziItem>
  ): ConstituentCharacterInfo[] {
    return Array.from(word).map(char => {
      const entry = hanziMap?.get(char);
      return {
        char,
        pinyin: entry?.pinyin || '',
        definition: entry?.definition || 'Character constituent',
        radical: entry?.radical,
        strokes: entry?.stroke_count
      };
    });
  }

  /**
   * Synchronous lookup checking:
   * 1. User overrides
   * 2. In-memory runtime cache
   * 3. Built-in compound lexicon
   * 4. Persistent localStorage cache
   * 5. Fallback character synthesis
   */
  public static lookupSync(
    word: string,
    hanziMap?: Map<string, HanziItem>,
    vocabMap?: Map<string, HanziItem>,
    overridesMap?: Record<string, { pinyin: string; definition: string }>
  ): CompoundWordEntry | null {
    const cleanWord = word.trim();
    if (!cleanWord) return null;

    // Single character lookup delegates to hanziMap / overrides
    if (cleanWord.length === 1) {
      if (overridesMap && overridesMap[cleanWord]) {
        return {
          word: cleanWord,
          pinyin: overridesMap[cleanWord].pinyin,
          definition: overridesMap[cleanWord].definition,
          hskLevel: 'Custom',
          source: 'override'
        };
      }
      const charItem = hanziMap?.get(cleanWord);
      if (charItem) {
        return {
          word: cleanWord,
          pinyin: charItem.pinyin,
          definition: charItem.definition,
          hskLevel: charItem.hsk_level,
          source: 'lexicon'
        };
      }
      return null;
    }

    // 1. Check user custom overrides
    if (overridesMap && overridesMap[cleanWord]) {
      return {
        word: cleanWord,
        pinyin: overridesMap[cleanWord].pinyin,
        definition: overridesMap[cleanWord].definition,
        hskLevel: 'Custom',
        source: 'override',
        constituentChars: this.decomposeCompound(cleanWord, hanziMap)
      };
    }

    // 2. Check in-memory runtime cache
    if (runtimeCompoundCache.has(cleanWord)) {
      return runtimeCompoundCache.get(cleanWord)!;
    }

    // 3. Check vocabMap from vocabDB.csv
    const vocabItem = vocabMap?.get(cleanWord);
    if (vocabItem) {
      const entry: CompoundWordEntry = {
        word: cleanWord,
        pinyin: vocabItem.pinyin,
        definition: vocabItem.definition,
        hskLevel: vocabItem.hsk_level,
        source: 'lexicon',
        constituentChars: this.decomposeCompound(cleanWord, hanziMap)
      };
      runtimeCompoundCache.set(cleanWord, entry);
      return entry;
    }

    // 4. Check built-in compound lexicon
    if (BUILTIN_COMPOUND_LEXICON[cleanWord]) {
      const item = BUILTIN_COMPOUND_LEXICON[cleanWord];
      const entry: CompoundWordEntry = {
        word: cleanWord,
        pinyin: item.pinyin,
        definition: item.definition,
        hskLevel: item.hsk,
        source: 'lexicon',
        constituentChars: this.decomposeCompound(cleanWord, hanziMap)
      };
      runtimeCompoundCache.set(cleanWord, entry);
      return entry;
    }

    // 5. Check persistent localStorage cache
    const storedCache = this.getCachedCompounds();
    if (storedCache[cleanWord]) {
      const entry = storedCache[cleanWord];
      entry.constituentChars = this.decomposeCompound(cleanWord, hanziMap);
      runtimeCompoundCache.set(cleanWord, entry);
      return entry;
    }

    // 6. If compound consists of characters all present in hanziMap, synthesize base reading
    if (hanziMap) {
      const chars = Array.from(cleanWord);
      const allKnown = chars.every(c => hanziMap.has(c));
      if (allKnown) {
        const pinyin = chars.map(c => hanziMap.get(c)?.pinyin || '').join(' ').trim();
        const synthesizedDef = chars.map(c => `${c} (${hanziMap.get(c)?.definition || ''})`).join(' + ');
        const entry: CompoundWordEntry = {
          word: cleanWord,
          pinyin,
          definition: synthesizedDef,
          source: 'synthesis',
          constituentChars: this.decomposeCompound(cleanWord, hanziMap)
        };
        return entry;
      }
    }

    return null;
  }

  /**
   * Asynchronous resolver:
   * First checks sync sources. If not found, uses the free Google Translate API
   * to translate the compound word and fetch accurate Pinyin and English meaning,
   * then caches the result persistently.
   */
  public static async resolveCompound(
    word: string,
    hanziMap?: Map<string, HanziItem>,
    vocabMap?: Map<string, HanziItem>,
    overridesMap?: Record<string, { pinyin: string; definition: string }>
  ): Promise<CompoundWordEntry> {
    const syncResult = this.lookupSync(word, hanziMap, vocabMap, overridesMap);
    if (syncResult && syncResult.source !== 'synthesis') {
      return syncResult;
    }

    const cleanWord = word.trim();

    // Query free Google Translate endpoint
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&dt=rm&q=${encodeURIComponent(cleanWord)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        let english = '';
        let romanized = '';

        if (Array.isArray(data) && Array.isArray(data[0])) {
          english = data[0]
            .map((seg: any) => seg[0])
            .filter(Boolean)
            .join(' ')
            .trim();

          // Romanization is in data[0][1][2] or seg[2] / seg[3]
          for (const seg of data[0]) {
            if (seg && typeof seg[2] === 'string' && seg[2].trim()) {
              romanized = seg[2].trim();
              break;
            }
            if (seg && typeof seg[3] === 'string' && seg[3].trim()) {
              romanized = seg[3].trim();
              break;
            }
          }
        }

        if (english) {
          // If romanized pinyin not returned by Google, synthesize from hanziMap
          let finalPinyin = romanized;
          if (!finalPinyin && hanziMap) {
            finalPinyin = Array.from(cleanWord)
              .map(c => hanziMap.get(c)?.pinyin || c)
              .join(' ');
          }

          const entry: CompoundWordEntry = {
            word: cleanWord,
            pinyin: finalPinyin,
            definition: english,
            source: 'google',
            constituentChars: this.decomposeCompound(cleanWord, hanziMap)
          };

          // Cache in memory and localStorage
          runtimeCompoundCache.set(cleanWord, entry);
          const cached = this.getCachedCompounds();
          cached[cleanWord] = entry;
          StorageService.setJson(STORAGE_KEYS.COMPOUND_WORDS_CACHE, cached);

          return entry;
        }
      }
    } catch (err) {
      console.warn('[CompoundDictionaryService] Google translation fetch failed, using fallback:', err);
    }

    // Fallback to sync result or basic entry
    return (
      syncResult || {
        word: cleanWord,
        pinyin: hanziMap
          ? Array.from(cleanWord)
              .map(c => hanziMap.get(c)?.pinyin || c)
              .join(' ')
          : '',
        definition: 'Compound word',
        source: 'synthesis',
        constituentChars: this.decomposeCompound(cleanWord, hanziMap)
      }
    );
  }
}
