import React, { useState, useEffect, useRef } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { 
  Zap, Volume2, Mic, Square, Check, X, 
  RotateCcw, Sparkles, Moon, Sun, Clock, Flame, ChevronRight, Award
} from 'lucide-react';
import { AzureSpeechService } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';
import { IslandStore } from '../../services/islandStore';
import { ToastStore } from '../../services/toastStore';
import { segmentSentenceIntoTokens } from '../../utils/wordSegmenter';

interface ActiveRecallArenaViewProps {
  islands: LanguageIsland[];
  sentences: IslandSentence[];
  initialIslandId?: string | null;
  hanziData?: any[];
  vocabData?: any[];
  overridesMap?: Record<string, { pinyin: string; definition: string }>;
  onSentenceUpdated?: () => void;
  onCharClick?: (char: string, e: React.MouseEvent, contextSentence?: string) => void;
  onStrokeOrder?: (char: string) => void;
}

export type SprintMode = 'standard' | 'lunch_sprint' | 'bedtime_consolidation';

export const ActiveRecallArenaView: React.FC<ActiveRecallArenaViewProps> = ({
  islands,
  sentences,
  initialIslandId,
  hanziData = [],
  vocabData = [],
  overridesMap = {},
  onSentenceUpdated,
  onCharClick,
  onStrokeOrder
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>(initialIslandId || 'all');
  const [sprintMode, setSprintMode] = useState<SprintMode>('standard');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  // Voice checking
  const [isListeningSpeech, setIsListeningSpeech] = useState(false);
  const [userSpokenText, setUserSpokenText] = useState('');
  const [speechMatchPercent, setSpeechMatchPercent] = useState<number | null>(null);

  // Session stats
  const [streak, setStreak] = useState(0);
  const [sessionCompletedCount, setSessionCompletedCount] = useState(0);
  const [sessionStruggles, setSessionStruggles] = useState(0);
  const [sessionFluents, setSessionFluents] = useState(0);

  // Sprint timer
  const [sprintSecondsRemaining, setSprintSecondsRemaining] = useState(600); // 10 minutes
  const [isSprintRunning, setIsSprintRunning] = useState(false);

  const recognitionRef = useRef<any>(null);
  const sessionStartTimeRef = useRef<number>(Date.now());

  // Filter sentences by island
  const activeDeck = sentences.filter(s => {
    if (selectedIslandId === 'all') return true;
    return s.islandId === selectedIslandId;
  });

  const currentSentence = activeDeck[currentIndex] || null;

  // Sprint countdown timer
  useEffect(() => {
    let interval: any = null;
    if (isSprintRunning && sprintSecondsRemaining > 0) {
      interval = setInterval(() => {
        setSprintSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsSprintRunning(false);
            ToastStore.success('Great effort pushing through the friction.', '🎉 Sprint Finished!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSprintRunning, sprintSecondsRemaining]);

  // Clean up SpeechRecognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Play native audio
  const handlePlayAudio = () => {
    if (!currentSentence) return;
    AzureSpeechService.speak(currentSentence.chinese);
  };

  // Live Mandarin Speech Recognition check
  const toggleSpeechRecognition = () => {
    if (isListeningSpeech) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListeningSpeech(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      ToastStore.warning('Speech recognition is not supported in this browser. Please use Chrome or Edge to test spoken production.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.trim();
        setUserSpokenText(spoken);

        // Calculate basic character match percent
        if (currentSentence) {
          const targetChars = currentSentence.chinese.replace(/[，。！？\s]/g, '').split('');
          const spokenChars = spoken.replace(/[，。！？\s]/g, '').split('');
          let matches = 0;
          for (const char of spokenChars) {
            if (targetChars.includes(char)) matches++;
          }
          const pct = Math.min(100, Math.round((matches / Math.max(1, targetChars.length)) * 100));
          setSpeechMatchPercent(pct);
        }
        setIsRevealed(true);
        handlePlayAudio();
      };

      recognition.onerror = () => {
        setIsListeningSpeech(false);
      };

      recognition.onend = () => {
        setIsListeningSpeech(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListeningSpeech(true);
    } catch (e) {
      console.warn('Speech error:', e);
      setIsListeningSpeech(false);
    }
  };

  // Grade Recall Outcome
  const handleRateOutcome = async (outcome: 'missed' | 'hesitated' | 'fluent') => {
    if (!currentSentence) return;

    await IslandStore.recordRecallAttempt(currentSentence.id, outcome);
    setSessionCompletedCount(prev => prev + 1);

    if (outcome === 'fluent') {
      setStreak(prev => prev + 1);
      setSessionFluents(prev => prev + 1);
    } else if (outcome === 'missed') {
      setStreak(0);
      setSessionStruggles(prev => prev + 1);
    }

    if (onSentenceUpdated) {
      onSentenceUpdated();
    }

    // Reset card state and advance
    setIsRevealed(false);
    setUserSpokenText('');
    setSpeechMatchPercent(null);
    setCurrentIndex(prev => (activeDeck.length > 0 ? (prev + 1) % activeDeck.length : 0));
  };

  const formatSprintTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Step 3 Active Recall Methodology */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: sprintMode === 'bedtime_consolidation' ? '#14171a' : 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Recall Arena: Force Your Brain to Produce
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(231,76,60,0.15)',
              color: '#e74c3c',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Step 3 The Friction Engine
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Look at the English thought. Don't just think it—<strong>say it out loud</strong> from memory. That struggle and friction is the exact moment real memory consolidation happens.
          </p>
        </div>

        {/* Sprint Mode Selector & Deck Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-base)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
            <button
              onClick={() => {
                setSprintMode('standard');
                setIsSprintRunning(false);
              }}
              style={{
                background: sprintMode === 'standard' ? 'var(--bg-surface)' : 'transparent',
                color: sprintMode === 'standard' ? 'var(--text-primary)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Standard
            </button>

            <button
              onClick={() => {
                setSprintMode('lunch_sprint');
                setSprintSecondsRemaining(600);
                setIsSprintRunning(true);
              }}
              style={{
                background: sprintMode === 'lunch_sprint' ? 'var(--accent-bamboo)' : 'transparent',
                color: sprintMode === 'lunch_sprint' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Flame size={12} /> 10m Lunch Sprint
            </button>

            <button
              onClick={() => {
                setSprintMode('bedtime_consolidation');
                setIsSprintRunning(false);
              }}
              style={{
                background: sprintMode === 'bedtime_consolidation' ? '#9b59b6' : 'transparent',
                color: sprintMode === 'bedtime_consolidation' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '4px',
                padding: '5px 10px',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Moon size={12} /> Bedtime Review
            </button>
          </div>

          <select
            value={selectedIslandId}
            onChange={(e) => {
              setSelectedIslandId(e.target.value);
              setCurrentIndex(0);
              setIsRevealed(false);
            }}
            className="form-select"
            style={{ fontSize: '12px', height: '34px' }}
          >
            <option value="all">All Islands ({sentences.length} phrases)</option>
            {islands.map(i => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sprint Info Strip if active */}
      {sprintMode === 'lunch_sprint' && (
        <div style={{
          padding: '12px 18px',
          backgroundColor: 'rgba(241,196,15,0.1)',
          border: '1px solid rgba(241,196,15,0.3)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '13px'
        }}>
          <span style={{ fontWeight: 600, color: '#f39c12' }}>
            🔥 High-Intensity Lunch Break Sprint: Rapid recall drills.
          </span>
          <span style={{ fontWeight: 700, fontSize: '15px', color: '#f39c12' }}>
            Time Remaining: {formatSprintTimer(sprintSecondsRemaining)}
          </span>
        </div>
      )}

      {/* Main Recall Flashcard Arena */}
      {currentSentence ? (
        <div style={{
          padding: '48px 36px',
          backgroundColor: sprintMode === 'bedtime_consolidation' ? '#1c2024' : 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '28px',
          minHeight: '380px',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Deck Counter & Streak Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Phrase {currentIndex + 1} of {activeDeck.length}</span>
            {streak > 1 && (
              <span style={{ color: 'var(--accent-bamboo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={13} /> {streak} Streak!
              </span>
            )}
            <span>Completed: {sessionCompletedCount}</span>
          </div>

          {/* FRONT: English Production Prompt (Must Produce from Memory) */}
          <div style={{ maxWidth: '750px' }}>
            <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
              Produce this in Mandarin aloud:
            </span>
            <div style={{
              fontSize: '28px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              lineHeight: 1.4
            }}>
              "{currentSentence.english}"
            </div>
          </div>

          {/* Optional Mic Test: Speak to Verify */}
          {!isRevealed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={toggleSpeechRecognition}
                className={`btn ${isListeningSpeech ? 'btn-danger' : 'btn-secondary'}`}
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: isListeningSpeech ? '#e74c3c' : undefined,
                  color: isListeningSpeech ? '#fff' : undefined
                }}
              >
                <Mic size={15} />
                <span>{isListeningSpeech ? 'Listening (Speak Mandarin)...' : 'Test Speech Aloud (Voice Check)'}</span>
              </button>

              <button
                onClick={() => {
                  setIsRevealed(true);
                  handlePlayAudio();
                }}
                className="btn btn-bamboo"
                style={{
                  padding: '12px 28px',
                  fontSize: '15px',
                  fontWeight: 600,
                  boxShadow: '0 4px 14px rgba(88,204,2,0.3)',
                  borderRadius: 'var(--radius-pill)'
                }}
              >
                Reveal Answer & Listen
              </button>
            </div>
          )}

          {/* BACK: Revealed Answer & Self-Rating */}
          {isRevealed && (
            <div style={{
              width: '100%',
              maxWidth: '750px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              animation: 'fadeIn 0.2s ease-in'
            }}>
              {/* Voice recognition check feedback if used */}
              {userSpokenText && (
                <div style={{
                  padding: '8px 14px',
                  backgroundColor: speechMatchPercent && speechMatchPercent >= 80 ? 'rgba(88,204,2,0.1)' : 'rgba(241,196,15,0.1)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}>
                  You said: <strong>{userSpokenText}</strong> ({speechMatchPercent}% match)
                </div>
              )}

              {/* Chinese Hanzi & Pinyin */}
              <div style={{
                padding: '20px 28px',
                backgroundColor: 'var(--bg-base)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                width: '100%'
              }}>
                <div style={{
                  fontSize: '30px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif-zh)',
                  lineHeight: 1.5,
                  marginBottom: '8px'
                }}>
                  {segmentSentenceIntoTokens(currentSentence.chinese, hanziData, vocabData, overridesMap).map((token, tIdx) => {
                    if (!token.isHanzi) return <span key={tIdx}>{token.text}</span>;
                    return (
                      <span
                        key={tIdx}
                        onClick={(e) => {
                          if (onCharClick) {
                            e.stopPropagation();
                            onCharClick(token.text, e, currentSentence.chinese);
                          }
                        }}
                        style={{
                          cursor: onCharClick ? 'pointer' : 'default',
                          borderBottom: token.isCompound 
                            ? '2px solid rgba(88, 204, 2, 0.75)' 
                            : '1px dashed rgba(88, 204, 2, 0.4)',
                          backgroundColor: token.isCompound 
                            ? 'rgba(88, 204, 2, 0.08)' 
                            : 'transparent',
                          borderRadius: token.isCompound ? '4px' : '0',
                          padding: token.isCompound ? '1px 4px' : '0',
                          margin: token.isCompound ? '0 2px' : '0',
                          transition: 'all 0.15s ease'
                        }}
                        className={`island-hanzi-token ${token.isCompound ? 'island-compound-token' : ''}`}
                        title={token.isCompound 
                          ? `Compound Word: ${token.text}${token.pinyin ? ` (${token.pinyin})` : ''} - Click to inspect word & component characters` 
                          : `Character: ${token.text} - Click to inspect meaning, pinyin, and radical`}
                      >
                        {token.text}
                      </span>
                    );
                  })}
                </div>

                <div style={{
                  fontSize: '17px',
                  color: 'var(--text-secondary)',
                  fontStyle: 'italic',
                  marginBottom: '10px'
                }}>
                  {currentSentence.pinyin}
                </div>

                {currentSentence.notes && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    💡 {currentSentence.notes}
                  </div>
                )}

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={handlePlayAudio}
                    className="btn btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Volume2 size={12} /> Replay Native Audio
                  </button>

                  {onStrokeOrder && (
                    <button
                      onClick={() => {
                        const firstChar = currentSentence.chinese.split('').find(c => /[\u4E00-\u9FFF]/.test(c));
                        if (firstChar) onStrokeOrder(firstChar);
                      }}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      title="Practice drawing stroke order (米字格)"
                    >
                      <span>🖌️ Stroke Practice</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Three Friction-Based Grade Buttons */}
              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Rate your friction / struggle:
                </span>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => handleRateOutcome('missed')}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                      color: '#e74c3c',
                      borderColor: '#e74c3c',
                      backgroundColor: 'rgba(231,76,60,0.06)'
                    }}
                  >
                    🔴 Missed / Struggled
                  </button>

                  <button
                    onClick={() => handleRateOutcome('hesitated')}
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                      color: '#f39c12',
                      borderColor: '#f39c12',
                      backgroundColor: 'rgba(241,196,15,0.06)'
                    }}
                  >
                    🟡 Hesitated / Partial
                  </button>

                  <button
                    onClick={() => handleRateOutcome('fluent')}
                    className="btn btn-bamboo"
                    style={{
                      padding: '10px 22px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    🟢 Instant & Fluent
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No sentences found for active recall in this island.
        </div>
      )}
    </div>
  );
};
