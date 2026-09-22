import React, { useState, useEffect } from 'react';
import { Zap, Trophy, History, X, Clock, BookOpen, Gauge } from 'lucide-react';
import { ReadingAnalytics, type ReadingSpeedRecord, type ReadingBenchmark } from '../services/readingAnalytics';

interface ReadingVelocityModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCPM: number;
  sessionElapsedSeconds: number;
  sessionCharsRead: number;
  storyTitle?: string;
  hskLevel?: string;
}

export const ReadingVelocityModal: React.FC<ReadingVelocityModalProps> = ({
  isOpen,
  onClose,
  currentCPM,
  sessionElapsedSeconds,
  sessionCharsRead,
  storyTitle,
  hskLevel
}) => {
  const [history, setHistory] = useState<ReadingSpeedRecord[]>([]);
  const [benchmarks, setBenchmarks] = useState<ReadingBenchmark[]>([]);
  const [avgCPM, setAvgCPM] = useState<number>(0);
  const [peakCPM, setPeakCPM] = useState<number>(0);
  const [totalChars, setTotalChars] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const records = ReadingAnalytics.getHistory();
      setHistory(records.slice(-10).reverse()); // show last 10 newest first
      setAvgCPM(ReadingAnalytics.getAverageCPM());
      setPeakCPM(ReadingAnalytics.getPeakCPM());
      setTotalChars(ReadingAnalytics.getTotalCharactersRead());
      setBenchmarks(ReadingAnalytics.getBenchmarks(currentCPM));
    }
  }, [isOpen, currentCPM]);

  if (!isOpen) return null;

  const minutes = Math.floor(sessionElapsedSeconds / 60);
  const seconds = sessionElapsedSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div 
        className="settings-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92vw', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b'
            }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600 }}>Reading Velocity & Fluency Analytics</h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>Characters Per Minute (CPM) & Fluency Progression (GTU-002)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Live Session Hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr 1fr',
          gap: '16px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)' }}>Current Velocity</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
              <span style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                {currentCPM}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#f59e0b' }}>CPM</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {storyTitle ? `📖 ${storyTitle.slice(0, 22)}...` : 'Active Reading Session'}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <Clock size={11} /> Reading Time
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {timeFormatted}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Active focus</div>
          </div>

          <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <BookOpen size={11} /> Characters Read
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
              {sessionCharsRead}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>HSK {hskLevel || '1'} content</div>
          </div>
        </div>

        {/* Lifetime Stats Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Average Velocity</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {avgCPM} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>CPM</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Peak Velocity</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#10b981', marginTop: '2px' }}>
              {peakCPM} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>CPM</span>
            </div>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Lifetime Volume</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
              {totalChars.toLocaleString()} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>chars</span>
            </div>
          </div>
        </div>

        {/* HSK Fluency Benchmark Tiers */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '10px' }}>
            <Gauge size={13} /> Pedagogical Fluency Benchmarks
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {benchmarks.map((bm, i) => (
              <div 
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: bm.isCurrentTier ? `1.5px solid ${bm.color}` : '1px solid var(--border-subtle)',
                  background: bm.isCurrentTier ? 'rgba(255,255,255,0.04)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: `${bm.color}22`,
                    color: bm.color,
                    minWidth: '55px',
                    textAlign: 'center'
                  }}>
                    {bm.tier}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {bm.name}
                      {bm.isCurrentTier && (
                        <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: bm.color, color: '#000', fontWeight: 700 }}>
                          YOUR CURRENT PACE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {bm.description}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                  {bm.targetRange}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Session History */}
        {history.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
              <History size={13} /> Recent Reading Sessions
            </div>

            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 10px' }}>Date</th>
                    <th style={{ padding: '6px 10px' }}>Story</th>
                    <th style={{ padding: '6px 10px' }}>Level</th>
                    <th style={{ padding: '6px 10px' }}>Length</th>
                    <th style={{ padding: '6px 10px', textAlign: 'right' }}>Speed</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                        {new Date(rec.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td style={{ padding: '6px 10px', fontWeight: 500 }}>
                        {rec.storyTitle?.slice(0, 20) || 'Story'}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                        HSK {rec.hskLevel || '1'}
                      </td>
                      <td style={{ padding: '6px 10px', color: 'var(--text-muted)' }}>
                        {rec.charactersRead} chars
                      </td>
                      <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>
                        {rec.cpm} CPM
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 18px', fontSize: '13px' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
