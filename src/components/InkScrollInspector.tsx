import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X, Volume2, Plus, Check, BookOpen, Layers, Edit3,
  Sparkles, Compass, AlertCircle, ArrowRight
} from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';
import { addCard } from '../services/srsStore';
import { getEtymology, type EtymologyEntry } from '../utils/etymologyDatabase';
import { PhonosemanticService, type PhoneticStemFamily } from '../utils/phonosemanticNetwork';
import { CONFUSABLE_CLUSTERS, type ConfusableCluster } from '../utils/confusableHanzi';
import { StrokeOrderService, STROKE_ORDER_RULES } from '../utils/strokeOrderData';
import type { HanziWriterInstance } from '../types/hanzi-writer';

export interface InkScrollInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  character: string;
  pinyin?: string;
  definition?: string;
  hskLevel?: string;
  radical?: string;
  strokeCount?: string | number;
  storySentence?: string;
  onNavigateToChar?: (char: string) => void;
}

export type InspectorTab = 'lexicon' | 'anatomy' | 'calligraphy' | 'corpus';

export const InkScrollInspector: React.FC<InkScrollInspectorProps> = ({
  isOpen,
  onClose,
  character,
  pinyin = '',
  definition = '',
  hskLevel = '1',
  radical = '',
  strokeCount = '',
  storySentence = '',
  onNavigateToChar
}) => {
  const [activeTab, setActiveTab] = useState<InspectorTab>('lexicon');
  const [addedToSrs, setAddedToSrs] = useState(false);

  // Stroke practice state
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const writerRef = useRef<HanziWriterInstance | null>(null);
  const [writerLoaded, setWriterLoaded] = useState(false);
  const [writerError, setWriterError] = useState(false);
  const [isQuizzing, setIsQuizzing] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);

  const cleanChar = useMemo(() => {
    if (!character) return '好';
    const match = character.match(/[\u4E00-\u9FFF]/);
    return match ? match[0] : character[0] || '好';
  }, [character]);

  // Paleographic Etymology
  const etymology: EtymologyEntry | null = useMemo(() => {
    return getEtymology(cleanChar);
  }, [cleanChar]);

  // Phonosemantic Family Stem & Siblings
  const phoneticFamily: PhoneticStemFamily | null = useMemo(() => {
    return PhonosemanticService.getFamilyForCharacter(cleanChar);
  }, [cleanChar]);

  // Look-alike / Confusable Cluster
  const confusableCluster: ConfusableCluster | null = useMemo(() => {
    return CONFUSABLE_CLUSTERS.find(c =>
      c.characters.some(ch => ch.character === cleanChar)
    ) || null;
  }, [cleanChar]);

  // Audio Playback
  const handleSpeak = (text: string) => {
    AzureSpeechService.speak(text, { rate: 0.9 });
  };

  // Add to SRS Flashcard Queue
  const handleAddToSrs = async () => {
    await addCard({
      character: cleanChar,
      pinyin: pinyin || '',
      definition: definition || (etymology ? etymology.meaning : 'Vocabulary item'),
      exampleSentence: storySentence || (etymology ? etymology.ancientOrigin : undefined)
    });
    setAddedToSrs(true);
    setTimeout(() => setAddedToSrs(false), 2500);
  };

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Initialize HanziWriter when on calligraphy tab
  useEffect(() => {
    let cancelled = false;

    if (!isOpen || activeTab !== 'calligraphy') {
      if (writerRef.current) {
        writerRef.current = null;
      }
      return;
    }

    const initWriter = () => {
      if (typeof window === 'undefined' || !canvasRef.current) return;

      const setupInstance = () => {
        if (cancelled || !canvasRef.current) return;
        canvasRef.current.innerHTML = '';
        try {
          const HanziWriterClass = (window as any).HanziWriter;
          if (!HanziWriterClass) {
            setWriterError(true);
            return;
          }

          const instance = HanziWriterClass.create(canvasRef.current, cleanChar, {
            width: 220,
            height: 220,
            padding: 15,
            showOutline: true,
            strokeAnimationSpeed: 1.2,
            delayBetweenStrokes: 180,
            strokeColor: '#38bdf8',
            outlineColor: 'rgba(255, 255, 255, 0.12)',
            highlightColor: '#f59e0b',
            drawingColor: '#38bdf8',
            showCharacter: true,
            showHintAfterMisses: 2,
            onLoadCharDataSuccess: () => {
              if (!cancelled) {
                setWriterLoaded(true);
                setWriterError(false);
              }
            },
            onLoadCharDataError: () => {
              if (!cancelled) setWriterError(true);
            }
          });

          writerRef.current = instance;
        } catch (e) {
          console.warn('HanziWriter init error:', e);
          setWriterError(true);
        }
      };

      if ((window as any).HanziWriter) {
        setupInstance();
      } else {
        const existingScript = document.getElementById('hanzi-writer-cdn');
        if (!existingScript) {
          const script = document.createElement('script');
          script.id = 'hanzi-writer-cdn';
          script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5/dist/hanzi-writer.min.js';
          script.async = true;
          script.onload = setupInstance;
          script.onerror = () => {
            if (!cancelled) setWriterError(true);
          };
          document.head.appendChild(script);
        } else {
          existingScript.addEventListener('load', setupInstance);
        }
      }
    };

    const timer = setTimeout(initWriter, 100);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, activeTab, cleanChar]);

  const handleAnimate = () => {
    if (writerRef.current) {
      setIsQuizzing(false);
      writerRef.current.showCharacter();
      writerRef.current.animateCharacter();
    }
  };

  const handleStartQuiz = () => {
    if (writerRef.current) {
      setIsQuizzing(true);
      setIsQuizComplete(false);
      writerRef.current.quiz({
        onComplete: () => {
          setIsQuizComplete(true);
          handleSpeak(cleanChar);
        }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.25s ease'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          backgroundColor: 'var(--bg-surface, #13171f)',
          borderLeft: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-panel, #0e121a)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif-zh, "Noto Serif SC", serif)',
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--text-primary, #f3f4f6)',
                lineHeight: 1
              }}
            >
              {cleanChar}
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--accent-bamboo, #38bdf8)', fontWeight: 600 }}>
                  {pinyin}
                </span>
                <button
                  onClick={() => handleSpeak(cleanChar)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                  title="Speak"
                >
                  <Volume2 size={14} />
                </button>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                HSK {hskLevel} {radical ? `· 部首: ${radical}` : ''} {strokeCount ? `· ${strokeCount} 笔` : ''}
              </div>
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
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* 4 Clean Tabs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            backgroundColor: 'var(--bg-panel, #0e121a)'
          }}
        >
          {[
            { id: 'lexicon', label: '释义', en: 'Lexicon' },
            { id: 'anatomy', label: '剖析', en: 'Anatomy' },
            { id: 'calligraphy', label: '笔顺', en: 'Strokes' },
            { id: 'corpus', label: '语境', en: 'Corpus' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as InspectorTab)}
              style={{
                padding: '10px 4px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent-bamboo, #38bdf8)' : '2px solid transparent',
                color: activeTab === tab.id ? 'var(--accent-bamboo, #38bdf8)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: activeTab === tab.id ? 600 : 400,
                textAlign: 'center'
              }}
            >
              {tab.label}
              <span style={{ fontSize: '10px', display: 'block', opacity: 0.65 }}>{tab.en}</span>
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TAB 1: LEXICON (释义) */}
          {activeTab === 'lexicon' && (
            <>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  English Definition
                </div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>
                  {definition || (etymology ? etymology.meaning : 'Standard dictionary definition')}
                </div>
              </div>

              {etymology && (
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <Sparkles size={14} color="var(--accent-gold, #f59e0b)" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                      {etymology.categoryLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {etymology.mnemonic}
                  </div>
                </div>
              )}

              {confusableCluster && (
                <div style={{ padding: '12px 14px', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    <AlertCircle size={14} />
                    <span>形近字辨析 Look-Alike Alert</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {confusableCluster.pedagogicalTip}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 2: ANATOMY & PHONOSEMANTICS (剖析) */}
          {activeTab === 'anatomy' && (
            <>
              {phoneticFamily ? (
                <div style={{ padding: '14px', borderRadius: '8px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--accent-bamboo)', fontWeight: 600, marginBottom: '6px' }}>
                    声旁图谱 Phonetic Stem Family ({phoneticFamily.stem} - {phoneticFamily.stemPinyin})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
                    {phoneticFamily.pedagogicalInsight}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Sound Siblings ({phoneticFamily.siblings.length} 字):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
                    {phoneticFamily.siblings.map(sib => (
                      <div
                        key={sib.character}
                        onClick={() => onNavigateToChar && onNavigateToChar(sib.character)}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          backgroundColor: sib.character === cleanChar ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                          border: sib.character === cleanChar ? '1px solid var(--accent-bamboo)' : '1px solid var(--border-subtle)',
                          cursor: onNavigateToChar ? 'pointer' : 'default',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                            {sib.character}
                          </span>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)' }}>
                            {sib.pinyin}
                          </span>
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sib.radical} · {sib.meaning}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No phonetic family cluster mapped for this character yet.
                </div>
              )}

              {etymology && etymology.ancientOrigin && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    古代演变 Paleographic Origin
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '12px', borderRadius: '6px', backgroundColor: 'var(--bg-panel)' }}>
                    {etymology.ancientOrigin}
                  </div>
                </div>
              )}
            </>
          )}

          {/* TAB 3: CALLIGRAPHY & STROKES (笔顺) */}
          {activeTab === 'calligraphy' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div
                ref={canvasRef}
                style={{
                  width: '220px',
                  height: '220px',
                  backgroundColor: 'var(--bg-panel, #0e121a)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)'
                }}
              />

              {writerError && (
                <div style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>
                  Offline stroke data unavailable for this glyph.
                </div>
              )}

              {/* Controls */}
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  onClick={handleAnimate}
                  className="btn btn-secondary"
                  style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                >
                  演示笔顺 (Animate)
                </button>
                <button
                  onClick={handleStartQuiz}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '12px', padding: '8px 12px' }}
                >
                  手写练习 (Handwriting Drill)
                </button>
              </div>

              {isQuizComplete && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#4ade80', fontSize: '13px', fontWeight: 600 }}>
                  <Check size={16} /> 笔顺书写准确！Stroke Order Perfect!
                </div>
              )}

              {/* 7 Core Stroke Order Rules */}
              <div style={{ width: '100%', marginTop: '8px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  笔顺基本法则 Core Stroke Rules
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {STROKE_ORDER_RULES.slice(0, 4).map(r => (
                    <div key={r.rule} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-panel)' }}>
                      <span><strong>{r.rule}</strong> ({r.description})</span>
                      <span style={{ color: 'var(--accent-bamboo)' }}>{r.example}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CORPUS & STORY CONTEXT (语境) */}
          {activeTab === 'corpus' && (
            <>
              {storySentence ? (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Occurrence in Current Story
                  </div>
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '15px',
                      lineHeight: 1.6,
                      fontFamily: 'var(--font-serif-zh)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {storySentence}
                  </div>
                  <button
                    onClick={() => handleSpeak(storySentence)}
                    className="btn btn-secondary"
                    style={{ marginTop: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Volume2 size={14} /> 朗读此句 Read Sentence
                  </button>
                </div>
              ) : (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No sentence context attached.
                </div>
              )}
            </>
          )}

        </div>

        {/* Permanent Footer Action */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            backgroundColor: 'var(--bg-panel, #0e121a)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            快捷键: <strong>Esc</strong> 关闭
          </div>

          <button
            onClick={handleAddToSrs}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '13px'
            }}
          >
            {addedToSrs ? (
              <>
                <Check size={14} color="#4ade80" /> 已加入生词本 Added
              </>
            ) : (
              <>
                <Plus size={14} /> 加入生词本 Add to Flashcards
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
