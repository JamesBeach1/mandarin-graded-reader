import React, { useState, useEffect, useRef } from 'react';
import {
  IME_DRILL_PROMPTS,
  getImeCandidates,
  type ImePrompt
} from '../utils/imeEngine';
import { X, Keyboard, CheckCircle2, RotateCcw, Volume2, ArrowRight, Sparkles, Filter, Zap } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface PinyinImeDrillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PinyinImeDrillModal: React.FC<PinyinImeDrillModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedLevel, setSelectedLevel] = useState<number>(0); // 0 = all
  const [currentPromptIdx, setCurrentPromptIdx] = useState(0);
  const [committedText, setCommittedText] = useState('');
  const [inputBuffer, setInputBuffer] = useState('');
  const [candidates, setCandidates] = useState<string[]>([]);
  const [errorCount, setErrorCount] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctCommittedChars, setCorrectCommittedChars] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [cpm, setCpm] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  const prompts = selectedLevel === 0
    ? IME_DRILL_PROMPTS
    : IME_DRILL_PROMPTS.filter(p => p.hskLevel === selectedLevel);

  const activePrompt: ImePrompt = prompts[currentPromptIdx % prompts.length];

  // Reset drill stage for a new prompt
  const setupPrompt = (index: number) => {
    setCommittedText('');
    setInputBuffer('');
    setCandidates([]);
    setIsCompleted(false);
    setStartTime(null);
    setCpm(0);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (isOpen) {
      setCurrentPromptIdx(0);
      setupPrompt(0);
    }
  }, [isOpen, selectedLevel]);

  // Update candidates whenever inputBuffer changes
  useEffect(() => {
    if (!inputBuffer) {
      setCandidates([]);
    } else {
      const c = getImeCandidates(inputBuffer);
      setCandidates(c);
    }
  }, [inputBuffer]);

  if (!isOpen) return null;

  // Handle selecting a candidate
  const commitCandidate = (candidate: string) => {
    if (!candidate) return;

    if (!startTime) {
      setStartTime(Date.now());
    }

    const nextCommitted = committedText + candidate;
    setInputBuffer('');

    // Check accuracy against target sentence
    const targetSubstring = activePrompt.hanzi.substring(0, nextCommitted.length);
    if (nextCommitted === targetSubstring) {
      setCommittedText(nextCommitted);
      setCorrectCommittedChars(prev => prev + candidate.length);

      // Check if finished entire sentence
      if (nextCommitted === activePrompt.hanzi) {
        setIsCompleted(true);
        const elapsedMinutes = Math.max(0.05, (Date.now() - (startTime || Date.now())) / 60000);
        const finalCpm = Math.round(activePrompt.hanzi.length / elapsedMinutes);
        setCpm(finalCpm);
        AzureSpeechService.speak(activePrompt.hanzi, 0.9);
      }
    } else {
      // Mis-selected candidate!
      setErrorCount(prev => prev + 1);
      setCommittedText(nextCommitted);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setTotalKeystrokes(prev => prev + 1);
    if (!startTime) {
      setStartTime(Date.now());
    }

    // Number keys 1..9 select candidate
    if (candidates.length > 0 && e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key) - 1;
      if (idx < candidates.length) {
        e.preventDefault();
        commitCandidate(candidates[idx]);
        return;
      }
    }

    // Space selects first candidate
    if (e.key === ' ' && candidates.length > 0) {
      e.preventDefault();
      commitCandidate(candidates[0]);
      return;
    }

    // Backspace: if buffer has text, let default input handle it; if empty, delete last committed
    if (e.key === 'Backspace' && inputBuffer === '' && committedText.length > 0) {
      e.preventDefault();
      setCommittedText(prev => prev.slice(0, -1));
      return;
    }
  };

  const handleNextPrompt = () => {
    const nextIdx = (currentPromptIdx + 1) % prompts.length;
    setCurrentPromptIdx(nextIdx);
    setupPrompt(nextIdx);
  };

  const accuracy = totalKeystrokes > 0
    ? Math.max(0, Math.round(((totalKeystrokes - errorCount) / totalKeystrokes) * 100))
    : 100;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '680px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 160, 23, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Keyboard size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Pinyin Typing Practice & IME Simulator
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Master standard Chinese QWERTY keyboard candidate selection (AIM-003)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Level Filters & Live Metrics */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          backgroundColor: 'var(--bg-base)'
        }}>
          {/* Level Filter */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Level:</span>
            {[
              { id: 0, label: 'All' },
              { id: 1, label: 'HSK 1' },
              { id: 2, label: 'HSK 2' },
              { id: 3, label: 'HSK 3' },
              { id: 4, label: 'HSK 4' }
            ].map(lvl => (
              <button
                key={lvl.id}
                onClick={() => setSelectedLevel(lvl.id)}
                style={{
                  padding: '3px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: selectedLevel === lvl.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  backgroundColor: selectedLevel === lvl.id ? 'rgba(212, 160, 23, 0.15)' : 'var(--bg-surface)',
                  color: selectedLevel === lvl.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Speed & Accuracy */}
          <div style={{ display: 'flex', gap: '14px', fontSize: '12px' }}>
            <div>
              Accuracy: <strong style={{ color: accuracy >= 90 ? 'var(--accent-bamboo)' : 'var(--accent-gold)' }}>{accuracy}%</strong>
            </div>
            <div>
              Speed: <strong style={{ color: 'var(--accent-gold)' }}>{cpm > 0 ? cpm : '—'}</strong> <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>CPM</span>
            </div>
          </div>
        </div>

        {/* Drill Arena */}
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Target Sentence Display */}
          <div style={{
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--accent-gold)', fontWeight: 600 }}>
              Target Sentence (HSK {activePrompt.hskLevel})
            </div>

            {/* Target Character Rendering with Real-time Matched Status */}
            <div style={{ fontSize: '32px', fontWeight: 600, fontFamily: 'var(--font-zh)', letterSpacing: '0.08em', display: 'flex', justifyContent: 'center', gap: '2px' }}>
              {activePrompt.hanzi.split('').map((char, ci) => {
                const isMatched = ci < committedText.length && committedText[ci] === char;
                const isWrong = ci < committedText.length && committedText[ci] !== char;
                let color = 'var(--text-primary)';
                if (isMatched) color = 'var(--accent-bamboo)';
                if (isWrong) color = 'var(--accent-coral)';

                return (
                  <span
                    key={ci}
                    style={{
                      color: color,
                      borderBottom: ci === committedText.length ? '2px solid var(--accent-gold)' : 'none',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {char}
                  </span>
                );
              })}
            </div>

            <div style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 500 }}>
              {activePrompt.pinyin}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              "{activePrompt.translation}"
            </div>
          </div>

          {/* Typing Input & Floating IME Candidates Window */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Type Toneless Pinyin (Space or 1..5 to select candidates):
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-base)',
              border: '2px solid var(--accent-gold)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 16px',
              fontSize: '18px',
              fontFamily: 'monospace'
            }}>
              {/* Already committed text */}
              <span style={{ color: 'var(--accent-bamboo)', fontWeight: 600, fontFamily: 'var(--font-zh)' }}>
                {committedText}
              </span>

              {/* Active input buffer (pinyin) */}
              <input
                ref={inputRef}
                type="text"
                value={inputBuffer}
                onChange={(e) => setInputBuffer(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
                onKeyDown={handleKeyDown}
                placeholder={committedText ? '' : 'type pinyin e.g. "ni"...'}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  width: '100%',
                  marginLeft: '4px'
                }}
                disabled={isCompleted}
                autoFocus
              />
            </div>

            {/* Floating IME Candidate Box */}
            {candidates.length > 0 && !isCompleted && (
              <div style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--accent-gold)',
                borderRadius: '6px',
                padding: '8px 12px',
                display: 'flex',
                gap: '12px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  IME Candidates:
                </span>
                {candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => commitCandidate(cand)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: idx === 0 ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                      backgroundColor: idx === 0 ? 'rgba(212, 160, 23, 0.15)' : 'var(--bg-base)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontFamily: 'var(--font-zh)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                      {idx + 1}.
                    </span>
                    <span>{cand}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Completed State Celebration Banner */}
          {isCompleted && (
            <div style={{
              padding: '16px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(74, 222, 128, 0.08)',
              border: '1px solid var(--accent-bamboo)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={24} color="var(--accent-bamboo)" />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                    Sentence Complete! Speed: {cpm} CPM
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Accuracy: {accuracy}% • Native audio vocalized
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => AzureSpeechService.speak(activePrompt.hanzi, 0.9)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Volume2 size={13} /> Replay Audio
                </button>
                <button
                  type="button"
                  onClick={handleNextPrompt}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#000',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Next Drill <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-base)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            Tip: Press <strong>Space</strong> for 1st candidate, or keys <strong>1-5</strong> for alternatives.
          </div>
          <button
            type="button"
            onClick={() => setupPrompt(currentPromptIdx)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px'
            }}
          >
            <RotateCcw size={12} /> Restart Current
          </button>
        </div>
      </div>
    </div>
  );
};
