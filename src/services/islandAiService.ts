import { generateGeminiText, getPreferredGeminiModel } from './gemini';
import { StorageService, STORAGE_KEYS } from './storage';
import type { TranscriptAnalysisResult } from '../types/Island';

export interface TranslatedIslandSentence {
  english: string;
  chinese: string;
  pinyin: string;
  notes?: string;
  hskLevel?: number;
}

export class IslandAiService {
  /**
   * Translates English text to Chinese using the free Google Translate web endpoint.
   * Zero API keys, zero quota credits consumed, and returns in ~150ms.
   */
  public static async translateWithFreeGoogle(
    englishSentences: string[],
    hanziData: any[] = []
  ): Promise<TranslatedIslandSentence[]> {
    const results: TranslatedIslandSentence[] = [];

    for (const eng of englishSentences) {
      const trimmed = eng.trim();
      if (!trimmed) continue;

      try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(trimmed)}`;
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Google Translate responded with ${res.status}`);
        }
        const data = await res.json();
        // data[0] is array of translated segments: [[chinese, english, ...], ...]
        let chinese = '';
        if (Array.isArray(data) && Array.isArray(data[0])) {
          chinese = data[0].map((seg: any) => seg[0]).join('').trim();
        }

        // Derive tone-marked Pinyin by matching characters against loaded hanziData
        let pinyinStr = '';
        if (chinese) {
          const pinyinParts: string[] = [];
          for (const char of chinese) {
            if (/[\u4E00-\u9FFF]/.test(char)) {
              const match = hanziData.find((h: any) => h.character === char);
              pinyinParts.push(match?.pinyin || char);
            } else {
              pinyinParts.push(char);
            }
          }
          pinyinStr = pinyinParts.join(' ').replace(/\s+([，。！？,.!?])/g, '$1');
        }

        results.push({
          english: trimmed,
          chinese: chinese || trimmed,
          pinyin: pinyinStr,
          notes: '⚡ Fast Free Translation (Google Engine)',
          hskLevel: 2
        });
      } catch (err) {
        console.warn(`Free Google Translate failed for "${trimmed}", falling back:`, err);
        results.push({
          english: trimmed,
          chinese: trimmed,
          pinyin: '',
          notes: 'Translation failed',
          hskLevel: 1
        });
      }
    }

    return results;
  }

  /**
   * Translates raw English thoughts/dictation into authentic, spoken Simplified Mandarin sentences.
   * Supports both 'gemini' (colloquial with grammar notes) and 'google' (instant, free, zero-quota).
   */
  public static async translateToSpokenMandarin(
    englishSentences: string[],
    topicContext: string = 'Daily Life',
    engine: 'gemini' | 'google' = 'gemini',
    hanziData: any[] = [],
    providedApiKey?: string
  ): Promise<TranslatedIslandSentence[]> {
    if (engine === 'google') {
      return this.translateWithFreeGoogle(englishSentences, hanziData);
    }

    const apiKey = providedApiKey || StorageService.getItem(STORAGE_KEYS.GEMINI_API_KEY);

    if (!apiKey) {
      // If no Gemini key is provided, automatically fallback to free Google Translate
      return this.translateWithFreeGoogle(englishSentences, hanziData);
    }

    const sentencesNumbered = englishSentences
      .filter(s => s.trim().length > 0)
      .map((s, idx) => `${idx + 1}. "${s.trim()}"`)
      .join('\n');

    const prompt = `You are a native Mandarin linguist specializing in conversational fluency and "Language Islands".
The user has captured these everyday personal English sentences from their life (Topic context: ${topicContext}):

${sentencesNumbered}

Translate each sentence into authentic, modern, natural spoken Simplified Chinese as a native speaker in Beijing or Shanghai would actually say in real conversation (NOT stiff, unnatural textbook Chinese).

Output strictly valid JSON with this exact array schema (no markdown fences, raw JSON only):
[
  {
    "english": "Exact English input sentence",
    "chinese": "Natural spoken Simplified Chinese translation",
    "pinyin": "Tone-marked Pinyin (e.g. Wǒ jīntiān zǎoshang...)",
    "notes": "Short concise 3-8 word breakdown of the key colloquial pattern or structure (e.g. '打算 = plan to; 把 structure')",
    "hskLevel": 2
  }
]`;

    try {
      const preferredModel = StorageService.getItem(STORAGE_KEYS.GEMINI_MODEL, 'gemini-2.5-flash');
      const rawText = await generateGeminiText(apiKey, prompt, preferredModel);
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (err) {
      console.warn('IslandAiService Gemini translation failed, attempting free Google Translate fallback:', err);
      return this.translateWithFreeGoogle(englishSentences, hanziData);
    }

    throw new Error('Failed to parse AI translation output.');
  }

  /**
   * Analyzes a raw video/podcast transcript to extract:
   * 1. Key conversational sentence islands
   * 2. High-impact vocabulary
   * 3. Comprehension readiness index (Pre-Input Comprehension)
   */
  public static async analyzeTranscriptForPreStudy(
    transcriptText: string,
    providedApiKey?: string
  ): Promise<TranscriptAnalysisResult> {
    const apiKey = providedApiKey || StorageService.getItem(STORAGE_KEYS.GEMINI_API_KEY);

    if (!apiKey) {
      throw new Error('Gemini API key is required for transcript pre-study analysis.');
    }

    // Limit length to ~6,000 characters for token speed
    const truncatedText = transcriptText.slice(0, 6000);

    const prompt = `You are a master language coach implementing "Pre-Input Comprehension" (studying transcripts before consuming native media).
Analyze this native Chinese or bilingual transcript:

"""
${truncatedText}
"""

Perform a deep linguistic extraction:
1. Extract 5-10 of the most reusable, conversational sentences that the learner should acquire as a "Language Island".
2. Extract 8-15 core vocabulary words that unlock the biggest chunk of comprehension.
3. Estimate the comprehension readiness percentage (e.g. 75-90) that a learner will achieve after pre-studying these items.
4. Provide a 1-sentence summary of the transcript.

Return strictly raw JSON with this exact schema (no markdown fences):
{
  "title": "Short descriptive topic title (e.g. Tech Talk Podcast / Street Food Vlog)",
  "summary": "1-sentence summary of what the audio/video discusses",
  "estimatedReadinessPercent": 82,
  "extractedSentences": [
    {
      "english": "Natural English translation",
      "chinese": "Simplified Chinese sentence from or based on transcript",
      "pinyin": "Tone-marked Pinyin",
      "notes": "Core grammar pattern or idiom"
    }
  ],
  "keyVocabulary": [
    {
      "chinese": "生词",
      "pinyin": "shēngcí",
      "english": "New/unfamiliar word",
      "hskLevel": 4,
      "contextSentence": "Short example phrase"
    }
  ]
}`;

    try {
      const preferredModel = getPreferredGeminiModel();
      const rawText = await generateGeminiText(apiKey, prompt, preferredModel);
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      return {
        title: parsed.title || 'Native Media Transcript Island',
        rawTranscript: transcriptText,
        extractedSentences: parsed.extractedSentences || [],
        keyVocabulary: parsed.keyVocabulary || [],
        estimatedReadinessPercent: parsed.estimatedReadinessPercent || 80,
        summary: parsed.summary || 'Transcript pre-study breakdown.'
      };
    } catch (err) {
      console.error('Transcript pre-study extraction failed:', err);
      throw err;
    }
  }

  /**
   * Generates a coherent batch of realistic, down-to-earth spoken sentences for a specific life scenario.
   * Strictly constrained against fantasy, whimsical stories, poetry, and dramatic LLM stereotypes.
   */
  public static async generateRealisticScenarioIsland(
    scenarioPrompt: string,
    options: {
      count?: number;
      category?: string;
      hskLevel?: string | number;
      apiKey?: string;
      hanziData?: any[];
    } = {}
  ): Promise<RealisticScenarioGenerationResult> {
    const { count = 8, category = 'Daily Life', hskLevel = 'HSK 2-3', hanziData = [] } = options;
    const apiKey = options.apiKey || StorageService.getItem(STORAGE_KEYS.GEMINI_API_KEY);

    // If no API key, check offline curated scenarios or generate via free Google fallback
    if (!apiKey) {
      const lower = scenarioPrompt.toLowerCase();
      if (lower.includes('dentist') || lower.includes('teeth') || lower.includes('tooth') || lower.includes('牙')) {
        return OFFLINE_REALISTIC_SCENARIOS.dentist;
      }
      if (lower.includes('landlord') || lower.includes('apartment') || lower.includes('rent') || lower.includes('drain') || lower.includes('房东')) {
        return OFFLINE_REALISTIC_SCENARIOS.landlord;
      }
      if (lower.includes('cat') || lower.includes('dog') || lower.includes('pet') || lower.includes('vet') || lower.includes('猫') || lower.includes('狗') || lower.includes('宠物')) {
        return OFFLINE_REALISTIC_SCENARIOS.vet;
      }
      if (lower.includes('bubble tea') || lower.includes('tea') || lower.includes('coffee') || lower.includes('order') || lower.includes('restaurant') || lower.includes('奶茶') || lower.includes('点餐')) {
        return OFFLINE_REALISTIC_SCENARIOS.boba_food;
      }

      const fallbackEnglish = [
        `Excuse me, could you please help me with this?`,
        `I would like to ask about the price and options.`,
        `Could you please explain how this works?`,
        `Is there any problem or delay with this?`,
        `I will be here around tomorrow afternoon.`,
        `Can I scan a QR code to pay for this?`,
        `Could you please give me a receipt?`,
        `Thank you so much for your help today.`
      ].slice(0, count);

      const translated = await this.translateWithFreeGoogle(fallbackEnglish, hanziData);
      return {
        suggestedTitle: scenarioPrompt,
        suggestedChineseTitle: '实用日常场景表达',
        suggestedDescription: `Realistic spoken phrases for "${scenarioPrompt}".`,
        sentences: translated
      };
    }

    const prompt = `You are a native Mandarin linguist specializing in practical spoken communication and "Language Islands".
A language learner needs a realistic, cohesive set of spoken Mandarin sentences for this specific real-world life situation:
Scenario: "${scenarioPrompt}"
Category: "${category}"
Target Level: "${hskLevel}"
Target Count: ${count} sentences

CRITICAL CONSTRAINTS (MANDATORY):
1. STRICTLY REALISTIC & DOWN-TO-EARTH: Every sentence must be something a real human living in modern China (e.g., Beijing, Shanghai, Chengdu, Taipei) would actually say in everyday life.
2. ZERO FANTASY / ZERO WHIMSY / ZERO DRAMA: Absolutely no dragons, magical quests, philosophical poetry, romantic melodrama, or fairy tales. Mundane is great! Real life is king.
3. AUTHENTIC SPOKEN COLLOQUIAL REGISTER: Use modern spoken Chinese with real speech particles and politeness patterns (e.g. 不好意思, 麻烦您, 稍微等一下, 帮我..., 请问, 扫码, 微信, 支付宝, 能不能). Do NOT use stiff, robotic textbook Chinese.
4. BALANCED CONVERSATIONAL COVERAGE: Provide a practical variety:
   - Initial questions or opening requests
   - Specific details, symptoms, preferences, or minor issues
   - Wrap-up, payment, receipt, or parting sentences

Output strictly valid JSON with this exact schema (no markdown fences, raw JSON only):
{
  "suggestedTitle": "Concise English title (e.g. Visiting the Dentist)",
  "suggestedChineseTitle": "Concise Chinese title (e.g. 看牙医与就诊检查)",
  "suggestedDescription": "1-sentence summary of the scenario context",
  "sentences": [
    {
      "english": "Natural, clear English sentence",
      "chinese": "Natural spoken Simplified Chinese (under 18 characters)",
      "pinyin": "Tone-marked Pinyin (e.g. Qǐngwèn zhège néng dǎzhé ma?)",
      "notes": "Concise 3-8 word practical grammar or vocabulary tip (e.g. '打折 = discount; 能...吗 = can I...')",
      "hskLevel": 2
    }
  ]
}`;

    try {
      const preferredModel = getPreferredGeminiModel();
      const rawText = await generateGeminiText(apiKey, prompt, preferredModel);
      const cleanJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (parsed && Array.isArray(parsed.sentences) && parsed.sentences.length > 0) {
        return {
          suggestedTitle: parsed.suggestedTitle || scenarioPrompt,
          suggestedChineseTitle: parsed.suggestedChineseTitle || '生活场景日常表达',
          suggestedDescription: parsed.suggestedDescription || `Realistic conversational sentences for ${scenarioPrompt}.`,
          sentences: parsed.sentences
        };
      }
    } catch (err) {
      console.warn('Gemini realistic scenario generation failed, using offline fallback:', err);
    }

    return OFFLINE_REALISTIC_SCENARIOS.dentist;
  }
}

export interface RealisticScenarioGenerationResult {
  suggestedTitle: string;
  suggestedChineseTitle: string;
  suggestedDescription: string;
  sentences: TranslatedIslandSentence[];
}

export const OFFLINE_REALISTIC_SCENARIOS: Record<string, RealisticScenarioGenerationResult> = {
  dentist: {
    suggestedTitle: 'Visiting the Dentist & Clinic',
    suggestedChineseTitle: '看牙医与就诊检查',
    suggestedDescription: 'Everyday dialogue for tooth pain, cleanings, cavities, and doctor consultation.',
    sentences: [
      {
        english: "Excuse me, my left tooth started aching a couple days ago.",
        chinese: "不好意思，我前几天开始左边牙齿有点酸痛。",
        pinyin: "Bù hǎoyìsi, wǒ qián jǐ tiān kāishǐ zuǒbian yáchǐ yǒudiǎn suāntòng.",
        notes: "不好意思 = excuse me; 酸痛 = sore/aching",
        hskLevel: 2
      },
      {
        english: "Especially when drinking ice water or eating sweets, it's very noticeable.",
        chinese: "特别是喝冰水或者吃甜食的时候，感觉特别明显。",
        pinyin: "Tèbié shì hē bīngshuǐ huòzhě chī tiánshí de shíhou, gǎnjué tèbié míngxiǎn.",
        notes: "特别是 = especially; 明显 = noticeable",
        hskLevel: 3
      },
      {
        english: "Could you take an X-ray of my teeth to check today?",
        chinese: "请问今天可以帮我拍个牙片检查一下吗？",
        pinyin: "Qǐngwèn jīntiān kěyǐ bāng wǒ pāi ge yápiàn jiǎnchá yíxià ma?",
        notes: "拍片 = take X-ray; 一下 = softening action",
        hskLevel: 3
      },
      {
        english: "Do I need a root canal or is a filling enough?",
        chinese: "请问需要做根管治疗还是补牙就可以了？",
        pinyin: "Qǐngwèn xūyào zuò gēnguǎn zhìliáo háishì bǔyá jiù kěyǐ le?",
        notes: "根管治疗 = root canal; 补牙 = filling",
        hskLevel: 4
      },
      {
        english: "How long does a filling take? Will you use local anesthesia?",
        chinese: "补牙大概需要多长时间？会打麻药吗？",
        pinyin: "Bǔyá dàgài xūyào duō cháng shíjiān? Huì dǎ máyào ma?",
        notes: "大概 = approximately; 麻药 = anesthesia",
        hskLevel: 3
      },
      {
        english: "Doctor, is there anything I should avoid eating over the next few days?",
        chinese: "医生，请问接下来几天有什么忌口或者需要注意的吗？",
        pinyin: "Yīshēng, qǐngwèn jiē xiàlái jǐ tiān yǒu shénme jìkǒu huòzhě xūyào zhùyì de ma?",
        notes: "忌口 = dietary restriction; 注意 = pay attention to",
        hskLevel: 3
      },
      {
        english: "How much is it in total? Can I scan WeChat to pay?",
        chinese: "一共多少钱？我可以微信扫码支付吗？",
        pinyin: "Yígòng duōshao qián? Wǒ kěyǐ Wēixìn sǎomǎ zhīfù ma?",
        notes: "一共 = in total; 扫码支付 = scan QR to pay",
        hskLevel: 2
      },
      {
        english: "Could you please give me the receipt and itemized bill, thank you.",
        chinese: "麻烦您帮我开一下发票和明细单，谢谢。",
        pinyin: "Máfán nín bāng wǒ kāi yíxià fāpiào hé míngxìdān, xièxie.",
        notes: "麻烦您 = politeness softener; 发票 = tax receipt",
        hskLevel: 3
      }
    ]
  },
  landlord: {
    suggestedTitle: 'Apartment Maintenance & Landlord',
    suggestedChineseTitle: '房屋维修与房东沟通',
    suggestedDescription: 'Practical phrases for clogged drains, broken appliances, rent, and lease renewal.',
    sentences: [
      {
        english: "Hello landlord, the bathroom drain seems clogged and drains very slowly.",
        chinese: "房东您好，洗手间的下水道好像有点堵，下水很慢。",
        pinyin: "Fángdōng nín hǎo, xǐshǒujiān de xiàshuǐdào hǎoxiàng yǒudiǎn dǔ, xiàshuǐ hěn màn.",
        notes: "下水道 = drain/sewer; 堵 = clogged",
        hskLevel: 3
      },
      {
        english: "The living room AC isn't cooling after an hour, it might need Freon.",
        chinese: "客厅的空调开了一个小时都不制冷，可能需要加氟利昂了。",
        pinyin: "Kètīng de kōngtiáo kāi le yí ge xiǎoshí dōu bù zhìlěng, kěnéng xūyào jiā fúlì'áng le.",
        notes: "制冷 = cool/refrigerate; 氟利昂 = Freon",
        hskLevel: 3
      },
      {
        english: "Would it be convenient for you to arrange a technician to come take a look?",
        chinese: "请问您方便安排师傅过来检修一下吗？",
        pinyin: "Qǐngwèn nín fāngbiàn ānpái shīfu guòlai jiǎnxiū yíxià ma?",
        notes: "师傅 = technician/master; 检修 = inspect/repair",
        hskLevel: 3
      },
      {
        english: "Around what date are water and electric bills due each month?",
        chinese: "请问水费和电费每个月大概几号交？",
        pinyin: "Qǐngwèn shuǐfèi hé diànfèi měi ge yuè dàgài jǐ hào jiāo?",
        notes: "水费/电费 = utility bills; 交 = pay",
        hskLevel: 2
      },
      {
        english: "I plan to renew the lease for another year, is the rent the same as last year?",
        chinese: "我打算续签一年的租房合同，请问房租还是和去年一样吗？",
        pinyin: "Wǒ dǎsuàn xùqiān yì nián de zūfáng hétong, qǐngwèn fángzū háishì hé qùnián yíyàng ma?",
        notes: "续签 = renew; 合同 = contract; 房租 = rent",
        hskLevel: 3
      },
      {
        english: "Around how many working days after moving out will the deposit be refunded?",
        chinese: "押金大概在退房后几个工作日内能退回？",
        pinyin: "Yājīn dàgài zài tuìfáng hòu jǐ ge gōngzuòrì nèi néng tuìhuí?",
        notes: "押金 = deposit; 工作日 = business days",
        hskLevel: 3
      }
    ]
  },
  vet: {
    suggestedTitle: 'Vet Clinic & Pet Care',
    suggestedChineseTitle: '带宠物去医院看病',
    suggestedDescription: 'Conversational phrases for sick pets, medication, symptoms, and veterinarian advice.',
    sentences: [
      {
        english: "Hello doctor, my cat hasn't had much appetite these past two days.",
        chinese: "医生您好，我家猫咪这两天食欲不太好，不怎么吃东西。",
        pinyin: "Yīshēng nín hǎo, wǒ jiā māomī zhè liǎng tiān shíyù bú tài hǎo, bù zěnme chī dōngxi.",
        notes: "食欲 = appetite; 不怎么 = barely/not much",
        hskLevel: 3
      },
      {
        english: "She's a bit lethargic and seems to have vomited yellow fluid twice.",
        chinese: "它精神有点蔫，而且刚才好像吐了两次黄水。",
        pinyin: "Tā jīngshén yǒudiǎn niān, érqiě gāngcái hǎoxiàng tù le liǎng cì huángshuǐ.",
        notes: "蔫 = listless/droopy; 呕吐 = vomit",
        hskLevel: 3
      },
      {
        english: "Do we need to do a routine blood test and ultrasound first?",
        chinese: "请问需要先做个血常规和B超检查吗？",
        pinyin: "Qǐngwèn xūyào xiān zuò ge xuèchángguī hé B-chāo jiǎnchá ma?",
        notes: "血常规 = routine blood work; B超 = ultrasound",
        hskLevel: 4
      },
      {
        english: "Is this medicine taken twice a day? Should it be mixed into canned food?",
        chinese: "这个药是一天吃两次吗？需要混在罐头里喂吗？",
        pinyin: "Zhè ge yào shì yì tiān chī liǎng cì ma? Xūyào hùn zài guàntou lǐ wèi ma?",
        notes: "混 = mix; 罐头 = canned pet food; 喂 = feed",
        hskLevel: 3
      },
      {
        english: "If she refuses to drink water, does she need to stay for an IV drip?",
        chinese: "如果它一直不肯喝水，需要留院输液吗？",
        pinyin: "Rúguǒ tā yìzhí bù kěn hē shuǐ, xūyào liúyuàn shūyè ma?",
        notes: "留院 = stay at clinic; 输液 = IV drip",
        hskLevel: 4
      },
      {
        english: "Around when should I bring her back for a follow-up check?",
        chinese: "请问大概什么时候需要带它回来复查？",
        pinyin: "Qǐngwèn dàgài shénme shíhou xūyào dài tā huílái fùchá?",
        notes: "复查 = re-examination/follow-up",
        hskLevel: 3
      }
    ]
  },
  boba_food: {
    suggestedTitle: 'Ordering Drinks & Food Customization',
    suggestedChineseTitle: '点单定制与日常餐饮',
    suggestedDescription: 'Practical spoken phrases for ice, sweetness, allergies, takeout, and splitting bills.',
    sentences: [
      {
        english: "Hello, I'd like a large Black Tea Latte with 30% sugar and light ice.",
        chinese: "你好，我要一杯大杯红茶拿铁，微糖少冰。",
        pinyin: "Nǐ hǎo, wǒ yào yì bēi dàbēi hóngchá nátiě, wēitáng shǎobīng.",
        notes: "微糖 = 30% sweetness; 少冰 = light ice",
        hskLevel: 2
      },
      {
        english: "Can the milk be switched to oat milk? Does adding boba cost extra?",
        chinese: "请问可以换成燕麦奶吗？加波霸要另外加钱吗？",
        pinyin: "Qǐngwèn kěyǐ huànchéng yànmài nǎi ma? Jiā bōbà yào lìngwài jiāqián ma?",
        notes: "燕麦奶 = oat milk; 另外 = additionally",
        hskLevel: 3
      },
      {
        english: "Can this dish be made without cilantro? I'm allergic to peanuts.",
        chinese: "这道菜可以不放香菜吗？我对花生过敏。",
        pinyin: "Zhè dào cài kěyǐ bú fàng xiāngcài ma? Wǒ duì huāshēng guòmǐn.",
        notes: "香菜 = cilantro; 对...过敏 = allergic to",
        hskLevel: 3
      },
      {
        english: "Could you please give us two extra pairs of chopsticks and a small bowl?",
        chinese: "麻烦帮我们拿两双筷子和一个小碗，谢谢。",
        pinyin: "Máfán bāng wǒmen ná liǎng shuāng kuàizi hé yí ge xiǎowǎn, xièxie.",
        notes: "双 = pair (measure word for chopsticks)",
        hskLevel: 2
      },
      {
        english: "Could you please pack up these leftovers for me?",
        chinese: "麻烦帮我把剩下的这些菜打包一下，拿个打包盒。",
        pinyin: "Máfán bāng wǒ bǎ shèngxià de zhèxiē cài dǎbāo yíxià, ná ge dǎbāohé.",
        notes: "打包 = pack leftovers/takeaway; 把 structure",
        hskLevel: 3
      }
    ]
  }
};
