import React, { useState, useEffect } from 'react';
import type { ThematicDeck } from '../services/srsStore';
import { getCustomDecks, saveCustomDecks, getAllCards, getDueCards } from '../services/srsStore';
import { FolderPlus, Trash2, X, Check, BookOpen } from 'lucide-react';

interface DeckManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDeck: (deckId: string) => void;
  activeDeckId: string;
}

export const DeckManagementModal: React.FC<DeckManagementModalProps> = ({
  isOpen,
  onClose,
  onSelectDeck,
  activeDeckId
}) => {
  const [decks, setDecks] = useState<ThematicDeck[]>([]);
  const [deckCounts, setDeckCounts] = useState<Record<string, { total: number; due: number }>>({});
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [newDeckIcon, setNewDeckIcon] = useState('🔖');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const loadedDecks = getCustomDecks();
    setDecks(loadedDecks);

    const counts: Record<string, { total: number; due: number }> = {};
    for (const d of loadedDecks) {
      const all = await getAllCards(d.id);
      const due = await getDueCards(d.id);
      counts[d.id] = { total: all.length, due: due.length };
    }
    setDeckCounts(counts);
  };

  const handleCreateDeck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeckName.trim()) return;

    const id = `deck_${Date.now()}`;
    const newDeck: ThematicDeck = {
      id,
      name: newDeckName.trim(),
      description: newDeckDesc.trim() || 'Custom user deck',
      icon: newDeckIcon || '🔖'
    };

    const updated = [...decks, newDeck];
    setDecks(updated);
    saveCustomDecks(updated);
    setNewDeckName('');
    setNewDeckDesc('');
    loadData();
  };

  const handleDeleteDeck = (id: string) => {
    if (id === 'all' || id === 'default') {
      alert('System default decks cannot be deleted.');
      return;
    }
    if (!confirm('Delete this thematic deck playlist? (Card data will remain in your general deck).')) {
      return;
    }
    const updated = decks.filter(d => d.id !== id);
    setDecks(updated);
    saveCustomDecks(updated);
    if (activeDeckId === id) {
      onSelectDeck('all');
    }
    loadData();
  };

  if (!isOpen) return null;

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
        maxWidth: '560px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--accent-gold)" />
            <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)' }}>
              Thematic Decks & Playlists (SRS-004)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
          Curate isolated study playlists to focus on specific domains like Dining, Business, or Travel without mixing unrelated cards.
        </p>

        {/* Decks List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
          {decks.map(deck => {
            const counts = deckCounts[deck.id] || { total: 0, due: 0 };
            const isActive = activeDeckId === deck.id;

            return (
              <div
                key={deck.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: isActive ? 'var(--bg-surface-hover)' : 'var(--bg-panel)',
                  border: `1px solid ${isActive ? 'var(--accent-gold)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  onSelectDeck(deck.id);
                  onClose();
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>{deck.icon || '📁'}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
                        {deck.name}
                      </span>
                      {isActive && (
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--accent-gold)',
                          backgroundColor: 'rgba(217, 119, 6, 0.15)',
                          padding: '1px 6px',
                          borderRadius: '3px',
                          fontWeight: 600
                        }}>
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {deck.description}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: counts.due > 0 ? 'var(--accent-seal)' : 'var(--accent-bamboo)' }}>
                      {counts.due} Due
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {counts.total} total cards
                    </div>
                  </div>

                  {deck.id !== 'all' && deck.id !== 'default' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDeck(deck.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                      title="Delete deck"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Deck Form */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px', fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>
            <FolderPlus size={15} color="var(--accent-gold)" /> Create Custom Thematic Deck
          </div>

          <form onSubmit={handleCreateDeck} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Emoji (e.g. 🏮, ☕, 💼)"
                value={newDeckIcon}
                onChange={(e) => setNewDeckIcon(e.target.value)}
                style={{ width: '80px' }}
                className="form-input"
              />
              <input
                type="text"
                placeholder="Deck Name (e.g. Medical & Doctor Visits)"
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                className="form-input"
                style={{ flex: 1 }}
                required
              />
            </div>
            <input
              type="text"
              placeholder="Description (optional)"
              value={newDeckDesc}
              onChange={(e) => setNewDeckDesc(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', padding: '6px 14px', fontSize: '12px' }}>
              <Check size={14} /> Add Thematic Deck
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
