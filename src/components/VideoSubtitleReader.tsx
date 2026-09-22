import React, { useState, useRef, useEffect } from 'react';
import type { SubtitleCue } from '../services/subtitleParser';
import type { HanziItem } from '../types/HanziItem';
import { tokenizeStory } from '../utils/tokenizer';

interface VideoSubtitleReaderProps {
  cues: SubtitleCue[];
  hanziData: HanziItem[];
  vocabData: HanziItem[];
  overridesMap: Record<string, { pinyin: string; definition: string }>;
  onCharacterClick?: (item: HanziItem) => void;
  onCharacterHover?: (e: React.MouseEvent, item: HanziItem) => void;
}

export const VideoSubtitleReader: React.FC<VideoSubtitleReaderProps> = ({
  cues,
  hanziData,
  vocabData,
  overridesMap,
  onCharacterClick,
  onCharacterHover
}) => {
  const [currentCueIndex, setCurrentCueIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const intervalRef = useRef<number | null>(null);

  const activeCue = cues[currentCueIndex];

  const tokenizedWords = activeCue
    ? tokenizeStory(activeCue.text, hanziData, vocabData, overridesMap)
    : [];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentCueIndex(prev => {
          if (prev >= cues.length - 1) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 3500);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, cues.length]);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: 'var(--shadow-main)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>
            🎬 交互式影视字幕学习 Interactive Subtitle Player
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
            Hover or click any character in the active subtitle to look up definitions and add to SRS cards.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="control-button"
            style={{
              background: isPlaying ? 'var(--accent-cinnabar)' : 'var(--accent-indigo)',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              fontSize: '13px'
            }}
          >
            {isPlaying ? '⏸ Pause Auto-Advance' : '▶ Play Subtitle Stream'}
          </button>
        </div>
      </div>

      {/* Main Subtitle Display Stage */}
      <div style={{
        background: '#1A1A1A',
        borderRadius: '10px',
        padding: '36px 20px',
        textAlign: 'center',
        minHeight: '140px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)'
      }}>
        {activeCue ? (
          <div>
            <div style={{ fontSize: '11px', color: '#9E9B93', fontFamily: 'monospace', marginBottom: '10px' }}>
              [{activeCue.startTime}] ➔ [{activeCue.endTime}]
            </div>
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '4px',
              fontSize: '28px',
              fontFamily: 'var(--font-serif-cn)',
              color: '#FFFFFF'
            }}>
              {tokenizedWords.map((item, idx) => (
                <span
                  key={idx}
                  onClick={() => onCharacterClick && onCharacterClick(item)}
                  onMouseEnter={(e) => onCharacterHover && onCharacterHover(e, item)}
                  style={{
                    cursor: 'pointer',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'rgba(200, 62, 45, 0.4)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  {item.character}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: '#9E9B93' }}>No subtitle track loaded.</div>
        )}
      </div>

      {/* Subtitle Cue Stepper & List */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button
          onClick={() => setCurrentCueIndex(prev => Math.max(0, prev - 1))}
          disabled={currentCueIndex === 0}
          className="control-button"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          ⏮ Previous Cue
        </button>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Line {currentCueIndex + 1} of {cues.length}
        </span>
        <button
          onClick={() => setCurrentCueIndex(prev => Math.min(cues.length - 1, prev + 1))}
          disabled={currentCueIndex >= cues.length - 1}
          className="control-button"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          Next Cue ⏭
        </button>
      </div>

      {/* Cue Timeline Preview */}
      <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {cues.map((cue, idx) => (
          <div
            key={idx}
            onClick={() => setCurrentCueIndex(idx)}
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
              backgroundColor: idx === currentCueIndex ? 'rgba(200, 62, 45, 0.08)' : 'var(--bg-primary)',
              border: `1px solid ${idx === currentCueIndex ? 'var(--accent-cinnabar)' : 'var(--border-color)'}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontFamily: 'var(--font-serif-cn)', color: idx === currentCueIndex ? 'var(--accent-cinnabar)' : 'var(--text-main)' }}>
              {cue.text}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
              {cue.startTime}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
