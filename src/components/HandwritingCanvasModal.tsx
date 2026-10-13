import React, { useRef, useState, useEffect } from 'react';
import { 
  classifyStroke, 
  recognizeHandwriting, 
  type RawStroke, 
  type StrokePoint, 
  type CharacterCandidate 
} from '../utils/handwritingRecognizer';
import { RotateCcw, X, Edit3, Check } from 'lucide-react';

interface HandwritingCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (char: string) => void;
  externalHanziDb?: any[];
}

export const HandwritingCanvasModal: React.FC<HandwritingCanvasModalProps> = ({
  isOpen,
  onClose,
  onSelectCharacter,
  externalHanziDb
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<RawStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<RawStroke | null>(null);
  const [candidates, setCandidates] = useState<CharacterCandidate[]>([]);
  const isDrawingRef = useRef(false);

  // Redraw canvas whenever strokes change
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Draw Rice-Grid (米字格) background
    ctx.clearRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = 'var(--bg-canvas-subtle, #1a1a1e)';
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Outer border
    ctx.strokeRect(0, 0, rect.width, rect.height);

    // Horizontal & vertical center lines
    ctx.beginPath();
    ctx.moveTo(rect.width / 2, 0);
    ctx.lineTo(rect.width / 2, rect.height);
    ctx.moveTo(0, rect.height / 2);
    ctx.lineTo(rect.width, rect.height / 2);
    // Diagonals
    ctx.moveTo(0, 0);
    ctx.lineTo(rect.width, rect.height);
    ctx.moveTo(rect.width, 0);
    ctx.lineTo(0, rect.height);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw all completed strokes
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const renderStroke = (strokePoints: RawStroke) => {
      if (strokePoints.length === 0) return;
      ctx.beginPath();
      ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
      for (let i = 1; i < strokePoints.length; i++) {
        ctx.lineTo(strokePoints[i].x, strokePoints[i].y);
      }
      ctx.stroke();
    };

    strokes.forEach(renderStroke);
    if (currentStroke) {
      renderStroke(currentStroke);
    }
  }, [strokes, currentStroke, isOpen]);

  // Run recognition whenever strokes update
  useEffect(() => {
    if (strokes.length === 0) {
      setCandidates([]);
      return;
    }
    const results = recognizeHandwriting(strokes, externalHanziDb);
    setCandidates(results);
  }, [strokes, externalHanziDb]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const pt: StrokePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };
    setCurrentStroke([pt]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStroke) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pt: StrokePoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      time: Date.now()
    };
    setCurrentStroke(prev => (prev ? [...prev, pt] : [pt]));
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStroke && currentStroke.length > 1) {
      setStrokes(prev => [...prev, currentStroke]);
    }
    setCurrentStroke(null);
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke(null);
    setCandidates([]);
  };

  const handleUndo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: 'var(--bg-surface, #1e1e24)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-strong, #333)',
          boxShadow: 'var(--shadow-modal, 0 16px 40px rgba(0,0,0,0.5))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle, #2a2a30)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={16} color="var(--accent-bamboo, #58cc02)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
              Handwriting Lookup (手写查字)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '4px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary, #aaa)' }}>
            Draw an unknown Chinese character on the calligraphic grid below. Stroke count & directions are analyzed in real time.
          </p>

          {/* Canvas Area */}
          <div style={{
            position: 'relative',
            width: '100%',
            height: '240px',
            borderRadius: 'var(--radius-md, 8px)',
            overflow: 'hidden',
            touchAction: 'none'
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: '100%',
                display: 'block',
                cursor: 'crosshair'
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />

            {/* Stroke counter pill */}
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-pill, 12px)',
              fontSize: '11px',
              color: 'var(--text-secondary, #aaa)',
              pointerEvents: 'none'
            }}>
              Strokes: <strong>{strokes.length}</strong>
            </div>

            {/* In-canvas action buttons */}
            <div style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              display: 'flex',
              gap: '6px'
            }}>
              {strokes.length > 0 && (
                <button
                  type="button"
                  onClick={handleUndo}
                  className="btn btn-secondary"
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}
                  title="Undo last stroke"
                >
                  Undo
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  backgroundColor: 'rgba(0, 0, 0, 0.75)',
                  color: '#fff',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
                title="Clear canvas"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
          </div>

          {/* Recognized Candidates Bar */}
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted, #777)',
              marginBottom: '6px'
            }}>
              Candidate Matches ({candidates.length})
            </div>

            {candidates.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-base, #141416)',
                borderRadius: 'var(--radius-sm, 6px)',
                fontSize: '12px',
                color: 'var(--text-muted, #777)'
              }}>
                {strokes.length === 0 ? 'Draw strokes above to see matching characters' : 'No exact match found — keep drawing or check strokes'}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                maxHeight: '140px',
                overflowY: 'auto',
                padding: '2px'
              }}>
                {candidates.map((cand, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onSelectCharacter(cand.character);
                      onClose();
                    }}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '8px 4px',
                      backgroundColor: idx === 0 ? 'rgba(88, 204, 2, 0.12)' : 'var(--bg-surface-hover, #282830)',
                      border: idx === 0 ? '1px solid var(--accent-bamboo, #58cc02)' : '1px solid var(--border-subtle, #333)',
                      borderRadius: 'var(--radius-sm, 6px)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    title={`${cand.character} (${cand.pinyin}): ${cand.definition}`}
                  >
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-serif-zh, "Noto Serif SC", serif)',
                      color: 'var(--text-primary, #fff)',
                      lineHeight: 1.1
                    }}>
                      {cand.character}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-secondary, #aaa)',
                      fontFamily: 'var(--font-mono, monospace)'
                    }}>
                      {cand.pinyin}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
