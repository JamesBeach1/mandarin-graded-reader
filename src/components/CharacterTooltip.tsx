import React, { useState, useEffect, useRef } from 'react';
import type { HanziItem } from '../types/HanziItem';
import type { TooltipContent } from '../types/ToolTip';
import { RadicalDecomposition } from './RadicalDecomposition';
import { getTraditionalVariant } from '../utils/scriptConverter';
import { pinyinToZhuyin } from '../utils/zhuyinConverter';
import { checkHomophone } from '../utils/homophoneDetector';
import { getEtymology } from '../utils/etymologyDatabase';
import { getConfusableCluster } from '../utils/confusableHanzi';
import { X, Plus, Edit3, BookOpen, Compass, Eye, AlertTriangle, Scroll, ChevronDown } from 'lucide-react';

export interface TooltipState {
  visible: boolean;
  content: TooltipContent | null;
  character: string;
  item?: HanziItem;
  contextSentence?: string;
  x: number;
  y: number;
}

interface CharacterTooltipProps {
  tooltip: TooltipState;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onPractice: (item: HanziItem) => void;
  onAddToFlashcards: (char: string, content: TooltipContent, sentenceContext?: string) => void;
  onOverride: (char: string, pinyin: string, definition: string) => void;
  onStrokeOrder: (char: string, pinyin: string, definition: string) => void;
  onExploreEtymology: (char: string) => void;
  onPracticeConfusable: (char: string) => void;
}

type InsightTab = 'none' | 'etymology' | 'lookalike' | 'homophone' | 'chengyu' | 'radical';

export const CharacterTooltip: React.FC<CharacterTooltipProps> = ({
  tooltip,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onPractice,
  onAddToFlashcards,
  onOverride,
  onStrokeOrder,
  onExploreEtymology,
  onPracticeConfusable
}) => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [activeInsight, setActiveInsight] = useState<InsightTab>('none');
  const [isMobile, setIsMobile] = useState<boolean>(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dismiss tooltip on outside click or Escape key press
  useEffect(() => {
    if (!tooltip.visible) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      window.addEventListener('keydown', handleKeyDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [tooltip.visible, onClose]);

  // Reset expanded insight whenever character changes
  useEffect(() => {
    setActiveInsight('none');
  }, [tooltip.character]);

  if (!tooltip.visible || !tooltip.content || !tooltip.item) return null;

  const tradVariant = getTraditionalVariant(tooltip.character);
  const zhuyin = tooltip.content.pinyin ? pinyinToZhuyin(tooltip.content.pinyin) : '';
  const homophoneInfo = checkHomophone(tooltip.character, tooltip.content.pinyin);
  const etymology = getEtymology(tooltip.character);
  const lookalikeCluster = getConfusableCluster(tooltip.character);
  const isChengyu = Boolean(tooltip.content.isChengyu);
  const hasRadical = Boolean(tooltip.item.radical);

  const hasAnyInsights = Boolean(
    etymology || lookalikeCluster || homophoneInfo || isChengyu || hasRadical
  );

  const toggleInsight = (tab: InsightTab) => {
    setActiveInsight(prev => prev === tab ? 'none' : tab);
  };

  // Clamped desktop positioning
  const tooltipWidth = 320;
  const clampedX = typeof window !== 'undefined' 
    ? Math.max(tooltipWidth / 2 + 16, Math.min(window.innerWidth - tooltipWidth / 2 - 16, tooltip.x))
    : tooltip.x;
  const isNearTop = tooltip.y < 240;

  const desktopStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${clampedX}px`,
    top: isNearTop ? `${tooltip.y + 40}px` : `${tooltip.y}px`,
    transform: isNearTop ? 'translate(-50%, 0)' : 'translate(-50%, -100%)',
    zIndex: 1000,
    width: `${tooltipWidth}px`
  };

  const mobileStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '16px',
    left: '12px',
    right: '12px',
    margin: '0 auto',
    maxWidth: '460px',
    zIndex: 2000
  };

  return (
    <>
      {/* Mobile background tap-to-dismiss curtain */}
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1999
          }}
        />
      )}

      <div
        ref={tooltipRef}
        style={isMobile ? mobileStyle : desktopStyle}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="tooltip-popup">
          {/* Header Row: Hanzi, Pinyin, Tags & Close */}
          <div className="tooltip-header">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
              <span className="tooltip-char">{tooltip.character}</span>

              {tradVariant && tradVariant !== tooltip.character && (
                <span
                  style={{ fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-zh)' }}
                  title={`Traditional Chinese variant: ${tradVariant}`}
                >
                  [{tradVariant}]
                </span>
              )}

              <span className="tooltip-pinyin">{tooltip.content.pinyin}</span>

              {zhuyin && (
                <span
                  style={{ fontSize: '11px', color: 'var(--accent-gold)', fontFamily: 'var(--font-zh)' }}
                  title="Zhuyin Bopomofo"
                >
                  [{zhuyin}]
                </span>
              )}

              {tooltip.content.hskLevel && (
                <span style={{
                  fontSize: '10px',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-surface-hover)',
                  border: '1px solid var(--border-subtle)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  letterSpacing: '0.04em',
                  fontWeight: 600
                }}>
                  HSK {tooltip.content.hskLevel}
                </span>
              )}

              {isChengyu && (
                <span style={{
                  fontSize: '10px',
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-sm)',
                  fontWeight: 600
                }}>
                  成语
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              aria-label="Close tooltip"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={15} />
            </button>
          </div>

          <div className="tooltip-divider" />

          {/* Definition: Clean, spacious typography */}
          <div className="tooltip-definition">
            {tooltip.content.definition}
          </div>

          {/* Primary Action: Clear, well-proportioned Save to Flashcards button */}
          <button
            onClick={() => onAddToFlashcards(tooltip.character, tooltip.content!, tooltip.contextSentence)}
            className="btn btn-primary"
            style={{
              width: '100%',
              height: '36px',
              fontSize: '13px',
              fontWeight: 700,
              textTransform: 'none',
              letterSpacing: '0.01em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              backgroundColor: 'var(--accent-seal)',
              borderColor: 'var(--accent-seal)',
              borderBottom: '3px solid #D93838',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-md)',
              marginBottom: '8px',
              boxShadow: '0 2px 6px rgba(255, 75, 75, 0.2)'
            }}
            title="Save this character to your spaced repetition flashcard deck for daily review"
          >
            <Plus size={15} /> Save to Flashcards
          </button>

          {/* Secondary Action Row: Write, Strokes, Edit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: hasAnyInsights ? '10px' : '0' }}>
            <button
              onClick={() => onPractice(tooltip.item!)}
              className="btn btn-secondary"
              style={{ height: '30px', padding: '0 6px', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', justifyContent: 'center' }}
              title="Practice writing this character on the rice-grid canvas"
            >
              <Edit3 size={12} /> Write
            </button>
            <button
              onClick={() => onStrokeOrder(tooltip.character, tooltip.content?.pinyin || '', tooltip.content?.definition || '')}
              className="btn btn-secondary"
              style={{ height: '30px', padding: '0 6px', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', justifyContent: 'center' }}
              title="Inspect animated stroke order and calligraphy guidelines"
            >
              <BookOpen size={12} /> Strokes
            </button>
            <button
              onClick={() => onOverride(tooltip.character, tooltip.content?.pinyin || '', tooltip.content?.definition || '')}
              className="btn btn-secondary"
              style={{ height: '30px', padding: '0 6px', fontSize: '11px', textTransform: 'none', letterSpacing: 'normal', justifyContent: 'center', color: 'var(--text-muted)' }}
              title="Define custom Pinyin pronunciation or English definition"
            >
              Edit
            </button>
          </div>


          {/* Secondary Insights Expandable Chips */}
          {hasAnyInsights && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
              <div style={{
                display: 'flex',
                gap: '5px',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginBottom: activeInsight !== 'none' ? '8px' : '0'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginRight: '2px' }}>
                  Explore:
                </span>

                {etymology && (
                  <button
                    type="button"
                    onClick={() => toggleInsight('etymology')}
                    className={`btn btn-secondary ${activeInsight === 'etymology' ? 'on' : ''}`}
                    style={{ padding: '3px 7px', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Compass size={11} color="var(--accent-gold)" /> Origin
                  </button>
                )}

                {lookalikeCluster && (
                  <button
                    type="button"
                    onClick={() => toggleInsight('lookalike')}
                    className={`btn btn-secondary ${activeInsight === 'lookalike' ? 'on' : ''}`}
                    style={{ padding: '3px 7px', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Eye size={11} color="var(--accent-bamboo)" /> Confusables
                  </button>
                )}

                {homophoneInfo && (
                  <button
                    type="button"
                    onClick={() => toggleInsight('homophone')}
                    className={`btn btn-secondary ${activeInsight === 'homophone' ? 'on' : ''}`}
                    style={{ padding: '3px 7px', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <AlertTriangle size={11} color="var(--accent-seal)" /> Homophones
                  </button>
                )}

                {isChengyu && (
                  <button
                    type="button"
                    onClick={() => toggleInsight('chengyu')}
                    className={`btn btn-secondary ${activeInsight === 'chengyu' ? 'on' : ''}`}
                    style={{ padding: '3px 7px', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}
                  >
                    <Scroll size={11} color="var(--accent-gold)" /> Allusion
                  </button>
                )}

                {hasRadical && (
                  <button
                    type="button"
                    onClick={() => toggleInsight('radical')}
                    className={`btn btn-secondary ${activeInsight === 'radical' ? 'on' : ''}`}
                    style={{ padding: '3px 7px', fontSize: '10px', borderRadius: 'var(--radius-sm)' }}
                  >
                    🧩 Radicals
                  </button>
                )}
              </div>

              {/* Expandable Disclosure Panels */}
              {activeInsight === 'etymology' && etymology && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(212, 160, 23, 0.08)',
                  border: '1px solid rgba(212, 160, 23, 0.25)',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                      🧭 {etymology.categoryLabel}
                    </span>
                    <button
                      onClick={() => onExploreEtymology(tooltip.character)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Deep Dive →
                    </button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "{etymology.mnemonic}"
                  </div>
                </div>
              )}

              {activeInsight === 'lookalike' && lookalikeCluster && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(76, 107, 83, 0.1)',
                  border: '1px solid var(--accent-bamboo)',
                  fontSize: '11px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-bamboo)' }}>
                      👁️ Visually Confusable
                    </span>
                    <button
                      onClick={() => onPracticeConfusable(tooltip.character)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-bamboo)',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: 0,
                        textDecoration: 'underline'
                      }}
                    >
                      Quiz →
                    </button>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '3px' }}>
                    Confusable with: <strong>{lookalikeCluster.characters.filter(c => c.character !== tooltip.character).map(c => c.character).join(', ')}</strong>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontStyle: 'italic' }}>
                    {lookalikeCluster.pedagogicalTip}
                  </div>
                </div>
              )}

              {activeInsight === 'homophone' && homophoneInfo && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(163, 59, 59, 0.1)',
                  border: '1px solid rgba(163, 59, 59, 0.3)',
                  fontSize: '11px'
                }}>
                  <div style={{ color: 'var(--accent-seal)', fontWeight: 600, marginBottom: '2px' }}>
                    ⚠️ Same Sound: {homophoneInfo.pinyin}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', marginBottom: '4px', fontSize: '10.5px' }}>
                    {homophoneInfo.warning}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {homophoneInfo.confusables.map((c, ci) => (
                      <span key={ci} style={{
                        fontSize: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        padding: '1px 5px',
                        borderRadius: '2px',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        <strong>{c.char}</strong>: <em>{c.example}</em>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeInsight === 'chengyu' && isChengyu && (
                <div style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(217, 119, 6, 0.08)',
                  border: '1px solid rgba(217, 119, 6, 0.25)',
                  fontSize: '11px'
                }}>
                  {tooltip.content.chengyuLiteral && (
                    <div style={{ marginBottom: '4px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>Literal: </span>
                      <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>"{tooltip.content.chengyuLiteral}"</span>
                    </div>
                  )}
                  {tooltip.content.chengyuAllusion && (
                    <div>
                      <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>Allusion (典故): </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>{tooltip.content.chengyuAllusion}</span>
                    </div>
                  )}
                </div>
              )}

              {activeInsight === 'radical' && hasRadical && (
                <div style={{ padding: '4px 0' }}>
                  <RadicalDecomposition item={tooltip.item} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
