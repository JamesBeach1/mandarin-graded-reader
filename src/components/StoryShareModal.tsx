import React, { useState, useMemo } from 'react';
import { X, Download, Share2, Copy, Check, QrCode, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { StoryShareService, type MoyunStoryPackage } from '../utils/storyShare';
import { OfflineQrCode } from '../utils/qrGenerator';
import type { HanziItem } from '../types/HanziItem';

interface StoryShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  storyText: string;
  hskLevel: string;
  tokens?: HanziItem[];
  onImportStory: (imported: MoyunStoryPackage) => void;
}

export const StoryShareModal: React.FC<StoryShareModalProps> = ({
  isOpen,
  onClose,
  storyTitle,
  storyText,
  hskLevel,
  tokens,
  onImportStory
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<MoyunStoryPackage | null>(null);

  const storyPkg = useMemo(() => {
    return StoryShareService.createPackage(storyTitle, storyText, hskLevel, tokens);
  }, [storyTitle, storyText, hskLevel, tokens]);

  const shareUrl = useMemo(() => {
    return StoryShareService.generateShareUrl(storyPkg);
  }, [storyPkg]);

  const qrMatrix = useMemo(() => {
    if (!showQr) return null;
    try {
      // Generate QR matrix for the share URL
      return OfflineQrCode.generateMatrix(shareUrl);
    } catch (e) {
      console.warn('QR code generation warning:', e);
      return null;
    }
  }, [showQr, shareUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(storyPkg, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleDownload = () => {
    StoryShareService.downloadStoryFile(storyPkg);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processImport(content);
    };
    reader.readAsText(file);
  };

  const processImport = (raw: string) => {
    try {
      setImportError(null);
      const pkg = StoryShareService.parseStoryPackage(raw);
      setImportSuccess(pkg);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse story package.');
      setImportSuccess(null);
    }
  };

  const handleConfirmImport = () => {
    if (importSuccess) {
      onImportStory(importSuccess);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '600px', width: '92%', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={20} color="var(--accent-bamboo)" />
            <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
              Peer-to-Peer Story Sharing (GTU-005)
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Switcher */}
        <div style={{ display: 'flex', gap: '8px', margin: '14px 0 16px 0', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <button
            onClick={() => setActiveTab('export')}
            className={`btn ${activeTab === 'export' ? 'btn-bamboo' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '6px 12px', fontSize: '13px' }}
          >
            <Download size={14} /> Export & Share Story
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`btn ${activeTab === 'import' ? 'btn-bamboo' : 'btn-secondary'}`}
            style={{ flex: 1, padding: '6px 12px', fontSize: '13px' }}
          >
            <Upload size={14} /> Import Story (.moyun.json)
          </button>
        </div>

        {/* Content Area */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
          {activeTab === 'export' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Story summary card */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                    {storyTitle}
                  </h4>
                  <span style={{ fontSize: '11px', fontWeight: 600, background: 'var(--bg-base)', border: '1px solid var(--border-strong)', padding: '2px 6px', borderRadius: '4px' }}>
                    HSK {hskLevel}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Characters: <strong>{storyPkg.metadata.characterCount}</strong></span>
                  <span>Est. Read Time: <strong>~{storyPkg.metadata.estimatedReadTimeMinutes} min</strong></span>
                  <span>Format: <strong>{storyPkg.format}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleDownload}
                  className="btn btn-primary"
                  style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  title="Download .moyun.json file for offline sharing"
                >
                  <Download size={15} /> Download .moyun.json
                </button>
                <button
                  onClick={handleCopyJson}
                  className="btn btn-secondary"
                  style={{ padding: '9px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {copiedJson ? <Check size={15} color="var(--accent-bamboo)" /> : <Copy size={15} />}
                  {copiedJson ? 'JSON Copied!' : 'Copy Raw JSON'}
                </button>
              </div>

              {/* QR Code & Link Share */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    {copiedLink ? <Check size={14} color="var(--accent-bamboo)" /> : <Share2 size={14} />}
                    {copiedLink ? 'Deep Link Copied!' : 'Copy Direct Deep Link'}
                  </button>
                  <button
                    onClick={() => setShowQr(prev => !prev)}
                    className={`btn ${showQr ? 'btn-bamboo' : 'btn-secondary'}`}
                    style={{ padding: '7px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Generate QR Code for Mobile Scanning"
                  >
                    <QrCode size={14} /> {showQr ? 'Hide QR' : 'Show QR Code'}
                  </button>
                </div>

                {showQr && qrMatrix && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px', background: '#ffffff', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', marginTop: '8px' }}>
                    <svg
                      width="200"
                      height="200"
                      viewBox={`0 0 ${qrMatrix.length} ${qrMatrix.length}`}
                      style={{ shapeRendering: 'crispEdges', maxWidth: '100%', height: 'auto' }}
                    >
                      {qrMatrix.map((row, r) =>
                        row.map((cell, c) => (
                          cell ? (
                            <rect
                              key={`${r}-${c}`}
                              x={c}
                              y={r}
                              width="1"
                              height="1"
                              fill="#1b1c1d"
                            />
                          ) : null
                        ))
                      )}
                    </svg>
                    <span style={{ fontSize: '11px', color: '#666', marginTop: '10px', textAlign: 'center' }}>
                      Scan with your phone camera or QR reader to import immediately on mobile.
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Import Tab */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Option A: Choose a .moyun.json File
                </label>
                <input
                  type="file"
                  accept=".json,.moyun.json"
                  onChange={handleFileUpload}
                  style={{ fontSize: '12px', width: '100%', padding: '6px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Option B: Paste JSON Story Code
                </label>
                <textarea
                  value={importInput}
                  onChange={(e) => {
                    setImportInput(e.target.value);
                    if (e.target.value.trim()) {
                      processImport(e.target.value);
                    } else {
                      setImportError(null);
                      setImportSuccess(null);
                    }
                  }}
                  placeholder="Paste contents of a .moyun.json file or shared JSON payload..."
                  rows={4}
                  className="form-input"
                  style={{ fontFamily: 'monospace', fontSize: '11px', resize: 'vertical' }}
                />
              </div>

              {/* Error feedback */}
              {importError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-seal)', borderRadius: 'var(--radius-sm)', color: 'var(--accent-seal)', fontSize: '12px' }}>
                  <AlertCircle size={16} />
                  <span>{importError}</span>
                </div>
              )}

              {/* Success Preview */}
              {importSuccess && (
                <div style={{ padding: '12px', background: 'rgba(34, 197, 94, 0.08)', border: '1px solid var(--accent-bamboo)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-bamboo)', fontWeight: 600, fontSize: '13px', marginBottom: '6px' }}>
                    <CheckCircle2 size={16} /> Valid Moyun Story Detected!
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                    {importSuccess.story.title} (HSK {importSuccess.story.hskLevel})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {importSuccess.metadata.characterCount} characters • ~{importSuccess.metadata.estimatedReadTimeMinutes} min reading time
                  </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-serif-zh)', lineHeight: 1.5, maxHeight: '60px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {importSuccess.story.text.slice(0, 100)}...
                  </p>
                  <button
                    onClick={handleConfirmImport}
                    className="btn btn-primary"
                    style={{ marginTop: '10px', width: '100%', padding: '8px', fontSize: '13px' }}
                  >
                    Load & Read This Story Now
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', marginTop: '14px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
