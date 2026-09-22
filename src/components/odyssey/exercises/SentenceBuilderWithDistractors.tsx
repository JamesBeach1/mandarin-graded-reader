import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, AlertCircle, Volume2 } from 'lucide-react';
import type { SentenceBuilderDistractorPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface SentenceBuilderProps {
  payload: SentenceBuilderDistractorPayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

interface ChipItem {
  id: string;
  text: string;
  isDistractor?: boolean;
}

export const SentenceBuilderWithDistractors: React.FC<SentenceBuilderProps> = ({ payload, onSuccess, onError }) => {
  const [availableChips, setAvailableChips] = useState<ChipItem[]>([]);
  const [selectedChips, setSelectedChips] = useState<ChipItem[]>([]);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // Initialize and shuffle chips with distractors
  useEffect(() => {
    const chips: ChipItem[] = [
      ...payload.validChips.map((text, idx) => ({ id: `valid-${idx}-${text}`, text })),
      ...payload.distractorChips.map((text, idx) => ({ id: `distractor-${idx}-${text}`, text, isDistractor: true }))
    ];

    // Knuth-Fisher-Yates shuffle
    for (let i = chips.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chips[i], chips[j]] = [chips[j], chips[i]];
    }

    setAvailableChips(chips);
    setSelectedChips([]);
    setStatus('idle');
  }, [payload]);

  const handleSelectChip = (chip: ChipItem) => {
    if (status === 'correct') return;
    odysseyAudio.playChipConnect();
    setAvailableChips(prev => prev.filter(c => c.id !== chip.id));
    setSelectedChips(prev => [...prev, chip]);
    if (status === 'incorrect') setStatus('idle');
  };

  const handleRemoveChip = (chip: ChipItem) => {
    if (status === 'correct') return;
    odysseyAudio.playChipRemove();
    setSelectedChips(prev => prev.filter(c => c.id !== chip.id));
    setAvailableChips(prev => [...prev, chip]);
    if (status === 'incorrect') setStatus('idle');
  };

  const handleReset = () => {
    if (status === 'correct') return;
    odysseyAudio.playChipRemove();
    setAvailableChips([...availableChips, ...selectedChips]);
    setSelectedChips([]);
    setStatus('idle');
  };

  const handleCheckAnswer = () => {
    if (status === 'correct') return;
    const assembledString = selectedChips.map(c => c.text).join('').replace(/[\s,，.。!！?？]/g, '');
    const targetString = payload.targetSentence.replace(/[\s,，.。!！?？]/g, '');

    const hasDistractor = selectedChips.some(c => c.isDistractor);

    if (assembledString === targetString && !hasDistractor) {
      setStatus('correct');
      odysseyAudio.playCorrectChord();
      odysseyAudio.speakChinese(payload.targetSentence);
      onSuccess();
    } else {
      setStatus('incorrect');
      odysseyAudio.playErrorChime();
      onError(`Sentence assembly error on "${payload.targetSentence}". Assembled: "${assembledString}"`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      {/* English Prompt Card */}
      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
          Assemble the Chinese Sentence
        </div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
          &ldquo;{payload.englishTranslation}&rdquo;
        </div>
        {payload.pinyin && (
          <div style={{ fontSize: '12px', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)', marginTop: '6px' }}>
            {payload.pinyin}
          </div>
        )}
      </div>

      {/* Selected Chips Tray (Drop Area) */}
      <div style={{
        minHeight: '80px',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: status === 'correct' ? 'rgba(56, 161, 105, 0.06)' : status === 'incorrect' ? 'rgba(229, 62, 62, 0.06)' : 'var(--bg-base)',
        border: `2px dashed ${status === 'correct' ? '#38a169' : status === 'incorrect' ? '#e53e3e' : 'var(--border-strong)'}`,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease'
      }}>
        {selectedChips.length === 0 ? (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
            Click word chips below to assemble the sentence
          </span>
        ) : (
          selectedChips.map(chip => (
            <button
              key={chip.id}
              type="button"
              onClick={() => handleRemoveChip(chip)}
              className="chip-badge selected"
              style={{
                padding: '8px 14px',
                fontSize: '17px',
                fontFamily: 'var(--font-serif-zh)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--accent-indigo)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
              }}
            >
              {chip.text}
            </button>
          ))
        )}
      </div>

      {/* Word Bank Tray (Available Chips including Distractors) */}
      <div style={{
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        minHeight: '70px'
      }}>
        {availableChips.map(chip => (
          <button
            key={chip.id}
            type="button"
            onClick={() => handleSelectChip(chip)}
            className="chip-badge available"
            style={{
              padding: '8px 14px',
              fontSize: '17px',
              fontFamily: 'var(--font-serif-zh)',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            {chip.text}
          </button>
        ))}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
          disabled={selectedChips.length === 0 || status === 'correct'}
        >
          <RefreshCw size={12} /> Clear Tray
        </button>

        <button
          type="button"
          onClick={handleCheckAnswer}
          className="btn btn-primary"
          style={{ padding: '8px 24px', fontSize: '14px' }}
          disabled={selectedChips.length === 0 || status === 'correct'}
        >
          Verify Sentence
        </button>
      </div>

      {/* Feedback Messages */}
      {status === 'correct' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(56, 161, 105, 0.1)',
          border: '1px solid rgba(56, 161, 105, 0.3)',
          color: '#38a169',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <Check size={18} />
          <span><strong>Perfect Sentence!</strong> You avoided the distractors flawlessly.</span>
        </div>
      )}

      {status === 'incorrect' && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(229, 62, 62, 0.1)',
          border: '1px solid rgba(229, 62, 62, 0.3)',
          color: '#e53e3e',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          fontSize: '13px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <AlertCircle size={16} /> Syntax or Distractor Error
          </div>
          <span>Check for similar-looking characters or order differences!</span>
          {payload.explanation && <span style={{ color: 'var(--text-secondary)' }}>Tip: {payload.explanation}</span>}
        </div>
      )}
    </div>
  );
};
