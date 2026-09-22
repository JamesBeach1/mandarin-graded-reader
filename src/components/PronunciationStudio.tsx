import React, { useState } from 'react';
import { ToneVisualizerCanvas } from './ToneVisualizerCanvas';
import { ShadowingStudio } from './ShadowingStudio';
import { ConversationalVoiceAgent } from './ConversationalVoiceAgent';
import { Activity, Mic, MessageSquare, Headphones } from 'lucide-react';

export const PronunciationStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tones' | 'shadowing' | 'conversation'>('tones');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Studio Navigation Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-flat)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif-zh)', fontSize: '22px', color: 'var(--text-main)' }}>
            🎙️ Pronunciation & Spoken Language Studio
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Real-time pitch estimation, tonal curve visualization, sentence shadowing, and conversational voice roleplay.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('tones')}
            className={`btn ${activeTab === 'tones' ? 'btn-indigo' : 'btn-secondary'}`}
          >
            <Activity size={16} /> Pitch Visualizer
          </button>
          <button
            onClick={() => setActiveTab('shadowing')}
            className={`btn ${activeTab === 'shadowing' ? 'btn-indigo' : 'btn-secondary'}`}
          >
            <Headphones size={16} /> Shadowing Mode
          </button>
          <button
            onClick={() => setActiveTab('conversation')}
            className={`btn ${activeTab === 'conversation' ? 'btn-indigo' : 'btn-secondary'}`}
          >
            <MessageSquare size={16} /> Voice Agent
          </button>
        </div>
      </div>

      {/* Sub-view 1: Real-Time Tone Pitch Visualizer */}
      {activeTab === 'tones' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            overflowX: 'auto'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              Select Benchmark Syllable:
            </span>
            {TONE_SAMPLES.map(sample => (
              <button
                key={sample.char}
                onClick={() => setSelectedToneChar({ char: sample.char, pinyin: sample.pinyin, tone: sample.tone })}
                className="btn btn-secondary"
                style={{
                  padding: '6px 14px',
                  backgroundColor: selectedToneChar.char === sample.char ? 'var(--accent-indigo)' : undefined,
                  color: selectedToneChar.char === sample.char ? '#FFFFFF' : undefined,
                  borderColor: selectedToneChar.char === sample.char ? 'var(--accent-indigo)' : undefined
                }}
              >
                {sample.char} {sample.pinyin} ({sample.label})
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

      {/* Sub-view 2: Sentence Shadowing Studio */}
      {activeTab === 'shadowing' && (
        <ShadowingStudio />
      )}

      {/* Sub-view 3: Multimodal Conversational Voice Agent */}
      {activeTab === 'conversation' && (
        <ConversationalVoiceAgent />
      )}
    </div>
  );
};
