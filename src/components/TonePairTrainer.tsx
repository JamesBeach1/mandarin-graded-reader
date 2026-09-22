import React, { useState } from 'react';
import { Volume2, Play, Sparkles, CheckCircle2, ArrowRight, Mic, AlertCircle } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

export interface TonePairItem {
  id: string;
  word: string;
  pinyinDisplay: string;
  surfacePinyin?: string; // what is actually pronounced after sandhi
  definition: string;
  pairCategory: string; // e.g. "1-1", "1-2", "3-3 (Sandhi)", "不 Sandhi"
  tone1: number;
  tone2: number;
  isSandhi?: boolean;
  sandhiRule?: string;
  pitchTrajectory: string; // descriptive pitch contour like "55-55", "21-35"
}

export const TONE_PAIRS_CATALOG: TonePairItem[] = [
  // Tone 1 Pairs
  { id: '1-1', word: '今天', pinyinDisplay: 'jīntiān', definition: 'today', pairCategory: '1-1', tone1: 1, tone2: 1, pitchTrajectory: '55 - 55' },
  { id: '1-2', word: '中国', pinyinDisplay: 'zhōngguó', definition: 'China', pairCategory: '1-2', tone1: 1, tone2: 2, pitchTrajectory: '55 - 35' },
  { id: '1-3', word: '机场', pinyinDisplay: 'jīchǎng', definition: 'airport', pairCategory: '1-3', tone1: 1, tone2: 3, pitchTrajectory: '55 - 21(4)' },
  { id: '1-4', word: '音乐', pinyinDisplay: 'yīnyuè', definition: 'music', pairCategory: '1-4', tone1: 1, tone2: 4, pitchTrajectory: '55 - 51' },
  { id: '1-5', word: '哥哥', pinyinDisplay: 'gēge', definition: 'older brother', pairCategory: '1-5', tone1: 1, tone2: 5, pitchTrajectory: '55 - 2' },

  // Tone 2 Pairs
  { id: '2-1', word: '时间', pinyinDisplay: 'shíjiān', definition: 'time', pairCategory: '2-1', tone1: 2, tone2: 1, pitchTrajectory: '35 - 55' },
  { id: '2-2', word: '学习', pinyinDisplay: 'xuéxí', definition: 'to study', pairCategory: '2-2', tone1: 2, tone2: 2, pitchTrajectory: '35 - 35' },
  { id: '2-3', word: '苹果', pinyinDisplay: 'píngguǒ', definition: 'apple', pairCategory: '2-3', tone1: 2, tone2: 3, pitchTrajectory: '35 - 21(4)' },
  { id: '2-4', word: '决定', pinyinDisplay: 'juédìng', definition: 'decision', pairCategory: '2-4', tone1: 2, tone2: 4, pitchTrajectory: '35 - 51' },
  { id: '2-5', word: '什么', pinyinDisplay: 'shénme', definition: 'what', pairCategory: '2-5', tone1: 2, tone2: 5, pitchTrajectory: '35 - 3' },

  // Tone 3 Pairs (Half-Third Tone Rule)
  { id: '3-1', word: '北京', pinyinDisplay: 'běijīng', definition: 'Beijing', pairCategory: '3-1', tone1: 3, tone2: 1, pitchTrajectory: '21 - 55', sandhiRule: 'Half 3rd Tone: Drops to low pitch (21) without rising back up.' },
  { id: '3-2', word: '旅行', pinyinDisplay: 'lǚxíng', definition: 'to travel', pairCategory: '3-2', tone1: 3, tone2: 2, pitchTrajectory: '21 - 35', sandhiRule: 'Half 3rd Tone: Drops to low pitch (21) then rises into 2nd tone.' },
  { id: '3-3', word: '你好', pinyinDisplay: 'nǐhǎo', surfacePinyin: 'níhǎo', definition: 'hello', pairCategory: '3-3 (Sandhi)', tone1: 3, tone2: 3, isSandhi: true, pitchTrajectory: '35 - 214', sandhiRule: '3-3 Rule: When two 3rd tones meet, the first changes to a 2nd Tone (níhǎo)!' },
  { id: '3-3b', word: '可以', pinyinDisplay: 'kěyǐ', surfacePinyin: 'kéyǐ', definition: 'can / may', pairCategory: '3-3 (Sandhi)', tone1: 3, tone2: 3, isSandhi: true, pitchTrajectory: '35 - 214', sandhiRule: '3-3 Rule: kě changes to ké in actual natural speech.' },
  { id: '3-4', word: '马上', pinyinDisplay: 'mǎshàng', definition: 'immediately', pairCategory: '3-4', tone1: 3, tone2: 4, pitchTrajectory: '21 - 51', sandhiRule: 'Half 3rd Tone: Low dip (21) immediately followed by sharp fall (51).' },
  { id: '3-5', word: '喜欢', pinyinDisplay: 'xǐhuan', definition: 'to like', pairCategory: '3-5', tone1: 3, tone2: 5, pitchTrajectory: '21 - 4' },

  // Tone 4 Pairs
  { id: '4-1', word: '面包', pinyinDisplay: 'miànbāo', definition: 'bread', pairCategory: '4-1', tone1: 4, tone2: 1, pitchTrajectory: '51 - 55' },
  { id: '4-2', word: '问题', pinyinDisplay: 'wèntí', definition: 'question / problem', pairCategory: '4-2', tone1: 4, tone2: 2, pitchTrajectory: '51 - 35' },
  { id: '4-3', word: '现在', pinyinDisplay: 'xiànzài', definition: 'now', pairCategory: '4-4', tone1: 4, tone2: 4, pitchTrajectory: '51 - 51' },
  { id: '4-4', word: '谢谢', pinyinDisplay: 'xièxie', definition: 'thank you', pairCategory: '4-5', tone1: 4, tone2: 5, pitchTrajectory: '51 - 1' },

  // Essential Morphological Sandhi: 不 (bù) and 一 (yī)
  { id: 'bu-4', word: '不是', pinyinDisplay: 'bùshì', surfacePinyin: 'búshì', definition: 'is not', pairCategory: '不 Sandhi', tone1: 4, tone2: 4, isSandhi: true, pitchTrajectory: '35 - 51', sandhiRule: '不 Sandhi: 不 changes from 4th tone (bù) to 2nd tone (bú) when preceding another 4th tone!' },
  { id: 'bu-1', word: '不吃', pinyinDisplay: 'bùchī', definition: 'do not eat', pairCategory: '不 Standard', tone1: 4, tone2: 1, pitchTrajectory: '51 - 55', sandhiRule: '不 Standard: Keeps regular 4th tone (bù) before 1st, 2nd, or 3rd tones.' },
  { id: 'yi-4', word: '一样', pinyinDisplay: 'yīyàng', surfacePinyin: 'yíyàng', definition: 'same / identical', pairCategory: '一 Sandhi', tone1: 1, tone2: 4, isSandhi: true, pitchTrajectory: '35 - 51', sandhiRule: '一 Sandhi: 一 changes from 1st tone (yī) to 2nd tone (yí) before 4th tones!' },
  { id: 'yi-3', word: '一起', pinyinDisplay: 'yīqǐ', surfacePinyin: 'yìqǐ', definition: 'together', pairCategory: '一 Sandhi', tone1: 1, tone2: 3, isSandhi: true, pitchTrajectory: '51 - 214', sandhiRule: '一 Sandhi: 一 changes from 1st tone (yī) to 4th tone (yì) before 1st, 2nd, or 3rd tones!' }
];

export const TonePairTrainer: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<TonePairItem>(TONE_PAIRS_CATALOG[12]); // default to 你好 (3-3 sandhi)
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isPlaying, setIsPlaying] = useState(false);

  const filterOptions = [
    { id: 'all', label: 'All Tone Pairs' },
    { id: 'sandhi', label: '⚡ Tone Sandhi Rules' },
    { id: 'tone1', label: 'Tone 1 Pairs' },
    { id: 'tone2', label: 'Tone 2 Pairs' },
    { id: 'tone3', label: 'Tone 3 Pairs' },
    { id: 'tone4', label: 'Tone 4 Pairs' }
  ];

  const filteredPairs = TONE_PAIRS_CATALOG.filter(item => {
    if (activeFilter === 'sandhi') return item.isSandhi;
    if (activeFilter === 'tone1') return item.tone1 === 1 && !item.isSandhi;
    if (activeFilter === 'tone2') return item.tone1 === 2;
    if (activeFilter === 'tone3') return item.tone1 === 3;
    if (activeFilter === 'tone4') return item.tone1 === 4;
    return true;
  });

  const handlePlayAudio = (pair: TonePairItem) => {
    setIsPlaying(true);
    AzureSpeechService.speak(pair.word, 0.9, undefined, undefined);
    setTimeout(() => setIsPlaying(false), 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {filterOptions.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`control-button ${activeFilter === f.id ? 'btn-bamboo' : ''}`}
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.5fr', gap: '20px' }}>
        
        {/* Left Column: Word Pair List */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '14px',
          maxHeight: '480px',
          overflowY: 'auto'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            Select Tone Combination ({filteredPairs.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredPairs.map(p => {
              const isSelected = selectedPair.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPair(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '1.5px solid var(--accent-seal)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'rgba(194, 65, 12, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-zh)' }}>
                      {p.word}
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {p.surfacePinyin ? (
                          <span>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '4px' }}>{p.pinyinDisplay}</span>
                            <span style={{ color: 'var(--accent-cinnabar)', fontWeight: 600 }}>{p.surfacePinyin}</span>
                          </span>
                        ) : p.pinyinDisplay}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.definition}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {p.isSandhi && (
                      <span style={{ fontSize: '10px', padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600 }}>
                        SANDHI
                      </span>
                    )}
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                      {p.pairCategory}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Contour & Pedagogical Sandhi Breakdown */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Header Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: selectedPair.isSandhi ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-base)',
                  color: selectedPair.isSandhi ? '#ef4444' : 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Tone Pair {selectedPair.pairCategory}
                </span>
                <h3 style={{ margin: '8px 0 2px 0', fontSize: '38px', fontWeight: 'bold', fontFamily: 'var(--font-zh)' }}>
                  {selectedPair.word}
                </h3>
              </div>

              <button
                onClick={() => handlePlayAudio(selectedPair)}
                className={`btn ${isPlaying ? 'btn-bamboo' : 'btn-primary'}`}
                style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Volume2 size={16} /> Listen Native
              </button>
            </div>

            {/* Pronunciation & Transition */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', marginBottom: '16px' }}>
              <span style={{ fontSize: '18px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                {selectedPair.pinyinDisplay}
              </span>
              {selectedPair.surfacePinyin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-cinnabar)', fontWeight: 600 }}>
                  <ArrowRight size={14} /> Spoken as: {selectedPair.surfacePinyin}
                </div>
              )}
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                — "{selectedPair.definition}"
              </span>
            </div>

            {/* Pitch Contour Visual Diagram */}
            <div style={{
              backgroundColor: 'var(--bg-base)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Acoustic Pitch Trajectory (Chao Register 5 High to 1 Low)
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)' }}>
                  {selectedPair.pitchTrajectory}
                </span>
              </div>

              {/* Simplified Pitch Visualizer SVG */}
              <div style={{ height: '90px', position: 'relative', width: '100%' }}>
                <svg width="100%" height="90" viewBox="0 0 300 90" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[18, 36, 54, 72].map((y, i) => (
                    <line key={i} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  ))}

                  {/* Pitch Curve based on category */}
                  {selectedPair.id.includes('3-3') ? (
                    // 3-3 sandhi curve: Syllable 1 rises (35), Syllable 2 dips (214)
                    <path
                      d="M 20 60 Q 80 40 130 20 M 170 45 Q 210 80 240 75 Q 265 70 280 25"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  ) : selectedPair.tone1 === 1 ? (
                    // Flat high (55)
                    <path
                      d="M 20 20 L 130 20 M 170 30 Q 230 60 280 40"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  ) : (
                    // Generic dynamic contour
                    <path
                      d="M 20 65 Q 70 30 130 25 M 170 25 Q 220 50 280 75"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  )}
                </svg>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  <span>Syllable 1: {selectedPair.word[0]}</span>
                  <span>Syllable 2: {selectedPair.word[1]}</span>
                </div>
              </div>
            </div>

            {/* Pedagogical Sandhi Explanation Card */}
            {selectedPair.sandhiRule && (
              <div style={{
                backgroundColor: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                borderRadius: '8px',
                padding: '12px 16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '4px' }}>
                  <Sparkles size={14} /> Pedagogical Sandhi Rule
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {selectedPair.sandhiRule}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Practice Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Tip: Read the pair smoothly in a single breath without pausing between syllables.
            </span>
            <button
              onClick={() => handlePlayAudio(selectedPair)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Repeat Sound
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
