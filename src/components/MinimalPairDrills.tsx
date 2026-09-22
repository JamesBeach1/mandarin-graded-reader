import React, { useState, useEffect } from 'react';
import {
  MINIMAL_PAIRS_CATALOG,
  type MinimalPair,
  type MinimalPairItem
} from '../utils/minimalPairsData';
import { Volume2, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight, RotateCcw, Filter, Eye, EyeOff } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

export const MinimalPairDrills: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [targetIsA, setTargetIsA] = useState<boolean>(true);
  const [userSelection, setUserSelection] = useState<'A' | 'B' | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [blindMode, setBlindMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const filteredPairs = selectedCategory === 'all'
    ? MINIMAL_PAIRS_CATALOG
    : MINIMAL_PAIRS_CATALOG.filter(p => p.category === selectedCategory);

  const activePair: MinimalPair = filteredPairs[currentIndex % filteredPairs.length];
  const targetItem: MinimalPairItem = targetIsA ? activePair.itemA : activePair.itemB;

  // Initialize a new question
  const setupTrial = (index: number, pairsList: MinimalPair[]) => {
    const isA = Math.random() < 0.5;
    setTargetIsA(isA);
    setUserSelection(null);
    const pair = pairsList[index % pairsList.length];
    const target = isA ? pair.itemA : pair.itemB;
    playTargetAudio(target.char);
  };

  useEffect(() => {
    setCurrentIndex(0);
    setupTrial(0, filteredPairs);
  }, [selectedCategory]);

  const playTargetAudio = (char: string) => {
    setIsPlaying(true);
    AzureSpeechService.speak(char, 0.85);
    setTimeout(() => setIsPlaying(false), 800);
  };

  const handleSelectOption = (choice: 'A' | 'B') => {
    if (userSelection !== null) return;
    setUserSelection(choice);
    const isCorrect = (choice === 'A' && targetIsA) || (choice === 'B' && !targetIsA);
    setTotalAttempts(prev => prev + 1);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => {
        const next = prev + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % filteredPairs.length;
    setCurrentIndex(nextIdx);
    setupTrial(nextIdx, filteredPairs);
  };

  const handleResetStats = () => {
    setScore(0);
    setTotalAttempts(0);
    setStreak(0);
    setupTrial(currentIndex, filteredPairs);
  };

  const isAnswered = userSelection !== null;
  const isCorrect = isAnswered && ((userSelection === 'A' && targetIsA) || (userSelection === 'B' && !targetIsA));
  const accuracy = totalAttempts > 0 ? Math.round((score / totalAttempts) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {/* Category selector & Stats Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
            <Filter size={13} /> Contrast:
          </span>
          {[
            { id: 'all', label: 'All Pairs' },
            { id: 'retroflex_dental', label: 'sh/s, zh/z, ch/c' },
            { id: 'aspiration', label: 'b/p, d/t, g/k' },
            { id: 'nasals', label: 'in/ing, an/ang' },
            { id: 'palatals', label: 'j/q/x' },
            { id: 'vowels', label: 'u/ü' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                borderRadius: '4px',
                border: selectedCategory === cat.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat.id ? 'rgba(212, 160, 23, 0.15)' : 'var(--bg-base)',
                color: selectedCategory === cat.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: selectedCategory === cat.id ? 600 : 400
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stats Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
          <div>
            Accuracy: <strong style={{ color: accuracy >= 80 ? 'var(--accent-bamboo)' : 'var(--accent-gold)' }}>{accuracy}%</strong> ({score}/{totalAttempts})
          </div>
          <div>
            Streak: <strong style={{ color: 'var(--accent-gold)' }}>🔥 {streak}</strong> (Best: {bestStreak})
          </div>
          <button
            onClick={() => setBlindMode(!blindMode)}
            title="Toggle blind listening (hide characters until answered)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'none',
              border: 'none',
              color: blindMode ? 'var(--accent-gold)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            {blindMode ? <EyeOff size={13} /> : <Eye size={13} />} Blind Mode
          </button>
        </div>
      </div>

      {/* Main Drill Arena */}
      <div style={{
        padding: '36px 28px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px',
        boxShadow: 'none'
      }}>
        {/* Phonemic header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-gold)', fontWeight: 600 }}>
            {activePair.categoryLabel}
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Discrimination: {activePair.contrastLabel} <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 400 }}>{activePair.phonemicContrast}</span>
          </h3>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Listen to the native voice and choose the sound you hear:
          </p>
        </div>

        {/* Audio Replay Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => playTargetAudio(targetItem.char)}
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              border: '2px solid var(--accent-gold)',
              backgroundColor: isPlaying ? 'rgba(212, 160, 23, 0.25)' : 'rgba(212, 160, 23, 0.1)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isPlaying ? '0 0 20px rgba(212, 160, 23, 0.4)' : 'none'
            }}
            title="Click to replay target sound"
          >
            <Volume2 size={36} />
          </button>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to play audio</span>
        </div>

        {/* A vs B Choice Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', maxWidth: '600px' }}>
          {/* Card A */}
          {(() => {
            const isTarget = targetIsA;
            const isChosen = userSelection === 'A';
            let borderColor = 'var(--border-subtle)';
            let bgColor = 'var(--bg-base)';
            if (isAnswered) {
              if (isTarget) {
                borderColor = 'var(--accent-bamboo)';
                bgColor = 'rgba(74, 222, 128, 0.08)';
              } else if (isChosen) {
                borderColor = 'var(--accent-coral)';
                bgColor = 'rgba(239, 68, 68, 0.08)';
              }
            }

            return (
              <button
                type="button"
                onClick={() => handleSelectOption('A')}
                disabled={isAnswered}
                style={{
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  [ Option A ]
                </span>
                <span style={{ fontSize: '38px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {blindMode && !isAnswered ? '?' : activePair.itemA.char}
                </span>
                <span style={{ fontSize: '16px', color: 'var(--accent-gold)', fontWeight: 500 }}>
                  {blindMode && !isAnswered ? '•••' : activePair.itemA.pinyin}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {blindMode && !isAnswered ? 'Audio A' : activePair.itemA.translation}
                </span>
                {isAnswered && isTarget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-bamboo)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                    <CheckCircle2 size={14} /> Correct Target
                  </div>
                )}
                {isAnswered && isChosen && !isTarget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-coral)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                    <XCircle size={14} /> Incorrect
                  </div>
                )}
              </button>
            );
          })()}

          {/* Card B */}
          {(() => {
            const isTarget = !targetIsA;
            const isChosen = userSelection === 'B';
            let borderColor = 'var(--border-subtle)';
            let bgColor = 'var(--bg-base)';
            if (isAnswered) {
              if (isTarget) {
                borderColor = 'var(--accent-bamboo)';
                bgColor = 'rgba(74, 222, 128, 0.08)';
              } else if (isChosen) {
                borderColor = 'var(--accent-coral)';
                bgColor = 'rgba(239, 68, 68, 0.08)';
              }
            }

            return (
              <button
                type="button"
                onClick={() => handleSelectOption('B')}
                disabled={isAnswered}
                style={{
                  padding: '24px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${borderColor}`,
                  backgroundColor: bgColor,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: isAnswered ? 'default' : 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative'
                }}
              >
                <span style={{ position: 'absolute', top: '10px', left: '12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  [ Option B ]
                </span>
                <span style={{ fontSize: '38px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {blindMode && !isAnswered ? '?' : activePair.itemB.char}
                </span>
                <span style={{ fontSize: '16px', color: 'var(--accent-gold)', fontWeight: 500 }}>
                  {blindMode && !isAnswered ? '•••' : activePair.itemB.pinyin}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {blindMode && !isAnswered ? 'Audio B' : activePair.itemB.translation}
                </span>
                {isAnswered && isTarget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-bamboo)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                    <CheckCircle2 size={14} /> Correct Target
                  </div>
                )}
                {isAnswered && isChosen && !isTarget && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-coral)', fontSize: '12px', fontWeight: 600, marginTop: '6px' }}>
                    <XCircle size={14} /> Incorrect
                  </div>
                )}
              </button>
            );
          })()}
        </div>

        {/* Post-Answer Analysis & Compare Section */}
        {isAnswered && (
          <div style={{
            width: '100%',
            maxWidth: '600px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, fontSize: '14px', color: isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-coral)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {isCorrect ? 'Accurate Discrimination!' : `The spoken character was "${targetItem.char}" (${targetItem.pinyin})`}
              </div>

              {/* Side-by-Side Comparison Audio */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => AzureSpeechService.speak(activePair.itemA.char, 0.85)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Volume2 size={12} /> Play {activePair.itemA.char}
                </button>
                <button
                  onClick={() => AzureSpeechService.speak(activePair.itemB.char, 0.85)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Volume2 size={12} /> Play {activePair.itemB.char}
                </button>
              </div>
            </div>

            {/* Articulatory & Acoustic Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div>
                <strong style={{ color: 'var(--accent-gold)' }}>👅 Tongue & Mouth Position:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{activePair.articulatoryTip}</span>
              </div>
              <div>
                <strong style={{ color: 'var(--accent-gold)' }}>🎧 Acoustic Signature:</strong>{' '}
                <span style={{ color: 'var(--text-secondary)' }}>{activePair.acousticFeature}</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              style={{
                marginTop: '6px',
                padding: '10px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--accent-gold)',
                color: '#000',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Next Contrast <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
