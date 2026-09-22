import React, { useState, useEffect } from 'react';
import { COMMON_GRAMMAR_PATTERNS, type GrammarRule } from '../utils/grammarHighlighter';
import { getSavedStories, type SavedStory } from '../services/libraryStore';
import { BookOpen, Search, Sparkles, Filter, ChevronRight, X, Quote } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

interface GrammarDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStory?: (story: SavedStory) => void;
}

interface PatternWithCorpusExamples {
  rule: GrammarRule;
  corpusExamples: {
    storyTitle: string;
    storyId: string;
    sentence: string;
    matchedText: string;
  }[];
}

export const GrammarDirectoryModal: React.FC<GrammarDirectoryModalProps> = ({
  isOpen,
  onClose,
  onSelectStory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [selectedRuleName, setSelectedRuleName] = useState<string>(COMMON_GRAMMAR_PATTERNS[0].name);
  const [stories, setStories] = useState<SavedStory[]>([]);
  const [patternCorpus, setPatternCorpus] = useState<Record<string, { storyTitle: string; storyId: string; sentence: string; matchedText: string }[]>>({});

  useEffect(() => {
    if (isOpen) {
      loadLibraryCorpus();
    }
  }, [isOpen]);

  const loadLibraryCorpus = async () => {
    const saved = await getSavedStories();
    setStories(saved);

    // Scan user's personal corpus stories for each grammar pattern
    const corpusMap: Record<string, { storyTitle: string; storyId: string; sentence: string; matchedText: string }[]> = {};

    COMMON_GRAMMAR_PATTERNS.forEach(rule => {
      corpusMap[rule.name] = [];

      for (const story of saved) {
        // Split story into individual sentences
        const rawSentences = story.text.split(/([。！？\n])/);
        const reconstructed: string[] = [];
        for (let i = 0; i < rawSentences.length; i += 2) {
          const sent = (rawSentences[i] + (rawSentences[i + 1] || '')).trim();
          if (sent) reconstructed.push(sent);
        }

        for (const sent of reconstructed) {
          const rx = new RegExp(rule.regex.source, 'g');
          const m = rx.exec(sent);
          if (m) {
            corpusMap[rule.name].push({
              storyTitle: story.title,
              storyId: story.id,
              sentence: sent,
              matchedText: m[0]
            });
            if (corpusMap[rule.name].length >= 10) break; // cap at 10 examples
          }
        }
      }
    });

    setPatternCorpus(corpusMap);
  };

  if (!isOpen) return null;

  const filteredRules = COMMON_GRAMMAR_PATTERNS.filter(rule => {
    const matchesLevel = levelFilter === 'all' || rule.hskLevel === levelFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q ||
      rule.name.toLowerCase().includes(q) ||
      rule.formula.toLowerCase().includes(q) ||
      rule.explanation.toLowerCase().includes(q);
    return matchesLevel && matchesQuery;
  });

  const activeRule = COMMON_GRAMMAR_PATTERNS.find(r => r.name === selectedRuleName) || COMMON_GRAMMAR_PATTERNS[0];
  const activeCorpus = patternCorpus[activeRule.name] || [];

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
        padding: '24px',
        maxWidth: '960px',
        width: '100%',
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={18} color="var(--accent-gold)" />
              <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
                HSK Grammar Pattern Directory (AIM-006)
              </h2>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Explore foundational Chinese syntactic formulas and examine real contextual examples mined from your saved story corpus.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Level Filter Bar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search grammar patterns, formulas, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '13px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 1, 2, 3, 4] as const).map(lvl => (
              <button
                key={lvl}
                onClick={() => setLevelFilter(lvl)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '12px',
                  fontWeight: 500,
                  border: '1px solid',
                  borderColor: levelFilter === lvl ? 'var(--accent-gold)' : 'var(--border-subtle)',
                  backgroundColor: levelFilter === lvl ? 'rgba(217, 119, 6, 0.15)' : 'transparent',
                  color: levelFilter === lvl ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {lvl === 'all' ? 'All Levels' : `HSK ${lvl}`}
              </button>
            ))}
          </div>
        </div>

        {/* Master-Detail Split Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px', flex: 1, overflow: 'hidden' }}>
          
          {/* Left Column: Patterns List */}
          <div style={{
            overflowY: 'auto',
            borderRight: '1px solid var(--border-subtle)',
            paddingRight: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {filteredRules.map(rule => {
              const isSelected = rule.name === activeRule.name;
              const matchesInCorpus = patternCorpus[rule.name]?.length || 0;

              return (
                <div
                  key={rule.name}
                  onClick={() => setSelectedRuleName(rule.name)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--bg-surface-hover)' : 'var(--bg-panel)',
                    border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: isSelected ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                      {rule.name}
                    </span>
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 5px',
                      borderRadius: '3px',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)'
                    }}>
                      HSK {rule.hskLevel}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {rule.formula}
                  </div>

                  <div style={{ fontSize: '11px', color: matchesInCorpus > 0 ? 'var(--accent-bamboo)' : 'var(--text-muted)' }}>
                    {matchesInCorpus > 0 ? `📖 ${matchesInCorpus} in personal corpus` : 'No saved matches yet'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Pattern Deep-Dive & Corpus Examples */}
          <div style={{ overflowY: 'auto', paddingLeft: '6px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Pattern Card Summary */}
            <div style={{
              padding: '18px',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)' }}>
                  {activeRule.name}
                </h3>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid var(--accent-gold)',
                  fontSize: '11px',
                  fontWeight: 600
                }}>
                  HSK {activeRule.hskLevel} Pattern
                </span>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '4px' }}>
                  Grammar Formula
                </div>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {activeRule.formula}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Linguistic Explanation & Usage
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                  {activeRule.explanation}
                </p>
              </div>
            </div>

            {/* Corpus Examples Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Quote size={16} color="var(--accent-gold)" />
                <h4 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>
                  Personal Corpus Sentence Citations ({activeCorpus.length})
                </h4>
              </div>

              {activeCorpus.length === 0 ? (
                <div style={{
                  padding: '28px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-panel)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed var(--border-subtle)',
                  color: 'var(--text-muted)',
                  fontSize: '13px'
                }}>
                  No examples of "{activeRule.name}" found in your saved library stories yet.
                  <br />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', display: 'inline-block' }}>
                    Generate or import stories at HSK {activeRule.hskLevel}+ to automatically mine live citations!
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeCorpus.map((example, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 14px',
                        backgroundColor: 'var(--bg-panel)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--accent-gold)' }}>
                          📖 {example.storyTitle}
                        </span>
                        <button
                          onClick={() => AzureSpeechService.speak(example.sentence, { rate: 0.95 })}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-bamboo)',
                            cursor: 'pointer',
                            fontSize: '11px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          🔊 Listen
                        </button>
                      </div>

                      <div style={{
                        fontFamily: 'var(--font-serif-zh)',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        color: 'var(--text-primary)'
                      }}>
                        {example.sentence.split(example.matchedText).map((part, pi, arr) => (
                          <React.Fragment key={pi}>
                            {part}
                            {pi < arr.length - 1 && (
                              <span style={{
                                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                                borderBottom: '2px solid var(--accent-gold)',
                                color: 'var(--accent-gold)',
                                fontWeight: 600,
                                padding: '1px 4px',
                                borderRadius: '2px'
                              }}>
                                {example.matchedText}
                              </span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
