import React from 'react';

export interface TocChapter {
  id: string;
  title: string;
  wordCount?: number;
  completed?: boolean;
}

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: TocChapter[];
  activeChapterId: string;
  onSelectChapter: (chapterId: string) => void;
  bookTitle?: string;
}

export const TocDrawer: React.FC<TocDrawerProps> = ({
  isOpen,
  onClose,
  chapters,
  activeChapterId,
  onSelectChapter,
  bookTitle
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        backdropFilter: 'blur(2px)',
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'flex-start'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '320px',
          maxWidth: '85vw',
          height: '100%',
          backgroundColor: 'var(--bg-card)',
          boxShadow: 'var(--shadow-main)',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
              目录 Table of Contents
            </h3>
            {bookTitle && (
              <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                {bookTitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--text-muted)'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {chapters.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
              No chapters detected in current document.
            </div>
          ) : (
            chapters.map((chap, idx) => {
              const isSelected = chap.id === activeChapterId;
              return (
                <div
                  key={chap.id}
                  onClick={() => {
                    onSelectChapter(chap.id);
                    onClose();
                  }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? 'rgba(200, 62, 45, 0.08)' : 'transparent',
                    border: `1px solid ${isSelected ? 'var(--accent-cinnabar)' : 'transparent'}`,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '12px',
                      color: isSelected ? 'var(--accent-cinnabar)' : 'var(--text-muted)',
                      fontFamily: 'monospace',
                      minWidth: '20px'
                    }}>
                      {idx + 1}.
                    </span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? 'var(--accent-cinnabar)' : 'var(--text-main)',
                      fontFamily: 'var(--font-serif-cn)'
                    }}>
                      {chap.title}
                    </span>
                  </div>
                  {chap.wordCount && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {chap.wordCount} 字
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
