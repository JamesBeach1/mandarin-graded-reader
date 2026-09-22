import React, { useState } from 'react';
import type { MultipleChoicePayload } from '../../types/Lesson';

interface MultipleChoiceProps {
  payload: MultipleChoicePayload;
  onComplete: () => void;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({ payload, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<Record<string, boolean>>({});
  const [isAnsweredCorrectly, setIsAnsweredCorrectly] = useState(false);

  const handleOptionClick = (opt: string) => {
    if (isAnsweredCorrectly) return;
    
    setSelectedOption(opt);
    if (opt === payload.correctAnswer) {
      setIsAnsweredCorrectly(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    } else {
      setWrongAnswers(prev => ({ ...prev, [opt]: true }));
      // Clear selection after a delay
      setTimeout(() => {
        setSelectedOption(null);
      }, 500);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', alignItems: 'center', width: '100%' }}>
      <style>{`
        @keyframes mc-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .option-wrong {
          animation: mc-shake 0.4s ease-in-out;
          border-color: #e53e3e !important;
          background-color: #fff5f5 !important;
          color: #e53e3e !important;
        }
        .option-correct {
          border-color: #38a169 !important;
          background-color: #f0fff4 !important;
          color: #38a169 !important;
          box-shadow: 0 0 10px rgba(56, 161, 105, 0.2) !important;
        }
      `}</style>

      <h3 style={{ fontSize: '18px', color: 'var(--text-main)', textAlign: 'center', margin: '0 0 8px 0', fontWeight: 'bold' }}>
        {payload.question}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        width: '100%',
        maxWidth: '500px'
      }}>
        {payload.options.map((opt, idx) => {
          const isWrong = !!wrongAnswers[opt];
          const isCorrect = isAnsweredCorrectly && opt === payload.correctAnswer;
          const isSelected = selectedOption === opt;
          
          let btnClass = '';
          if (isWrong) btnClass = 'option-wrong';
          else if (isCorrect) btnClass = 'option-correct';

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(opt)}
              className={`control-button ${btnClass}`}
              style={{
                padding: '16px 20px',
                fontSize: '16px',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                background: isSelected ? 'var(--accent-glow)' : 'var(--bg-card)',
                color: isSelected ? 'var(--accent-color)' : 'var(--text-main)',
                cursor: isAnsweredCorrectly ? 'default' : 'pointer',
                transition: 'all 0.2s ease',
                fontWeight: '600',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: '1px solid currentColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {isAnsweredCorrectly && (
        <div style={{ color: '#38a169', fontSize: '15px', fontWeight: '600', display: 'flex', gap: '6px', alignItems: 'center', marginTop: '10px' }}>
          ✨ Correct! {payload.explanation && `– ${payload.explanation}`}
        </div>
      )}
    </div>
  );
};
