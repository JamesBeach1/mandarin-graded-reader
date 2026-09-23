import React, { useState, useEffect } from 'react';
import {
  LeaderboardService,
  type LeaderboardEntry,
  type LeaderboardSettings
} from '../services/leaderboardStore';
import {
  X, Trophy, ShieldCheck, Flame, RefreshCw, Eye, EyeOff,
  User, Award, Clock, BookOpen, Layers
} from 'lucide-react';

interface CommunityLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityLeaderboardModal: React.FC<CommunityLeaderboardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState<LeaderboardSettings>(LeaderboardService.getSettings());
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [resetTime, setResetTime] = useState<string>('');
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [customAlias, setCustomAlias] = useState('');

  useEffect(() => {
    if (isOpen) {
      const s = LeaderboardService.getSettings();
      setSettings(s);
      setCustomAlias(s.userAlias);
      setEntries(LeaderboardService.getWeeklyLeaderboard());
      setResetTime(LeaderboardService.getTimeUntilReset());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleOptIn = () => {
    const nextOpt = !settings.optedIn;
    const updated = { ...settings, optedIn: nextOpt };
    setSettings(updated);
    LeaderboardService.saveSettings(updated);
    setEntries(LeaderboardService.getWeeklyLeaderboard());
  };

  const handleSaveAlias = () => {
    if (!customAlias.trim()) return;
    const updated = { ...settings, userAlias: customAlias.trim() };
    setSettings(updated);
    LeaderboardService.saveSettings(updated);
    setIsEditingAlias(false);
    setEntries(LeaderboardService.getWeeklyLeaderboard());
  };

  const userEntry = entries.find(e => e.isCurrentUser);

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
        maxWidth: '720px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
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
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Trophy size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                每周阅读榜 · Weekly Community Leaderboard
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                100% Anonymous · Reset in {resetTime} (every Sunday midnight)
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

        {/* Modal Body */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Privacy & Opt-in Banner */}
          <div style={{
            padding: '16px 20px',
            backgroundColor: settings.optedIn ? 'rgba(76, 107, 83, 0.1)' : 'var(--bg-base)',
            border: `1px solid ${settings.optedIn ? 'var(--accent-bamboo)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={24} color={settings.optedIn ? 'var(--accent-bamboo)' : 'var(--text-muted)'} />
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {settings.optedIn ? 'You are Opted-In (Active)' : 'Leaderboard is Opt-In Only'}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {settings.optedIn
                    ? `Participating anonymously as: ${settings.userEmoji} ${settings.userAlias}`
                    : 'Zero personal data is shared. Join the anonymous cohort to track weekly volume.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {settings.optedIn && (
                <button
                  onClick={() => setIsEditingAlias(!isEditingAlias)}
                  className="control-button"
                  style={{ fontSize: '12px', padding: '6px 10px' }}
                >
                  <User size={13} /> {isEditingAlias ? 'Cancel' : 'Change Pen Name'}
                </button>
              )}
              <button
                onClick={handleToggleOptIn}
                className="btn"
                style={{
                  backgroundColor: settings.optedIn ? 'var(--accent-bamboo)' : 'var(--border-strong)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 14px',
                  fontSize: '12px'
                }}
              >
                {settings.optedIn ? <><EyeOff size={13} /> Opt-Out</> : <><Eye size={13} /> Opt-In Anonymously</>}
              </button>
            </div>
          </div>

          {/* Alias Editing Drawer */}
          {isEditingAlias && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: 'var(--bg-base)',
              border: '1px dashed var(--border-strong)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              gap: '10px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Pen Name:</span>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value)}
                placeholder="e.g. 寒山客 (Cold Mountain)"
                className="form-input"
                style={{ flex: 1, height: '32px', fontSize: '13px' }}
                maxLength={24}
              />
              <button onClick={handleSaveAlias} className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
                Save
              </button>
            </div>
          )}

          {/* User's Highlighted Standing Card (If Opted In) */}
          {settings.optedIn && userEntry && (
            <div style={{
              padding: '14px 18px',
              backgroundColor: 'rgba(217, 119, 6, 0.08)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-gold)',
                  color: '#121212',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  #{userEntry.rank}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {userEntry.avatarEmoji} {userEntry.alias}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '2px' }}>
                    {userEntry.hskTier}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>This Week</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {userEntry.charactersRead} <span style={{ fontSize: '11px', fontWeight: 400 }}>字</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reviews</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {userEntry.reviewsCompleted}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Streak</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-seal)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Flame size={14} /> {userEntry.streakDays}d
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard Table */}
          <div style={{
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 120px 100px 90px',
              padding: '10px 16px',
              backgroundColor: 'var(--bg-panel)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              fontWeight: 600
            }}>
              <div>Rank</div>
              <div>Scholar (Pen Name)</div>
              <div style={{ textAlign: 'right' }}>Chars Read</div>
              <div style={{ textAlign: 'right' }}>Reviews</div>
              <div style={{ textAlign: 'right' }}>Streak</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {entries.map((entry) => {
                const isUser = entry.isCurrentUser;
                return (
                  <div
                    key={entry.rank}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 120px 100px 90px',
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isUser ? 'rgba(217, 119, 6, 0.08)' : 'transparent',
                      alignItems: 'center',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: entry.rank <= 3 ? 'var(--accent-gold)' : 'var(--text-muted)' }}>
                      {entry.rank === 1 ? '🥇 1' : entry.rank === 2 ? '🥈 2' : entry.rank === 3 ? '🥉 3' : `#${entry.rank}`}
                    </div>
                    <div>
                      <span style={{ fontWeight: isUser ? 700 : 500, color: isUser ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
                        {entry.avatarEmoji} {entry.alias}
                      </span>
                      <span style={{ marginLeft: '8px', fontSize: '10px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-base)', padding: '1px 6px', borderRadius: '3px' }}>
                        {entry.hskTier.split(' ')[0]}
                      </span>
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {entry.charactersRead.toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>字</span>
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>
                      {entry.reviewsCompleted}
                    </div>
                    <div style={{ textAlign: 'right', color: 'var(--accent-seal)', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '3px' }}>
                      <Flame size={12} /> {entry.streakDays}d
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            🌿 Moyun (墨韵) GTU-003 · Private peer learning
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
