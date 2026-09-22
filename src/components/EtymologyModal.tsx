import React, { useState } from 'react';
import {
  ETYMOLOGY_DATABASE,
  type EtymologyEntry,
  type CharacterCategory,
  getEtymology
} from '../utils/etymologyDatabase';
import { X, Search, BookOpen, Sparkles, Volume2, Plus, Check, Filter, Compass } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';
import { addCard } from '../services/srsStore';

interface EtymologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCharacter?: string;
}

export const EtymologyModal: React.FC<EtymologyModalProps> = ({
  isOpen,
  onClose,
  initialCharacter
}) => {
  const [searchQuery, setSearchQuery] = useState(initialCharacter || '');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedChar, setSelectedChar] = useState<string>(
    initialCharacter && ETYMOLOGY_DATABASE[initialCharacter] ? initialCharacter : '休'
  );
  const [addedToSrs, setAddedToSrs] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const allEntries = Object.values(ETYMOLOGY_DATABASE);

  const filteredEntries = allEntries.filter(entry => {
    const matchesCat = selectedCategory === 'all' || entry.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesSearch =
      entry.character.includes(q) ||
      entry.pinyin.toLowerCase().includes(q) ||
      entry.meaning.toLowerCase().includes(q) ||
      entry.semanticRadical.includes(q);
    return matchesCat && matchesSearch;
  });

  const activeEntry: EtymologyEntry = ETYMOLOGY_DATABASE[selectedChar] || filteredEntries[0] || allEntries[0];

  const handleAddToSrs = async (entry: EtymologyEntry) => {
    await addCard({
      character: entry.character,
      pinyin: entry.pinyin,
      definition: `${entry.meaning} [${entry.categoryLabel}] Mnemonic: ${entry.mnemonic}`,
      exampleSentence: entry.ancientOrigin
    });
    setAddedToSrs(prev => ({ ...prev, [entry.character]: true }));
    setTimeout(() => {
      setAddedToSrs(prev => ({ ...prev, [entry.character]: false }));
    }, 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 160, 23, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Compass size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Hanzi Etymology & Radical Mnemonics (字源与拆字)
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Paleographic origins across the Six Writings (六书) with narrative memory hooks (SRS-006)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Bar */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          backgroundColor: 'var(--bg-base)'
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '4px 10px',
            flex: '1 1 200px'
          }}>
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search Hanzi, Pinyin, or English..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                fontSize: '12px',
                outline: 'none',
                width: '100%'
              }}
            />
          </div>

          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Origins' },
              { id: 'compound_ideogram', label: '会意 Compound Ideogram' },
              { id: 'phono_semantic', label: '形声 Phono-Semantic' },
              { id: 'pictogram', label: '象形 Pictogram' },
              { id: 'ideogram', label: '指事 Ideogram' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: selectedCategory === cat.id ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                  backgroundColor: selectedCategory === cat.id ? 'rgba(212, 160, 23, 0.15)' : 'var(--bg-surface)',
                  color: selectedCategory === cat.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Explorer Body */}
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {/* Left: Character List */}
          <div style={{
            borderRight: '1px solid var(--border-subtle)',
            overflowY: 'auto',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            backgroundColor: 'var(--bg-base)'
          }}>
            {filteredEntries.map(entry => {
              const isSelected = entry.character === activeEntry?.character;
              return (
                <button
                  key={entry.character}
                  onClick={() => setSelectedChar(entry.character)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid var(--accent-gold)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'rgba(212, 160, 23, 0.1)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-zh)' }}>
                      {entry.character}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 500 }}>
                      {entry.pinyin}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {entry.meaning.split('/')[0]}
                  </span>
                </button>
              );
            })}
            {filteredEntries.length === 0 && (
              <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No matching character etymologies found.
              </div>
            )}
          </div>

          {/* Right: Detailed Etymology Card */}
          {activeEntry ? (
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Card Title Banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    fontSize: '56px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-zh)',
                    lineHeight: 1
                  }}>
                    {activeEntry.character}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        {activeEntry.pinyin}
                      </span>
                      <button
                        onClick={() => AzureSpeechService.speak(activeEntry.character, 0.9)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-gold)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        title="Listen to pronunciation"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px' }}>
                      {activeEntry.meaning}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: 'rgba(212, 160, 23, 0.15)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--accent-gold)'
                  }}>
                    {activeEntry.categoryLabel}
                  </span>
                  <button
                    onClick={() => handleAddToSrs(activeEntry)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-base)',
                      color: addedToSrs[activeEntry.character] ? 'var(--accent-bamboo)' : 'var(--text-primary)',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {addedToSrs[activeEntry.character] ? <Check size={12} /> : <Plus size={12} />}
                    {addedToSrs[activeEntry.character] ? 'Added' : 'Save to SRS'}
                  </button>
                </div>
              </div>

              {/* Component Decomposition Chips */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Radical & Structural Anatomy
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeEntry.components.length}, 1fr)`, gap: '10px' }}>
                  {activeEntry.components.map((c, ci) => (
                    <div
                      key={ci}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '22px', fontWeight: 600, fontFamily: 'var(--font-zh)', color: 'var(--text-primary)' }}>
                          {c.char}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          padding: '2px 5px',
                          borderRadius: '3px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          backgroundColor: c.role === 'semantic' ? 'rgba(74, 222, 128, 0.15)' : c.role === 'phonetic' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.08)',
                          color: c.role === 'semantic' ? 'var(--accent-bamboo)' : c.role === 'phonetic' ? '#60a5fa' : 'var(--text-secondary)'
                        }}>
                          {c.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {c.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ancient Paleographic Origin */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <BookOpen size={14} /> Ancient Paleographic Origin (甲骨文 / 金文)
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {activeEntry.ancientOrigin}
                </div>
              </div>

              {/* Narrative Mnemonic Hook */}
              <div style={{
                padding: '14px 16px',
                borderRadius: '6px',
                backgroundColor: 'rgba(212, 160, 23, 0.08)',
                border: '1px solid rgba(212, 160, 23, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} /> Narrative Mnemonic Hook (记忆口诀)
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: '1.5', fontStyle: 'italic' }}>
                  "{activeEntry.mnemonic}"
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
