import React, { useState } from 'react';
import { ShieldAlert, Volume2, RotateCcw, Check, Sparkles } from 'lucide-react';
import type { SrsAmbushPayload } from '../../../types/Course';
import { odysseyAudio } from '../../../services/odysseyAudio';

interface SrsAmbushProps {
  payload: SrsAmbushPayload;
  onSuccess: () => void;
  onError: (mistake: string) => void;
}

export const SrsAmbush: React.FC<SrsAmbushProps> = ({ payload, onSuccess, onError }) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCards, setReviewedCards] = useState<number[]>([]);

  const card = payload.cards[currentCardIndex] || payload.cards[0];
  const totalCards = payload.cards.length;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    odysseyAudio.playChipConnect();
  };

  const handleGrade = (rating: 'hard' | 'good' | 'easy') => {
    if (rating === 'hard') {
      odysseyAudio.playErrorChime();
      onError(`Struggled on SRS Ambush card: ${card.character} (${card.pinyin})`);
    } else {
      odysseyAudio.playCorrectChord();
    }

    const nextIndex = currentCardIndex + 1;
    if (nextIndex < totalCards) {
      setCurrentCardIndex(nextIndex);
      setIsFlipped(false);
      setReviewedCards(prev => [...prev, currentCardIndex]);
    } else {
      // Completed all ambush cards
      onSuccess();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '520px', margin: '0 auto' }}>
      {/* Ambush Header Alert */}
      <div style={{
        padding: '14px 18px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'rgba(229, 62, 62, 0.08)',
        border: '1px solid rgba(229, 62, 62, 0.25)',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(229, 62, 62, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#e53e3e',
          flexShrink: 0
        }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-primary)' }}>
            {payload.ambushTitle}
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {payload.reason} &bull; Card {currentCardIndex + 1} of {totalCards}
          </span>
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        onClick={handleFlip}
        style={{
          width: '100%',
          minHeight: '220px',
          padding: '30px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--border-strong)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          cursor: 'pointer',
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
          transition: 'all 0.2s ease',
          gap: '12px'
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
          {card.character}
        </div>

        {isFlipped ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '18px', color: 'var(--accent-indigo)', fontFamily: 'var(--font-mono)' }}>
              {card.pinyin}
            </div>
            <div style={{ fontSize: '15px', color: 'var(--text-secondary)' }}>
              {card.definition}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                odysseyAudio.speakChinese(card.character);
              }}
              className="btn btn-secondary"
              style={{ fontSize: '11px', padding: '3px 10px', alignSelf: 'center', marginTop: '6px' }}
            >
              <Volume2 size={12} /> Speak
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click card to reveal meaning &amp; pinyin
          </span>
        )}
      </div>

      {/* SRS Rating Actions (Revealed after flip) */}
      {isFlipped ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', width: '100%' }}>
          <button
            type="button"
            onClick={() => handleGrade('hard')}
            className="btn btn-secondary"
            style={{ borderColor: '#e53e3e', color: '#e53e3e', padding: '10px', fontSize: '13px' }}
          >
            Hesitated / Hard
          </button>
          <button
            type="button"
            onClick={() => handleGrade('good')}
            className="btn btn-primary"
            style={{ padding: '10px', fontSize: '13px' }}
          >
            Good Recall
          </button>
          <button
            type="button"
            onClick={() => handleGrade('easy')}
            className="btn btn-bamboo"
            style={{ padding: '10px', fontSize: '13px' }}
          >
            Instant / Easy
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleFlip}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '10px' }}
        >
          <RotateCcw size={14} /> Reveal Card
        </button>
      )}
    </div>
  );
};
