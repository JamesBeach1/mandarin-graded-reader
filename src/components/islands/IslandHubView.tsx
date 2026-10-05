import React, { useState } from 'react';
import type { LanguageIsland, IslandSentence } from '../../types/Island';
import { 
  Plus, Search, Volume2, Trash2, Edit3, 
  Play, Sparkles, Star, Zap, CheckCircle2, ChevronRight, BookOpen
} from 'lucide-react';
import { AzureSpeechService } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';
import { BatchFillIslandModal } from './BatchFillIslandModal';
import { ToastStore } from '../../services/toastStore';
import { segmentSentenceIntoTokens } from '../../utils/wordSegmenter';

interface IslandHubViewProps {
  islands: LanguageIsland[];
  sentences: IslandSentence[];
  selectedIslandId: string | null;
  hanziData?: any[];
  vocabData?: any[];
  overridesMap?: Record<string, { pinyin: string; definition: string }>;
  onSelectIsland: (id: string | null) => void;
  onCreateIsland: (title: string, description: string, category: any) => void;
  onUpdateIsland: (island: LanguageIsland) => void;
  onDeleteIsland: (id: string) => void;
  onDeleteSentence: (id: string) => void;
  onStartAudioFlooding: (islandId?: string) => void;
  onStartActiveRecall: (islandId?: string) => void;
  onStartShadowing: (sentence: IslandSentence) => void;
  onOpenCollectorForIsland: (islandId: string) => void;
  onCharClick?: (char: string, e: React.MouseEvent, contextSentence?: string) => void;
  onStrokeOrder?: (char: string) => void;
  onSentencesAdded?: (islandId: string, sentences: IslandSentence[]) => void;
}

export const IslandHubView: React.FC<IslandHubViewProps> = ({
  islands,
  sentences,
  selectedIslandId,
  hanziData = [],
  vocabData = [],
  overridesMap = {},
  onSelectIsland,
  onCreateIsland,
  onUpdateIsland,
  onDeleteIsland,
  onDeleteSentence,
  onStartAudioFlooding,
  onStartActiveRecall,
  onStartShadowing,
  onOpenCollectorForIsland,
  onCharClick,
  onStrokeOrder,
  onSentencesAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBatchFillModal, setShowBatchFillModal] = useState(false);
  const [batchFillTargetIsland, setBatchFillTargetIsland] = useState<LanguageIsland | null>(null);
  const [editingIsland, setEditingIsland] = useState<LanguageIsland | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<'daily' | 'work' | 'social' | 'opinions' | 'travel' | 'media' | 'custom'>('daily');
  const [newChineseTitle, setNewChineseTitle] = useState('');
  const [playingSentenceId, setPlayingSentenceId] = useState<string | null>(null);
  const [wordGroupingMode, setWordGroupingMode] = useState<boolean>(() => {
    return StorageService.getJson<boolean>(STORAGE_KEYS.WORD_GROUPING_MODE, true);
  });

  const toggleWordGrouping = () => {
    const next = !wordGroupingMode;
    setWordGroupingMode(next);
    StorageService.setJson(STORAGE_KEYS.WORD_GROUPING_MODE, next);
  };

  // Play audio for a sentence
  const handlePlayAudio = (sent: IslandSentence) => {
    setPlayingSentenceId(sent.id);
    AzureSpeechService.speak(
      sent.chinese,
      {},
      () => setPlayingSentenceId(null),
      () => setPlayingSentenceId(null)
    );
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onCreateIsland(newTitle.trim(), newDesc.trim(), newCategory);
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  const activeIsland = islands.find(i => i.id === selectedIslandId);

  // Filtered sentences
  const displayedSentences = sentences.filter(s => {
    if (selectedIslandId && s.islandId !== selectedIslandId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.english.toLowerCase().includes(q) ||
        s.chinese.includes(q) ||
        s.pinyin.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate mastery level badge
  const getMasteryBadge = (level: number) => {
    switch (level) {
      case 0:
        return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>🌱 New</span>;
      case 1:
        return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(231,76,60,0.15)', color: '#e74c3c' }}>🔴 Struggling</span>;
      case 2:
        return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(241,196,15,0.15)', color: '#f39c12' }}>🟡 Familiar</span>;
      case 3:
        return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(88,204,2,0.15)', color: 'var(--accent-bamboo)' }}>🟢 Fluent</span>;
      case 4:
        return <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(218,165,32,0.2)', color: 'var(--accent-gold)' }}>⭐ Automatic</span>;
      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner: Language Islands Concept Explainer */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🏝️</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Language Islands & Personal Blueprints
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              color: 'var(--accent-bamboo)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Step 1 of Fluency
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Don't waste time memorizing random textbook words. Build islands of complete, real sentences centered around your actual life. When you master full sentences, grammar absorbs naturally as a side-effect.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onStartAudioFlooding(selectedIslandId || undefined)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Start continuous looped listening"
          >
            <Play size={14} /> Audio Flooding
          </button>
          <button
            onClick={() => onStartActiveRecall(selectedIslandId || undefined)}
            className="btn btn-bamboo"
            style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Test English to Mandarin production"
          >
            <Zap size={14} /> Active Recall Drill
          </button>
          <button
            onClick={() => {
              setBatchFillTargetIsland(activeIsland || null);
              setShowBatchFillModal(true);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold, #d97706)' }}
            title="Batch fill an island with realistic everyday conversational sentences"
          >
            <Sparkles size={14} /> Batch Fill
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '12px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Plus size={14} /> New Island
          </button>
        </div>
      </div>

      {/* Islands Horizontal Carousel / Grid */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Your Language Islands ({islands.length})
            </h4>
            {selectedIslandId && (
              <button
                onClick={() => onSelectIsland(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--accent-indigo, #58cc02)',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
              >
                (Show All Sentences)
              </button>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '14px'
        }}>
          {islands.map(island => {
            const islandSents = sentences.filter(s => s.islandId === island.id);
            const fluentCount = islandSents.filter(s => s.masteryLevel >= 3).length;
            const isSelected = selectedIslandId === island.id;

            return (
              <div
                key={island.id}
                onClick={() => onSelectIsland(isSelected ? null : island.id)}
                style={{
                  padding: '16px',
                  backgroundColor: isSelected ? 'var(--bg-card, rgba(88,204,2,0.06))' : 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--accent-bamboo)' : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>
                      {island.category === 'work' ? '💼' : island.category === 'daily' ? '☕' : island.category === 'opinions' ? '💬' : island.category === 'travel' ? '🚇' : '🏝️'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      backgroundColor: 'var(--bg-base)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-pill)'
                    }}>
                      {islandSents.length} phrases
                    </span>
                  </div>

                  <h5 style={{ margin: '0 0 2px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {island.title}
                  </h5>
                  {island.chineseTitle && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontFamily: 'var(--font-serif-zh)' }}>
                      {island.chineseTitle}
                    </div>
                  )}

                  <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {island.description}
                  </p>
                </div>

                {/* Mastery Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Mastery</span>
                    <span>{islandSents.length > 0 ? Math.round((fluentCount / islandSents.length) * 100) : 0}%</span>
                  </div>
                  <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${islandSents.length > 0 ? (fluentCount / islandSents.length) * 100 : 0}%`,
                      height: '100%',
                      backgroundColor: 'var(--accent-bamboo)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenCollectorForIsland(island.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          color: 'var(--accent-bamboo)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 500
                        }}
                      >
                        <Plus size={12} /> Add
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBatchFillTargetIsland(island);
                          setShowBatchFillModal(true);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '11px',
                          color: 'var(--accent-gold, #d97706)',
                          cursor: 'pointer',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontWeight: 500
                        }}
                        title="Batch fill realistic phrases"
                      >
                        <Sparkles size={12} /> Batch Fill
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIsland(island);
                          setNewTitle(island.title);
                          setNewChineseTitle(island.chineseTitle || '');
                          setNewDesc(island.description || '');
                          setNewCategory(island.category as any || 'daily');
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Edit island details"
                      >
                        <Edit3 size={13} />
                      </button>

                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = await ToastStore.confirm({
                            title: 'Delete Language Island?',
                            message: `Are you sure you want to delete "${island.title}" and its sentences? This action cannot be undone.`,
                            confirmText: 'Delete Island',
                            type: 'danger'
                          });
                          if (confirmed) {
                            onDeleteIsland(island.id);
                            ToastStore.success(`Deleted island "${island.title}".`);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-seal)',
                          cursor: 'pointer',
                          padding: 0
                        }}
                        title="Delete island"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sentences Shelf */}
      <div style={{
        padding: '20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        {/* Search & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeIsland ? `Phrases in "${activeIsland.title}"` : 'All Island Phrases'} ({displayedSentences.length})
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Complete sentences customized to your real life. Click audio to train ears, or shadow to practice mouth muscle memory.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleWordGrouping}
              className="btn btn-secondary"
              style={{
                fontSize: '12px',
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: wordGroupingMode ? 'rgba(88, 204, 2, 0.12)' : 'transparent',
                borderColor: wordGroupingMode ? 'var(--accent-bamboo)' : 'var(--border-subtle)',
                color: wordGroupingMode ? 'var(--accent-bamboo)' : 'var(--text-secondary)'
              }}
              title="Toggle Chinese Word Grouping (Compounds like 燕麦奶 grouped together) vs Single Characters"
            >
              {wordGroupingMode ? '🧩 Words' : '🔤 Chars'}
            </button>

            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search sentences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '30px', fontSize: '12px', width: '180px', height: '34px' }}
              />
            </div>

            {selectedIslandId && (
              <>
                <button
                  onClick={() => {
                    setBatchFillTargetIsland(activeIsland || null);
                    setShowBatchFillModal(true);
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold, #d97706)' }}
                  title="Batch fill this island with realistic sentences"
                >
                  <Sparkles size={13} /> Batch Fill
                </button>
                <button
                  onClick={() => onOpenCollectorForIsland(selectedIslandId)}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Plus size={13} /> Add More
                </button>
              </>
            )}
          </div>
        </div>

        {/* Sentences List */}
        {displayedSentences.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>No sentences found.</p>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>Use the Sentence Collector tab above to dictate your life or paste English phrases.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayedSentences.map(sent => (
              <div
                key={sent.id}
                style={{
                  padding: '14px 18px',
                  backgroundColor: 'var(--bg-base)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'background-color 0.15s ease'
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Chinese & Pinyin */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                      {wordGroupingMode ? (
                        segmentSentenceIntoTokens(sent.chinese, hanziData, vocabData, overridesMap).map((token, tIdx) => {
                          if (!token.isHanzi) {
                            return <span key={tIdx}>{token.text}</span>;
                          }
                          return (
                            <span
                              key={tIdx}
                              onClick={(e) => {
                                if (onCharClick) {
                                  e.stopPropagation();
                                  onCharClick(token.text, e, sent.chinese);
                                }
                              }}
                              style={{
                                cursor: onCharClick ? 'pointer' : 'default',
                                borderBottom: token.isCompound 
                                  ? '2px solid rgba(88, 204, 2, 0.75)' 
                                  : '1px dashed rgba(88, 204, 2, 0.4)',
                                backgroundColor: token.isCompound 
                                  ? 'rgba(88, 204, 2, 0.08)' 
                                  : 'transparent',
                                borderRadius: token.isCompound ? '3px' : '0',
                                padding: token.isCompound ? '1px 3px' : '0',
                                margin: token.isCompound ? '0 1.5px' : '0',
                                transition: 'all 0.15s ease'
                              }}
                              className={`island-hanzi-token ${token.isCompound ? 'island-compound-token' : ''}`}
                              title={token.isCompound 
                                ? `Compound Word: ${token.text}${token.pinyin ? ` (${token.pinyin})` : ''} - Click to inspect word & component characters` 
                                : `Character: ${token.text} - Click to inspect meaning, pinyin, and radical`}
                            >
                              {token.text}
                            </span>
                          );
                        })
                      ) : (
                        sent.chinese.split('').map((char, charIdx) => {
                          const isHan = /[\u4E00-\u9FFF]/.test(char);
                          if (!isHan) {
                            return <span key={charIdx}>{char}</span>;
                          }
                          return (
                            <span
                              key={charIdx}
                              onClick={(e) => {
                                if (onCharClick) {
                                  e.stopPropagation();
                                  onCharClick(char, e, sent.chinese);
                                }
                              }}
                              style={{
                                cursor: onCharClick ? 'pointer' : 'default',
                                borderBottom: '1px dashed rgba(88, 204, 2, 0.4)',
                                transition: 'color 0.15s ease, border-color 0.15s ease'
                              }}
                              className="island-hanzi-token"
                              title="Click to inspect character meaning, pinyin, and radical"
                            >
                              {char}
                            </span>
                          );
                        })
                      )}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      {sent.pinyin}
                    </span>
                  </div>

                  {/* English Prompt */}
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: sent.notes ? '4px' : '0' }}>
                    {sent.english}
                  </div>

                  {/* Structure Notes & HSK Badge */}
                  {sent.notes && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span style={{ backgroundColor: 'var(--bg-surface)', padding: '1px 6px', borderRadius: '3px' }}>
                        💡 {sent.notes}
                      </span>
                      {sent.hskLevel && (
                        <span>HSK {sent.hskLevel}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Right Action Tools */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {getMasteryBadge(sent.masteryLevel)}

                  {/* Stroke Order Practice Button */}
                  {onStrokeOrder && (
                    <button
                      onClick={() => {
                        // Pick first Chinese character in sentence for stroke order practice
                        const firstChar = sent.chinese.split('').find(c => /[\u4E00-\u9FFF]/.test(c));
                        if (firstChar) onStrokeOrder(firstChar);
                      }}
                      className="btn btn-secondary"
                      style={{
                        padding: '6px 10px',
                        fontSize: '12px',
                        borderRadius: 'var(--radius-pill)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title="Practice drawing stroke order (米字格)"
                    >
                      <span>🖌️ Stroke</span>
                    </button>
                  )}

                  {/* Play Audio Button */}
                  <button
                    onClick={() => handlePlayAudio(sent)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Listen to native pronunciation"
                  >
                    <Volume2 size={13} className={playingSentenceId === sent.id ? 'spin' : ''} />
                    <span>Play</span>
                  </button>

                  {/* Shadow Button */}
                  <button
                    onClick={() => onStartShadowing(sent)}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 10px',
                      fontSize: '12px',
                      borderRadius: 'var(--radius-pill)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title="Record and compare shadowing audio"
                  >
                    <span>Shadow</span>
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={async () => {
                      const confirmed = await ToastStore.confirm({
                        title: 'Delete Sentence?',
                        message: 'Remove this sentence from the island?',
                        confirmText: 'Delete Sentence',
                        type: 'danger'
                      });
                      if (confirmed) {
                        onDeleteSentence(sent.id);
                        ToastStore.success('Sentence removed from island.');
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Delete sentence"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Island Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Create New Language Island</h3>
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Island Name (Topic)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Doctor Visits, Gym & Fitness, Tech Discussion"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Chinese Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 医生看诊, 健身运动"
                  value={newChineseTitle}
                  onChange={(e) => setNewChineseTitle(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-serif-zh)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="daily">Daily Life & Routine</option>
                  <option value="work">Work & Career</option>
                  <option value="social">Social & Banter</option>
                  <option value="opinions">Opinions & Venting</option>
                  <option value="travel">Travel & Navigation</option>
                  <option value="custom">Specialized / Custom</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Description / Context
                </label>
                <textarea
                  placeholder="What situations do you find yourself needing these sentences in?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', height: '70px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-bamboo"
                >
                  Create Island
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Island Modal */}
      {editingIsland && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: 600 }}>Edit Language Island</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newTitle.trim()) return;
              onUpdateIsland({
                ...editingIsland,
                title: newTitle.trim(),
                chineseTitle: newChineseTitle.trim() || undefined,
                description: newDesc.trim(),
                category: newCategory,
                updatedAt: Date.now()
              });
              setEditingIsland(null);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Island Name (English)
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="form-input"
                  style={{ width: '100%' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Chinese Title
                </label>
                <input
                  type="text"
                  value={newChineseTitle}
                  onChange={(e) => setNewChineseTitle(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', fontFamily: 'var(--font-serif-zh)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="form-select"
                  style={{ width: '100%' }}
                >
                  <option value="daily">Daily Life & Routine</option>
                  <option value="work">Work & Career</option>
                  <option value="social">Social & Banter</option>
                  <option value="opinions">Opinions & Venting</option>
                  <option value="travel">Travel & Navigation</option>
                  <option value="custom">Specialized / Custom</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>
                  Description / Context
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', height: '70px', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setEditingIsland(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-bamboo"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Realistic Scenario Batch Fill Modal */}
      <BatchFillIslandModal
        isOpen={showBatchFillModal}
        onClose={() => setShowBatchFillModal(false)}
        targetIsland={batchFillTargetIsland}
        islands={islands}
        hanziData={hanziData}
        onSentencesAdded={(islandId, newSents) => {
          if (onSentencesAdded) {
            onSentencesAdded(islandId, newSents);
          }
        }}
      />
    </div>
  );
};
