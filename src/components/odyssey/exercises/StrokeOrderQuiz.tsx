import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Eye, Check, AlertCircle } from 'lucide-react';
import type { StrokeOrderQuizPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface StrokeOrderQuizProps {
  payload: StrokeOrderQuizPayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const StrokeOrderQuiz: React.FC<StrokeOrderQuizProps> = ({ payload, onSuccess, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const writerInstanceRef = useRef<any>(null);
  const [isScriptReady, setIsScriptReady] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [strokeMistakes, setStrokeMistakes] = useState(0);
  const [hasRevealedOutline, setHasRevealedOutline] = useState(false);

  // Load HanziWriter script
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).HanziWriter) {
      setIsScriptReady(true);
    } else if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
      script.onload = () => setIsScriptReady(true);
      script.onerror = () => setIsScriptReady(true); // graceful fallback
      document.head.appendChild(script);
    }
  }, []);

  // Initialize HanziWriter quiz mode
  useEffect(() => {
    if (!isScriptReady || !containerRef.current || isPassed) return;

    const HanziWriter = (window as any).HanziWriter;
    if (!HanziWriter) return;

    containerRef.current.innerHTML = '';
    try {
      const writer = HanziWriter.create(containerRef.current, payload.character, {
        width: 220,
        height: 220,
        padding: 15,
        showOutline: hasRevealedOutline,
        strokeColor: '#38a169',
        outlineColor: 'rgba(255, 255, 255, 0.15)',
        drawingColor: '#6366f1',
        strokeWidth: 4,
        highlightColor: '#e53e3e',
        charDataLoader: (char: string, onComplete: any) => {
          fetch(`https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0/${char}.json`)
            .then(res => res.json())
            .then(onComplete)
            .catch(() => {
              // Fallback to local SVG font or skip
            });
        }
      });

      writerInstanceRef.current = writer;

      writer.quiz({
        onMistake: () => {
          odysseyAudio.playErrorChime();
          setStrokeMistakes(prev => prev + 1);
        },
        onCorrectStroke: () => {
          odysseyAudio.playChipConnect();
        },
        onComplete: (summary: any) => {
          setIsPassed(true);
          odysseyAudio.playCorrectChord();
          if (summary.totalMistakes > 2) {
            onError(`Stroke order mistakes (${summary.totalMistakes}) on "${payload.character}"`);
          } else {
            onSuccess();
          }
        }
      });
    } catch {
      // Fallback
    }

    return () => {
      if (writerInstanceRef.current) {
        try {
          writerInstanceRef.current.cancelQuiz();
        } catch {}
      }
    };
  }, [isScriptReady, payload.character, hasRevealedOutline, isPassed]);

  const handleRevealOutline = () => {
    setHasRevealedOutline(true);
  };

  const handleReset = () => {
    if (writerInstanceRef.current) {
      try {
        writerInstanceRef.current.quiz();
        setIsPassed(false);
        setStrokeMistakes(0);
      } catch {}
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      {/* Target Prompt Info */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Draw Character from Memory
        </div>
        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
          {payload.pinyin} &mdash; &ldquo;{payload.definition}&rdquo;
        </div>
        {payload.radical && (
          <div style={{ fontSize: '12px', color: 'var(--accent-indigo)' }}>
            Radical hint: {payload.radical}
          </div>
        )}
      </div>

      {/* Interactive Hanzi Canvas Box */}
      <div style={{
        width: '240px',
        height: '240px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-base)',
        border: `2px solid ${isPassed ? '#38a169' : 'var(--border-strong)'}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
        cursor: 'crosshair'
      }}>
        {/* Mi Zi Ge (Rice Character Grid Lines) */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="0" y1="0" x2="240" y2="240" stroke="var(--border-subtle)" strokeDasharray="4 4" />
          <line x1="240" y1="0" x2="0" y2="240" stroke="var(--border-subtle)" strokeDasharray="4 4" />
          <line x1="120" y1="0" x2="120" y2="240" stroke="var(--border-subtle)" strokeDasharray="4 4" />
          <line x1="0" y1="120" x2="240" y2="120" stroke="var(--border-subtle)" strokeDasharray="4 4" />
        </svg>

        <div ref={containerRef} style={{ width: '220px', height: '220px', zIndex: 2 }} />

        {/* Fallback if HanziWriter takes time to load */}
        {!isScriptReady && (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Loading writing canvas...
          </span>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleRevealOutline}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
          disabled={hasRevealedOutline || isPassed}
        >
          <Eye size={13} /> Reveal Outline
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          <RotateCcw size={13} /> Restart Canvas
        </button>
      </div>

      {/* Result feedback */}
      {isPassed && (
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
          <span><strong>Strokes Verified!</strong> You accurately formed {payload.character} ({payload.pinyin}).</span>
        </div>
      )}

      {strokeMistakes > 2 && !isPassed && (
        <div style={{ fontSize: '12px', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertCircle size={13} /> Multiple stroke order mistakes. Follow standard top-to-bottom, left-to-right stroke flow.
        </div>
      )}
    </div>
  );
};
