import React, { useState } from 'react';
import {
  LOOKALIKE_DRILLS,
  CONFUSABLE_CLUSTERS,
  type LookAlikeQuizQuestion,
  type ConfusableCluster
} from '../utils/confusableHanzi';
import { X, CheckCircle2, AlertCircle, Sparkles, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface ConfusableHanziModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetChar?: string;
}

export const ConfusableHanziModal: React.FC<ConfusableHanziModalProps> = ({
  isOpen,
  onClose,
  targetChar
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'library'>('quiz');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [libraryFilter, setLibraryFilter] = useState(targetChar || '');

  if (!isOpen) return null;

  const currentQuestion: LookAlikeQuizQuestion = LOOKALIKE_DRILLS[currentIdx % LOOKALIKE_DRILLS.length];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion.correctCharacter;

  const handleSelectOption = (char: string) => {
    if (isAnswered) return;
    setSelectedAnswer(char);
    setAnsweredCount(prev => prev + 1);
    if (char === currentQuestion.correctCharacter) {
      setScore(prev => prev + 1);
      AzureSpeechService.speak(char, 0.9);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setCurrentIdx(prev => (prev + 1) % LOOKALIKE_DRILLS.length);
  };

  const filteredClusters: ConfusableCluster[] = libraryFilter.trim()
    ? CONFUSABLE_CLUSTERS.filter(c => 
        c.title.includes(libraryFilter) || 
        c.characters.some(ch => ch.character.includes(libraryFilter) || ch.pinyin.includes(libraryFilter) || ch.definition.toLowerCase().includes(libraryFilter.toLowerCase()))
      )
    : CONFUSABLE_CLUSTERS;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '680px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>👁️</span>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Look-Alike Hanzi Studio (形近字辨析)
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', padding: '2px', border: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  background: activeTab === 'quiz' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'quiz' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <HelpCircle size={13} /> Active Quiz
              </button>
              <button
                onClick={() => setActiveTab('library')}
                style={{
                  background: activeTab === 'library' ? 'var(--bg-surface)' : 'transparent',
                  color: activeTab === 'library' ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <BookOpen size={13} /> Visual Catalog ({CONFUSABLE_CLUSTERS.length})
              </button>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'quiz' ? (
            <div>
              {/* Score bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                  Question {currentIdx + 1} of {LOOKALIKE_DRILLS.length}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                  Score: {score} / {answeredCount} ({answeredCount > 0 ? Math.round((score / answeredCount) * 100) : 0}%)
                </span>
              </div>

              {/* Question Sentence Prompt */}
              <div style={{
                padding: '24px',
                backgroundColor: 'var(--bg-panel)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                textAlign: 'center',
                marginBottom: '20px'
              }}>
                <div style={{
                  fontSize: '22px',
                  fontFamily: 'var(--font-serif-zh)',
                  lineHeight: '1.8',
                  color: 'var(--text-primary)',
                  marginBottom: '10px'
                }}>
                  {currentQuestion.sentencePrompt.split('[ ___ ]').map((part, idx, arr) => (
                    <React.Fragment key={idx}>
                      {part}
                      {idx < arr.length - 1 && (
                        <span style={{
                          display: 'inline-block',
                          padding: '0 12px',
                          margin: '0 6px',
                          borderBottom: '3px solid var(--accent-gold)',
                          color: isAnswered ? (isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)') : 'var(--accent-gold)',
                          fontWeight: 700
                        }}>
                          {isAnswered ? currentQuestion.correctCharacter : '？'}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  "{currentQuestion.sentenceTranslation}"
                </div>
              </div>

              {/* Options */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${currentQuestion.options.length}, 1fr)`, gap: '14px', marginBottom: '20px' }}>
                {currentQuestion.options.map(option => {
                  let btnBg = 'var(--bg-surface)';
                  let btnBorder = 'var(--border-subtle)';
                  let textColor = 'var(--text-primary)';

                  if (isAnswered) {
                    if (option === currentQuestion.correctCharacter) {
                      btnBg = 'rgba(74, 222, 128, 0.15)';
                      btnBorder = 'var(--accent-bamboo)';
                      textColor = 'var(--accent-bamboo)';
                    } else if (option === selectedAnswer) {
                      btnBg = 'rgba(239, 68, 68, 0.15)';
                      btnBorder = 'var(--accent-seal)';
                      textColor = 'var(--accent-seal)';
                    }
                  }

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      disabled={isAnswered}
                      style={{
                        padding: '16px',
                        backgroundColor: btnBg,
                        border: `2px solid ${btnBorder}`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: '32px',
                        fontFamily: 'var(--font-serif-zh)',
                        color: textColor,
                        cursor: isAnswered ? 'default' : 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'transform 0.1s ease, border-color 0.15s ease'
                      }}
                    >
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Stroke Diff Breakdown */}
              {isAnswered && (
                <div style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isCorrect ? 'rgba(74, 222, 128, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                  border: `1px solid ${isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)'}`,
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {isCorrect ? (
                      <CheckCircle2 size={18} color="var(--accent-bamboo)" />
                    ) : (
                      <AlertCircle size={18} color="var(--accent-seal)" />
                    )}
                    <span style={{ fontWeight: 600, fontSize: '14px', color: isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)' }}>
                      {isCorrect ? 'Correct!' : `Incorrect — the answer is ${currentQuestion.correctCharacter}`}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                    {currentQuestion.explanation}
                  </p>

                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleNextQuestion}
                      className="btn btn-primary"
                      style={{ padding: '8px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      Next Question <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Reference Library Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="Search confusable character or pinyin (e.g. 己, 末, buy)..."
                value={libraryFilter}
                onChange={(e) => setLibraryFilter(e.target.value)}
                className="form-input"
                style={{ width: '100%', height: '36px', fontSize: '13px' }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredClusters.map(cluster => (
                  <div
                    key={cluster.id}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                        {cluster.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--accent-gold)', backgroundColor: 'var(--bg-surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                        {cluster.characters.length} Variants
                      </span>
                    </div>

                    {/* Character Comparison Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(180px, 1fr))`, gap: '12px', marginBottom: '12px' }}>
                      {cluster.characters.map(item => (
                        <div
                          key={item.character}
                          style={{
                            padding: '12px',
                            backgroundColor: 'var(--bg-surface)',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-subtle)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '40px', fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)', lineHeight: 1 }}>
                            {item.character}
                          </div>
                          <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', margin: '4px 0 2px 0' }}>
                            {item.pinyin}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            {item.definition}
                          </div>
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--accent-bamboo)',
                            backgroundColor: 'rgba(74, 222, 128, 0.1)',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            lineHeight: 1.4
                          }}>
                            <strong>Key difference:</strong> {item.strokeDifference}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                      💡 <strong>Mnemonic hook:</strong> {cluster.pedagogicalTip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
