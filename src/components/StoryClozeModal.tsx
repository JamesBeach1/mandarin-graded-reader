import React from 'react';
import { Modal } from './common/Modal';
import { convertScript, type ChineseScript } from '../utils/scriptConverter';
import type { Flashcard } from '../services/srsStore';

interface StoryClozeModalProps {
  card: Flashcard | null;
  onClose: () => void;
  options: string[];
  feedback: Record<string, 'correct' | 'incorrect'>;
  onAnswer: (option: string) => void;
  scriptPreference: ChineseScript;
}

export const StoryClozeModal: React.FC<StoryClozeModalProps> = ({
  card,
  onClose,
  options,
  feedback,
  onAnswer,
  scriptPreference
}) => {
  if (!card) return null;

  return (
    <Modal
      isOpen={Boolean(card)}
      onClose={onClose}
      title={
        <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)' }}>
          📝 Active Recall Cloze (SRS-007)
        </span>
      }
      maxWidth="440px"
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
          "{card.definition}"
        </div>
        <div style={{ fontSize: '14px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', marginBottom: '20px' }}>
          Pinyin: {card.pinyin}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Which character completes the sentence?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
          {options.map(option => {
            const isSelected = feedback[card.character] !== undefined;
            let btnBg = 'var(--bg-panel)';
            let btnBorder = 'var(--border-subtle)';
            let textColor = 'var(--text-primary)';

            if (isSelected) {
              if (option === card.character) {
                btnBg = 'rgba(74, 222, 128, 0.2)';
                btnBorder = 'var(--accent-bamboo)';
                textColor = 'var(--accent-bamboo)';
              } else {
                btnBg = 'rgba(239, 68, 68, 0.1)';
                textColor = 'var(--text-muted)';
              }
            }

            return (
              <button
                key={option}
                onClick={() => onAnswer(option)}
                disabled={isSelected}
                style={{
                  padding: '16px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: btnBg,
                  border: `2px solid ${btnBorder}`,
                  fontSize: '28px',
                  fontFamily: 'var(--font-serif-zh)',
                  color: textColor,
                  cursor: isSelected ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {convertScript(option, scriptPreference)}
              </button>
            );
          })}
        </div>

        {feedback[card.character] && (
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: feedback[card.character] === 'correct' ? 'var(--accent-bamboo)' : 'var(--accent-seal)'
          }}>
            {feedback[card.character] === 'correct'
              ? '✨ Correct! SRS interval updated.'
              : `❌ Incorrect! Character is ${card.character}`}
          </div>
        )}
      </div>
    </Modal>
  );
};
