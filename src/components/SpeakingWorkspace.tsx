import React, { useState } from 'react';
import { ToneVisualizerCanvas } from './ToneVisualizerCanvas';
import { TonePairTrainer } from './TonePairTrainer';
import { ShadowingStudio } from './ShadowingStudio';
import { ConversationalVoiceAgent } from './ConversationalVoiceAgent';
import { SentenceMixingTrainer } from './SentenceMixingTrainer';
import { MinimalPairDrills } from './MinimalPairDrills';
import { PronunciationHeatmap } from './PronunciationHeatmap';
import { Activity, Mic, MessageSquare, Volume2, Puzzle, Headphones, BarChart2 } from 'lucide-react';

export const SpeakingWorkspace: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'visualizer' | 'tonePairs' | 'minimalPairs' | 'shadowing' | 'jigsaw' | 'voiceChat' | 'heatmap'>('visualizer');

  const [selectedToneChar, setSelectedToneChar] = useState({
    char: '妈',
    pinyin: 'mā',
    tone: 1
  });

  const TONE_SAMPLES = [
    { char: '妈', pinyin: 'mā', tone: 1, label: '1st Tone (High 55)' },
    { char: '麻', pinyin: 'má', tone: 2, label: '2nd Tone (Rising 35)' },
    { char: '马', pinyin: 'mǎ', tone: 3, label: '3rd Tone (Dipping 214)' },
    { char: '骂', pinyin: 'mà', tone: 4, label: '4th Tone (Falling 51)' },
    { char: '吗', pinyin: 'ma', tone: 5, label: '5th Tone (Neutral)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Sub-navigation bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'none'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Speaking Practice
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Real-time vocal pitch visualization, sentence shadowing, and conversational voice chat.
          </p>
        </div>

        {/* Sub-nav tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'var(--bg-base)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveSubTab('visualizer')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'visualizer' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'visualizer' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Activity size={13} /> Tone Visualizer
          </button>

          <button
            onClick={() => setActiveSubTab('tonePairs')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'tonePairs' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'tonePairs' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Volume2 size={13} /> Tone Pairs & Sandhi
          </button>

          <button
            onClick={() => setActiveSubTab('minimalPairs')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'minimalPairs' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'minimalPairs' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Headphones size={13} /> Minimal Pairs (ALS-002)
          </button>

          <button
            onClick={() => setActiveSubTab('shadowing')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'shadowing' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'shadowing' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Mic size={13} /> Shadowing Studio
          </button>

          <button
            onClick={() => setActiveSubTab('jigsaw')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'jigsaw' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'jigsaw' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Puzzle size={13} /> Auditory Jigsaw (ALS-008)
          </button>

          <button
            onClick={() => setActiveSubTab('voiceChat')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'voiceChat' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'voiceChat' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <MessageSquare size={13} /> Roleplay Chat (ALS-009)
          </button>

          <button
            onClick={() => setActiveSubTab('heatmap')}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: activeSubTab === 'heatmap' ? 'var(--border-strong)' : 'transparent',
              color: activeSubTab === 'heatmap' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart2 size={13} /> Weakness Heatmap (ALS-010)
          </button>
        </div>
      </div>

      {/* Sub-view: Tone Visualizer */}
      {activeSubTab === 'visualizer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Tone Quick Selector */}
          <div style={{
            display: 'flex',
            gap: '10px',
            alignItems: 'center',
            padding: '12px 18px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto'
          }}>
            <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Target Tone:</span>
            {TONE_SAMPLES.map(sample => (
              <button
                key={sample.char}
                onClick={() => setSelectedToneChar({ char: sample.char, pinyin: sample.pinyin, tone: sample.tone })}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${selectedToneChar.char === sample.char ? 'var(--border-strong)' : 'transparent'}`,
                  backgroundColor: selectedToneChar.char === sample.char ? 'var(--bg-surface-hover)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: selectedToneChar.char === sample.char ? 500 : 400,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ fontSize: '16px', fontFamily: 'var(--font-serif-zh)' }}>{sample.char}</span>
                <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{sample.pinyin}</span>
              </button>
            ))}
          </div>

          <ToneVisualizerCanvas
            character={selectedToneChar.char}
            pinyin={selectedToneChar.pinyin}
            targetTone={selectedToneChar.tone}
          />
        </div>
      )}

      {/* Sub-view: 2-Syllable Tone Pairs & Sandhi (ALS-003) */}
      {activeSubTab === 'tonePairs' && (
        <TonePairTrainer />
      )}

      {/* Sub-view: Minimal Pairs Discrimination Drills (ALS-002) */}
      {activeSubTab === 'minimalPairs' && (
        <MinimalPairDrills />
      )}

      {/* Sub-view: Sentence Shadowing */}
      {activeSubTab === 'shadowing' && (
        <ShadowingStudio />
      )}

      {/* Sub-view: Auditory Jigsaw Sentence Mixing (ALS-008) */}
      {activeSubTab === 'jigsaw' && (
        <SentenceMixingTrainer />
      )}

      {/* Sub-view: Voice Chat (ALS-009) */}
      {activeSubTab === 'voiceChat' && (
        <ConversationalVoiceAgent />
      )}

      {/* Sub-view: Pronunciation Weakness Heatmap (ALS-010) */}
      {activeSubTab === 'heatmap' && (
        <PronunciationHeatmap />
      )}

    </div>
  );
};
