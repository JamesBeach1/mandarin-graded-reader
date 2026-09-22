import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { MultipleChoicePayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface MultipleChoiceProps {
  payload: MultipleChoicePayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const MultipleChoiceOdyssey: React.FC<MultipleChoiceProps> = ({ payload, onSuccess, onError }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const handleSelect = (opt: string) => {
    if (isResolved) return;
    setSelectedOption(opt);
    setIsResolved(true);

    if (opt === payload.correctAnswer) {
      odysseyAudio.playCorrectChord();
      onSuccess();
    } else {
      odysseyAudio.playErrorChime();
      onError(`Multiple choice error: Selected "${opt}" on question "${payload.question}"`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
          {payload.question}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {payload.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          const isCorrect = opt === payload.correctAnswer;
          let borderCol = 'var(--border-subtle)';
          let bgCol = 'var(--bg-surface)';

          if (isResolved) {
            if (isCorrect) {
              borderCol = '#38a169';
              bgCol = 'rgba(56, 161, 105, 0.08)';
            } else if (isSelected && !isCorrect) {
              borderCol = '#e53e3e';
              bgCol = 'rgba(229, 62, 62, 0.08)';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(opt)}
              disabled={isResolved}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: bgCol,
                border: `2px solid ${borderCol}`,
                fontSize: '15px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-serif-zh)',
                cursor: isResolved ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{opt}</span>
              {isResolved && isCorrect && <Check size={16} color="#38a169" />}
              {isResolved && isSelected && !isCorrect && <X size={16} color="#e53e3e" />}
            </button>
          );
        })}
      </div>

      {isResolved && payload.explanation && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: selectedOption === payload.correctAnswer ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
          border: `1px solid ${selectedOption === payload.correctAnswer ? 'rgba(56, 161, 105, 0.3)' : 'rgba(229, 62, 62, 0.3)'}`,
          fontSize: '13px',
          color: selectedOption === payload.correctAnswer ? '#2f855a' : '#c53030'
        }}>
          <strong>Explanation:</strong> {payload.explanation}
        </div>
      )}
    </div>
  );
};
