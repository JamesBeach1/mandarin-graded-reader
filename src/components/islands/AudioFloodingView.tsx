import React, { useState, useEffect, useRef } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { 
  Play, Pause, SkipForward, SkipBack, Repeat, RotateCcw, 
  Volume2, Eye, EyeOff, Clock, Sparkles, Filter, ChevronRight
} from 'lucide-react';
import { AzureSpeechService, type AudioPlaybackHandle } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';
import { IslandStore } from '../../services/islandStore';
import { segmentSentenceIntoTokens } from '../../utils/wordSegmenter';

interface AudioFloodingViewProps {
  islands: LanguageIsland[];
  sentences: IslandSentence[];
  initialIslandId?: string | null;
  hanziData?: any[];
  vocabData?: any[];
  overridesMap?: Record<string, { pinyin: string; definition: string }>;
  onNavigateToShadowing?: (sentence: IslandSentence) => void;
  onCharClick?: (char: string, e: React.MouseEvent, contextSentence?: string) => void;
  onStrokeOrder?: (char: string) => void;
}

export const AudioFloodingView: React.FC<AudioFloodingViewProps> = ({
  islands,
  sentences,
  initialIslandId,
  hanziData = [],
  vocabData = [],
  overridesMap = {},
  onNavigateToShadowing,
  onCharClick,
  onStrokeOrder
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>(initialIslandId || 'all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Audio playback controls
  const [repeatCount, setRepeatCount] = useState<number>(2); // 1, 2, 3, or 999 (loop current)
  const [currentRepeatIteration, setCurrentRepeatIteration] = useState(1);
  const [pauseDelaySeconds, setPauseDelaySeconds] = useState<number>(2); // Buffer between sentences for shadowing
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownRemaining, setCountdownRemaining] = useState(0);

  // Display toggles
  const [showPinyin, setShowPinyin] = useState(true);
  const [showEnglish, setShowEnglish] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(false);

  // Time logging (for Daily Routine)
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const sessionStartTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);

  // Filtered playlist
  const playlist = sentences.filter(s => {
    if (selectedIslandId === 'all') return true;
    return s.islandId === selectedIslandId;
  });

  const currentSentence = playlist[currentIndex] || null;

  // Active playing ref to prevent stale state in timeouts
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  // Track session duration
  useEffect(() => {
    if (isPlaying) {
      if (!sessionStartTimeRef.current) {
        sessionStartTimeRef.current = Date.now();
      }
      timerIntervalRef.current = setInterval(() => {
        if (sessionStartTimeRef.current) {
          const mins = Math.floor((Date.now() - sessionStartTimeRef.current) / 60000);
          setElapsedMinutes(mins);
          if (mins > 0 && mins % 1 === 0) {
            // Log 1 minute of flooding activity
            IslandStore.logDailyActivity('flooding', 1);
          }
        }
      }, 60000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isPlaying]);

  // Active playback handle and timers
  const playbackHandleRef = useRef<AudioPlaybackHandle | null>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Clean up all audio and intervals on unmount
  useEffect(() => {
    return () => {
      playbackHandleRef.current?.stop();
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // Play current sentence audio
  const playCurrentSentenceAudio = () => {
    if (!currentSentence || !isPlayingRef.current) return;

    playbackHandleRef.current?.stop();
    playbackHandleRef.current = AzureSpeechService.speak(
      currentSentence.chinese,
      { rate: playbackSpeed },
      () => {
        handleAudioCompleted();
      },
      () => {
        handleAudioCompleted();
      }
    );
  };

  const handleAudioCompleted = () => {
    if (!isPlayingRef.current) return;

    // Check repeat iterations
    if (repeatCount === 999 || currentRepeatIteration < repeatCount) {
      if (repeatCount !== 999) {
        setCurrentRepeatIteration(prev => prev + 1);
      }
      startPauseCountdown(() => {
        playCurrentSentenceAudio();
      });
    } else {
      // Advance to next sentence
      setCurrentRepeatIteration(1);
      startPauseCountdown(() => {
        advanceNextSentence();
      });
    }
  };

  const startPauseCountdown = (onComplete: () => void) => {
    if (pauseDelaySeconds <= 0) {
      onComplete();
      return;
    }

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    setIsCountingDown(true);
    let remaining = pauseDelaySeconds;
    setCountdownRemaining(remaining);

    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      setCountdownRemaining(remaining);
      if (remaining <= 0 || !isPlayingRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setIsCountingDown(false);
        if (isPlayingRef.current) {
          onComplete();
        }
      }
    }, 1000);
  };

  const advanceNextSentence = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev + 1) % playlist.length);
  };

  const advancePrevSentence = () => {
    if (playlist.length === 0) return;
    setCurrentIndex(prev => (prev - 1 + playlist.length) % playlist.length);
    setCurrentRepeatIteration(1);
  };

  // Play / Pause toggle
  const togglePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      setIsCountingDown(false);
    } else {
      setIsPlaying(true);
      setCurrentRepeatIteration(1);
    }
  };

  // Trigger audio when current index changes and playing
  useEffect(() => {
    if (isPlaying) {
      playCurrentSentenceAudio();
    }
  }, [currentIndex, isPlaying]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Step 2 Audio Flooding Banner */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
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
            <span style={{ fontSize: '20px' }}>🎧</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Audio Flooding: Passive Ear Immersion
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(52,152,219,0.1)',
              color: '#3498db',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Step 2 of Fluency
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Put your earbuds in while commuting, doing chores, or getting dressed. Listen to your real sentences on repeat until you can predict the cadence and rhythm before each line plays.
          </p>
        </div>

        {/* Island filter & elapsed time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px'
          }}>
            <Clock size={13} color="var(--accent-bamboo)" />
            <span>Today's Flooding: <strong>{elapsedMinutes}m</strong></span>
          </div>

          <select
            value={selectedIslandId}
            onChange={(e) => {
              setSelectedIslandId(e.target.value);
              setCurrentIndex(0);
              setCurrentRepeatIteration(1);
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

      {/* Main Theater Display Card */}
      {currentSentence ? (
        <div style={{
          padding: immersiveMode ? '60px 32px' : '40px 32px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px',
          minHeight: '340px',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Top Playlist Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <span>Phrase {currentIndex + 1} of {playlist.length}</span>
            <span>•</span>
            <span>
              {repeatCount === 999 
                ? 'Looping single phrase' 
                : `Loop ${currentRepeatIteration} / ${repeatCount}`}
            </span>
            {isCountingDown && (
              <span style={{ color: 'var(--accent-bamboo)', fontWeight: 600 }}>
                (Pause: {countdownRemaining}s)
              </span>
            )}
          </div>

          {/* Large Chinese Headline */}
          <div style={{ maxWidth: '850px' }}>
            <div style={{
              fontSize: immersiveMode ? '38px' : '30px',
              fontWeight: 600,
              lineHeight: 1.5,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif-zh)',
              marginBottom: '10px'
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

            {/* Pinyin */}
            {showPinyin && (
              <div style={{
                fontSize: immersiveMode ? '19px' : '16px',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                fontStyle: 'italic',
                marginBottom: '12px'
              }}>
                {currentSentence.pinyin}
              </div>
            )}

            {/* English */}
            {showEnglish && (
              <div style={{
                fontSize: '15px',
                color: 'var(--text-muted)',
                lineHeight: 1.4
              }}>
                "{currentSentence.english}"
              </div>
            )}
          </div>

          {/* Quick Grammar / Idiom Pill */}
          {currentSentence.notes && (
            <div style={{
              fontSize: '12px',
              padding: '3px 12px',
              backgroundColor: 'var(--bg-base)',
              borderRadius: 'var(--radius-pill)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-subtle)'
            }}>
              💡 {currentSentence.notes}
            </div>
          )}

          {/* Interactive Player Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '12px' }}>
            <button
              onClick={advancePrevSentence}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', borderRadius: '50%' }}
              title="Previous phrase"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlayPause}
              className="btn btn-bamboo"
              style={{
                padding: '14px 28px',
                fontSize: '16px',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                boxShadow: '0 4px 14px rgba(88,204,2,0.3)'
              }}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              <span>{isPlaying ? 'Pause Loop' : 'Start Immersion Loop'}</span>
            </button>

            <button
              onClick={advanceNextSentence}
              className="btn btn-secondary"
              style={{ padding: '10px 14px', borderRadius: '50%' }}
              title="Next phrase"
            >
              <SkipForward size={18} />
            </button>
          </div>

          {/* Bottom Settings Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '8px',
            fontSize: '12px',
            color: 'var(--text-muted)'
          }}>
            {/* Repetitions per sentence */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Repeat size={13} />
              <span>Repeats:</span>
              {[1, 2, 3, 999].map(num => (
                <button
                  key={num}
                  onClick={() => {
                    setRepeatCount(num);
                    setCurrentRepeatIteration(1);
                  }}
                  style={{
                    background: repeatCount === num ? 'var(--accent-bamboo)' : 'transparent',
                    color: repeatCount === num ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 7px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {num === 999 ? '∞' : `${num}x`}
                </button>
              ))}
            </div>

            {/* Pause Buffer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Pause Gap:</span>
              {[1, 2, 3, 5].map(sec => (
                <button
                  key={sec}
                  onClick={() => setPauseDelaySeconds(sec)}
                  style={{
                    background: pauseDelaySeconds === sec ? 'var(--accent-bamboo)' : 'transparent',
                    color: pauseDelaySeconds === sec ? '#fff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 7px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>

            {/* Toggle Pinyin & English */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setShowPinyin(p => !p)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 10px',
                  color: showPinyin ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                Pinyin: {showPinyin ? 'On' : 'Off'}
              </button>

              <button
                onClick={() => setShowEnglish(e => !e)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 10px',
                  color: showEnglish ? 'var(--text-primary)' : 'var(--text-muted)',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                English: {showEnglish ? 'On' : 'Off'}
              </button>

              {onNavigateToShadowing && (
                <button
                  onClick={() => onNavigateToShadowing(currentSentence)}
                  className="btn btn-secondary"
                  style={{ fontSize: '11px', padding: '3px 10px', borderRadius: 'var(--radius-pill)' }}
                >
                  Jump to Shadowing Studio ➔
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0 }}>No sentences found in this island.</p>
        </div>
      )}
    </div>
  );
};
