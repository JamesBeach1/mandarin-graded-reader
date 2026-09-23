import React, { useState, useEffect } from 'react';
import {
  X, Download, CheckCircle2, CloudOff, Plane, Trash2,
  HardDrive, RefreshCw, Volume2, Sparkles
} from 'lucide-react';
import { AzureSpeechService, type TtsEngine } from '../services/azureSpeech';
import { hashString, getCachedAudio } from '../services/audioCache';

interface AudioPrecacheModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  sentences: string[];
  selectedEngine?: TtsEngine;
}

export const AudioPrecacheModal: React.FC<AudioPrecacheModalProps> = ({
  isOpen,
  onClose,
  storyTitle,
  sentences,
  selectedEngine = 'cloud-natural'
}) => {
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [isCaching, setIsCaching] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [currentSentenceText, setCurrentSentenceText] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      checkCacheStatus();
    }
  }, [isOpen, sentences]);

  const checkCacheStatus = async () => {
    if (!sentences || sentences.length === 0) return;
    let found = 0;
    for (const sent of sentences) {
      const hash = await hashString(sent.trim());
      const blob = await getCachedAudio(hash);
      if (blob) found++;
    }
    setCachedCount(found);
  };

  if (!isOpen) return null;

  const total = sentences.length;
  const isFullyCached = total > 0 && cachedCount === total;
  const pct = total > 0 ? Math.round((cachedCount / total) * 100) : 0;

  const handleStartPrecache = async () => {
    if (isCaching || total === 0) return;
    setIsCaching(true);
    setProgress(0);

    let completed = 0;

    for (let i = 0; i < sentences.length; i++) {
      const text = sentences[i].trim();
      if (!text) continue;

      setCurrentSentenceText(text);

      try {
        const hash = await hashString(text);
        const existing = await getCachedAudio(hash);

        if (!existing) {
          // Synthesize and automatically cache
          await AzureSpeechService.synthesizeSpeech(text, {
            engine: selectedEngine
          });
        }
      } catch (e) {
        console.warn('Failed to precache audio for sentence:', text, e);
      }

      completed++;
      setProgress(Math.round((completed / total) * 100));
      setCachedCount(completed);
    }

    setIsCaching(false);
    setCurrentSentenceText('');
    checkCacheStatus();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(63, 107, 87, 0.15)',
              color: 'var(--accent-bamboo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Plane size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                离线音频包 · Offline Audio Pre-caching (AIM-009)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Pre-download studio audio to IndexedDB for 100% flight &amp; offline use
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="control-button"
            style={{ padding: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status Banner */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: isFullyCached ? 'rgba(63, 107, 87, 0.12)' : 'var(--bg-base)',
            border: `1px solid ${isFullyCached ? 'var(--accent-bamboo)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isFullyCached ? (
                  <>
                    <CheckCircle2 size={16} color="var(--accent-bamboo)" />
                    <span>100% Ready for Airplane Mode ✈️</span>
                  </>
                ) : (
                  <>
                    <CloudOff size={16} color="var(--text-muted)" />
                    <span>Offline Status: Partial ({cachedCount} / {total} sentences)</span>
                  </>
                )}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Story: <b style={{ color: 'var(--text-primary)' }}>{storyTitle || 'Current Story'}</b>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: isFullyCached ? 'var(--accent-bamboo)' : 'var(--accent-gold)' }}>
                {pct}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cached</div>
            </div>
          </div>

          {/* Progress Bar (Visible while caching) */}
          {isCaching && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span>Downloading audio clips...</span>
                <span>{progress}%</span>
              </div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--accent-bamboo)',
                  transition: 'width 0.2s ease'
                }} />
              </div>
              {currentSentenceText && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Caching: "{currentSentenceText}"
                </div>
              )}
            </div>
          )}

          {/* Explanation Info */}
          <div style={{
            fontSize: '12.5px',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            backgroundColor: 'var(--bg-panel)',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            💡 <b>How it works:</b> Pre-caching downloads high-fidelity neural audio for every sentence in this story directly into your browser's local <b>IndexedDB</b> storage. When you're on a flight or without internet, narration continues without skipping a beat.
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', alignItems: 'center' }}>
            <button
              onClick={handleStartPrecache}
              disabled={isCaching}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 18px',
                fontSize: '13px'
              }}
            >
              {isCaching ? (
                <>Caching in Progress...</>
              ) : isFullyCached ? (
                <><RefreshCw size={13} /> Re-download Audio Pack</>
              ) : (
                <><Download size={13} /> Pre-cache Audio Pack ({total - cachedCount} needed)</>
              )}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ✈️ Moyun (墨韵) AIM-009 · Offline Neural Audio Packs
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
