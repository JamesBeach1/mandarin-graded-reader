import React, { useState, useEffect, useRef } from 'react';
import {
  X, Play, Pause, RotateCcw, ArrowRight, ArrowLeft,
  BookOpen, Info, CheckCircle2, Layers
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
  const [activeChar, setActiveChar] = useState(character || '好');
  const [strokeCount, setStrokeCount] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [rawStrokeData, setRawStrokeData] = useState<string[]>([]);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);

  useEffect(() => {
    if (character) {
      setActiveChar(character);
    }
  }, [character]);

  useEffect(() => {
    if (!isOpen) {
      if (writerRef.current) {
        writerRef.current = null;
      }
      return;
    }

    // Load HanziWriter if not present
    if (typeof window !== 'undefined' && !(window as any).HanziWriter) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
      script.async = true;
      script.onload = () => initWriter();
      document.body.appendChild(script);
    } else {
      initWriter();
    }
  }, [isOpen, activeChar]);

  const initWriter = () => {
    if (!canvasRef.current || !(window as any).HanziWriter) return;

    canvasRef.current.innerHTML = '';
    const HanziWriter = (window as any).HanziWriter;

    try {
      const writer = HanziWriter.create(canvasRef.current, activeChar, {
        width: 260,
        height: 260,
        padding: 24,
        strokeAnimationSpeed: 1.2,
        delayBetweenStrokes: 250,
        strokeColor: '#B03A2E', // traditional seal cinnabar
        radicalColor: '#3F6B57', // jade green for radical
        outlineColor: 'rgba(160, 160, 165, 0.25)',
        showOutline: true,
        showCharacter: true
      });
      writerRef.current = writer;

      if (HanziWriter.loadCharacterData) {
        HanziWriter.loadCharacterData(activeChar).then((charData: any) => {
          if (charData && charData.strokes) {
            setStrokeCount(charData.strokes.length);
            setRawStrokeData(charData.strokes);
            setCurrentStep(charData.strokes.length);
          }
        }).catch((err: any) => {
          console.warn('Error loading Hanzi strokes data:', err);
        });
      }
    } catch (e) {
      console.warn('Failed to init HanziWriter:', e);
    }
  };

  if (!isOpen) return null;

  const handleAnimate = () => {
    if (!writerRef.current || isPlaying) return;
    setIsPlaying(true);
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
    writerRef.current.showCharacter();
    setCurrentStep(strokeCount);
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
            </div>

            {/* Character Meta & Playback Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontSize: '32px', fontFamily: 'var(--font-serif-zh)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {activeChar}
                  </span>
                  {pinyin && (
                    <span style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', color: 'var(--accent-seal)' }}>
                      {pinyin}
                    </span>
                  )}
                  {strokeCount > 0 && (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      ({strokeCount} 画 · strokes)
                    </span>
                  )}
                </div>
                {definition && (
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    {definition}
                  </p>
                )}
              </div>

              {/* Playback Button Group */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleAnimate}
                  disabled={isPlaying}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px' }}
                >
                  <Play size={14} /> {isPlaying ? 'Drawing...' : 'Animate Stroke Order'}
                </button>
                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '13px' }}
                >
                  <RotateCcw size={13} /> Reset
                </button>
              </div>

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
