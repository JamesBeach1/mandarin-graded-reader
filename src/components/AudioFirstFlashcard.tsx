import React, { useState, useEffect } from 'react';
import type { Flashcard } from '../services/srsStore';
import { Volume2, Eye, Edit3 } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface AudioFirstFlashcardProps {
  card: Flashcard;
  onGrade: (quality: number) => void;
  onOpenWritingPractice: () => void;
}

export const AudioFirstFlashcard: React.FC<AudioFirstFlashcardProps> = ({
  card,
  onGrade,
  onOpenWritingPractice
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  // Play audio on initial card mount
  useEffect(() => {
    setIsRevealed(false);
    const handle = AzureSpeechService.speak(card.character, { rate: 0.9 });
    return () => handle.stop();
  }, [card.character]);

  const handlePlayAudio = () => {
    AzureSpeechService.speak(card.character, { rate: 0.9 });
  };

  return (
    <div className="srs-card-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          🎧 Audio-First Active Recall
        </span>
        {card.hsk_level && (
          <span style={{ backgroundColor: 'var(--bg-panel)', padding: '3px 8px', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 'bold' }}>
            HSK {card.hsk_level}
          </span>
        )}
      </div>

      {/* Audio Recall Trigger */}
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={handlePlayAudio}
          className="btn btn-primary"
          style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', padding: 0 }}
          title="Replay Audio"
        >
          <Volume2 size={28} />
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Listen carefully. What character and meaning do you hear?
        </span>
      </div>

      {/* SRS-001: Context Sentence Recall Cloze (Unrevealed Front) */}
      {!isRevealed && card.exampleSentence && (
        <div style={{
          margin: '16px 0',
          padding: '14px 16px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--accent-gold)',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            📖 Context Sentence Cloze
          </div>
          <div style={{
            fontFamily: 'var(--font-serif-zh)',
            fontSize: '17px',
            lineHeight: '1.7',
            color: 'var(--text-primary)'
          }}>
            {card.exampleSentence.split(card.character).map((part, idx, arr) => (
              <React.Fragment key={idx}>
                {part}
                {idx < arr.length - 1 && (
                  <span style={{
                    display: 'inline-block',
                    padding: '1px 8px',
                    margin: '0 4px',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    borderBottom: '2px solid var(--accent-gold)',
                    borderRadius: '3px',
                    color: 'var(--accent-gold)',
                    fontWeight: 600,
                    letterSpacing: '2px'
                  }}>
                    ___
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {!isRevealed ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button onClick={() => setIsRevealed(true)} className="btn btn-primary" style={{ padding: '12px' }}>
            <Eye size={16} /> Reveal Character & Definition
          </button>
          <button onClick={onOpenWritingPractice} className="btn btn-secondary">
            <Edit3 size={15} /> Practice Writing First
          </button>
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <div className="srs-character-display">
            {card.character}
          </div>

          <div style={{ fontSize: '20px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '8px' }}>
            {card.pinyin}
          </div>

          <div style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px', lineHeight: 1.5 }}>
            {card.definition}
          </div>

          {/* SRS-001: Context Sentence Revealed with Audio */}
          {card.exampleSentence && (
            <div style={{
              margin: '16px 0 20px 0',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  📖 Example Sentence
                </span>
                <button
                  onClick={() => AzureSpeechService.speak(card.exampleSentence!, 0.85)}
                  className="control-button"
                  style={{ padding: '2px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Listen to full sentence"
                >
                  <Volume2 size={12} /> Play Sentence
                </button>
              </div>
              <p style={{ margin: 0, fontFamily: 'var(--font-serif-zh)', fontSize: '16px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                {card.exampleSentence.split(card.character).map((part, idx, arr) => (
                  <React.Fragment key={idx}>
                    {part}
                    {idx < arr.length - 1 && (
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 700, backgroundColor: 'rgba(217, 119, 6, 0.15)', padding: '0 4px', borderRadius: '3px' }}>
                        {card.character}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </p>
              {card.exampleTranslation && (
                <p style={{ margin: '6px 0 0 0', fontSize: '12px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{card.exampleTranslation}"
                </p>
              )}
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Self-Grade Recall Quality:
            </p>
            <div className="srs-grading-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <button
                onClick={() => onGrade(1)}
                className="btn"
                style={{
                  backgroundColor: 'var(--accent-seal)',
                  color: '#FFFFFF',
                  borderColor: 'var(--accent-seal)',
                  borderBottom: '3px solid #D93838',
                  fontWeight: 700
                }}
              >
                1: Again
              </button>
              <button
                onClick={() => onGrade(2)}
                className="btn"
                style={{
                  backgroundColor: 'var(--accent-gold)',
                  color: '#FFFFFF',
                  borderColor: 'var(--accent-gold)',
                  borderBottom: '3px solid #D97706',
                  fontWeight: 700
                }}
              >
                2: Hard
              </button>
              <button
                onClick={() => onGrade(3)}
                className="btn"
                style={{
                  backgroundColor: 'var(--accent-bamboo)',
                  color: '#FFFFFF',
                  borderColor: 'var(--accent-bamboo)',
                  borderBottom: '3px solid #46A302',
                  fontWeight: 700
                }}
              >
                3: Good
              </button>
              <button
                onClick={() => onGrade(4)}
                className="btn"
                style={{
                  backgroundColor: 'var(--accent-sky)',
                  color: '#FFFFFF',
                  borderColor: 'var(--accent-sky)',
                  borderBottom: '3px solid #1899D6',
                  fontWeight: 700
                }}
              >
                4: Easy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
