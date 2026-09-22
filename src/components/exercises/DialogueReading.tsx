import React, { useState } from 'react';
import type { DialogueReadingPayload } from '../../types/Lesson';
import { Volume2, MessageCircle } from 'lucide-react';

interface DialogueReadingProps {
  payload: DialogueReadingPayload;
  onComplete: () => void;
}

import { AzureSpeechService } from '../../services/azureSpeech';

export const DialogueReading: React.FC<DialogueReadingProps> = ({ payload, onComplete }) => {
  const [showTranslations, setShowTranslations] = useState<Record<number, boolean>>({});

  const speakLine = (text: string) => {
    AzureSpeechService.speak(text, { rate: 0.95 });
  };

  const toggleTranslation = (idx: number) => {
    setShowTranslations(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', margin: 0 }}>
        Read through the dialogue. Tap bubbles to play audio or show translation guides.
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        width: '100%',
        maxWidth: '550px',
        padding: '10px 0'
      }}>
        {payload.dialogue.map((line, idx) => {
          const isEven = idx % 2 === 0;
          const showTrans = !!showTranslations[idx];

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: isEven ? 'flex-start' : 'flex-end',
                width: '100%'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isEven ? 'flex-start' : 'flex-end',
                maxWidth: '80%'
              }}>
                {/* Speaker Label */}
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginHorizontal: '8px'
                }}>
                  <MessageCircle size={12} />
                  <span>{line.speaker}</span>
                </div>

                {/* Speech Bubble */}
                <div
                  onClick={() => toggleTranslation(idx)}
                  style={{
                    background: isEven ? 'var(--bg-card)' : 'var(--accent-glow)',
                    border: '1px solid var(--border-color)',
                    borderColor: isEven ? 'var(--border-color)' : 'var(--accent-color)',
                    borderRadius: '16px',
                    borderTopLeftRadius: isEven ? '4px' : '16px',
                    borderTopRightRadius: isEven ? '16px' : '4px',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-card)',
                    position: 'relative',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                  {/* Chinese Text */}
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{line.text}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakLine(line.text);
                      }}
                      className="control-button"
                      style={{
                        padding: '4px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--accent-color)'
                      }}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  {/* Pinyin */}
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--accent-color)',
                    fontFamily: 'monospace',
                    marginTop: '4px',
                    opacity: 0.85
                  }}>
                    {line.pinyin}
                  </div>

                  {/* Translation Toggle Panel */}
                  <div style={{
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    marginTop: '6px',
                    borderTop: '1px solid var(--border-color)',
                    paddingTop: '6px',
                    display: showTrans ? 'block' : 'none'
                  }}>
                    {line.translation}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onComplete}
        className="generate-button"
        style={{ width: '100%', maxWidth: '220px', marginTop: '15px' }}
      >
        Complete Lesson
      </button>
    </div>
  );
};
