import React, { useState } from 'react';
import type { VocabIntroPayload } from '../../types/Lesson';
import { Volume2, CheckCircle2 } from 'lucide-react';

interface VocabIntroProps {
  payload: VocabIntroPayload;
  onComplete: () => void;
}

import { AzureSpeechService } from '../../services/azureSpeech';

export const VocabIntro: React.FC<VocabIntroProps> = ({ payload, onComplete }) => {
  const [learnedCount, setLearnedCount] = useState<Record<number, boolean>>({});

  const speakWord = (word: string) => {
    AzureSpeechService.speak(word, { rate: 0.9 });
  };

  const toggleLearned = (idx: number) => {
    const updated = { ...learnedCount, [idx]: true };
    setLearnedCount(updated);
    
    // If all words are checked off, auto-complete or enable completion
    if (Object.keys(updated).length === payload.words.length) {
      onComplete();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
        Tap the speaker to hear the word, and mark them as reviewed to continue.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        maxWidth: '500px'
      }}>
        {payload.words.map((word, idx) => {
          const isDone = !!learnedCount[idx];
          return (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: isDone ? '2px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.3s ease',
                boxShadow: isDone ? 'var(--accent-glow) 0px 4px 12px' : 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  {word.character}
                </span>
                <div>
                  <div style={{ fontSize: '16px', color: 'var(--accent-color)', fontFamily: 'monospace', fontWeight: '600' }}>
                    {word.pinyin}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {word.definition}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={() => speakWord(word.character)}
                  className="control-button"
                  style={{
                    padding: '8px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Listen"
                >
                  <Volume2 size={18} />
                </button>

                <button
                  onClick={() => toggleLearned(idx)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isDone ? 'var(--accent-color)' : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s'
                  }}
                  title={isDone ? "Marked as Learned" : "Mark as Learned"}
                >
                  <CheckCircle2 size={24} style={{ fill: isDone ? 'var(--accent-glow)' : 'transparent' }} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {Object.keys(learnedCount).length === payload.words.length && (
        <button
          onClick={onComplete}
          className="generate-button"
          style={{ width: '100%', maxWidth: '200px', marginTop: '10px' }}
        >
          Proceed to Quiz
        </button>
      )}
    </div>
  );
};
