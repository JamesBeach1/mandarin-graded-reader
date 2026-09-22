import React, { useState } from 'react';
import type { SentenceBuilderPayload } from '../../types/Lesson';
import { RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

interface SentenceBuilderProps {
  payload: SentenceBuilderPayload;
  onComplete: () => void;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({ payload, onComplete }) => {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleWordClick = (index: number) => {
    if (isChecked && isCorrect) return;
    setIsChecked(false);
    setShowError(false);

    if (selectedIndices.includes(index)) {
      // Remove word
      setSelectedIndices(prev => prev.filter(i => i !== index));
    } else {
      // Append word
      setSelectedIndices(prev => [...prev, index]);
    }
  };

  const handleReset = () => {
    setSelectedIndices([]);
    setIsChecked(false);
    setIsCorrect(false);
    setShowError(false);
  };

  const checkAnswer = () => {
    const constructed = selectedIndices.map(i => payload.wordBank[i]).join('');
    // Remove space or punctuation check
    const cleanConstructed = constructed.replace(/[\s。？！，]/g, '');
    const cleanCorrect = payload.correctAnswer.replace(/[\s。？！，]/g, '');

    setIsChecked(true);
    if (cleanConstructed === cleanCorrect) {
      setIsCorrect(true);
      setShowError(false);
      setTimeout(() => {
        onComplete();
      }, 1500);
    } else {
      setIsCorrect(false);
      setShowError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      <style>{`
        @keyframes sb-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .sb-error {
          animation: sb-shake 0.4s ease-in-out;
          border-color: #e53e3e !important;
        }
      `}</style>

      {/* Target Translation */}
      <div style={{
        background: 'var(--bg-primary)',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '500px'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Translate this sentence:
        </div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
          "{payload.englishTranslation}"
        </div>
      </div>

      {/* Answer Board */}
      <div
        className={showError ? 'sb-error' : ''}
        style={{
          borderBottom: '2px solid var(--border-color)',
          minHeight: '60px',
          width: '100%',
          maxWidth: '500px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          padding: '10px 0',
          justifyContent: 'center',
          alignItems: 'center',
          transition: 'border-color 0.2s'
        }}
      >
        {selectedIndices.length === 0 && (
          <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontStyle: 'italic' }}>
            Tap words from the bank below to build the sentence
          </span>
        )}
        {selectedIndices.map((wordIndex) => (
          <button
            key={wordIndex}
            onClick={() => handleWordClick(wordIndex)}
            className="control-button"
            style={{
              padding: '8px 14px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '1px solid var(--accent-color)',
              background: 'var(--accent-glow)',
              color: 'var(--accent-color)',
              fontWeight: '600'
            }}
          >
            {payload.wordBank[wordIndex]}
          </button>
        ))}
      </div>

      {/* Word Bank */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        width: '100%',
        maxWidth: '500px',
        padding: '10px 0'
      }}>
        {payload.wordBank.map((word, idx) => {
          const isSelected = selectedIndices.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => handleWordClick(idx)}
              className="control-button"
              disabled={isSelected}
              style={{
                padding: '10px 16px',
                fontSize: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                background: isSelected ? 'var(--bg-primary)' : 'var(--bg-card)',
                color: isSelected ? 'var(--border-color)' : 'var(--text-main)',
                opacity: isSelected ? 0.3 : 1,
                cursor: isSelected ? 'default' : 'pointer',
                fontWeight: '600',
                transition: 'all 0.2s'
              }}
            >
              {word}
            </button>
          );
        })}
      </div>

      {/* Control Buttons */}
      <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '500px', marginTop: '10px' }}>
        <button
          onClick={handleReset}
          className="control-button"
          style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <RefreshCw size={16} /> Reset
        </button>
        <button
          onClick={checkAnswer}
          className="generate-button"
          disabled={selectedIndices.length === 0 || (isChecked && isCorrect)}
          style={{ flex: 2, padding: '12px' }}
        >
          Check Answer
        </button>
      </div>

      {isChecked && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: '600' }}>
          {isCorrect ? (
            <span style={{ color: '#38a169', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={20} /> Excellent! Correct translation.
            </span>
          ) : (
            <span style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={20} /> Let's try again!
            </span>
          )}
        </div>
      )}
    </div>
  );
};
