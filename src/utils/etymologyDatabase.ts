/**
 * Etymology and Radical Mnemonics Database (SRS-006)
 * Cataloging paleographic origins (六书: 象形, 指事, 会意, 形声) and vivid narrative mnemonics
 */

export type CharacterCategory = 'pictogram' | 'ideogram' | 'compound_ideogram' | 'phono_semantic';

export interface EtymologyEntry {
  character: string;
  pinyin: string;
  meaning: string;
  category: CharacterCategory;
  categoryLabel: string; // e.g. "会意 Compound Ideogram"
  semanticRadical: string;
  radicalMeaning: string;
  phoneticComponent?: string;
  phoneticSound?: string;
  ancientOrigin: string; // Oracle bone or historical evolution explanation
  mnemonic: string; // Narrative memory hook
  components: Array<{
    char: string;
    role: 'semantic' | 'phonetic' | 'symbolic';
    explanation: string;
  }>;
}

export const ETYMOLOGY_DATABASE: Record<string, EtymologyEntry> = {
  '休': {
    character: '休',
    pinyin: 'xiū',
    meaning: 'to rest / stop',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '亻 (人)',
    radicalMeaning: 'Person',
    ancientOrigin: 'In Oracle Bone script, depicts a person (人) leaning against the trunk of a shady tree (木) to take a breather from field labor.',
    mnemonic: 'A tired person (亻) leaning against a tree (木) takes a well-deserved rest (休).',
    components: [
      { char: '亻', role: 'semantic', explanation: 'Person (人) standing or leaning' },
      { char: '木', role: 'semantic', explanation: 'Tree providing shelter and shade' }
    ]
  },
  '明': {
    character: '明',
    pinyin: 'míng',
    meaning: 'bright / clear / brilliant',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '日',
    radicalMeaning: 'Sun / Day',
    ancientOrigin: 'Combines the two brightest celestial orbs in the ancient cosmos: the blazing Sun (日) by day and the luminous Moon (月) by night.',
    mnemonic: 'When the golden Sun (日) and silvery Moon (月) unite their light, the whole world becomes bright (明).',
    components: [
      { char: '日', role: 'semantic', explanation: 'Sun shining during the day' },
      { char: '月', role: 'semantic', explanation: 'Moon glowing in the night sky' }
    ]
  },
  '看': {
    character: '看',
    pinyin: 'kàn',
    meaning: 'to look / see / watch',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '目',
    radicalMeaning: 'Eye',
    ancientOrigin: 'Depicts a stylized hand (手, here written ) held horizontally above an eye (目) to shield against the blinding glare while scanning the horizon.',
    mnemonic: 'Place your hand (手) over your eye (目) like a visor to look (看) into the far distance.',
    components: [
      { char: '手 ()', role: 'semantic', explanation: 'Hand held flat as an eyeshade' },
      { char: '目', role: 'semantic', explanation: 'Eye peering forward' }
    ]
  },
  '想': {
    character: '想',
    pinyin: 'xiǎng',
    meaning: 'to think / wish / miss',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '心',
    radicalMeaning: 'Heart / Mind',
    phoneticComponent: '相',
    phoneticSound: 'xiāng',
    ancientOrigin: 'Phono-semantic creation where the semantic base is the heart/mind (心) where emotions and thoughts reside, while 相 (xiāng) provides phonetic harmony.',
    mnemonic: 'Your heart (心) holds mutual appearances (相) of the one you miss and think about (想).',
    components: [
      { char: '相', role: 'phonetic', explanation: 'Phonetic indicator sounding like "xiāng" (mutual appearance)' },
      { char: '心', role: 'semantic', explanation: 'Heart / Mind where thoughts and feelings occur' }
    ]
  },
  '妈': {
    character: '妈',
    pinyin: 'mā',
    meaning: 'mother / mom',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '女',
    radicalMeaning: 'Woman / Female',
    phoneticComponent: '马',
    phoneticSound: 'mǎ',
    ancientOrigin: 'The quintessential phono-semantic word: 女 (female) specifies the semantic family of motherhood, while 马 (mǎ) conveys the phonetic syllable.',
    mnemonic: 'The woman (女) in your life who works tirelessly like a loyal horse (马) is your mom (妈).',
    components: [
      { char: '女', role: 'semantic', explanation: 'Woman / Female relation' },
      { char: '马', role: 'phonetic', explanation: 'Phonetic borrowing sounding like "mǎ"' }
    ]
  },
  '爸': {
    character: '爸',
    pinyin: 'bà',
    meaning: 'father / dad',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '父',
    radicalMeaning: 'Father / Patriarch',
    phoneticComponent: '巴',
    phoneticSound: 'bā',
    ancientOrigin: '父 (an ancient stone axe held in hand, signifying the provider/patriarch) combines with the phonetic sound 巴 (bā).',
    mnemonic: 'The patriarchal father (父) of the clan holding a banner (巴) is dad (爸).',
    components: [
      { char: '父', role: 'semantic', explanation: 'Father / axe-bearing guardian of the household' },
      { char: '巴', role: 'phonetic', explanation: 'Phonetic component sounding like "bā"' }
    ]
  },
  '好': {
    character: '好',
    pinyin: 'hǎo',
    meaning: 'good / well / fine',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '女',
    radicalMeaning: 'Woman',
    ancientOrigin: 'Oracle Bone carvings show a mother (女) gently cradling a newborn child (子). In agrarian ancient China, a healthy mother and child symbolized ideal prosperity.',
    mnemonic: 'When a mother (女) holds her beloved child (子), everything is good (好).',
    components: [
      { char: '女', role: 'semantic', explanation: 'Woman / Mother' },
      { char: '子', role: 'semantic', explanation: 'Child / Infant' }
    ]
  },
  '问': {
    character: '问',
    pinyin: 'wèn',
    meaning: 'to ask / inquire',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '口',
    radicalMeaning: 'Mouth',
    phoneticComponent: '门',
    phoneticSound: 'mén',
    ancientOrigin: 'Depicts standing at an entrance gate (门) opening one\'s mouth (口) to call out an inquiry or ask for directions.',
    mnemonic: 'Opening your mouth (口) at someone\'s front gate (门) to ask (问) if anyone is home.',
    components: [
      { char: '门', role: 'phonetic', explanation: 'Phonetic sounding like "mén" and depicting a gate' },
      { char: '口', role: 'semantic', explanation: 'Mouth asking questions' }
    ]
  },
  '晴': {
    character: '晴',
    pinyin: 'qíng',
    meaning: 'clear / sunny weather',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '日',
    radicalMeaning: 'Sun',
    phoneticComponent: '青',
    phoneticSound: 'qīng',
    ancientOrigin: 'The sun radical (日) evokes sunlight and daytime, combined with the pure azure/green phonetic element 青 (qīng).',
    mnemonic: 'When the sun (日) shines through azure-blue (青) cloudless skies, the weather is sunny and clear (晴).',
    components: [
      { char: '日', role: 'semantic', explanation: 'Sun shining overhead' },
      { char: '青', role: 'phonetic', explanation: 'Phonetic component sounding like "qīng" (azure/green)' }
    ]
  },
  '河': {
    character: '河',
    pinyin: 'hé',
    meaning: 'river / waterway',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '氵 (水)',
    radicalMeaning: 'Water droplets',
    phoneticComponent: '可',
    phoneticSound: 'kě',
    ancientOrigin: 'Originally specifically denoted the Yellow River (黄河). Three splashes of water (氵) with the phonetic modifier 可 (anciently pronounced closer to "kha/ga").',
    mnemonic: 'Flowing water (氵) that is passable and permits (可) navigation is a river (河).',
    components: [
      { char: '氵', role: 'semantic', explanation: 'Three splashes of water' },
      { char: '可', role: 'phonetic', explanation: 'Phonetic component "kě"' }
    ]
  },
  '语': {
    character: '语',
    pinyin: 'yǔ',
    meaning: 'spoken language / words',
    category: 'phono_semantic',
    categoryLabel: '形声 Phono-Semantic Compound',
    semanticRadical: '讠 (言)',
    radicalMeaning: 'Speech / Words',
    phoneticComponent: '吾',
    phoneticSound: 'wú',
    ancientOrigin: 'The speech radical (讠) combined with 吾 (ancient literary pronoun for "I / me" wú). Language is literally "speech expressing oneself".',
    mnemonic: 'Spoken words (讠) expressing my inner self (吾) make up language (语).',
    components: [
      { char: '讠', role: 'semantic', explanation: 'Speech radical (sound waves issuing from mouth)' },
      { char: '吾', role: 'phonetic', explanation: 'Phonetic "wú" (Five 五 + Mouth 口, meaning "myself")' }
    ]
  },
  '家': {
    character: '家',
    pinyin: 'jiā',
    meaning: 'home / family / household',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '宀',
    radicalMeaning: 'Roof / House',
    ancientOrigin: 'In ancient Bronze script, shows a thatched roof (宀) sheltering a domesticated pig (豕). In early pastoral civilization, owning a pig under one\'s roof was the mark of a settled family home.',
    mnemonic: 'A secure roof (宀) with a prized pig (豕) kept safely underneath forms a prosperous home and family (家).',
    components: [
      { char: '宀', role: 'semantic', explanation: 'Sheltering roof of a house' },
      { char: '豕', role: 'semantic', explanation: 'Pig / Swine (livestock of ancient settled homesteads)' }
    ]
  },
  '森': {
    character: '森',
    pinyin: 'sēn',
    meaning: 'dense forest / woods',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '木',
    radicalMeaning: 'Tree',
    ancientOrigin: 'A triplicated pictogram (品字结构). One tree (木) is a tree; two trees (林) is a grove; three trees (森) is a dense primeval forest.',
    mnemonic: 'Tree (木) stacked upon trees (木木) multiplies into a thick, towering forest (森).',
    components: [
      { char: '木', role: 'semantic', explanation: 'Top tree reaching high' },
      { char: '木', role: 'semantic', explanation: 'Bottom left tree' },
      { char: '木', role: 'semantic', explanation: 'Bottom right tree' }
    ]
  },
  '尖': {
    character: '尖',
    pinyin: 'jiān',
    meaning: 'sharp / pointed / tip',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '小',
    radicalMeaning: 'Small',
    ancientOrigin: 'Logical ideogram illustrating physical geometry: an object that tapers from big (大) at the base to small (小) at the apex.',
    mnemonic: 'Small (小) on top of big (大) forms a sharp needle point (尖).',
    components: [
      { char: '小', role: 'semantic', explanation: 'Small point at the top' },
      { char: '大', role: 'semantic', explanation: 'Wide base at the bottom' }
    ]
  },
  '信': {
    character: '信',
    pinyin: 'xìn',
    meaning: 'trust / faith / letter / believe',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '亻 (人)',
    radicalMeaning: 'Person',
    ancientOrigin: 'A person (人) standing by their spoken word (言). Confucian virtue of honesty and trustworthiness: a person true to their speech.',
    mnemonic: 'A person (亻) standing steadfastly behind their word (言) embodies trust and honesty (信).',
    components: [
      { char: '亻', role: 'semantic', explanation: 'Person' },
      { char: '言', role: 'semantic', explanation: 'Words / Speech' }
    ]
  },
  '刃': {
    character: '刃',
    pinyin: 'rèn',
    meaning: 'blade / razor edge',
    category: 'ideogram',
    categoryLabel: '指事 Simple Ideogram',
    semanticRadical: '刀',
    radicalMeaning: 'Knife',
    ancientOrigin: 'Takes the knife pictogram (刀) and places an indicative dot or stroke right on the cutting edge to point directly to the sharpened blade.',
    mnemonic: 'A knife (刀) with a mark pointing to its dangerous cutting edge is the blade (刃).',
    components: [
      { char: '刀', role: 'semantic', explanation: 'Knife outline' },
      { char: '丶', role: 'symbolic', explanation: 'Indicative marker highlighting the cutting edge' }
    ]
  },
  '本': {
    character: '本',
    pinyin: 'běn',
    meaning: 'origin / root / foundation / book',
    category: 'ideogram',
    categoryLabel: '指事 Simple Ideogram',
    semanticRadical: '木',
    radicalMeaning: 'Tree',
    ancientOrigin: 'Draws a tree (木) with an indicative horizontal stroke across the bottom roots, pointing to the foundation or source.',
    mnemonic: 'A tree (木) with a bar marking its deep roots points to the origin and foundation (本).',
    components: [
      { char: '木', role: 'semantic', explanation: 'Tree' },
      { char: '一', role: 'symbolic', explanation: 'Indicator marking the root beneath the soil' }
    ]
  },
  '末': {
    character: '末',
    pinyin: 'mò',
    meaning: 'tip / end / insignificant details',
    category: 'ideogram',
    categoryLabel: '指事 Simple Ideogram',
    semanticRadical: '木',
    radicalMeaning: 'Tree',
    ancientOrigin: 'Opposite of 本! Draws a tree (木) with an emphasized longer top branch, designating the far tip or extremity.',
    mnemonic: 'A tree (木) with an extended top stroke points to the highest branch tip and the end (末).',
    components: [
      { char: '木', role: 'semantic', explanation: 'Tree' },
      { char: '一', role: 'symbolic', explanation: 'Indicator marking the distant top twigs' }
    ]
  },
  '安': {
    character: '安',
    pinyin: 'ān',
    meaning: 'peaceful / calm / safe',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '宀',
    radicalMeaning: 'Roof',
    ancientOrigin: 'Depicts a woman (女) seated peacefully and safely inside the sanctuary of her home (宀).',
    mnemonic: 'A woman (女) safely residing under a solid roof (宀) brings peace and tranquility (安).',
    components: [
      { char: '宀', role: 'semantic', explanation: 'Roof / Sanctuary' },
      { char: '女', role: 'semantic', explanation: 'Woman at peace' }
    ]
  },
  '泪': {
    character: '泪',
    pinyin: 'lèi',
    meaning: 'tears / weep',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '氵 (水)',
    radicalMeaning: 'Water',
    ancientOrigin: 'Modern simplified compound ideogram directly showing water droplets (氵) flowing from an eye (目).',
    mnemonic: 'Water (氵) streaming from the eye (目) produces tears (泪).',
    components: [
      { char: '氵', role: 'semantic', explanation: 'Water droplets' },
      { char: '目', role: 'semantic', explanation: 'Eye' }
    ]
  },
  '鸣': {
    character: '鸣',
    pinyin: 'míng',
    meaning: 'bird chirp / ring / sound out',
    category: 'compound_ideogram',
    categoryLabel: '会意 Compound Ideogram',
    semanticRadical: '口',
    radicalMeaning: 'Mouth',
    ancientOrigin: 'Draws an open calling mouth (口) beside a songbird (鸟).',
    mnemonic: 'The mouth (口) of a little bird (鸟) chirps out a melodious song (鸣).',
    components: [
      { char: '口', role: 'semantic', explanation: 'Mouth calling out' },
      { char: '鸟', role: 'semantic', explanation: 'Songbird' }
    ]
  },
  '日': {
    character: '日',
    pinyin: 'rì',
    meaning: 'sun / day',
    category: 'pictogram',
    categoryLabel: '象形 Pictogram',
    semanticRadical: '日',
    radicalMeaning: 'Sun',
    ancientOrigin: 'Ancient Oracle bone carving of the circular sun with a dark central sunspot (⊙), later squared into modern strokes.',
    mnemonic: 'A window framing the blazing square disc of the sun (日).',
    components: [
      { char: '日', role: 'semantic', explanation: 'Pictograph of the sun with central core' }
    ]
  },
  '月': {
    character: '月',
    pinyin: 'yuè',
    meaning: 'moon / month',
    category: 'pictogram',
    categoryLabel: '象形 Pictogram',
    semanticRadical: '月',
    radicalMeaning: 'Moon',
    ancientOrigin: 'Pictogram depicting the crescent moon with faint lunar Maria lines across its surface.',
    mnemonic: 'The gentle curve of a crescent moon (月) glowing in the night sky.',
    components: [
      { char: '月', role: 'semantic', explanation: 'Crescent moon pictogram' }
    ]
  },
  '山': {
    character: '山',
    pinyin: 'shān',
    meaning: 'mountain',
    category: 'pictogram',
    categoryLabel: '象形 Pictogram',
    semanticRadical: '山',
    radicalMeaning: 'Mountain',
    ancientOrigin: 'Draws three jagged mountain peaks rising from the ground plane with the highest peak in the center.',
    mnemonic: 'Three towering rocky peaks standing side-by-side make a mountain (山).',
    components: [
      { char: '山', role: 'semantic', explanation: 'Three peaks of a mountain range' }
    ]
  },
  '水': {
    character: '水',
    pinyin: 'shuǐ',
    meaning: 'water / river',
    category: 'pictogram',
    categoryLabel: '象形 Pictogram',
    semanticRadical: '水 (氵)',
    radicalMeaning: 'Water',
    ancientOrigin: 'Depicts a winding central river stream with scattered droplets of water splashing along both banks.',
    mnemonic: 'A rushing central current with water droplets splashing on both sides is water (水).',
    components: [
      { char: '水', role: 'semantic', explanation: 'Rushing stream with water droplets' }
    ]
  }
};

export function getEtymology(character: string): EtymologyEntry | null {
  if (!character) return null;
  const firstChar = character.trim()[0];
  return ETYMOLOGY_DATABASE[firstChar] || null;
}
