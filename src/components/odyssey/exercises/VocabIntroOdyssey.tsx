import React, { useState } from 'react';
import { Volume2, CheckCircle2, Check } from 'lucide-react';
import type { VocabIntroPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface VocabIntroProps {
  payload: VocabIntroPayload;
  onSuccess: () => void;
  onError?: (mistake: string) => void;
}

export const VocabIntroOdyssey: React.FC<VocabIntroProps> = ({ payload, onSuccess }) => {
  const [learnedIndices, setLearnedIndices] = useState<number[]>([]);

  const handleToggleLearned = (idx: number, word: string) => {
    odysseyAudio.playChipConnect();
    odysseyAudio.speakChinese(word);

    let updated: number[];
    if (learnedIndices.includes(idx)) {
      updated = learnedIndices.filter(i => i !== idx);
    } else {
      updated = [...learnedIndices, idx];
    }
    setLearnedIndices(updated);

    if (updated.length === payload.words.length) {
      odysseyAudio.playCorrectChord();
      onSuccess();
    }
  };

  const handlePlayAudio = (word: string, e: React.MouseEvent) => {
    e.stopPropagation();
    odysseyAudio.speakChinese(word);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
        Review and listen to each word. Click to verify you have internalized it.
      </div>

      {payload.words.map((w, idx) => {
        const isLearned = learnedIndices.includes(idx);
        return (
          <div
            key={idx}
            onClick={() => handleToggleLearned(idx, w.character)}
            style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: isLearned ? 'rgba(56, 161, 105, 0.08)' : 'var(--bg-surface)',
              border: `1px solid ${isLearned ? '#38a169' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ fontSize: '30px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                {w.character}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '13px', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
                  {w.pinyin}
                </span>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  {w.definition}
                </span>
                {w.exampleSentence && (
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-serif-zh)', marginTop: '2px' }}>
                    {w.exampleSentence}
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={(e) => handlePlayAudio(w.character, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', color: 'var(--text-muted)' }}
                title="Hear pronunciation"
              >
                <Volume2 size={18} />
              </button>
              <div style={{ color: isLearned ? '#38a169' : 'var(--border-strong)' }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
