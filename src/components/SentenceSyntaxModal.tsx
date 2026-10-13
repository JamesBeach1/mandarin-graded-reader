import React, { useState } from 'react';
import { parseSentenceSyntax, type SentenceSyntaxTree, type SyntaxConstituent } from '../utils/sentenceSyntaxParser';
import { X, GitCommit, Layers, ArrowRight, BookOpen } from 'lucide-react';

interface SentenceSyntaxModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentence: string;
}

export const SentenceSyntaxModal: React.FC<SentenceSyntaxModalProps> = ({
  isOpen,
  onClose,
  sentence
}) => {
  const [activeSentence, setActiveSentence] = useState(sentence);
  const [selectedConstituent, setSelectedConstituent] = useState<SyntaxConstituent | null>(null);

  React.useEffect(() => {
    if (sentence) {
      setActiveSentence(sentence);
      setSelectedConstituent(null);
    }
  }, [sentence]);

  if (!isOpen) return null;

  const syntaxTree: SentenceSyntaxTree = parseSentenceSyntax(activeSentence);

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
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface, #1e1e24)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-strong, #333)',
          boxShadow: 'var(--shadow-modal, 0 16px 40px rgba(0,0,0,0.5))',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
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
            <GitCommit size={16} color="var(--accent-bamboo, #58cc02)" />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
              Sentence Syntax Tree (句法层次树)
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

        {/* Content */}
        <div style={{ padding: '18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Target Sentence Banner */}
          <div style={{
            padding: '14px',
            backgroundColor: 'var(--bg-base, #141416)',
            borderRadius: 'var(--radius-md, 8px)',
            border: '1px solid var(--border-subtle, #2a2a30)'
          }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-muted, #777)',
              marginBottom: '6px'
            }}>
              Sentence Analysis
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: 600,
              fontFamily: 'var(--font-serif-zh, "Noto Serif SC", serif)',
              color: 'var(--text-primary, #fff)',
              lineHeight: 1.5
            }}>
              {syntaxTree.sentence}
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '8px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-pill, 12px)',
              backgroundColor: 'rgba(74, 144, 226, 0.15)',
              border: '1px solid rgba(74, 144, 226, 0.3)',
              fontSize: '11px',
              color: '#4a90e2',
              fontWeight: 600
            }}>
              <Layers size={12} /> {syntaxTree.structureType}
            </div>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: 'var(--text-secondary, #aaa)' }}>
              {syntaxTree.structureExplanation}
            </p>
          </div>

          {/* Interactive Visual Syntax Blocks */}
          <div>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-secondary, #aaa)',
              marginBottom: '8px'
            }}>
              Grammatical Constituents (Click any block for pedagogical breakdown):
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'stretch'
            }}>
              {syntaxTree.constituents.map((item, idx) => {
                const isSelected = selectedConstituent?.labelZh === item.labelZh;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedConstituent(item)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '10px 14px',
                      backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'var(--bg-base, #141416)',
                      border: `2px solid ${item.color}`,
                      borderRadius: 'var(--radius-md, 8px)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      flex: '1 1 auto',
                      minWidth: '80px'
                    }}
                  >
                    <span style={{
                      fontSize: '17px',
                      fontWeight: 600,
                      fontFamily: 'var(--font-serif-zh, "Noto Serif SC", serif)',
                      color: 'var(--text-primary, #fff)',
                      marginBottom: '2px'
                    }}>
                      {item.text}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      color: item.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em'
                    }}>
                      {item.role}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Constituent Card */}
          {selectedConstituent && (
            <div style={{
              padding: '14px',
              backgroundColor: 'var(--bg-card, #23232b)',
              borderRadius: 'var(--radius-md, 8px)',
              borderLeft: `4px solid ${selectedConstituent.color}`
            }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: selectedConstituent.color, marginBottom: '4px' }}>
                {selectedConstituent.labelZh}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary, #ccc)', lineHeight: 1.5 }}>
                {selectedConstituent.explanation}
              </div>
            </div>
          )}

          {/* Pedagogical Hint */}
          <div style={{
            fontSize: '11px',
            color: 'var(--text-muted, #777)',
            borderTop: '1px solid var(--border-subtle, #2a2a30)',
            paddingTop: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BookOpen size={12} />
            <span>Moyun syntax engine models topic-comment frameworks and Chinese coverb complements.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
