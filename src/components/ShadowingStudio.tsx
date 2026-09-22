import React, { useState, useRef, useEffect } from 'react';
import { Volume2, Mic, Play, Square, Plus, Trash2, BookOpen, Sparkles, Filter } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

export interface ShadowingPrompt {
  id: string;
  chinese: string;
  pinyin?: string;
  english: string;
  hskLevel: number;
  category: string;
  isCustom?: boolean;
}

const BUILTIN_SHADOWING_PROMPTS: ShadowingPrompt[] = [
  // HSK 1
  {
    id: 'hsk1-1',
    chinese: '很高兴认识你。',
    pinyin: 'Hěn gāoxìng rènshi nǐ.',
    english: 'Very pleased to meet you.',
    hskLevel: 1,
    category: 'Greetings'
  },
  {
    id: 'hsk1-2',
    chinese: '请问，这个多少钱？',
    pinyin: 'Qǐngwèn, zhège duōshao qián?',
    english: 'Excuse me, how much is this?',
    hskLevel: 1,
    category: 'Shopping'
  },
  {
    id: 'hsk1-3',
    chinese: '我想喝一杯冰水。',
    pinyin: 'Wǒ xiǎng hē yībēi bīng shuǐ.',
    english: 'I would like to drink a glass of ice water.',
    hskLevel: 1,
    category: 'Dining'
  },

  // HSK 2
  {
    id: 'hsk2-1',
    chinese: '我想喝一杯冰咖啡。',
    pinyin: 'Wǒ xiǎng hē yībēi bīng kāfēi.',
    english: 'I would like to drink a glass of iced coffee.',
    hskLevel: 2,
    category: 'Dining'
  },
  {
    id: 'hsk2-2',
    chinese: '从这里到火车站怎么走？',
    pinyin: 'Cóng zhèlǐ dào huǒchēzhàn zěnme zǒu?',
    english: 'How do I get to the train station from here?',
    hskLevel: 2,
    category: 'Travel'
  },
  {
    id: 'hsk2-3',
    chinese: '今天天气非常晴朗，我们去公园散步吧。',
    pinyin: 'Jīntiān tiānqì fēicháng qínglǎng, wǒmen qù gōngyuán sànbù ba.',
    english: 'The weather is very sunny today, let us go for a walk in the park.',
    hskLevel: 2,
    category: 'Daily Life'
  },

  // HSK 3
  {
    id: 'hsk3-1',
    chinese: '虽然今天下雨，但是我还要去图书馆。',
    pinyin: 'Suīrán jīntiān xiàyǔ, dànshì wǒ hái yào qù túshūguǎn.',
    english: 'Although it is raining today, I still want to go to the library.',
    hskLevel: 3,
    category: 'Daily Life'
  },
  {
    id: 'hsk3-2',
    chinese: '除了汉语以外，他还打算学习西班牙语。',
    pinyin: 'Chúle Hànyǔ yǐwài, tā hái dǎsuàn xuéxí Xībānyáyǔ.',
    english: 'Besides Chinese, he also plans to learn Spanish.',
    hskLevel: 3,
    category: 'Education'
  },
  {
    id: 'hsk3-3',
    chinese: '把窗户打开，让新鲜空气流进来。',
    pinyin: 'Bǎ chuānghu dǎkāi, ràng xīnxiān kōngqì liú jìnlái.',
    english: 'Open the window to let fresh air flow inside.',
    hskLevel: 3,
    category: 'Home'
  },

  // HSK 4
  {
    id: 'hsk4-1',
    chinese: '不管遇到什么困难，我们都要坚持下去。',
    pinyin: 'Bùguǎn yù dào shénme kùnnan, wǒmen dōu yào jiānchí xiàqù.',
    english: 'No matter what difficulties we encounter, we must persist.',
    hskLevel: 4,
    category: 'Mindset'
  },
  {
    id: 'hsk4-2',
    chinese: '阅读不仅能丰富知识，还能培养思考能力。',
    pinyin: 'Yuèdú bùjǐn néng fēngfù zhīshi, hái néng péiyǎng sīkǎo nénglì.',
    english: 'Reading not only enriches knowledge, but also nurtures thinking skills.',
    hskLevel: 4,
    category: 'Education'
  },
  {
    id: 'hsk4-3',
    chinese: '只要双方坦诚交流，许多误会就能迎刃而解。',
    pinyin: 'Zhǐyào shuāngfāng tǎnchéng jiāoliú, xǔduō wùhuì jiù néng yíngrèn\'érjiě.',
    english: 'As long as both parties communicate candidly, many misunderstandings can be resolved smoothly.',
    hskLevel: 4,
    category: 'Work & Life'
  },

  // HSK 5
  {
    id: 'hsk5-1',
    chinese: '在快节奏的现代生活中，保持内心的从容显得尤为宝贵。',
    pinyin: 'Zài kuàijièzòu de xiàndài shēnghuó zhōng, bǎochí nèixīn de cóngróng xiǎnde yóuwéi bǎoguì.',
    english: 'In fast-paced modern life, maintaining inner composure proves exceptionally precious.',
    hskLevel: 5,
    category: 'Philosophy'
  },
  {
    id: 'hsk5-2',
    chinese: '这项创新技术不仅提高了生产效率，也减少了资源浪费。',
    pinyin: 'Zhè xiàng chuàngxīn jìshù bùjǐn tígāo le shēngchǎn xiàolǜ, yě jiǎnshǎo le zīyuán làngfèi.',
    english: 'This innovative technology not only improved production efficiency, but also reduced resource waste.',
    hskLevel: 5,
    category: 'Business'
  },

  // HSK 6
  {
    id: 'hsk6-1',
    chinese: '落霞与孤鹜齐飞，秋水共长天一色。',
    pinyin: 'Luò xiá yǔ gū wù qí fēi, qiū shuǐ gòng cháng tiān yí sè.',
    english: 'Sunset clouds fly with the solitary wild duck; autumn water merges into the boundless sky.',
    hskLevel: 6,
    category: 'Literature'
  },
  {
    id: 'hsk6-2',
    chinese: '学术研究贵在精益求精，切忌浅尝辄止与浮躁求成。',
    pinyin: 'Xuéshù yánjiū guì zài jīngyìqiújīng, qièjì qiǎnchángzhézhǐ yǔ fúzào qiúchéng.',
    english: 'Scholarly research values constant striving for perfection; avoid stopping at superficial glances and seeking rash results.',
    hskLevel: 6,
    category: 'Academia'
  }
];

export const ShadowingStudio: React.FC = () => {
  const [customPrompts, setCustomPrompts] = useState<ShadowingPrompt[]>(() => {
    try {
      const saved = localStorage.getItem('custom_shadowing_prompts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPrompts = [...BUILTIN_SHADOWING_PROMPTS, ...customPrompts];
  const [selectedPrompt, setSelectedPrompt] = useState<ShadowingPrompt>(allPrompts[0]);
  const [levelFilter, setLevelFilter] = useState<number | 'all' | 'custom'>('all');

  // Recording & Playback state
  const [isRecording, setIsRecording] = useState(false);
  const [userAudioUrl, setUserAudioUrl] = useState<string | null>(null);
  const [isPlayingDual, setIsPlayingDual] = useState(false);
  const [isPlayingRef, setIsPlayingRef] = useState(false);

  // Custom prompt modal
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customChinese, setCustomChinese] = useState('');
  const [customEnglish, setCustomEnglish] = useState('');
  const [customHsk, setCustomHsk] = useState(3);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const filteredPrompts = allPrompts.filter(p => {
    if (levelFilter === 'all') return true;
    if (levelFilter === 'custom') return p.isCustom;
    return p.hskLevel === levelFilter && !p.isCustom;
  });

  const handlePlayReference = () => {
    if (isPlayingRef) return;
    setIsPlayingRef(true);
    AzureSpeechService.speak(
      selectedPrompt.chinese,
      { rate: 0.9 },
      () => setIsPlayingRef(false),
      () => setIsPlayingRef(false)
    );
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setUserAudioUrl(url);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      alert('Microphone access is required for shadowing recording.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDualPlayback = () => {
    if (!userAudioUrl || isPlayingDual) return;
    setIsPlayingDual(true);

    // 1. Play reference native audio
    AzureSpeechService.speak(
      selectedPrompt.chinese,
      { rate: 0.9 },
      () => {
        // 2. Play user recorded audio after 400ms pause
        setTimeout(() => {
          const userAudio = new Audio(userAudioUrl);
          userAudio.onended = () => {
            setIsPlayingDual(false);
          };
          userAudio.onerror = () => {
            setIsPlayingDual(false);
          };
          userAudio.play().catch(() => setIsPlayingDual(false));
        }, 400);
      },
      () => {
        setIsPlayingDual(false);
      }
    );
  };

  const handleSaveCustomPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customChinese.trim()) return;

    const newPrompt: ShadowingPrompt = {
      id: `custom-${Date.now()}`,
      chinese: customChinese.trim(),
      english: customEnglish.trim() || 'Custom practice sentence',
      hskLevel: customHsk,
      category: 'Custom Sentence',
      isCustom: true
    };

    const updated = [newPrompt, ...customPrompts];
    setCustomPrompts(updated);
    localStorage.setItem('custom_shadowing_prompts', JSON.stringify(updated));
    setSelectedPrompt(newPrompt);
    setCustomChinese('');
    setCustomEnglish('');
    setShowAddCustom(false);
    setLevelFilter('custom');
  };

  const handleDeleteCustomPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPrompts.filter(p => p.id !== id);
    setCustomPrompts(updated);
    localStorage.setItem('custom_shadowing_prompts', JSON.stringify(updated));
    if (selectedPrompt.id === id) {
      setSelectedPrompt(BUILTIN_SHADOWING_PROMPTS[0]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Active Shadowing Practice Card */}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--border-strong)',
                color: 'var(--text-primary)'
              }}>
                HSK {selectedPrompt.hskLevel} • {selectedPrompt.category}
              </span>
              {selectedPrompt.isCustom && (
                <span style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>[Custom]</span>
              )}
            </div>

            <h3 style={{
              margin: '8px 0 0 0',
              fontFamily: 'var(--font-serif-zh)',
              fontSize: '28px',
              lineHeight: 1.5,
              color: 'var(--text-primary)'
            }}>
              {selectedPrompt.chinese}
            </h3>

            {selectedPrompt.pinyin && (
              <div style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                marginTop: '6px'
              }}>
                {selectedPrompt.pinyin}
              </div>
            )}

            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginTop: '6px',
              fontStyle: 'italic'
            }}>
              "{selectedPrompt.english}"
            </div>
          </div>

          {/* 3-Step Guided Action Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '200px' }}>
            <button
              onClick={handlePlayReference}
              disabled={isPlayingRef || isPlayingDual}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <Volume2 size={15} /> 1. Native Audio
            </button>

            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                disabled={isPlayingRef || isPlayingDual}
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
              >
                <Mic size={15} /> 2. Record Your Shadow
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="btn btn-primary"
                style={{ justifyContent: 'center', backgroundColor: '#B32418' }}
              >
                <Square size={14} /> Stop Recording
              </button>
            )}

            <button
              onClick={handleDualPlayback}
              disabled={!userAudioUrl || isPlayingDual}
              className="btn btn-secondary"
              style={{
                justifyContent: 'center',
                borderColor: userAudioUrl ? 'var(--accent-bamboo)' : undefined,
                color: userAudioUrl ? 'var(--accent-bamboo)' : undefined
              }}
            >
              <Play size={14} /> {isPlayingDual ? 'Playing Dual...' : '3. Back-to-Back Compare'}
            </button>
          </div>
        </div>
      </div>

      {/* Shadowing Sentence Library & Extensibility */}
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Sentence Library & Custom Prompts
            </h4>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
              Select from standard curriculum sentences or add custom sentences from your reading.
            </p>
          </div>

          <button
            onClick={() => setShowAddCustom(v => !v)}
            className="btn btn-secondary"
            style={{ fontSize: '12px' }}
          >
            <Plus size={14} /> {showAddCustom ? 'Close' : 'Add Custom Sentence'}
          </button>
        </div>

        {/* Add Custom Sentence Form Drawer */}
        {showAddCustom && (
          <form
            onSubmit={handleSaveCustomPrompt}
            style={{
              padding: '16px',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr 1fr', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter Chinese sentence (e.g. 熟能生巧。)..."
                value={customChinese}
                onChange={(e) => setCustomChinese(e.target.value)}
                className="form-input"
                required
              />
              <input
                type="text"
                placeholder="English translation (optional)..."
                value={customEnglish}
                onChange={(e) => setCustomEnglish(e.target.value)}
                className="form-input"
              />
              <select
                value={customHsk}
                onChange={(e) => setCustomHsk(parseInt(e.target.value, 10))}
                className="form-select"
              >
                {[1, 2, 3, 4, 5, 6].map(lvl => (
                  <option key={lvl} value={lvl}>HSK {lvl}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowAddCustom(false)}
                className="btn btn-secondary"
                style={{ fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ fontSize: '12px' }}
              >
                Save to Shadowing Deck
              </button>
            </div>
          </form>
        )}

        {/* Filter bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginRight: '4px' }}>
            Filter:
          </span>
          {(['all', 1, 2, 3, 4, 5, 6, 'custom'] as const).map(f => (
            <button
              key={f}
              onClick={() => setLevelFilter(f)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: levelFilter === f ? 'var(--border-strong)' : 'var(--border-subtle)',
                backgroundColor: levelFilter === f ? 'var(--bg-surface-hover)' : 'transparent',
                color: levelFilter === f ? 'var(--text-primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f === 'all' ? 'All' : f === 'custom' ? `Custom (${customPrompts.length})` : `HSK ${f}`}
            </button>
          ))}
        </div>

        {/* Sentence Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '10px',
          maxHeight: '280px',
          overflowY: 'auto'
        }}>
          {filteredPrompts.map(prompt => (
            <div
              key={prompt.id}
              onClick={() => {
                setSelectedPrompt(prompt);
                setUserAudioUrl(null);
              }}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid',
                borderColor: selectedPrompt.id === prompt.id ? 'var(--accent-seal)' : 'var(--border-subtle)',
                backgroundColor: selectedPrompt.id === prompt.id ? 'var(--bg-surface-hover)' : 'var(--bg-surface)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '6px',
                transition: 'border-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  HSK {prompt.hskLevel} • {prompt.category}
                </span>
                {prompt.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomPrompt(prompt.id, e)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-seal)', cursor: 'pointer', padding: 0 }}
                    title="Delete custom sentence"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              <div style={{ fontFamily: 'var(--font-serif-zh)', fontSize: '16px', color: 'var(--text-primary)' }}>
                {prompt.chinese}
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {prompt.english}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
