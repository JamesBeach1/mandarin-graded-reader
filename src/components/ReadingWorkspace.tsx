import React, { useState } from 'react';
import type { HanziItem } from '../types/HanziItem';
import type { SavedStory } from '../services/libraryStore';
import { ReadingTheater } from './ReadingTheater';
import { Sparkles, Library, Trash2, BookOpen, Search, Upload, ClipboardPaste, X } from 'lucide-react';
import { SemanticSearchEngine } from '../services/semanticSearch';
import { StoryShareModal } from './StoryShareModal';
import type { MoyunStoryPackage } from '../utils/storyShare';

interface ReadingWorkspaceProps {
  storyIdea: string;
  setStoryIdea: (val: string) => void;
  hskLevel: string;
  setHskLevel: (val: string) => void;
  loading: boolean;
  apiKey: string;
  onGenerateStory: (e: React.FormEvent) => void;
  storyTitle: string;
  generatedStory: HanziItem[];
  onScaleDifficulty: (direction: 'simplify' | 'harder') => void;
  onContinueStory: (continuationPrompt: string) => void;
  onSaveStory: () => void;
  onCharClick: (item: HanziItem, e: React.MouseEvent, sentenceText?: string) => void;
  isContinuing: boolean;
  savedStories: SavedStory[];
  onSelectSavedStory: (story: SavedStory) => void;
  onDeleteSavedStory: (id: string) => void;
  librarySearchQuery: string;
  setLibrarySearchQuery: (val: string) => void;
  onImportStory?: (pkg: MoyunStoryPackage) => void;
  onOpenImportWorkspace?: () => void;
  onPasteTextIntoReader?: (title: string, rawText: string) => void;
}

export const ReadingWorkspace: React.FC<ReadingWorkspaceProps> = ({
  storyIdea,
  setStoryIdea,
  hskLevel,
  setHskLevel,
  loading,
  apiKey,
  onGenerateStory,
  storyTitle,
  generatedStory,
  onScaleDifficulty,
  onContinueStory,
  onSaveStory,
  onCharClick,
  isContinuing,
  savedStories,
  onSelectSavedStory,
  onDeleteSavedStory,
  librarySearchQuery,
  setLibrarySearchQuery,
  onImportStory,
  onOpenImportWorkspace,
  onPasteTextIntoReader
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [quickPastedTitle, setQuickPastedTitle] = useState('');
  const [quickPastedText, setQuickPastedText] = useState('');

  const [selectedHskFilter, setSelectedHskFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const isStoryInGenre = (story: SavedStory, genreId: string) => {
    if (genreId === 'all') return true;
    if (genreId === 'books') {
      return (
        story.title.includes('【完整名著】') ||
        story.title.includes('【古典全本】') ||
        story.title.includes('【晚清小说】') ||
        story.title.includes('【完整散文】') ||
        story.title.includes('【先秦经典】') ||
        story.text.length >= 1500
      );
    }
    if (genreId === 'buddhist') {
      return (
        story.title.includes('百喻经') ||
        story.title.includes('心经') ||
        story.title.includes('坛经') ||
        story.title.includes('金刚经') ||
        story.title.includes('九色鹿') ||
        story.title.includes('盲人摸象') ||
        story.category === 'culture'
      );
    }
    if (genreId === 'children') {
      return (
        story.category === 'fable' ||
        story.title.includes('马良') ||
        story.title.includes('稻草人') ||
        story.title.includes('阿凡提') ||
        story.title.includes('和尚') ||
        story.title.includes('神笔')
      );
    }
    if (genreId === 'classics') {
      return (
        story.category === 'literature' ||
        story.title.includes('白蛇') ||
        story.title.includes('梁山伯') ||
        story.title.includes('西游记') ||
        story.title.includes('三国') ||
        story.title.includes('水浒') ||
        story.title.includes('红楼梦') ||
        story.title.includes('鲁迅') ||
        story.title.includes('孙武') ||
        story.title.includes('老子')
      );
    }
    if (genreId === 'chengyu') {
      return (
        story.category === 'chengyu' ||
        story.title.includes('守株待兔') ||
        story.title.includes('滥竽充数') ||
        story.title.includes('塞翁失马') ||
        story.title.includes('矛盾') ||
        story.title.includes('买椟还珠') ||
        story.title.includes('叶公好龙') ||
        story.title.includes('亡羊补牢') ||
        story.title.includes('井底之蛙')
      );
    }
    return false;
  };

  const GENRE_CATEGORIES = [
    { id: 'all', label: 'All Stories', icon: '📖', desc: 'Browse complete library' },
    { id: 'books', label: 'Books & Novellas', icon: '📚', desc: 'Unabridged multi-page texts' },
    { id: 'buddhist', label: 'Buddhist & Wisdom', icon: '📿', desc: 'Sutras & moral parables' },
    { id: 'children', label: 'Fairy Tales & Children', icon: '🧸', desc: 'Folklore & illustrated tales' },
    { id: 'classics', label: 'Literary Classics', icon: '📜', desc: 'Ancient & modern masters' },
    { id: 'chengyu', label: 'Idioms & Fables', icon: '🏮', desc: 'Proverbs & cultural stories' }
  ];

  const filteredStories = savedStories.filter(story => {
    // 1. HSK Level filter
    if (selectedHskFilter !== 'all' && story.hskLevel !== selectedHskFilter) {
      return false;
    }
    // 2. Category / Genre filter
    if (selectedCategoryFilter !== 'all' && !isStoryInGenre(story, selectedCategoryFilter)) {
      return false;
    }
    // 3. Search query filter
    if (librarySearchQuery.trim()) {
      const matchTitle = story.title.toLowerCase().includes(librarySearchQuery.toLowerCase());
      const matchText = story.text.toLowerCase().includes(librarySearchQuery.toLowerCase());
      if (!matchTitle && !matchText) return false;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Story Generator Card */}
      <div className="container print-hide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Generate Graded Story
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Generate custom stories strictly constrained to HSK 1–6 vocabulary and grammar.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="btn btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Paste your own Chinese text to read in the Graded Reader"
            >
              <ClipboardPaste size={14} color="var(--accent-bamboo)" />
              Paste Chinese Text
            </button>
            <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              Target: HSK {hskLevel}
            </span>
          </div>
        </div>

        <form onSubmit={onGenerateStory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="story-generator-form-row">
            <input
              type="text"
              value={storyIdea}
              onChange={(e) => setStoryIdea(e.target.value)}
              placeholder="e.g. A tourist orders tea in Chengdu, or a dialogue about weekend plans..."
              className="form-input story-generator-input"
              required
            />
            <select
              value={hskLevel}
              onChange={(e) => setHskLevel(e.target.value)}
              className="form-select story-generator-select"
            >
              <option value="1">HSK 1 - Beginner (150 words)</option>
              <option value="2">HSK 2 - Elementary (300 words)</option>
              <option value="3">HSK 3 - Intermediate (600 words)</option>
              <option value="4">HSK 4 - Upper-Intermediate (1,200 words)</option>
              <option value="5">HSK 5 - Advanced (2,500 words)</option>
              <option value="6">HSK 6 - Mastery (5,000+ words)</option>
            </select>
            <button
              type="submit"
              className="btn btn-primary story-generator-btn"
              disabled={loading || !apiKey}
            >
              <Sparkles size={14} />
              {loading ? 'Writing...' : 'Write Graded Story'}
            </button>
          </div>

          {!apiKey && (
            <div style={{
              margin: '2px 0 0 0',
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: 'rgba(56, 189, 248, 0.06)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '6px'
            }}>
              <span>
                💡 <strong>Zero-API Mode:</strong> Enjoy our built-in <strong>Offline Story Anthology</strong> below or use <strong>"Paste Chinese Text"</strong> above without requiring an API key. (To synthesize brand-new AI stories on demand, configure a free Gemini key in Settings).
              </span>
            </div>
          )}
        </form>
      </div>

      {/* Deep Reading Stage */}
      {generatedStory.length > 0 && (
        <ReadingTheater
          storyTitle={storyTitle}
          tokens={generatedStory}
          hskLevel={hskLevel}
          onScaleDifficulty={onScaleDifficulty}
          onContinueStory={onContinueStory}
          onSaveStory={onSaveStory}
          onCharClick={onCharClick}
          onSentenceClick={() => {}}
          isContinuing={isContinuing}
          isLoading={loading}
          onImportStory={onImportStory}
        />
      )}

      {/* Offline Saved Stories Library */}
      <div className="container print-hide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Library size={16} color="var(--text-primary)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Story Library ({savedStories.length})
            </h3>
          </div>

          <div className="story-library-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Import Story File (.moyun.json) - GTU-005"
            >
              <Upload size={13} /> Import .moyun.json
            </button>

            <div className="story-library-search-wrapper" style={{ position: 'relative', width: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search saved stories..."
                value={librarySearchQuery}
                onChange={(e) => setLibrarySearchQuery(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '32px', height: '34px', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {/* Primary Genre Categorization Tabs */}
        <div 
          className="story-library-category-bar"
          style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px', 
            flexWrap: 'wrap'
          }}
        >
          {GENRE_CATEGORIES.map(genre => {
            const count = savedStories.filter(s => isStoryInGenre(s, genre.id)).length;
            const isSelected = selectedCategoryFilter === genre.id;
            return (
              <button
                key={genre.id}
                type="button"
                onClick={() => setSelectedCategoryFilter(genre.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '1px solid var(--accent-bamboo)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--accent-bamboo-subtle)' : 'var(--bg-surface)',
                  color: isSelected ? 'var(--accent-bamboo)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'all 0.18s ease',
                  whiteSpace: 'nowrap',
                  boxShadow: isSelected ? '0 1px 3px rgba(0, 0, 0, 0.05)' : 'none'
                }}
              >
                <span style={{ fontSize: '15px' }}>{genre.icon}</span>
                <span>{genre.label}</span>
                <span 
                  style={{ 
                    fontSize: '11px', 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isSelected ? 'var(--accent-bamboo)' : 'var(--bg-secondary)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary HSK Level Quick Filter Row */}
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            marginBottom: '20px', 
            flexWrap: 'wrap',
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginRight: '4px', whiteSpace: 'nowrap' }}>
            Filter by HSK Level:
          </span>
          {['all', '1', '2', '3', '4', '5', '6'].map(lvl => {
            const isSelected = selectedHskFilter === lvl;
            const lvlCount = savedStories.filter(s => {
              const matchesGenre = selectedCategoryFilter === 'all' || isStoryInGenre(s, selectedCategoryFilter);
              const matchesLvl = lvl === 'all' || s.hskLevel === lvl;
              return matchesGenre && matchesLvl;
            }).length;

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedHskFilter(lvl)}
                className={`btn ${isSelected ? 'btn-bamboo' : 'btn-secondary'}`}
                style={{ 
                  padding: '4px 10px', 
                  fontSize: '11px', 
                  borderRadius: 'var(--radius-pill)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span>{lvl === 'all' ? 'All HSK' : `HSK ${lvl}`}</span>
                <span style={{ opacity: 0.8, fontSize: '10.5px', whiteSpace: 'nowrap', flexShrink: 0 }}>({lvlCount})</span>
              </button>
            );
          })}
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            Showing {filteredStories.length} of {savedStories.length} stories
          </span>
        </div>

        {filteredStories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No saved stories found. Click "Save" in the Reading Theater to store stories in local offline storage.
          </div>
        ) : (
          <div className="story-library-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {filteredStories.map(story => (
              <div
                key={story.id}
                onClick={() => onSelectSavedStory(story)}
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-surface)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)', flex: 1 }}>
                      {story.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      {story.categoryLabel && (
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 7px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--accent-bamboo-subtle)',
                          color: 'var(--accent-bamboo)',
                          border: '1px solid rgba(46, 125, 87, 0.2)',
                          whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          {story.categoryLabel.split(' ')[0]}
                        </span>
                      )}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        backgroundColor: 'var(--bg-base)',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-subtle)',
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                      }}>
                        HSK {story.hskLevel}
                      </span>
                    </div>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5',
                    fontFamily: 'var(--font-serif-zh)',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {story.text}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {new Date(story.timestamp).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSavedStory(story.id);
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Delete story"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GTU-005: Library Import Modal */}
      <StoryShareModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        storyTitle={storyTitle}
        storyText={generatedStory.map(t => t.character).join('')}
        hskLevel={hskLevel}
        tokens={generatedStory}
        onImportStory={(pkg) => {
          if (onImportStory) {
            onImportStory(pkg);
          }
        }}
      />

      {/* Quick Paste Chinese Text Modal */}
      {showPasteModal && (
        <div className="modal-overlay" onClick={() => setShowPasteModal(false)} style={{ zIndex: 1100 }}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '620px', width: '92%', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardPaste size={20} color="var(--accent-bamboo)" />
                <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                  Paste Chinese Text
                </h3>
              </div>
              <button onClick={() => setShowPasteModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ margin: '12px 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Paste any Chinese text here to immediately launch it into the Graded Reader with interactive word lookups, Pinyin, stroke order, and audio.
            </p>

            {/* Title Input */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Title (Optional)
              </label>
              <input
                type="text"
                value={quickPastedTitle}
                onChange={(e) => setQuickPastedTitle(e.target.value)}
                placeholder="Leave blank to auto-detect from first line..."
                className="form-input"
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Textarea */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
                  Chinese Content
                </label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {quickPastedText.length} characters ({(quickPastedText.match(/[\u4E00-\u9FFF]/g) || []).length} Hanzi)
                </span>
              </div>
              <textarea
                value={quickPastedText}
                onChange={(e) => setQuickPastedText(e.target.value)}
                placeholder={"Paste Chinese text here... \n\n例如：\n今天下午阳光很好，我和朋友一起在咖啡馆喝茶聊天。"}
                rows={9}
                className="form-input"
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-serif-zh)',
                  fontSize: '15px',
                  lineHeight: 1.8,
                  padding: '12px 14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Footer / Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              {onOpenImportWorkspace ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowPasteModal(false);
                    onOpenImportWorkspace();
                  }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  Need file / OCR import? Go to Import Studio →
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', padding: '7px 14px' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!quickPastedText.trim()}
                  onClick={() => {
                    const text = quickPastedText.trim();
                    if (!text) return;
                    let title = quickPastedTitle.trim();
                    if (!title) {
                      const firstLine = text.split('\n').map(l => l.trim()).find(l => l.length > 0) || '';
                      title = firstLine.length > 24 ? firstLine.slice(0, 24) + '...' : firstLine || 'Custom Chinese Text';
                    }
                    if (onPasteTextIntoReader) {
                      onPasteTextIntoReader(title, text);
                    }
                    setShowPasteModal(false);
                    setQuickPastedText('');
                    setQuickPastedTitle('');
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '13px', fontWeight: 600, padding: '7px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <BookOpen size={14} /> Open in Graded Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
