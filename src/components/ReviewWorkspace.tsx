import React, { useState, useEffect } from 'react';
import type { Flashcard, ThematicDeck } from '../services/srsStore';
import { getCustomDecks, getDueCards, getAllCards } from '../services/srsStore';
import { AudioFirstFlashcard } from './AudioFirstFlashcard';
import { SrsHeatmap } from './SrsHeatmap';
import { AnkiExportService } from '../services/ankiExport';
import type { ReadingSpeedRecord } from '../services/readingAnalytics';
import { Download, CheckCircle2, Layers, Zap, Clock, Eye, FolderKanban, Sliders, Headphones, BookOpen, Trophy } from 'lucide-react';
import { ConfusableHanziModal } from './ConfusableHanziModal';
import { DeckManagementModal } from './DeckManagementModal';
import { SrsCustomizerModal } from './SrsCustomizerModal';
import { AudioCommuteModeModal } from './AudioCommuteModeModal';
import { GrammarSrsModal } from './GrammarSrsModal';
import { CommunityLeaderboardModal } from './CommunityLeaderboardModal';

interface ReviewWorkspaceProps {
  currentReviewCard: Flashcard | null;
  dueCardsCount: number;
  totalCardsCount: number;
  onGradeCard: (quality: number) => void;
  onOpenWritingPractice: (card: Flashcard) => void;
  heatmapData: Record<string, number>;
  readingStats: ReadingSpeedRecord[];
  activeDeckId?: string;
  onSelectDeck?: (deckId: string) => void;
}

export const ReviewWorkspace: React.FC<ReviewWorkspaceProps> = ({
  currentReviewCard,
  dueCardsCount,
  totalCardsCount,
  onGradeCard,
  onOpenWritingPractice,
  heatmapData,
  readingStats,
  activeDeckId = 'all',
  onSelectDeck = () => {}
}) => {
  const [showConfusableModal, setShowConfusableModal] = useState(false);
  const [showDeckModal, setShowDeckModal] = useState(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState(false);
  const [showCommuteModal, setShowCommuteModal] = useState(false);
  const [showGrammarSrsModal, setShowGrammarSrsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [decks, setDecks] = useState<ThematicDeck[]>([]);
  const [upcomingCards, setUpcomingCards] = useState<Flashcard[]>([]);

  useEffect(() => {
    setDecks(getCustomDecks());
  }, [showDeckModal]);

  useEffect(() => {
    const loadUpcoming = async () => {
      try {
        let cards = await getDueCards(activeDeckId);
        if (cards.length <= 1) {
          cards = await getAllCards(activeDeckId);
        }
        setUpcomingCards(cards.filter(c => !currentReviewCard || c.character !== currentReviewCard.character));
      } catch (e) {
        console.warn('Failed to load upcoming cards', e);
      }
    };
    loadUpcoming();
  }, [currentReviewCard, activeDeckId]);

  const currentDeck = decks.find(d => d.id === activeDeckId) || { name: 'All Cards', icon: '📚' };

  const avgCPM = readingStats.length > 0
    ? Math.round(readingStats.reduce((a, b) => a + b.cpm, 0) / readingStats.length)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Review Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'none'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: 'var(--text-primary)' }}>
            Spaced Repetition Review
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Audio-First active recall flashcards powered by the SM-2 spaced repetition algorithm.
          </p>
        </div>

        <div className="review-workspace-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowGrammarSrsModal(true)}
            className="control-button"
            title="Grammar Pattern Cloze syntax flashcards with SM-2 scheduling (SRS-002)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
          >
            <BookOpen size={14} /> Grammar Cloze
          </button>
          <button
            onClick={() => setShowCommuteModal(true)}
            className="control-button"
            title="Hands-free Audio-Only Commute Mode for walking or driving (ALS-007)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-bamboo)', borderColor: 'var(--accent-bamboo)' }}
          >
            <Headphones size={14} /> Commute Audio
          </button>
          <button
            onClick={() => setShowCustomizerModal(true)}
            className="control-button"
            title="Configure SRS Intervals, Ease Floors & Graduation Steps (SRS-010)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sliders size={14} /> SRS Settings
          </button>
          <button
            onClick={() => setShowDeckModal(true)}
            className="control-button"
            title="Switch or manage Thematic Vocabulary Decks (SRS-004)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
          >
            <FolderKanban size={14} /> {currentDeck.icon || '📁'} Deck: {currentDeck.name}
          </button>
          <button
            onClick={() => setShowConfusableModal(true)}
            className="control-button"
            title="Look-Alike (Visually Similar Hanzi) Quizzes (SRS-005)"
            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)' }}
          >
            <Eye size={14} /> Look-Alike Drills
          </button>
          <button
            onClick={() => AnkiExportService.downloadAnkiDeck()}
            className="control-button"
            title="Export flashcards to Anki TSV format"
          >
            <Download size={14} /> Export Anki (.tsv)
          </button>
          <button
            onClick={() => AnkiExportService.downloadPlecoDeck()}
            className="control-button"
            title="Export flashcards to Pleco user dictionary / flashcard format (SRS-008)"
          >
            <Download size={14} /> Export Pleco (.txt)
          </button>
          <button
            onClick={() => setShowLeaderboardModal(true)}
            className="control-button"
            title="Opt-in Anonymous Weekly Reading Leaderboard (GTU-003)"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', borderColor: 'var(--accent-gold)' }}
          >
            <Trophy size={14} /> Leaderboard
          </button>
        </div>
      </div>

      {/* Review Card Stage */}
      {currentReviewCard ? (
        <AudioFirstFlashcard
          card={currentReviewCard}
          onGrade={onGradeCard}
          onOpenWritingPractice={() => onOpenWritingPractice(currentReviewCard)}
        />
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '60px 24px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'none',
          maxWidth: '540px',
          margin: '0 auto',
          width: '100%'
        }}>
          <CheckCircle2 size={48} color="var(--accent-bamboo)" style={{ marginBottom: '16px' }} />
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>
            All Reviews Complete!
          </h3>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            You've cleared all cards due for review today. Total deck size: <strong>{totalCardsCount}</strong> words.
          </p>
        </div>
      )}

      {/* Next Up Queue Preview (From Prototype) */}
      {upcomingCards.length > 0 && (
        <div style={{
          padding: '16px 20px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Next Up in Queue:
            </span>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {upcomingCards.slice(0, 7).map((c, i) => (
                <span key={i} style={{
                  fontSize: '14px',
                  fontFamily: 'var(--font-serif-zh)',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <b>{c.character}</b>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {c.pinyin}
                  </span>
                </span>
              ))}
              {upcomingCards.length > 7 && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  +{upcomingCards.length - 7} more
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Activity Heatmap Grid */}
      <SrsHeatmap data={heatmapData} />

      {/* Learning Analytics Overview */}
      <div className="container">
        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
          Reading & Memory Analytics
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Layers size={14} /> Total Deck Size
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {totalCardsCount}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Clock size={14} /> Due Today
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {dueCardsCount}
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
              <Zap size={14} /> Average Reading Speed
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-main)', marginTop: '6px' }}>
              {avgCPM} <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>CPM</span>
            </div>
          </div>
        </div>
      </div>

      {/* SRS-005: Look-Alike Hanzi Drills Modal */}
      <ConfusableHanziModal
        isOpen={showConfusableModal}
        onClose={() => setShowConfusableModal(false)}
      />

      {/* SRS-004: Custom Thematic Decks Modal */}
      <DeckManagementModal
        isOpen={showDeckModal}
        onClose={() => setShowDeckModal(false)}
        activeDeckId={activeDeckId}
        onSelectDeck={onSelectDeck}
      />

      {/* SRS-010: SM-2 Customizer Modal */}
      <SrsCustomizerModal
        isOpen={showCustomizerModal}
        onClose={() => setShowCustomizerModal(false)}
      />

      {/* ALS-007: Audio-Only Commute Mode Modal */}
      <AudioCommuteModeModal
        isOpen={showCommuteModal}
        onClose={() => setShowCommuteModal(false)}
        activeDeckId={activeDeckId}
      />

      {/* SRS-002: Grammar Pattern Cloze SRS Modal */}
      <GrammarSrsModal
        isOpen={showGrammarSrsModal}
        onClose={() => setShowGrammarSrsModal(false)}
      />

      {/* GTU-003: Opt-in Community Leaderboards Modal */}
      <CommunityLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
      />

    </div>
  );
};
