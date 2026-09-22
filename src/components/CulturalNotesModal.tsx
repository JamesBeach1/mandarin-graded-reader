import React, { useState } from 'react';
import { X, BookOpen, Volume2, Sparkles, AlertTriangle, ShieldCheck, Compass, Info } from 'lucide-react';
import { CULTURAL_KNOWLEDGE_BASE, type CulturalContextNote } from '../utils/culturalContextEngine';
import { AzureSpeechService } from '../services/azureSpeech';

interface CulturalNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedNotes: CulturalContextNote[];
}

export const CulturalNotesModal: React.FC<CulturalNotesModalProps> = ({
  isOpen,
  onClose,
  detectedNotes
}) => {
  const [selectedTab, setSelectedTab] = useState<'detected' | 'all'>('detected');
  const [activeNoteId, setActiveNoteId] = useState<string>(
    detectedNotes.length > 0 ? detectedNotes[0].id : CULTURAL_KNOWLEDGE_BASE[0].id
  );
  const [filterCategory, setFilterCategory] = useState<string>('all');

  if (!isOpen) return null;

  const notesToDisplay = selectedTab === 'detected' && detectedNotes.length > 0
    ? detectedNotes
    : CULTURAL_KNOWLEDGE_BASE;

  const filteredNotes = filterCategory === 'all'
    ? notesToDisplay
    : notesToDisplay.filter(n => n.category === filterCategory);

  const activeNote = CULTURAL_KNOWLEDGE_BASE.find(n => n.id === activeNoteId) || filteredNotes[0] || CULTURAL_KNOWLEDGE_BASE[0];

  const handleSpeak = (text: string) => {
    AzureSpeechService.speak(text, 0.9);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '850px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🏮</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                Cultural Context & Etiquette Notes (TRC-009)
              </h3>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Social norms, subtle subtext, and historical taboos embedded in everyday Chinese
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab & Category Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', margin: '14px 0', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedTab('detected')}
              className={`btn ${selectedTab === 'detected' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              In Current Story ({detectedNotes.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`btn ${selectedTab === 'all' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Full Etiquette Encyclopedia ({CULTURAL_KNOWLEDGE_BASE.length})
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Filter:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-select"
              style={{ fontSize: '11px', padding: '3px 8px', height: '26px' }}
            >
              <option value="all">All Topics</option>
              <option value="etiquette">🍶 Dining & Etiquette</option>
              <option value="taboo">⚠️ Taboos & Superstitions</option>
              <option value="social_concept">🎭 Social Philosophy</option>
              <option value="linguistic_subtext">🗣️ Linguistic Subtext</option>
              <option value="tradition">🧧 Traditions & Living</option>
            </select>
          </div>
        </div>

        {/* Main 2-Column Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Notes Sidebar List */}
          <div style={{ overflowY: 'auto', borderRight: '1px solid var(--border-subtle)', paddingRight: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filteredNotes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '12px' }}>
                No cultural notes detected for this filter. Switch to "Full Encyclopedia" to explore all customs.
              </div>
            ) : (
              filteredNotes.map(note => {
                const isSelected = note.id === activeNote?.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => setActiveNoteId(note.id)}
                    style={{
                      textAlign: 'left',
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'var(--bg-secondary)' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-bamboo)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {note.categoryBadge}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                      {note.chineseTitle}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {note.topic}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right: Detailed Cultural Context Dossier */}
          {activeNote && (
            <div style={{ overflowY: 'auto', paddingLeft: '6px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Dossier Header */}
              <div style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                        {activeNote.chineseTitle}
                      </span>
                      <button
                        onClick={() => handleSpeak(activeNote.chineseTitle)}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-bamboo)', cursor: 'pointer', padding: '2px' }}
                        title="Listen to Chinese pronunciation"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {activeNote.topic}
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                    {activeNote.categoryBadge}
                  </span>
                </div>

                {/* Matched Keywords Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Trigger Keywords:</span>
                  {activeNote.matchedKeywords.map(kw => (
                    <span key={kw} style={{ fontSize: '11px', padding: '1px 6px', background: 'var(--bg-base)', border: '1px solid var(--border-strong)', borderRadius: '3px', fontFamily: 'var(--font-serif-zh)' }}>
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cultural Subtext Card */}
              <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '6px' }}>
                  <Compass size={14} /> Cultural Logic & Social Subtext
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {activeNote.culturalSubtext}
                </p>
              </div>

              {/* Actionable Etiquette Tip */}
              <div style={{ padding: '14px', background: 'rgba(34, 197, 94, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent-bamboo)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-bamboo)', marginBottom: '6px' }}>
                  <ShieldCheck size={14} /> Practical Native Etiquette Tip
                </div>
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                  {activeNote.etiquetteTip}
                </p>
              </div>

              {/* Historical Origin */}
              {activeNote.historicalOrigin && (
                <div style={{ padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <Info size={12} /> Historical & Classical Origins
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', lineHeight: 1.5, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {activeNote.historicalOrigin}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: '14px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Close Notes
          </button>
        </div>
      </div>
    </div>
  );
};
