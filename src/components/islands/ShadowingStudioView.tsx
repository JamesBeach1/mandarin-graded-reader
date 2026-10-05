import React, { useState, useRef, useEffect } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { 
  Mic, Square, Play, RotateCcw, Volume2, 
  Check, ArrowRight, ArrowLeft, Headphones, Sparkles, AlertCircle
} from 'lucide-react';
import { AzureSpeechService, type AudioPlaybackHandle } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';
import { IslandStore } from '../../services/islandStore';
import { ToastStore } from '../../services/toastStore';
import { segmentSentenceIntoTokens } from '../../utils/wordSegmenter';

interface ShadowingStudioViewProps {
  islands: LanguageIsland[];
  sentences: IslandSentence[];
  initialSentenceId?: string | null;
  hanziData?: any[];
  vocabData?: any[];
  overridesMap?: Record<string, { pinyin: string; definition: string }>;
  onSentenceMasteryChange?: (sentenceId: string, level: any) => void;
  onCharClick?: (char: string, e: React.MouseEvent, contextSentence?: string) => void;
  onStrokeOrder?: (char: string) => void;
}

export const ShadowingStudioView: React.FC<ShadowingStudioViewProps> = ({
  islands,
  sentences,
  initialSentenceId,
  hanziData = [],
  vocabData = [],
  overridesMap = {},
  onSentenceMasteryChange,
  onCharClick,
  onStrokeOrder
}) => {
  const [selectedSentenceId, setSelectedSentenceId] = useState<string>(
    initialSentenceId || (sentences[0]?.id || '')
  );
  const [isRecording, setIsRecording] = useState(false);
  const [recordingBlobUrl, setRecordingBlobUrl] = useState<string | null>(null);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingDual, setIsPlayingDual] = useState(false);
  const [speed, setSpeed] = useState<number>(1.0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const userAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const playbackHandleRef = useRef<AudioPlaybackHandle | null>(null);

  // Time logging and audio unmount cleanup
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    sessionStartRef.current = Date.now();
    return () => {
      playbackHandleRef.current?.stop();
      const minutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
      if (minutes >= 1) {
        IslandStore.logDailyActivity('shadowing', minutes);
      }
    };
  }, []);

  const currentIndex = sentences.findIndex(s => s.id === selectedSentenceId);
  const currentSentence = sentences[currentIndex] || sentences[0] || null;

  // Load existing user recording if present
  useEffect(() => {
    let active = true;
    if (currentSentence) {
      IslandStore.getShadowingAudio(currentSentence.id).then(blob => {
        if (!active) return;
        if (blob) {
          const url = URL.createObjectURL(blob);
          setRecordingBlobUrl(url);
        } else {
          setRecordingBlobUrl(null);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [currentSentence?.id]);

  // Clean up blob url on unmount
  useEffect(() => {
    return () => {
      if (recordingBlobUrl) {
        URL.revokeObjectURL(recordingBlobUrl);
      }
    };
  }, [recordingBlobUrl]);

  // Native TTS Audio playback
  const playNativeAudio = (onEnded?: () => void) => {
    if (!currentSentence) return;
    setIsPlayingNative(true);

    playbackHandleRef.current?.stop();
    playbackHandleRef.current = AzureSpeechService.speak(
      currentSentence.chinese,
      { rate: speed },
      () => {
        setIsPlayingNative(false);
        if (onEnded) onEnded();
      },
      () => {
        setIsPlayingNative(false);
        if (onEnded) onEnded();
      }
    );
  };

  // Start Mic Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordingBlobUrl(url);
        if (currentSentence) {
          await IslandStore.saveShadowingAudio(currentSentence.id, audioBlob);
        }
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      ToastStore.warning('Microphone access is required for shadowing recording. Please enable mic permissions in your browser.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play User Audio
  const playUserAudio = (onEnded?: () => void) => {
    if (!recordingBlobUrl) return;
    setIsPlayingUser(true);

    if (!userAudioElementRef.current) {
      userAudioElementRef.current = new Audio(recordingBlobUrl);
    } else {
      userAudioElementRef.current.src = recordingBlobUrl;
    }

    userAudioElementRef.current.onended = () => {
      setIsPlayingUser(false);
      if (onEnded) onEnded();
    };

    userAudioElementRef.current.play().catch(e => {
      console.warn('Playback error:', e);
      setIsPlayingUser(false);
    });
  };

  // Dual A/B Comparison Playback
  const playDualComparison = () => {
    if (!recordingBlobUrl) {
      playNativeAudio();
      return;
    }

    setIsPlayingDual(true);
    // Play native first, then small delay, then user
    playNativeAudio(() => {
      setTimeout(() => {
        playUserAudio(() => {
          setIsPlayingDual(false);
        });
      }, 500);
    });
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setSelectedSentenceId(sentences[currentIndex + 1].id);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setSelectedSentenceId(sentences[currentIndex - 1].id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Shadowing Explainer Banner */}
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
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🗣️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Shadowing Studio: Connect Listening to Mouth Muscle Memory
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              color: 'var(--accent-bamboo)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Step 2 Advanced
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Repeat out loud at the exact same time as the native speaker. Record yourself, then listen to the side-by-side comparison to instantly hear differences in tone contours, pace, and rhythm.
          </p>
        </div>

        {/* Sentence Counter */}
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Phrase {currentIndex + 1} of {sentences.length}
        </div>
      </div>

      {currentSentence ? (
        <div style={{
          padding: '40px 32px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '24px'
        }}>
          {/* Main Phrase Card */}
          <div style={{ maxWidth: '800px' }}>
            <div style={{
              fontSize: '32px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-serif-zh)',
              lineHeight: 1.5,
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

            <div style={{
              fontSize: '17px',
              color: 'var(--text-secondary)',
              fontStyle: 'italic',
              marginBottom: '10px'
            }}>
              {currentSentence.pinyin}
            </div>

            <div style={{
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '12px'
            }}>
              "{currentSentence.english}"
            </div>

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

          {/* Action Row: Listen Native & Record User */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            width: '100%',
            maxWidth: '650px'
          }}>
            {/* Native Playback Button */}
            <button
              onClick={() => playNativeAudio()}
              disabled={isPlayingNative || isPlayingDual}
              className="btn btn-secondary"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Volume2 size={16} className={isPlayingNative ? 'spin' : ''} />
              <span>{isPlayingNative ? 'Playing Native...' : '1. Listen Native'}</span>
            </button>

            {/* Mic Record Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`btn ${isRecording ? 'btn-danger' : 'btn-bamboo'}`}
              style={{
                padding: '10px 22px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 600,
                backgroundColor: isRecording ? '#e74c3c' : undefined
              }}
            >
              {isRecording ? <Square size={16} /> : <Mic size={16} />}
              <span>{isRecording ? 'Stop Recording' : '2. Record Yourself'}</span>
            </button>
          </div>

          {/* A/B Comparison Control Box */}
          {recordingBlobUrl && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '18px 24px',
              backgroundColor: 'rgba(88,204,2,0.06)',
              border: '1px solid rgba(88,204,2,0.25)',
              borderRadius: 'var(--radius-md)',
              width: '100%',
              maxWidth: '650px'
            }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                🎧 Side-by-Side Comparison (A/B Test)
              </span>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => playUserAudio()}
                  disabled={isPlayingUser || isPlayingDual}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px' }}
                >
                  {isPlayingUser ? 'Playing...' : 'Play My Voice'}
                </button>

                <button
                  onClick={playDualComparison}
                  disabled={isPlayingDual || isPlayingNative || isPlayingUser}
                  className="btn btn-bamboo"
                  style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 600 }}
                >
                  {isPlayingDual ? 'Playing Dual Sequence...' : '✨ Play Both (Native ➔ You)'}
                </button>
              </div>

              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Listen closely: Did your pitch drop on the 4th tone? Did your 2nd tone rise cleanly?
              </span>
            </div>
          )}

          {/* Next / Previous Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '650px', marginTop: '12px' }}>
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              <ArrowLeft size={14} /> Previous Phrase
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === sentences.length - 1}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
            >
              Next Phrase <ArrowRight size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          No sentences available for shadowing.
        </div>
      )}
    </div>
  );
};
