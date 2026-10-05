import React, { useState } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { IslandAiService, type TranslatedIslandSentence, OFFLINE_REALISTIC_SCENARIOS } from '../../services/islandAiService';
import { AzureSpeechService } from '../../services/azureSpeech';
import { 
  Sparkles, X, Volume2, Check, RefreshCw, AlertCircle, 
  Plus, CheckSquare, Square, Play, ShieldCheck, HelpCircle
} from 'lucide-react';

interface BatchFillIslandModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetIsland?: LanguageIsland | null;
  islands: LanguageIsland[];
  hanziData?: any[];
  onSentencesAdded: (islandId: string, sentences: IslandSentence[]) => void;
}

// Curated realistic inspiration chips for everyday life
const REALISTIC_SCENARIO_PROMPTS = [
  {
    icon: '🦷',
    label: 'Dentist & Clinic',
    scenario: 'Visiting the dentist for a toothache, tooth cleaning, cavities, and X-ray checkup',
    category: 'daily' as const
  },
  {
    icon: '🏠',
    label: 'Landlord & Maintenance',
    scenario: 'Calling the landlord about a leaking pipe, air conditioner not cooling, paying utilities, and renewing the lease',
    category: 'daily' as const
  },
  {
    icon: '🐾',
    label: 'Vet & Sick Pet',
    scenario: 'Taking a cat to the vet clinic for vomiting, lack of appetite, medication, and blood checkup',
    category: 'daily' as const
  },
  {
    icon: '☕',
    label: 'Ordering Bubble Tea',
    scenario: 'Ordering milk tea with custom sweetness (微糖), ice level, oat milk substitute, and adding boba pearls',
    category: 'daily' as const
  },
  {
    icon: '📦',
    label: 'Express Courier & Delivery',
    scenario: 'Talking to the courier about package delivery code, delivery locker, holding packages, and damaged parcels',
    category: 'daily' as const
  },
  {
    icon: '🚕',
    label: 'Taxi & Didi Ride',
    scenario: 'Directing a taxi driver, asking to turn on the AC, dropping off across the street, and scanning payment code',
    category: 'travel' as const
  },
  {
    icon: '💼',
    label: 'Workplace & Overtime',
    scenario: 'Declining weekend overtime politely, asking a colleague for a spreadsheet link, and wrapping up Friday tasks',
    category: 'work' as const
  },
  {
    icon: '💇',
    label: 'Salon & Haircut',
    scenario: 'Telling the barber to trim just the ends, keep the bangs long, thin out the sides, and wash with warm water',
    category: 'daily' as const
  }
];

export const BatchFillIslandModal: React.FC<BatchFillIslandModalProps> = ({
  isOpen,
  onClose,
  targetIsland,
  islands,
  hanziData = [],
  onSentencesAdded
}) => {
  const [selectedIslandId, setSelectedIslandId] = useState<string>(() => {
    return targetIsland?.id || (islands[0]?.id || '');
  });

  const [promptText, setPromptText] = useState('');
  const [targetCount, setTargetCount] = useState<number>(8);
  const [targetHskLevel, setTargetHskLevel] = useState<string>('HSK 3 Practical Spoken');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Candidate generation results
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedChineseTitle, setGeneratedChineseTitle] = useState('');
  const [candidates, setCandidates] = useState<TranslatedIslandSentence[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  // Keep selectedIslandId in sync when targetIsland prop changes
  React.useEffect(() => {
    if (targetIsland?.id) {
      setSelectedIslandId(targetIsland.id);
    } else if (islands.length > 0 && !selectedIslandId) {
      setSelectedIslandId(islands[0].id);
    }
  }, [targetIsland, islands]);

  if (!isOpen) return null;

  const currentIsland = islands.find(i => i.id === selectedIslandId) || targetIsland;

  // Audio preview handler using Azure speech
  const handlePlayAudio = (chineseText: string, index: number) => {
    setPlayingIndex(index);
    AzureSpeechService.speak(
      chineseText,
      { rate: 0.9 },
      () => setPlayingIndex(null),
      () => setPlayingIndex(null)
    );
  };

  // Run generator
  const handleGenerate = async (overridePrompt?: string) => {
    const textToUse = (overridePrompt ?? promptText).trim();
    if (!textToUse) {
      setErrorMsg('Please enter a scenario description or choose an inspiration prompt above.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setCandidates([]);
    setSelectedIndices(new Set());

    try {
      const res = await IslandAiService.generateRealisticScenarioIsland(textToUse, {
        category: (currentIsland?.category as any) || 'daily',
        count: targetCount,
        hskLevel: targetHskLevel
      });

      if (!res.sentences || res.sentences.length === 0) {
        throw new Error('No sentences could be generated. Please try again.');
      }

      setGeneratedTitle(res.suggestedTitle);
      setGeneratedChineseTitle(res.suggestedChineseTitle);
      setCandidates(res.sentences);
      // Select all by default
      setSelectedIndices(new Set(res.sentences.map((_, i) => i)));
    } catch (err: any) {
      console.error('Scenario generation failed:', err);
      setErrorMsg(err?.message || 'Failed to generate scenario sentences. Please check your connection or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle selection
  const toggleSelectCandidate = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === candidates.length) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(candidates.map((_, i) => i)));
    }
  };

  // Commit selected sentences to destination island
  const handleImportSelected = () => {
    if (!selectedIslandId) {
      setErrorMsg('Please select a destination island.');
      return;
    }

    const selectedSentences = candidates.filter((_, idx) => selectedIndices.has(idx));
    if (selectedSentences.length === 0) {
      setErrorMsg('Please select at least one sentence to import.');
      return;
    }

    const baseTime = Date.now();
    const newItems: IslandSentence[] = selectedSentences.map((c, idx) => ({
      id: `sent-batch-${baseTime}-${idx}`,
      islandId: selectedIslandId,
      chinese: c.chinese,
      pinyin: c.pinyin,
      english: c.english,
      notes: c.notes,
      hskLevel: c.hskLevel || 3,
      masteryLevel: 0,
      timesReviewed: 0,
      struggleCount: 0,
      createdAt: baseTime + idx
    }));

    onSentencesAdded(selectedIslandId, newItems);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px',
      backdropFilter: 'blur(3px)'
    }}>
      <div 
        className="editorial-card modal-container"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg, 12px)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-card, var(--bg-surface))'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              color: 'var(--accent-gold, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Batch Fill Language Island
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Generate realistic, mundane conversational sentences tailored to everyday situations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-icon"
            style={{ color: 'var(--text-muted)', border: 'none', background: 'transparent' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{
          padding: '20px 22px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flex: 1
        }}>
          {/* Destination Island Selection */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                Destination Island:
              </span>
              <select
                value={selectedIslandId}
                onChange={(e) => setSelectedIslandId(e.target.value)}
                className="form-select"
                style={{
                  minWidth: '220px',
                  height: '34px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}
              >
                {islands.map(i => (
                  <option key={i.id} value={i.id}>
                    {i.title} {i.chineseTitle ? `(${i.chineseTitle})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--accent-bamboo, #10b981)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-pill, 9999px)'
            }}>
              <ShieldCheck size={14} />
              <span>Anti-Fantasy Filter Active</span>
            </div>
          </div>

          {/* Quick Inspiration Chips */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Realistic Everyday Scenarios:
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Click to load realistic mundane phrases
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              {REALISTIC_SCENARIO_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(item.scenario);
                    handleGenerate(item.scenario);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 10px',
                    borderRadius: 'var(--radius-sm, 6px)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover-subtle"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Prompt Input */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Describe your realistic situation or context:
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Focus on practical tasks, requests, and mild complaints
              </span>
            </div>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g., Calling landlord about leaking sink; asking the dentist if a root canal is needed; ordering milk tea with 30% sweetness and no ice..."
              className="form-input"
              rows={3}
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '10px 12px',
                lineHeight: 1.5,
                resize: 'vertical'
              }}
            />
          </div>

          {/* Generation Options Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phrases:</span>
                <select
                  value={targetCount}
                  onChange={(e) => setTargetCount(Number(e.target.value))}
                  className="form-select"
                  style={{ height: '32px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value={5}>5 sentences</option>
                  <option value={8}>8 sentences</option>
                  <option value={10}>10 sentences</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Level:</span>
                <select
                  value={targetHskLevel}
                  onChange={(e) => setTargetHskLevel(e.target.value)}
                  className="form-select"
                  style={{ height: '32px', fontSize: '12px', padding: '2px 8px' }}
                >
                  <option value="HSK 2 Spoken Core">HSK 2 Spoken Core</option>
                  <option value="HSK 3 Practical Spoken">HSK 3 Practical Spoken</option>
                  <option value="HSK 4 Nuanced Spoken">HSK 4 Nuanced Spoken</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => handleGenerate()}
              disabled={isLoading || !promptText.trim()}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                fontSize: '13px',
                fontWeight: 600,
                backgroundColor: 'var(--accent-gold, #d97706)',
                borderColor: 'var(--accent-gold, #d97706)'
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={14} className="spin-slow" />
                  Generating Realistic Sentences...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate Sentences
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div style={{
              padding: '10px 14px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              borderRadius: 'var(--radius-sm)',
              color: '#ef4444',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Generated Candidates Inspection & Review */}
          {candidates.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              borderTop: '1px solid var(--border-subtle)',
              paddingTop: '16px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {generatedTitle} {generatedChineseTitle && <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>({generatedChineseTitle})</span>}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selectedIndices.size} of {candidates.length} sentences selected for import
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-bamboo, #10b981)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px'
                  }}
                >
                  {selectedIndices.size === candidates.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Sentences List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '340px',
                overflowY: 'auto'
              }}>
                {candidates.map((cand, idx) => {
                  const isChecked = selectedIndices.has(idx);
                  const isPlaying = playingIndex === idx;

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectCandidate(idx)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: isChecked ? 'var(--bg-card, rgba(217, 119, 6, 0.05))' : 'var(--bg-base)',
                        border: isChecked ? '1px solid var(--accent-gold, #d97706)' : '1px solid var(--border-subtle)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Checkbox */}
                      <div style={{ marginTop: '2px', color: isChecked ? 'var(--accent-gold, #d97706)' : 'var(--text-muted)' }}>
                        {isChecked ? <CheckSquare size={17} /> : <Square size={17} />}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            fontFamily: 'var(--font-serif-zh, "Noto Serif SC", serif)'
                          }}>
                            {cand.chinese}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                            {cand.pinyin}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {cand.english}
                        </div>

                        {cand.notes && (
                          <div style={{
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            backgroundColor: 'rgba(255,255,255,0.04)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            width: 'fit-content',
                            marginTop: '2px'
                          }}>
                            💡 {cand.notes}
                          </div>
                        )}
                      </div>

                      {/* Audio Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio(cand.chinese, idx);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: isPlaying ? 'var(--accent-gold, #d97706)' : 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={16} className={isPlaying ? 'pulse-audio' : ''} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 22px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          backgroundColor: 'var(--bg-card, var(--bg-surface))'
        }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '8px 16px' }}
          >
            Cancel
          </button>

          {candidates.length > 0 && (
            <button
              type="button"
              onClick={handleImportSelected}
              disabled={selectedIndices.size === 0}
              className="btn btn-bamboo"
              style={{
                fontSize: '13px',
                padding: '8px 18px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Plus size={15} />
              Import {selectedIndices.size} Sentences to Island
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
