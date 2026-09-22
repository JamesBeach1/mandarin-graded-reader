import React from 'react';
import { Flame, Trophy, Calendar, Sparkles } from 'lucide-react';

interface SrsHeatmapProps {
  data: Record<string, number>;
}

export const SrsHeatmap: React.FC<SrsHeatmapProps> = ({ data }) => {
  // Local timezone date string helper (prevents UTC date shifting)
  const getLocalDateStr = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate last 35 days (5 full weeks)
  const days: { date: string; count: number; dayOfWeek: number; dayNum: number }[] = [];
  const today = new Date();
  const todayStr = getLocalDateStr(today);

  for (let i = 34; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = getLocalDateStr(d);
    days.push({
      date: dateStr,
      count: data[dateStr] || 0,
      dayOfWeek: d.getDay(),
      dayNum: d.getDate()
    });
  }

  // Calculate Streak in Local Timezone (GTU-004)
  let currentStreak = 0;
  const cursor = new Date();

  // If today has activity, start streak at 1 and check backwards.
  // If today hasn't been completed yet, check yesterday to preserve active streak.
  if ((data[todayStr] || 0) > 0) {
    currentStreak = 1;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if ((data[getLocalDateStr(yesterday)] || 0) > 0) {
      currentStreak = 1;
      cursor.setDate(yesterday.getDate() - 1);
    }
  }

  if (currentStreak > 0) {
    while (true) {
      const dStr = getLocalDateStr(cursor);
      if ((data[dStr] || 0) > 0) {
        currentStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Calculate Longest Streak across all recorded days
  const activeDates = Object.keys(data).filter(k => data[k] > 0).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  activeDates.forEach(dateStr => {
    const [y, m, d] = dateStr.split('-').map(Number);
    const currentDate = new Date(y, m - 1, d);

    if (prevDate) {
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = currentDate;
  });

  longestStreak = Math.max(longestStreak, currentStreak);
  const totalReviews = Object.values(data).reduce((acc, v) => acc + v, 0);

  const getIntensityClass = (count: number) => {
    if (count === 0) return '';
    if (count <= 5) return 'bamboo-1';
    if (count <= 15) return 'bamboo-2';
    if (count <= 30) return 'bamboo-3';
    return 'bamboo-4';
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-md)',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Header & Streak Counters (GTU-004) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} color="var(--accent-gold)" /> Daily Reading & Review Activity
          </h4>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            35-day consistency heatmap
          </span>
        </div>

        {/* Streak Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: currentStreak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'var(--bg-base)',
            border: `1px solid ${currentStreak > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
            color: currentStreak > 0 ? '#f59e0b' : 'var(--text-muted)'
          }}>
            <Flame size={14} fill={currentStreak > 0 ? '#f59e0b' : 'none'} />
            <span style={{ fontSize: '12px', fontWeight: 700 }}>
              {currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} Streak
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)'
          }}>
            <Trophy size={13} color="var(--accent-gold)" />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              Best: {longestStreak}d
            </span>
          </div>

          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-base)',
            border: '1px solid var(--border-subtle)'
          }}>
            Total: <strong style={{ color: 'var(--text-primary)' }}>{totalReviews}</strong> cards
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="srs-heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
        {days.map(d => (
          <div
            key={d.date}
            className={`srs-day-cell ${getIntensityClass(d.count)}`}
            style={{
              height: '24px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'transform 0.15s ease'
            }}
            title={`${d.date}: ${d.count} cards reviewed`}
          />
        ))}
      </div>

      {/* Legend & Hint */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span>Keep your flame alive by reviewing daily!</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span>Less</span>
          <div className="srs-day-cell" style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
          <div className="srs-day-cell bamboo-1" style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
          <div className="srs-day-cell bamboo-2" style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
          <div className="srs-day-cell bamboo-3" style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
          <div className="srs-day-cell bamboo-4" style={{ width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' }} />
          <span>More</span>
        </div>
      </div>
    </div>
  );
};
