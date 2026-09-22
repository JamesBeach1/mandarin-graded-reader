import React, { useState } from 'react';
import { Mic, Square, Volume2, Sparkles, User, Bot, RotateCcw, Coffee, Car, Home, Hotel, CheckCircle } from 'lucide-react';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { AzureSpeechService } from '../services/azureSpeech';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface RoleplayPersona {
  id: string;
  name: string;
  chineseTitle: string;
  avatarIcon: string;
  location: string;
  hskLevel: string;
  mission: string;
  starterMessage: {
    chinese: string;
    pinyin: string;
    english: string;
  };
  suggestedPhrases: string[];
  systemPrompt: string;
  simulatedDialogTree: {
    keywords: string[];
    reply: string;
    pinyin: string;
    english: string;
  }[];
}

const ROLEPLAY_PERSONAS: RoleplayPersona[] = [
  {
    id: 'barista',
    name: 'Xiao Lin (小林)',
    chineseTitle: '精品咖啡师 • 小林',
    avatarIcon: '☕',
    location: '上海 • 静安区精品咖啡馆',
    hskLevel: 'HSK 2-3',
    mission: '点一杯燕麦奶拿铁，要求少冰无糖，并询问价格。',
    starterMessage: {
      chinese: '你好！欢迎光临墨韵咖啡，今天想喝点什么？我们有美式、拿铁和今天的日晒特调。',
      pinyin: 'Nǐ hǎo! Huānyíng guānglín Mòyùn kāfēi, jīntiān xiǎng hē diǎn shénme? Wǒmen yǒu měishì, nátiě hé jīntiān de rìshài tètiáo.',
      english: 'Hello! Welcome to Moyun Coffee. What would you like to drink today? We have Americano, Latte, and today\'s single-origin special.'
    },
    suggestedPhrases: [
      '我要一杯拿铁，换燕麦奶。',
      '请问可以做少冰无糖吗？',
      '一共多少钱？我可以扫码支付吗？'
    ],
    systemPrompt: `You are Xiao Lin, a warm, professional boutique coffee barista in Shanghai. Speak in friendly, spoken Simplified Chinese suitable for an HSK 2-3 learner. Keep sentences under 15 words. Respond naturally to their coffee order, ask clarifying questions about sweetness, temperature, and milk type if needed.`,
    simulatedDialogTree: [
      {
        keywords: ['拿铁', '美式', '咖啡', '燕麦奶', '喝'],
        reply: '好的！拿铁做大杯还是中杯？我们要加冰还是热的？可以帮您换燕麦奶。',
        pinyin: 'Hǎo de! Nátiě zuò dàbēi háishì zhōngbēi? Yào jiābīng háishì rè de? Kěyǐ bāng nín huàn yànmài nǎi.',
        english: 'Sure! Would you like a large or medium latte? Iced or hot? We can switch to oat milk for you.'
      },
      {
        keywords: ['少冰', '无糖', '微糖', '半糖', '去冰', '热'],
        reply: '没问题，少冰无糖已经帮您备注好了。请问您要在店里喝还是打包带走？',
        pinyin: 'Méi wèntí, shǎobīng wútáng yǐjīng bāng nín bèizhù hǎo le. Qǐngwèn nín yào zài diàn lǐ hē háishì dǎbāo dài zǒu?',
        english: 'No problem, less ice and no sugar noted! Will you be having it here or for takeaway?'
      },
      {
        keywords: ['多少钱', '买单', '扫码', '微信', '支付宝', '结账'],
        reply: '一共是二十八元。微信或支付宝扫这里都可以，稍等三分钟就好！',
        pinyin: 'Yígòng shì èrshíbā yuán. Wēixìn huò Zhīfùbǎo sǎo zhèlǐ dōu kěyǐ, shāoděng sān fēnzhōng jiù hǎo!',
        english: 'That will be 28 RMB in total. You can scan WeChat or Alipay right here, ready in 3 minutes!'
      },
      {
        keywords: ['谢谢', '好的', '打包', '堂食'],
        reply: '您的咖啡做好了，慢走，祝您今天心情愉快！',
        pinyin: 'Nín de kāfēi zuò hǎo le, màn zǒu, zhù nín jīntiān xīinqíng yúkuài!',
        english: 'Your coffee is ready. Take care, have a wonderful day!'
      }
    ]
  },
  {
    id: 'taxi_driver',
    name: 'Master Wang (老王)',
    chineseTitle: '热情老的哥 • 老王',
    avatarIcon: '🚕',
    location: '北京 • 首都国际机场三号航站楼',
    hskLevel: 'HSK 3-4',
    mission: '告诉司机去王府井酒店，询问路程时间，并请师傅靠边停车。',
    starterMessage: {
      chinese: '师傅！您好啊，上车请系好安全带。您这是打算去哪儿啊？',
      pinyin: 'Shīfu! Nín hǎo a, shàng chē qǐng jì hǎo ānquándài. Nín zhè shì dǎsuàn qù nǎr a?',
      english: 'Hello there! Please fasten your seatbelt. Where are we headed today?'
    },
    suggestedPhrases: [
      '师傅，去王府井希尔顿酒店。',
      '现在东三环堵车严重吗？大概要多久？',
      '前面路口请靠边停一下，谢谢。'
    ],
    systemPrompt: `You are Master Wang, a lively and humorous Beijing cab driver. You speak colloquial Northern Mandarin with occasional friendly Erhua. Keep responses under 2 sentences, engaging with the passenger about Beijing traffic, weather, and destinations.`,
    simulatedDialogTree: [
      {
        keywords: ['王府井', '酒店', '故宫', '天安门', '三里屯', '去'],
        reply: '好勒！王府井走机场高速直达，现在这个点儿稍微有点车多，大概四十分钟能到。',
        pinyin: 'Hǎo lei! Wángfǔjǐng zǒu jīchǎng gāosù zhídá, xiànzài zhè gè diǎnr shāowēi yǒudiǎn chē duō, dàgài sìshí fēnzhōng néng dào.',
        english: 'Alright! We take the Airport Expressway straight to Wangfujing. Traffic is a bit thick right now, should take about 40 minutes.'
      },
      {
        keywords: ['堵车', '多久', '时间', '快点', '急'],
        reply: '放心吧！咱前面绕二环路走，避开拥堵路段。您是第一次来北京旅游吗？',
        pinyin: 'Fàngxīn ba! Zán qiánmiàn rào èrhuán lù zǒu, bìkāi yōngdǔ lùduàn. Nín shì dì-yī cì lái Běijīng lǚyóu ma?',
        english: 'Don’t worry! We will take the 2nd Ring Road ahead to skirt the jam. Is this your first time visiting Beijing?'
      },
      {
        keywords: ['靠边', '停', '到了', '下车', '门口'],
        reply: '好，前面黄色实线不能停，我打个右转灯靠边给您停下。请拿好后排随身物品！',
        pinyin: 'Hǎo, qiánmiàn huángsè shíxiàn bù néng tíng, wǒ dǎ gè yòuzhuǎn dēng kàobiān gěi nín tíng xià. Qǐng ná hǎo hòupái suíshēn wùpǐn!',
        english: 'Okay, yellow line ahead means no stopping, I\'ll signal right and pull over for you. Please check the back seat for your belongings!'
      },
      {
        keywords: ['多少钱', '发票', '微信', '结账'],
        reply: '一共是一百一十五块，发票给您打出来了，祝您在北京玩得痛快！',
        pinyin: 'Yígòng shì yībǎi yīshíwǔ kuài, fāpiào gěi nín dǎ chūlái le, zhù nín zài Běijīng wán de tòngkuai!',
        english: 'Total is 115 RMB. Here is your receipt, have a fantastic time in Beijing!'
      }
    ]
  },
  {
    id: 'landlord',
    name: 'Auntie Zhang (张阿姨)',
    chineseTitle: '细心房东 • 张阿姨',
    avatarIcon: '🏢',
    location: '深圳 • 南山区科技园公寓',
    hskLevel: 'HSK 3-4',
    mission: '看房咨询：询问房租是否包含水电、押金方式以及周边交通。',
    starterMessage: {
      chinese: '小李你好啊，快请进！这就是咱们那套朝南的一居室，采光特别通透。你四处看看！',
      pinyin: 'Xiǎo Lǐ nǐ hǎo a, kuài qǐng jìn! Zhè jiù shì zánmen nà tào cháo nán de yī jū shì, cǎiguāng tèbié tōngtòu. Nǐ sìchù kànkan!',
      english: 'Hello! Come in, come in! This is our south-facing one-bedroom apartment, plenty of sunlight. Take a look around!'
    },
    suggestedPhrases: [
      '张阿姨，请问一个月房租多少钱？',
      '物业费和水电网络包含在房租里吗？',
      '付款方式是押一付三吗？什么时候可以入住？'
    ],
    systemPrompt: `You are Auntie Zhang, a warm, caring, and detail-oriented Chinese apartment landlord in Shenzhen. You speak courteous, clear Mandarin. Discuss monthly rent, deposit (押一付三), utility bills (水电物业), and nearby metro subway lines with prospective tenants.`,
    simulatedDialogTree: [
      {
        keywords: ['房租', '多少钱', '一个月', '便宜', '租金'],
        reply: '每月三千八，家电家具都是新的。要是你签一年合同，阿姨每个月给你少两百！',
        pinyin: 'Měi yuè sānqiān bā, jiādiàn jiājù dōu shì xīn de. Yàoshi nǐ qiān yī nián hétong, āyí měi gè yuè gěi nǐ shǎo liǎngbǎi!',
        english: 'It\'s 3800 RMB a month. All appliances and furniture are new. If you sign a one-year lease, I\'ll take 200 off each month!'
      },
      {
        keywords: ['水电', '网络', '物业', '网费', '包含'],
        reply: '物业费和宽带我来包，水费电费按民用标准自己网上交，非常划算方便。',
        pinyin: 'Wùyè fèi hé kuāndài wǒ lái bāo, shuǐfèi diànfèi àn mínyòng biāozhǔn zìjǐ wǎngshang jiāo, fēicháng huásuàn fāngbiàn.',
        english: 'I cover the property management and high-speed broadband. Water and electricity are standard residential rates paid via phone.'
      },
      {
        keywords: ['押金', '押一付三', '付款', '合同', '什么时候', '入住'],
        reply: '按惯例是押一付三。屋子阿姨昨天刚请人深度保洁过，你随时都可以搬进来住！',
        pinyin: 'Àn guànlì shì yā yī fù sān. Wūzi āyí zuótiān gāng qǐng rén shēndù bǎojié guò, nǐ suíshí dōu kěyǐ bān jìnlái zhù!',
        english: 'Customary standard is one month deposit, three months rent. The unit was deeply cleaned yesterday, you can move in anytime!'
      },
      {
        keywords: ['地铁', '交通', '超市', '周边', '方便'],
        reply: '楼下步行五分钟就是地铁一号线，旁边就是大超市和菜市场，生活特别方便。',
        pinyin: 'Lóu xià bùxíng wǔ fēnzhōng jiù shì dìtiě yī hào xiàn, pángbiān jiù shì dà chāoshì hé càishìchǎng, shēnghuó tèbié fāngbiàn.',
        english: 'Just a 5-minute walk downstairs to Metro Line 1, right next to a supermarket and fresh market.'
      }
    ]
  },
  {
    id: 'hotel_receptionist',
    name: 'Manager Chen (陈经理)',
    chineseTitle: '酒店前台 • 陈经理',
    avatarIcon: '🛎️',
    location: '成都 • 春熙路精品度假酒店',
    hskLevel: 'HSK 2-3',
    mission: '办理入住：出示护照/身份证，询问早餐时间和无线网络密码。',
    starterMessage: {
      chinese: '您好，欢迎光临墨韵精品酒店！请问您有预订吗？请出示一下您的证件。',
      pinyin: 'Nín hǎo, huānyíng guānglín Mòyùn jīngpǐn jiǔdiàn! Qǐngwèn nín yǒu yùdìng ma? Qǐng chūshì yíxià nín de zhèngjiàn.',
      english: 'Good day, welcome to Moyun Boutique Hotel! Do you have a reservation? Please show your identification or passport.'
    },
    suggestedPhrases: [
      '您好，我预订了一间大床房，名字叫David。',
      '请问明天早上早餐是几点到几点？',
      '房间里的无线网络WiFi密码是多少？'
    ],
    systemPrompt: `You are Manager Chen, a polite, hospitable 5-star hotel front desk receptionist in Chengdu. Speak courteous, crisp Mandarin. Guide guests through hotel check-in, breakfast buffet timings, Wi-Fi password, and elevator locations.`,
    simulatedDialogTree: [
      {
        keywords: ['预订', '名字', '大床房', '双人间', '身份证', '护照'],
        reply: '已查到您的预订信息。这是您的两张房卡，房间在八楼808号，电梯在右转直走。',
        pinyin: 'Yǐ chádào nín de yùdìng xìnxī. Zhè shì nín de liǎng zhāng fángkǎ, fángjiān zài bā lóu bābā líng hào, diàntī zài yòuzhuǎn zhízǒu.',
        english: 'Found your reservation! Here are two keycards for room 808 on the 8th floor. Elevators are down the hall to your right.'
      },
      {
        keywords: ['早餐', '吃饭', '餐厅', '时间', '几点'],
        reply: '早餐在二楼西餐厅，每天早晨七点到十点凭房卡用餐，中西式自助都有。',
        pinyin: 'Zǎocān zài èr lóu xī cāntīng, měitiān zǎochen qī diǎn dào shí diǎn píng fángkǎ yòngcān, zhōng-xī shì zìzhù dōu yǒu.',
        english: 'Breakfast is in the 2nd-floor restaurant from 7:00 AM to 10:00 AM with your keycard, Chinese and Western buffet.'
      },
      {
        keywords: ['网络', 'wifi', '密码', '网速'],
        reply: '全楼免费覆盖高速WiFi，网络名称是Moyun_Hotel，密码是您的房间号808。',
        pinyin: 'Quán lóu miǎnfèi fùgài gāosù WiFi, wǎngluò míngchēng shì Moyun_Hotel, mìmǎ shì nín de fángjiān hào bābā líng.',
        english: 'High-speed Wi-Fi covers the building. Network name is Moyun_Hotel, password is your room number 808.'
      },
      {
        keywords: ['退房', '行李', '寄放', '寄存', '退押金'],
        reply: '退房时间是中午十二点前。如果您想出去逛街，前台随时可以为您免费寄存行李。',
        pinyin: 'Tuìfáng shíjiān shì zhōngwǔ shí\'èr diǎn qián. Rúguǒ nín xiǎng chūqù guàngjiē, qiántái suíshí kěyǐ wèi nín miǎnfèi jìcún xíngli.',
        english: 'Checkout time is by 12:00 noon. If you wish to go sightseeing, we can store your luggage for free anytime.'
      }
    ]
  }
];

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  pinyin?: string;
  translation?: string;
}

export const ConversationalVoiceAgent: React.FC = () => {
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('barista');
  const activePersona = ROLEPLAY_PERSONAS.find(p => p.id === selectedPersonaId) || ROLEPLAY_PERSONAS[0];

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-msg',
      sender: 'agent',
      text: activePersona.starterMessage.chinese,
      pinyin: activePersona.starterMessage.pinyin,
      translation: activePersona.starterMessage.english
    }
  ]);

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeVoicePrompt, setActiveVoicePrompt] = useState('Press the microphone button to respond in Mandarin.');

  const handleSwitchPersona = (personaId: string) => {
    const next = ROLEPLAY_PERSONAS.find(p => p.id === personaId) || ROLEPLAY_PERSONAS[0];
    setSelectedPersonaId(personaId);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'agent',
        text: next.starterMessage.chinese,
        pinyin: next.starterMessage.pinyin,
        translation: next.starterMessage.english
      }
    ]);
    setActiveVoicePrompt('Persona switched. Press microphone to speak.');
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'agent',
        text: activePersona.starterMessage.chinese,
        pinyin: activePersona.starterMessage.pinyin,
        translation: activePersona.starterMessage.english
      }
    ]);
  };

  const handleStartListening = async () => {
    if (!SpeechRecognitionService.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setIsListening(true);
      setActiveVoicePrompt(`Listening to your Mandarin response for ${activePersona.name}...`);

      const result = await SpeechRecognitionService.listenOnce('zh-CN');
      setIsListening(false);

      if (!result.transcript || result.transcript.trim().length === 0) {
        setActiveVoicePrompt('No speech detected. Please press the mic and speak again.');
        return;
      }

      const userText = result.transcript.trim();
      const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: userText
      };
      setMessages(prev => [...prev, userMsg]);

      setIsProcessing(true);
      setActiveVoicePrompt(`${activePersona.name} is thinking...`);

      // Determine Agent Reply (Gemini online or Smart Offline Dialog Tree)
      let replyText = '';
      let replyPinyin = '';
      let replyTranslation = '';

      const apiKey = localStorage.getItem('gemini_api_key') || '';
      let usedGemini = false;

      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-3.1-flash-lite' });
          const prompt = `${activePersona.systemPrompt}
Current situation: ${activePersona.location}.
Mission target: ${activePersona.mission}.
The learner just said: "${userText}".
Respond directly in character with 1-2 spoken Simplified Chinese sentences.
Do NOT use markdown, pinyin, or English.`;

          const response = await model.generateContent(prompt);
          const raw = response.response.text().trim();
          if (raw && raw.length > 0) {
            replyText = raw;
            usedGemini = true;
          }
        } catch (err) {
          console.warn('Gemini generative dialogue fallback to offline tree:', err);
        }
      }

      // Offline keyword-driven multi-turn dialog tree fallback
      if (!usedGemini) {
        const lowerUser = userText.toLowerCase();
        const matched = activePersona.simulatedDialogTree.find(node =>
          node.keywords.some(k => lowerUser.includes(k.toLowerCase()))
        );

        if (matched) {
          replyText = matched.reply;
          replyPinyin = matched.pinyin;
          replyTranslation = matched.english;
        } else {
          replyText = `好的，我知道了！关于“${userText.slice(0, 6)}”，请您继续说。`;
          replyPinyin = 'Hǎo de, wǒ zhīdào le! Qǐng nín jìxù shuō.';
          replyTranslation = 'Understood! Please continue.';
        }
      }

      const agentMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: replyText,
        pinyin: replyPinyin || undefined,
        translation: replyTranslation || undefined
      };

      setMessages(prev => [...prev, agentMsg]);
      setIsProcessing(false);
      setActiveVoicePrompt('Spoken reply received. Press the mic to reply.');

      // Synthesize spoken agent reply
      AzureSpeechService.speak(replyText, 0.95);
    } catch (err) {
      console.error('Roleplay voice agent error:', err);
      setIsListening(false);
      setIsProcessing(false);
      setActiveVoicePrompt('Could not recognize speech. Please verify microphone permissions.');
    }
  };

  const handleSpeakMessage = (text: string) => {
    AzureSpeechService.speak(text, 0.95);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Persona Selection Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {ROLEPLAY_PERSONAS.map(p => {
          const isSelected = p.id === activePersona.id;
          return (
            <div
              key={p.id}
              onClick={() => handleSwitchPersona(p.id)}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: isSelected ? '2px solid var(--accent-bamboo)' : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'var(--bg-secondary)' : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '24px' }}>{p.avatarIcon}</span>
                <span style={{ fontSize: '11px', fontWeight: 600, background: 'var(--bg-base)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  {p.hskLevel}
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                {p.chineseTitle}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {p.location}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Scenario Mission Banner */}
      <div style={{ padding: '12px 16px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎯 Practice Mission
          </span>
          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: 'var(--text-primary)' }}>
            {activePersona.mission}
          </p>
        </div>
        <button
          onClick={handleResetChat}
          className="btn btn-secondary"
          style={{ padding: '4px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="Restart scenario from beginning"
        >
          <RotateCcw size={12} /> Restart Dialogue
        </button>
      </div>

      {/* Voice Stream Chat Container */}
      <div className="voice-agent-container" style={{ minHeight: '380px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>{activePersona.avatarIcon}</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                {activePersona.chineseTitle}
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {isProcessing ? 'Thinking...' : isListening ? 'Listening to your voice...' : 'Online & Ready'}
              </span>
            </div>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ALS-009 Situational AI
          </span>
        </div>

        {/* Message Stream */}
        <div className="voice-stream-messages" style={{ minHeight: '240px', maxHeight: '380px', overflowY: 'auto' }}>
          {messages.map(msg => (
            <div key={msg.id} className={`voice-bubble ${msg.sender}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', opacity: 0.8, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {msg.sender === 'user' ? <User size={12} /> : <span>{activePersona.avatarIcon}</span>}
                  {msg.sender === 'user' ? 'You (Learner)' : activePersona.name}
                </span>
                <button
                  onClick={() => handleSpeakMessage(msg.text)}
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', opacity: 0.8 }}
                  title="Listen to pronunciation"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <div style={{ fontFamily: 'var(--font-serif-zh)', fontSize: '16px', lineHeight: 1.6 }}>
                {msg.text}
              </div>
              {msg.pinyin && (
                <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '4px', color: 'var(--accent-gold)' }}>
                  {msg.pinyin}
                </div>
              )}
              {msg.translation && (
                <div style={{ fontSize: '12px', opacity: 0.85, marginTop: '4px', fontStyle: 'italic' }}>
                  {msg.translation}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Suggested Response Chips */}
        <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-base)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
            💡 Suggested Replies (Speak or Read Aloud):
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {activePersona.suggestedPhrases.map((phrase, idx) => (
              <button
                key={idx}
                onClick={() => handleSpeakMessage(phrase)}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-serif-zh)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title="Click to hear native pronunciation before speaking"
              >
                <Volume2 size={11} /> {phrase}
              </button>
            ))}
          </div>
        </div>

        {/* Push-to-Talk Recording Bar */}
        <div className="ptt-control-bar" style={{ padding: '14px 0 8px 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={isListening ? () => SpeechRecognitionService.stop() : handleStartListening}
              className={`ptt-button ${isListening ? 'recording' : ''}`}
              disabled={isProcessing}
              title={isListening ? 'Stop recording' : 'Click to speak in Mandarin'}
            >
              {isListening ? <Square size={24} /> : <Mic size={26} />}
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {activeVoicePrompt}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
