import React, { useState, useEffect } from 'react';
import {
  type GrammarSrsCard,
  getGrammarSrsCards,
  saveGrammarSrsCards
} from '../utils/grammarSrsData';
import {
  X, Sparkles, CheckCircle2, XCircle, Volume2, ArrowRight,
  RotateCcw, BookOpen, Layers, Check, Clock
} from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface GrammarSrsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarSrsModal: React.FC<GrammarSrsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [cards, setCards] = useState<GrammarSrsCard[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string[] | null>(null);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const loaded = getGrammarSrsCards();
      setCards(loaded);
      setCurrentIdx(0);
      setSelectedOption(null);
    }
  }, [isOpen]);

  if (!isOpen || cards.length === 0) return null;

  const activeCard = cards[currentIdx % cards.length];
  const isAnswered = selectedOption !== null;
  const isCorrect = isAnswered && (
    selectedOption[0] === activeCard.connectors[0] &&
    selectedOption[1] === activeCard.connectors[1]
  );

  const handleSelectOption = (opt: string[]) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setTotalAnswered(prev => prev + 1);

    const match = opt[0] === activeCard.connectors[0] && opt[1] === activeCard.connectors[1];
    if (match) {
      setScore(prev => prev + 1);
      AzureSpeechService.speak(activeCard.fullSentence, 0.9);
    }
  };

  const handleGradeSm2 = (quality: number) => {
    // Standard SM-2 for grammar card
    const updated = [...cards];
    const card = { ...activeCard };
    let interval = card.interval || 0;
    let ease = card.easeFactor || 2.5;

    if (quality < 3) {
      interval = 1;
    } else {
      if (interval === 0) interval = 1;
      else if (interval === 1) interval = 4;
      else interval = Math.round(interval * ease);
    }

    ease = ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ease < 1.3) ease = 1.3;

    card.interval = interval;
    card.easeFactor = ease;
    card.nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

    updated[currentIdx % cards.length] = card;
    setCards(updated);
    saveGrammarSrsCards(updated);

    // Advance
    setSelectedOption(null);
    setCurrentIdx(prev => (prev + 1) % cards.length);
  };

  const accuracy = totalAnswered > 0 ? Math.round((score / totalAnswered) * 100) : 0;

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
        maxWidth: '640px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
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
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Grammar Pattern SRS (语法填空卡)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Active recall cloze cards for sentence structures & connectors (SRS-002)
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

        {/* Status Bar */}
        <div style={{
          padding: '10px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-base)',
          fontSize: '12px'
        }}>
          <div>
            Card <strong>{(currentIdx % cards.length) + 1}</strong> of <strong>{cards.length}</strong> (HSK {activeCard.hskLevel})
          </div>
          <div>
            Accuracy: <strong style={{ color: 'var(--accent-gold)' }}>{accuracy}%</strong> ({score}/{totalAnswered})
          </div>
        </div>

        {/* Cloze Prompt Arena */}
        <div style={{ padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Target Pattern Card */}
          <div style={{
            padding: '24px 20px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)', fontWeight: 600 }}>
              {activeCard.patternName}
            </div>

            {/* Cloze Sentence */}
            <div style={{ fontSize: '24px', fontWeight: 600, fontFamily: 'var(--font-zh)', color: 'var(--text-primary)', lineHeight: '1.4' }}>
              {isAnswered ? activeCard.fullSentence : activeCard.clozeSentence}
            </div>

            {isAnswered && (
              <div style={{ fontSize: '14px', color: 'var(--accent-gold)', fontWeight: 500 }}>
                {activeCard.pinyin}
              </div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              "{activeCard.translation}"
            </div>
          </div>

          {/* Multiple Choice Particle Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {activeCard.options.map((opt, idx) => {
              const isOptionCorrect = opt[0] === activeCard.connectors[0] && opt[1] === activeCard.connectors[1];
              const isOptionSelected = isAnswered && selectedOption[0] === opt[0] && selectedOption[1] === opt[1];

              let borderColor = 'var(--border-subtle)';
              let bgColor = 'var(--bg-base)';
              if (isAnswered) {
                if (isOptionCorrect) {
                  borderColor = 'var(--accent-bamboo)';
                  bgColor = 'rgba(74, 222, 128, 0.1)';
                } else if (isOptionSelected) {
                  borderColor = 'var(--accent-coral)';
                  bgColor = 'rgba(239, 68, 68, 0.1)';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  style={{
                    padding: '16px 14px',
                    borderRadius: '6px',
                    border: `1.5px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: 'var(--text-primary)',
                    fontSize: '16px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-zh)',
                    cursor: isAnswered ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <span>{opt[0]} ... {opt[1]}</span>
                  {isAnswered && isOptionCorrect && <CheckCircle2 size={16} color="var(--accent-bamboo)" />}
                  {isAnswered && isOptionSelected && !isOptionCorrect && <XCircle size={16} color="var(--accent-coral)" />}
                </button>
              );
            })}
          </div>

          {/* Post-Answer Feedback & SM-2 Grade Buttons */}
          {isAnswered && (
            <div style={{
              padding: '18px 20px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} /> Rule Formula: <code>{activeCard.formula}</code>
                </div>
                <button
                  onClick={() => AzureSpeechService.speak(activeCard.fullSentence, 0.9)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <Volume2 size={14} /> Replay
                </button>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {activeCard.explanation}
              </div>

              {/* SM-2 Quality Grade Buttons */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                  Rate your active recall difficulty:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                  <button
                    onClick={() => handleGradeSm2(1)}
                    style={{ padding: '8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Fail (1d)
                  </button>
                  <button
                    onClick={() => handleGradeSm2(2)}
                    style={{ padding: '8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(212, 160, 23, 0.15)', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleGradeSm2(3)}
                    style={{ padding: '8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(74, 222, 128, 0.15)', color: 'var(--accent-bamboo)', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleGradeSm2(4)}
                    style={{ padding: '8px', borderRadius: '4px', border: 'none', backgroundColor: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                  >
                    Easy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
