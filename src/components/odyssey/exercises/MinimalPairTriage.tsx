import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Clock, Check, X, AlertTriangle } from 'lucide-react';
import type { MinimalPairTriagePayload, MinimalPairOption } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface MinimalPairTriageProps {
  payload: MinimalPairTriagePayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const MinimalPairTriage: React.FC<MinimalPairTriageProps> = ({ payload, onSuccess, onError }) => {
  const [timeLeft, setTimeLeft] = useState(payload.timeLimitSeconds);
  const [selectedOption, setSelectedOption] = useState<MinimalPairOption | null>(null);
  const [isResolved, setIsResolved] = useState(false);
  const timerRef = useRef<any>(null);

  // Play audio on initial load
  useEffect(() => {
    odysseyAudio.speakChinese(payload.promptAudioText);
  }, [payload.promptAudioText]);

  // Countdown timer
  useEffect(() => {
    if (isResolved) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 4) {
          odysseyAudio.playCountdownTick(true);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [isResolved]);

  const handleTimeExpired = () => {
    if (isResolved) return;
    setIsResolved(true);
    odysseyAudio.playErrorChime();
    onError(`Time expired on Minimal Pair Triage for "${payload.promptAudioText}"`);
  };

  const handleSelectOption = (opt: MinimalPairOption) => {
    if (isResolved) return;
    setIsResolved(true);
    setSelectedOption(opt);
    clearInterval(timerRef.current);

    if (opt.isCorrect) {
      odysseyAudio.playCorrectChord();
      onSuccess();
    } else {
      odysseyAudio.playErrorChime();
      onError(`Minimal Pair confusion: Selected "${opt.text}" instead of correct option for "${payload.promptAudioText}"`);
    }
  };

  const progressPercent = Math.max(0, (timeLeft / payload.timeLimitSeconds) * 100);
  const isUrgent = timeLeft <= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      {/* Top Countdown Timer Bar */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUrgent ? '#e53e3e' : 'var(--text-muted)' }}>
            <Clock size={13} /> Phonetic Reflex Timer
          </span>
          <strong style={{ color: isUrgent ? '#e53e3e' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
            {timeLeft}s
          </strong>
        </div>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: isUrgent ? '#e53e3e' : 'var(--accent-indigo)',
              transition: 'width 1s linear, background-color 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Prompt Audio Sphere */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <button
          type="button"
          onClick={() => odysseyAudio.speakChinese(payload.promptAudioText)}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--bg-base)',
            border: '2px solid var(--border-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}
          title="Replay Audio"
        >
          <Volume2 size={28} color="var(--accent-indigo)" />
        </button>

        <div>
          <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
            Which word did you hear?
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Category: {payload.contrastCategory.toUpperCase()} CONTRAST
          </span>
        </div>
      </div>

      {/* Two Triage Options Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', width: '100%' }}>
        {payload.options.map((opt, idx) => {
          const isSelected = selectedOption === opt;
          let borderCol = 'var(--border-subtle)';
          let bgCol = 'var(--bg-surface)';

          if (isResolved) {
            if (opt.isCorrect) {
              borderCol = '#38a169';
              bgCol = 'rgba(56, 161, 105, 0.08)';
            } else if (isSelected && !opt.isCorrect) {
              borderCol = '#e53e3e';
              bgCol = 'rgba(229, 62, 62, 0.08)';
            }
          }

          return (
            <div
              key={idx}
              onClick={() => handleSelectOption(opt)}
              style={{
                padding: '20px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: bgCol,
                border: `2px solid ${borderCol}`,
                cursor: isResolved ? 'default' : 'pointer',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                {opt.text}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
                {opt.pinyin}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {opt.meaning}
              </div>

              {isResolved && opt.isCorrect && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#38a169' }}>
                  <Check size={16} />
                </div>
              )}
              {isResolved && isSelected && !opt.isCorrect && (
                <div style={{ position: 'absolute', top: '8px', right: '8px', color: '#e53e3e' }}>
                  <X size={16} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation banner once resolved */}
      {isResolved && (
        <div style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: selectedOption?.isCorrect ? 'rgba(56, 161, 105, 0.1)' : 'rgba(229, 62, 62, 0.1)',
          border: `1px solid ${selectedOption?.isCorrect ? 'rgba(56, 161, 105, 0.3)' : 'rgba(229, 62, 62, 0.3)'}`,
          fontSize: '13px',
          color: selectedOption?.isCorrect ? '#2f855a' : '#c53030'
        }}>
          <strong>{selectedOption?.isCorrect ? 'Correct!' : 'Notice the difference:'}</strong> {payload.explanation}
        </div>
      )}
    </div>
  );
};
