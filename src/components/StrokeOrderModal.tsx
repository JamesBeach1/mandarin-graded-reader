import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Play, Pause, RotateCcw, ArrowRight, ArrowLeft,
  BookOpen, Info, CheckCircle2, Layers, Edit3, Sparkles
} from 'lucide-react';
import { StrokeOrderService, STROKE_ORDER_RULES } from '../utils/strokeOrderData';
import type { HanziWriterInstance } from '../types/hanzi-writer';

interface StrokeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: string;
  pinyin?: string;
  definition?: string;
}

export const StrokeOrderModal: React.FC<StrokeOrderModalProps> = ({
  isOpen,
  onClose,
  character,
  pinyin = '',
  definition = ''
}) => {
  // Extract individual Chinese characters if character is a multi-char compound word (e.g. 咖啡馆)
  const hanziChars = useMemo(() => {
    if (!character) return ['好'];
    const matches = character.match(/[\u4E00-\u9FFF]/g);
    return matches && matches.length > 0 ? matches : [character[0] || '好'];
  }, [character]);

  const [activeChar, setActiveChar] = useState<string>(() => {
    const matches = character ? character.match(/[\u4E00-\u9FFF]/g) : null;
    return matches && matches.length > 0 ? matches[0] : (character ? character[0] : '好');
  });

  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showOutlineHint, setShowOutlineHint] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [rawStrokeData, setRawStrokeData] = useState<string[]>([]);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);

  // Sync active character when input character changes
  useEffect(() => {
    if (hanziChars.length > 0) {
      setActiveChar(hanziChars[0]);
    }
  }, [character, hanziChars]);

  // Compute pinyin for the active character when inspecting a compound word
  const activePinyin = useMemo(() => {
    if (!pinyin) return '';
    if (hanziChars.length <= 1) return pinyin;
    const parts = pinyin.trim().split(/\s+/);
    const activeIdx = hanziChars.indexOf(activeChar);
    if (activeIdx >= 0 && parts[activeIdx]) {
      return parts[activeIdx];
    }
    return pinyin;
  }, [pinyin, hanziChars, activeChar]);

  useEffect(() => {
    let cancelled = false;

    if (!isOpen) {
      if (writerRef.current) {
        writerRef.current = null;
      }
      return;
    }

    const runInit = () => {
      if (!cancelled) {
        initWriter(() => cancelled);
      }
    };

    // Load HanziWriter if not present
    if (typeof window !== 'undefined' && !(window as any).HanziWriter) {
      const existingScript = document.querySelector('script[src*="hanzi-writer"]');
      if (existingScript) {
        existingScript.addEventListener('load', runInit, { once: true });
      } else {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
        script.async = true;
        script.onload = runInit;
        document.body.appendChild(script);
      }
    } else {
      runInit();
    }

    return () => {
      cancelled = true;
      if (writerRef.current) {
        try {
          writerRef.current.cancelQuiz();
        } catch (e) {}
      }
    };
  }, [isOpen, activeChar]);

  const initWriter = (isCancelled?: () => boolean) => {
    if (!canvasRef.current || !(window as any).HanziWriter || (isCancelled && isCancelled())) return;

    const targetChar = (activeChar && activeChar.length > 0) ? activeChar[0] : '好';
    canvasRef.current.innerHTML = '';
    const HanziWriter = (window as any).HanziWriter;

    try {
      const writer = HanziWriter.create(canvasRef.current, targetChar, {
        width: 260,
        height: 260,
        padding: 24,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 250,
        strokeColor: '#B03A2E', // traditional seal cinnabar
        radicalColor: '#3F6B57', // jade green for radical
        outlineColor: 'rgba(160, 160, 165, 0.28)',
        drawingColor: '#2B4C3F', // bamboo ink for interactive user strokes
        drawingWidth: 5,
        showOutline: true,
        showCharacter: true
      });
      writerRef.current = writer;

      if (HanziWriter.loadCharacterData) {
        HanziWriter.loadCharacterData(targetChar).then((charData: any) => {
          if (isCancelled && isCancelled()) return;
          if (charData && charData.strokes) {
            setStrokeCount(charData.strokes.length);
            setRawStrokeData(charData.strokes);
            setCurrentStep(charData.strokes.length);
          }
        }).catch((err: any) => {
          console.warn('Error loading Hanzi strokes data for', targetChar, err);
        });
      }
    } catch (e) {
      console.warn('Failed to init HanziWriter:', e);
    }
  };

  if (!isOpen) return null;

  const handleStartQuiz = () => {
    if (!writerRef.current) return;
    setIsPlaying(false);
    setIsQuizComplete(false);
    setIsQuizzing(true);

    try {
      writerRef.current.cancelQuiz();
    } catch (e) {}

    writerRef.current.quiz({
      showOutline: showOutlineHint,
      showHintAfterMisses: 2,
      highlightOnComplete: true,
      onComplete: () => {
        setIsQuizComplete(true);
        setIsQuizzing(false);
      }
    });
  };

  const handleAnimate = () => {
    if (!writerRef.current || isPlaying) return;
    if (isQuizzing) {
      try {
        writerRef.current.cancelQuiz();
      } catch (e) {}
      setIsQuizzing(false);
    }
    setIsQuizComplete(false);
    setIsPlaying(true);
    writerRef.current.showCharacter();
    writerRef.current.animateCharacter({
      onComplete: () => {
        setIsPlaying(false);
        setCurrentStep(strokeCount);
      }
    });
  };

  const handleReset = () => {
    if (!writerRef.current) return;
    setIsPlaying(false);
    setIsQuizzing(false);
    setIsQuizComplete(false);
    try {
      writerRef.current.cancelQuiz();
    } catch (e) {}
    writerRef.current.showCharacter();
    setCurrentStep(strokeCount);
  };

  const toggleOutlineHint = () => {
    const nextVal = !showOutlineHint;
    setShowOutlineHint(nextVal);
    if (writerRef.current) {
      try {
        writerRef.current.update({ showOutline: nextVal });
      } catch (e) {}
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(163, 59, 59, 0.15)',
              color: 'var(--accent-seal)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-serif-zh)',
              fontSize: '18px',
              fontWeight: 700
            }}>
              笔
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                汉字笔顺 · Integrated Stroke Order Typography (AIM-010)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Canonical sequential stroke order & calligraphy guidelines (米字格)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="control-button"
            style={{ padding: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Compound Word Character Selector Tabs */}
          {hanziChars.length > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Compound Word:
                </span>
                <span style={{ fontFamily: 'var(--font-serif-zh)', fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {character}
                </span>
                {pinyin && (
                  <span style={{ fontSize: '13px', color: 'var(--accent-seal)', fontFamily: 'var(--font-mono)' }}>
                    ({pinyin})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Select character:</span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {hanziChars.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setActiveChar(c);
                        setIsPlaying(false);
                        setIsQuizzing(false);
                        setIsQuizComplete(false);
                      }}
                      className={`btn ${activeChar === c ? 'btn-bamboo' : 'btn-secondary'}`}
                      style={{
                        fontFamily: 'var(--font-serif-zh)',
                        fontSize: '16px',
                        fontWeight: 600,
                        padding: '4px 14px',
                        borderRadius: 'var(--radius-sm)',
                        minWidth: '40px',
                        boxShadow: activeChar === c ? '0 0 0 2px var(--accent-bamboo)' : 'none'
                      }}
                      title={`Inspect stroke order for ${c} (${i + 1}/${hanziChars.length})`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Stage Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '280px 1fr',
            gap: '24px',
            alignItems: 'center'
          }}>
            {/* Calligraphic Rice-Grid Canvas (米字格) */}
            <div style={{
              position: 'relative',
              width: '260px',
              height: '260px',
              margin: '0 auto',
              backgroundColor: 'var(--bg-base)',
              border: '2px solid var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'inset 0 0 0 1px var(--border-subtle)',
              overflow: 'hidden'
            }}>
              {/* Traditional Red Guideline Grid (米字格) */}
              <svg
                viewBox="0 0 260 260"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  opacity: 0.25
                }}
              >
                {/* Horizontal center */}
                <line x1="0" y1="130" x2="260" y2="130" stroke="var(--accent-seal)" strokeDasharray="4 3" />
                {/* Vertical center */}
                <line x1="130" y1="0" x2="130" y2="260" stroke="var(--accent-seal)" strokeDasharray="4 3" />
                {/* Diagonal 1 */}
                <line x1="0" y1="0" x2="260" y2="260" stroke="var(--accent-seal)" strokeDasharray="3 3" />
                {/* Diagonal 2 */}
                <line x1="260" y1="0" x2="0" y2="260" stroke="var(--accent-seal)" strokeDasharray="3 3" />
              </svg>

              {/* HanziWriter Canvas mount point */}
              <div ref={canvasRef} style={{ width: '260px', height: '260px', position: 'relative', zIndex: 2 }} />

              {/* Drawing Mode Overlay Badge */}
              {isQuizzing && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  zIndex: 10,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  fontSize: '10px',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-bamboo)',
                  color: '#FFFFFF',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <Edit3 size={10} /> Draw Mode
                </div>
              )}
            </div>

            {/* Character Meta & Playback Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '32px', fontFamily: 'var(--font-serif-zh)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeChar}
                  </span>
                  {activePinyin && (
                    <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', color: 'var(--accent-seal)' }}>
                      {activePinyin}
                    </span>
                  )}
                  {strokeCount > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({strokeCount} 画 · strokes)
                    </span>
                  )}
                  {hanziChars.length > 1 && (
                    <span style={{ fontSize: '11px', color: 'var(--accent-bamboo)', fontWeight: 500 }}>
                      [Char {hanziChars.indexOf(activeChar) + 1} of {hanziChars.length}]
                    </span>
                  )}
                </div>
                {definition && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {definition}
                  </p>
                )}
              </div>

              {/* Playback & Drawing Button Group */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAnimate}
                  disabled={isPlaying}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                >
                  <Play size={14} /> {isPlaying ? 'Drawing...' : 'Animate'}
                </button>
                <button
                  onClick={handleStartQuiz}
                  className={`btn ${isQuizzing ? 'btn-bamboo' : 'btn-primary'}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
                  title="Interactive handwriting canvas: draw strokes with your mouse or stylus"
                >
                  <Edit3 size={14} /> {isQuizzing ? 'Drawing Active...' : 'Practice Drawing'}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

              {/* Quizzing / Drawing Guidance & Controls */}
              {isQuizzing && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(76, 107, 83, 0.12)',
                  border: '1px solid var(--accent-bamboo)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-bamboo)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Edit3 size={13} /> Draw strokes on the grid
                    </span>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <input
                        type="checkbox"
                        checked={showOutlineHint}
                        onChange={toggleOutlineHint}
                        style={{ cursor: 'pointer' }}
                      />
                      Show Outline Guide
                    </label>
                  </div>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    Click & drag following canonical stroke order. Hints appear automatically after 2 misses.
                  </span>
                </div>
              )}

              {/* Quiz Completion Celebration Banner */}
              {isQuizComplete && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: 'rgba(88, 204, 2, 0.12)',
                  border: '1px solid rgba(88, 204, 2, 0.4)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-bamboo)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={15} /> Well done! Stroke order completed!
                  </span>
                  <button
                    onClick={handleStartQuiz}
                    className="btn btn-bamboo"
                    style={{ fontSize: '11px', padding: '3px 8px' }}
                  >
                    Draw Again
                  </button>
                </div>
              )}

              {/* Character Input Quick Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inspect character:</span>
                <input
                  type="text"
                  maxLength={1}
                  value={activeChar}
                  onChange={(e) => {
                    const char = e.target.value.trim();
                    if (char) setActiveChar(char);
                  }}
                  className="form-input"
                  style={{ width: '48px', height: '32px', textAlign: 'center', fontSize: '16px', fontFamily: 'var(--font-serif-zh)' }}
                />
              </div>

              {/* Toggle Stroke Rules */}
              <button
                onClick={() => setShowRules(!showRules)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-gold)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px'
                }}
              >
                <Info size={13} /> {showRules ? 'Hide standard stroke order rules' : 'View 7 standard stroke order rules (笔顺七大规则)'}
              </button>
            </div>
          </div>

          {/* Stroke Rules Drawer */}
          {showRules && (
            <div style={{
              padding: '16px',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                Chinese Character Stroke Order Rules (笔顺基本法则):
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {STROKE_ORDER_RULES.map((r, i) => (
                  <div key={i} style={{ padding: '8px 10px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent-gold)', fontFamily: 'var(--font-serif-zh)' }}>
                      {i + 1}. {r.rule} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>({r.pinyin})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {r.description}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontStyle: 'italic' }}>
                      例字：{r.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ✏️ Moyun (墨韵) AIM-010 · Integrated Calligraphic Stroke Engine
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
