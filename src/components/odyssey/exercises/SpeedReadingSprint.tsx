import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Check, X, Clock, HelpCircle } from 'lucide-react';
import type { SpeedReadingSprintPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface SpeedReadingSprintProps {
  payload: SpeedReadingSprintPayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const SpeedReadingSprint: React.FC<SpeedReadingSprintProps> = ({ payload, onSuccess, onError }) => {
  const [phase, setPhase] = useState<'reading' | 'quiz'>('reading');
  const [timeLeft, setTimeLeft] = useState(payload.timeLimitSeconds);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const timerRef = useRef<any>(null);

  // Reading pacing countdown
  useEffect(() => {
    if (phase !== 'reading') return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleFinishReading();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const handleFinishReading = () => {
    clearInterval(timerRef.current);
    odysseyAudio.playChipConnect();
    setPhase('quiz');
  };

  const handleSelectOption = (opt: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(opt);
    setIsAnswerChecked(true);

    if (opt === payload.correctAnswer) {
      odysseyAudio.playCorrectChord();
      onSuccess();
    } else {
      odysseyAudio.playErrorChime();
      onError(`Comprehension sprint error: Selected "${opt}" instead of "${payload.correctAnswer}"`);
    }
  };

  const progressPercent = Math.max(0, ((payload.timeLimitSeconds - timeLeft) / payload.timeLimitSeconds) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
      {/* PHASE 1: PACED SPEED READING SPRINT */}
      {phase === 'reading' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Header Pacing Indicator */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-indigo)', fontWeight: 600 }}>
              <FastForward size={14} /> Paced Reading Sprint ({payload.targetCPM} CPM)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
              {timeLeft}s remaining
            </span>
          </div>

          {/* Visual Pacing Bar Moving Down */}
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-base)', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                backgroundColor: 'var(--accent-indigo)',
                transition: 'width 1s linear'
              }}
            />
          </div>

          {/* Chinese Passage Card */}
          <div style={{
            padding: '24px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '18px',
            lineHeight: 2.0,
            fontFamily: 'var(--font-serif-zh)',
            color: 'var(--text-primary)',
            position: 'relative'
          }}>
            {payload.passage}
          </div>

          <button
            type="button"
            onClick={handleFinishReading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            I&apos;ve Finished Reading &mdash; Start Quiz
          </button>
        </div>
      )}

      {/* PHASE 2: COMPREHENSION RECALL QUIZ */}
      {phase === 'quiz' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
              Comprehension Check
            </span>
            <h3 style={{ margin: '6px 0 0 0', fontSize: '16px', color: 'var(--text-primary)' }}>
              {payload.question}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {payload.options.map((opt, idx) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === payload.correctAnswer;
              let borderCol = 'var(--border-subtle)';
              let bgCol = 'var(--bg-surface)';

              if (isAnswerChecked) {
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
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswerChecked}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: bgCol,
                    border: `1px solid ${borderCol}`,
                    textAlign: 'left',
                    fontSize: '14px',
                    color: 'var(--text-primary)',
                    cursor: isAnswerChecked ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>{opt}</span>
                  {isAnswerChecked && isCorrect && <Check size={16} color="#38a169" />}
                  {isAnswerChecked && isSelected && !isCorrect && <X size={16} color="#e53e3e" />}
                </button>
              );
            })}
          </div>

          {isAnswerChecked && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: selectedAnswer === payload.correctAnswer ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
              border: `1px solid ${selectedAnswer === payload.correctAnswer ? 'rgba(56, 161, 105, 0.3)' : 'rgba(229, 62, 62, 0.3)'}`,
              fontSize: '13px',
              color: selectedAnswer === payload.correctAnswer ? '#2f855a' : '#c53030'
            }}>
              <strong>{selectedAnswer === payload.correctAnswer ? 'Comprehension Verified!' : 'Context Detail:'}</strong> {payload.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
