import React, { useState, useEffect, useRef } from 'react';
import {
  type Flashcard,
  getDueCards,
  getAllCards,
  getCustomDecks,
  type ThematicDeck
} from '../services/srsStore';
import {
  X, Headphones, Play, Pause, SkipForward, SkipBack, RotateCcw,
  Volume2, Sliders, CheckCircle2, Repeat, Clock, Layers
} from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface AudioCommuteModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDeckId?: string;
}

export const AudioCommuteModeModal: React.FC<AudioCommuteModeModalProps> = ({
  isOpen,
  onClose,
  activeDeckId = 'all'
}) => {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'prompt' | 'pause' | 'reveal' | 'idle'>('idle');
  const [recallPauseSeconds, setRecallPauseSeconds] = useState<number>(3.5);
  const [speakEnglish, setSpeakEnglish] = useState<boolean>(true);
  const [repeatMode, setRepeatMode] = useState<'all' | 'single'>('all');
  const [selectedDeck, setSelectedDeck] = useState<string>(activeDeckId);
  const [decks, setDecks] = useState<ThematicDeck[]>([]);

  const isPlayingRef = useRef(false);
  isPlayingRef.current = isPlaying;

  const timerRef = useRef<any>(null);

  // Load cards and decks
  useEffect(() => {
    if (isOpen) {
      setDecks(getCustomDecks());
      loadCards(selectedDeck);
    } else {
      stopPlayback();
    }
  }, [isOpen, selectedDeck]);

  const loadCards = async (deckId: string) => {
    let loaded = await getDueCards(deckId);
    if (loaded.length === 0) {
      loaded = await getAllCards(deckId);
    }
    setCards(loaded);
    setCurrentIndex(0);
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    setPhase('idle');
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const playSequenceForIndex = async (index: number) => {
    if (!isPlayingRef.current || cards.length === 0) return;

    const card = cards[index % cards.length];
    if (!card) return;

    // Phase 1: Speak Chinese Character / Word
    setPhase('prompt');
    AzureSpeechService.speak(card.character, 0.85);

    // Phase 2: Pause for learner's mental active recall
    setPhase('pause');
    timerRef.current = setTimeout(() => {
      if (!isPlayingRef.current) return;

      // Phase 3: Reveal Pinyin & Meaning
      setPhase('reveal');
      if (speakEnglish && window.speechSynthesis) {
        // Speak English definition using browser speech
        try {
          const utterance = new SpeechSynthesisUtterance(`${card.pinyin}. ${card.definition.split('/')[0]}`);
          utterance.lang = 'en-US';
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {
          // Fallback: speak pinyin in Chinese voice
          AzureSpeechService.speak(card.pinyin, 0.9);
        }
      } else {
        // Just repeat Chinese target word once more
        AzureSpeechService.speak(card.character, 0.85);
      }

      // Phase 4: Wait post-reveal and advance
      timerRef.current = setTimeout(() => {
        if (!isPlayingRef.current) return;

        if (repeatMode === 'single') {
          playSequenceForIndex(index);
        } else {
          const nextIdx = (index + 1) % cards.length;
          setCurrentIndex(nextIdx);
          playSequenceForIndex(nextIdx);
        }
      }, 2500);

    }, recallPauseSeconds * 1000);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      playSequenceForIndex(currentIndex);
    }
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const nextIdx = (currentIndex + 1) % cards.length;
    setCurrentIndex(nextIdx);
    if (isPlaying) {
      playSequenceForIndex(nextIdx);
    }
  };

  const handlePrev = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const prevIdx = (currentIndex - 1 + cards.length) % cards.length;
    setCurrentIndex(prevIdx);
    if (isPlaying) {
      playSequenceForIndex(prevIdx);
    }
  };

  if (!isOpen) return null;

  const currentCard = cards[currentIndex % cards.length];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)',
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
        maxWidth: '540px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
        overflow: 'hidden'
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
              <Headphones size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Audio-Only Commute Mode (随身听)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Hands-free audio SRS loop for walking, driving, and travel (ALS-007)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopPlayback();
              onClose();
            }}
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

        {/* Deck Selector & Progress Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-base)',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Playlist:</span>
            <select
              value={selectedDeck}
              onChange={(e) => setSelectedDeck(e.target.value)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                padding: '3px 8px',
                fontSize: '11px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {decks.map(d => (
                <option key={d.id} value={d.id}>{d.icon || '📁'} {d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ color: 'var(--text-secondary)' }}>
            Card <strong>{cards.length > 0 ? currentIndex + 1 : 0}</strong> of <strong>{cards.length}</strong>
          </div>
        </div>

        {/* Big Audio Stage */}
        <div style={{
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          textAlign: 'center'
        }}>
          {/* Phase Badge */}
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 600,
            backgroundColor: phase === 'prompt' ? 'rgba(96, 165, 250, 0.15)' : phase === 'pause' ? 'rgba(212, 160, 23, 0.15)' : phase === 'reveal' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            color: phase === 'prompt' ? '#60a5fa' : phase === 'pause' ? 'var(--accent-gold)' : phase === 'reveal' ? 'var(--accent-bamboo)' : 'var(--text-muted)',
            border: '1px solid currentColor'
          }}>
            {phase === 'prompt' && '🗣️ Speaking Target Word'}
            {phase === 'pause' && `🧠 Mental Recall (${recallPauseSeconds}s)`}
            {phase === 'reveal' && '💡 Revealing Definition'}
            {phase === 'idle' && (isPlaying ? 'Ready' : 'Paused')}
          </div>

          {/* Character Glyph Display */}
          {currentCard ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                fontSize: '72px',
                fontWeight: 600,
                fontFamily: 'var(--font-zh)',
                color: 'var(--text-primary)',
                lineHeight: 1.1
              }}>
                {currentCard.character}
              </div>

              <div style={{
                fontSize: '22px',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                opacity: (phase === 'reveal' || !isPlaying) ? 1 : 0.25,
                transition: 'opacity 0.3s ease'
              }}>
                {currentCard.pinyin}
              </div>

              <div style={{
                fontSize: '15px',
                color: 'var(--text-secondary)',
                maxWidth: '380px',
                opacity: (phase === 'reveal' || !isPlaying) ? 1 : 0.15,
                transition: 'opacity 0.3s ease'
              }}>
                {currentCard.definition}
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', padding: '20px' }}>
              No cards found in this deck. Add cards to begin.
            </div>
          )}

          {/* Playback Transport Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '10px' }}>
            <button
              onClick={handlePrev}
              disabled={cards.length === 0}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Previous card"
            >
              <SkipBack size={18} />
            </button>

            <button
              onClick={togglePlay}
              disabled={cards.length === 0}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--accent-gold)',
                color: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isPlaying ? '0 0 24px rgba(212, 160, 23, 0.4)' : 'none',
                transition: 'all 0.2s ease'
              }}
              title={isPlaying ? 'Pause loop' : 'Start hands-free loop'}
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: '3px' }} />}
            </button>

            <button
              onClick={handleNext}
              disabled={cards.length === 0}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Next card"
            >
              <SkipForward size={18} />
            </button>
          </div>
        </div>

        {/* Pacing & Voice Settings Bar */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} /> Mental Recall Pause:
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[2, 3.5, 5, 7].map(sec => (
                <button
                  key={sec}
                  onClick={() => setRecallPauseSeconds(sec)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: recallPauseSeconds === sec ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                    backgroundColor: recallPauseSeconds === sec ? 'rgba(212, 160, 23, 0.15)' : 'var(--bg-surface)',
                    color: recallPauseSeconds === sec ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '11px'
                  }}
                >
                  {sec}s
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={speakEnglish}
                onChange={(e) => setSpeakEnglish(e.target.checked)}
              />
              Vocalize English definition in reveal phase
            </label>

            <button
              onClick={() => setRepeatMode(repeatMode === 'all' ? 'single' : 'all')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                background: 'none',
                border: 'none',
                color: repeatMode === 'single' ? 'var(--accent-gold)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              <Repeat size={12} /> {repeatMode === 'single' ? 'Repeat Single' : 'Loop Playlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
