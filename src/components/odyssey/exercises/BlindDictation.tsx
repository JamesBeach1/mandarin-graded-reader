import React, { useState, useEffect } from 'react';
import { Volume2, HelpCircle, Check, AlertCircle, RotateCcw } from 'lucide-react';
import type { BlindDictationPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface BlindDictationProps {
  payload: BlindDictationPayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const BlindDictation: React.FC<BlindDictationProps> = ({ payload, onSuccess, onError }) => {
  const [userInput, setUserInput] = useState('');
  const [hasPlayedAudio, setHasPlayedAudio] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  // Play audio automatically on mount
  useEffect(() => {
    odysseyAudio.speakChinese(payload.audioText);
    setHasPlayedAudio(true);
  }, [payload.audioText]);

  const handlePlayAudio = () => {
    odysseyAudio.speakChinese(payload.audioText);
  };

  const handlePlaySlowAudio = () => {
    odysseyAudio.speakChinese(payload.audioText, 0.65);
  };

  const normalize = (str: string) =>
    str.trim().toLowerCase().replace(/[\s,，.。!！?？]/g, '');

  const checkAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'correct') return;

    const cleanInput = normalize(userInput);
    if (!cleanInput) return;

    const isMatch = payload.acceptedAnswers.some(ans => {
      const cleanAns = normalize(ans);
      return cleanInput === cleanAns || cleanInput === normalize(payload.audioText) || cleanInput === normalize(payload.pinyin);
    });

    if (isMatch) {
      setStatus('correct');
      odysseyAudio.playCorrectChord();
      onSuccess();
    } else {
      setStatus('incorrect');
      odysseyAudio.playErrorChime();
      onError(`Blind Dictation mismatch for "${payload.audioText}" (User typed: "${userInput}")`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      {/* Audio Trigger Sphere */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '30px 20px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-base)',
          border: '2px solid var(--border-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.2s ease'
        }}
        onClick={handlePlayAudio}
        title="Click to play Chinese audio"
        >
          <Volume2 size={32} color="var(--accent-indigo)" />
        </div>

        <div>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
            {hasPlayedAudio ? 'Listen carefully and transcribe' : 'Click to hear audio'}
          </span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handlePlayAudio}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <Volume2 size={12} /> Normal Speed
            </button>
            <button
              type="button"
              onClick={handlePlaySlowAudio}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '4px 10px' }}
            >
              <RotateCcw size={12} /> 0.65x Slow
            </button>
          </div>
        </div>
      </div>

      {/* Input transcription form */}
      <form onSubmit={checkAnswer} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              if (status === 'incorrect') setStatus('idle');
            }}
            placeholder="Type in Chinese characters or Pinyin..."
            className="form-input"
            style={{
              width: '100%',
              fontSize: '18px',
              textAlign: 'center',
              padding: '14px 16px',
              fontFamily: 'var(--font-serif-zh), var(--font-sans)',
              borderColor: status === 'correct' ? '#38a169' : status === 'incorrect' ? '#e53e3e' : 'var(--border-subtle)'
            }}
            autoFocus
            disabled={status === 'correct'}
          />
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--text-muted)' }}
          >
            <HelpCircle size={13} /> Need a hint?
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: '8px 24px', fontSize: '14px' }}
            disabled={!userInput.trim() || status === 'correct'}
          >
            Check Transcription
          </button>
        </div>
      </form>

      {/* Hint reveal */}
      {showHint && (
        <div style={{
          width: '100%',
          padding: '10px 14px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--bg-base)',
          border: '1px dashed var(--border-subtle)',
          fontSize: '13px',
          color: 'var(--text-secondary)'
        }}>
          💡 <strong>Translation Hint:</strong> &ldquo;{payload.englishTranslation}&rdquo; (Pinyin starts with: <em>{payload.pinyin.slice(0, 4)}...</em>)
        </div>
      )}

      {/* Validation banner */}
      {status === 'correct' && (
        <div style={{
          width: '100%',
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
          <span><strong>Spot on!</strong> {payload.audioText} ({payload.pinyin}) &mdash; {payload.englishTranslation}</span>
        </div>
      )}

      {status === 'incorrect' && (
        <div style={{
          width: '100%',
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(229, 62, 62, 0.1)',
          border: '1px solid rgba(229, 62, 62, 0.3)',
          color: '#e53e3e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px'
        }}>
          <AlertCircle size={18} />
          <span>Not quite. Listen again carefully to the tones or check your spelling!</span>
        </div>
      )}
    </div>
  );
};
