import React, { useState } from 'react';
import { Subtitles, Download, X, FileText, Check } from 'lucide-react';
import {
  generateSRT,
  generateVTT,
  downloadSubtitles,
  type SubtitleSentence,
  type SubtitleFormat,
  type SubtitleContentMode
} from '../services/subtitleExport';

interface SubtitleExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  sentences: SubtitleSentence[];
  currentSpeed: number;
}

export const SubtitleExportModal: React.FC<SubtitleExportModalProps> = ({
  isOpen,
  onClose,
  storyTitle,
  sentences,
  currentSpeed
}) => {
  const [format, setFormat] = useState<SubtitleFormat>('srt');
  const [contentMode, setContentMode] = useState<SubtitleContentMode>('bilingual');
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const previewContent = format === 'srt'
    ? generateSRT(sentences.slice(0, 3), contentMode, currentSpeed)
    : generateVTT(sentences.slice(0, 3), contentMode, currentSpeed);

  const handleExport = () => {
    const fullContent = format === 'srt'
      ? generateSRT(sentences, contentMode, currentSpeed)
      : generateVTT(sentences, contentMode, currentSpeed);

    downloadSubtitles(storyTitle, fullContent, format);
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div 
        className="settings-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '92vw', padding: '22px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-azure)'
            }}>
              <Subtitles size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Export Story Subtitles (AIM-008)</h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>Generate synchronized .srt or .vtt tracks with timestamps</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Format Choice */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            Subtitle Format
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setFormat('srt')}
              className={`control-button ${format === 'srt' ? 'btn-bamboo' : ''}`}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: format === 'srt' ? 600 : 400
              }}
            >
              <FileText size={13} /> SubRip (.srt)
            </button>
            <button
              onClick={() => setFormat('vtt')}
              className={`control-button ${format === 'vtt' ? 'btn-bamboo' : ''}`}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontWeight: format === 'vtt' ? 600 : 400
              }}
            >
              <FileText size={13} /> WebVTT (.vtt)
            </button>
          </div>
        </div>

        {/* Content Mode Choice */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            Subtitle Content & Languages
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'bilingual', label: 'Bilingual (Hanzi + English Translation)', desc: 'Recommended for video study & immersion' },
              { id: 'pinyin', label: 'Phonetic (Hanzi + Pinyin Romanization)', desc: 'Great for speaking along & reading drills' },
              { id: 'hanzi', label: 'Hanzi Only (Chinese Characters)', desc: 'Clean native Chinese subtitles' }
            ].map(item => (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: contentMode === item.id ? '1px solid var(--accent-azure)' : '1px solid var(--border-subtle)',
                  background: contentMode === item.id ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="contentMode"
                  checked={contentMode === item.id}
                  onChange={() => setContentMode(item.id as SubtitleContentMode)}
                  style={{ marginTop: '2px' }}
                />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Preview Snippet */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
            Timestamp Preview ({sentences.length} Total Sentences)
          </div>
          <pre style={{
            background: 'var(--bg-base)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '10px',
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            maxHeight: '110px',
            overflowY: 'auto',
            margin: 0,
            whiteSpace: 'pre-wrap',
            color: 'var(--text-secondary)'
          }}>
            {previewContent}
          </pre>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Cancel
          </button>
          <button
            onClick={handleExport}
            className="btn btn-primary"
            style={{
              padding: '6px 18px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: downloaded ? '#10b981' : undefined
            }}
          >
            {downloaded ? <Check size={13} /> : <Download size={13} />}
            {downloaded ? 'Exported!' : `Download .${format}`}
          </button>
        </div>
      </div>
    </div>
  );
};
