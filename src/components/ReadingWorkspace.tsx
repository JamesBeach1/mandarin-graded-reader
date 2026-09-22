import React, { useState } from 'react';
import type { HanziItem } from '../types/HanziItem';
import type { SavedStory } from '../services/libraryStore';
import { ReadingTheater } from './ReadingTheater';
import { Sparkles, Library, Trash2, BookOpen, Search, Upload } from 'lucide-react';
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
  onImportStory
}) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const filteredStories = librarySearchQuery.trim()
    ? SemanticSearchEngine.searchStories(librarySearchQuery, savedStories).map(r => r.story)
    : savedStories;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Story Generator Card */}
      <div className="container print-hide">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
              Generate Graded Story
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Generate custom stories strictly constrained to HSK 1–6 vocabulary and grammar.
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
            Target: HSK {hskLevel}
          </span>
        </div>

        <form onSubmit={onGenerateStory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={storyIdea}
              onChange={(e) => setStoryIdea(e.target.value)}
              placeholder="e.g. A tourist orders tea in Chengdu, or a dialogue about weekend plans..."
              className="form-input"
              style={{ flex: 2, minWidth: '240px' }}
              required
            />
            <select
              value={hskLevel}
              onChange={(e) => setHskLevel(e.target.value)}
              className="form-select"
              style={{ flex: 1, minWidth: '160px' }}
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
              className="btn btn-primary"
              disabled={loading || !apiKey}
              style={{ minWidth: '180px' }}
            >
              <Sparkles size={14} />
              {loading ? 'Writing...' : 'Write Graded Story'}
            </button>
          </div>

          {!apiKey && (
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--accent-seal)' }}>
              ⚠️ Please configure your Gemini API Key in Settings to generate AI stories.
            </p>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => setShowImportModal(true)}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              title="Import Story File (.moyun.json) - GTU-005"
            >
              <Upload size={13} /> Import .moyun.json
            </button>

            <div style={{ position: 'relative', width: '240px' }}>
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

        {filteredStories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No saved stories found. Click "Save" in the Reading Theater to store stories in local offline storage.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                      {story.title}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      backgroundColor: 'var(--bg-base)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-secondary)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      HSK {story.hskLevel}
                    </span>
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
    </div>
  );
};
