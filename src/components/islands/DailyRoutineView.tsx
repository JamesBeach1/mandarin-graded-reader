import React, { useState, useEffect } from 'react';
import type { DailyIslandRoutine } from '../../types/Island';
import { IslandStore } from '../../services/islandStore';
import { 
  Sun, Car, Flame, Moon, CheckCircle2, 
  Clock, Play, Zap, ArrowRight, ShieldCheck, Award
} from 'lucide-react';

interface DailyRoutineViewProps {
  onStartFlooding: () => void;
  onStartShadowing: () => void;
  onStartLunchSprint: () => void;
  onStartBedtimeRecall: () => void;
}

export const DailyRoutineView: React.FC<DailyRoutineViewProps> = ({
  onStartFlooding,
  onStartShadowing,
  onStartLunchSprint,
  onStartBedtimeRecall
}) => {
  const [routine, setRoutine] = useState<DailyIslandRoutine>({
    date: new Date().toISOString().slice(0, 10),
    floodingMinutes: 0,
    shadowingMinutes: 0,
    recallMinutes: 0,
    recallSentencesCount: 0
  });

  useEffect(() => {
    IslandStore.getDailyRoutine().then(r => setRoutine(r));
  }, []);

  const totalMinutes = routine.floodingMinutes + routine.shadowingMinutes + routine.recallMinutes;
  const targetTotal = 75; // 20 morning + 30 commute + 15 lunch + 10 bedtime = 75 mins total
  const overallPercent = Math.min(100, Math.round((totalMinutes / targetTotal) * 100));

  const ROUTINE_BLOCKS = [
    {
      title: '1. Morning Getting Ready',
      chinese: '早晨起居沉浸',
      icon: <Sun size={20} color="#e67e22" />,
      target: '20 mins',
      targetMinutes: 20,
      currentMinutes: routine.shadowingMinutes,
      type: 'Shadowing while getting dressed & breakfast',
      desc: 'Audio looping in background. Repeat out loud to train mouth muscle memory.',
      actionText: 'Start Morning Audio',
      action: onStartShadowing
    },
    {
      title: '2. Daily Commute / Dead Time',
      chinese: '通勤与碎片时间',
      icon: <Car size={20} color="#3498db" />,
      target: '30 mins',
      targetMinutes: 30,
      currentMinutes: routine.floodingMinutes,
      type: 'Passive Audio Flooding',
      desc: 'Earbuds in on train/bus/car. Train ear to recognize normal speaking speed.',
      actionText: 'Start Flooding Playlist',
      action: onStartFlooding
    },
    {
      title: '3. Lunch Break Sprint',
      chinese: '午休高强度主动回忆',
      icon: <Flame size={20} color="#e74c3c" />,
      target: '15 mins',
      targetMinutes: 15,
      currentMinutes: routine.recallMinutes,
      type: 'High-Intensity Active Recall',
      desc: 'Quick 10-15 minute production sprint. Produce Mandarin from English prompt.',
      actionText: 'Start Lunch Sprint',
      action: onStartLunchSprint
    },
    {
      title: '4. Bedtime Memory Consolidation',
      chinese: '睡前记忆固化',
      icon: <Moon size={20} color="#9b59b6" />,
      target: '15 mins',
      targetMinutes: 15,
      currentMinutes: Math.min(15, Math.floor(routine.recallMinutes / 2)),
      type: 'Overnight Retention Review',
      desc: 'Active recall right before sleep. Brain processes and consolidates memory overnight.',
      actionText: 'Start Bedtime Review',
      action: onStartBedtimeRecall
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>📅</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              The 20-Minute Protocol: Daily Implementation
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              color: 'var(--accent-bamboo)',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              Zero Classroom Hours
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            "You don't need 3 hours to sit down in a classroom. What you need is to use your dead time intelligently." Four focused routines scheduled throughout your day ensure permanent fluency in weeks.
          </p>
        </div>

        {/* Today's Overall Progress Ring / Gauge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '12px 20px',
          backgroundColor: 'var(--bg-base)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Today's Total Immersion</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
              {totalMinutes} / {targetTotal} <span style={{ fontSize: '13px', fontWeight: 400 }}>mins</span>
            </div>
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--accent-bamboo)',
            backgroundColor: 'rgba(88,204,2,0.1)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-pill)'
          }}>
            {overallPercent}%
          </div>
        </div>
      </div>

      {/* Routine Blocks Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px'
      }}>
        {ROUTINE_BLOCKS.map((block, idx) => {
          const isDone = block.currentMinutes >= block.targetMinutes;
          const progress = Math.min(100, Math.round((block.currentMinutes / block.targetMinutes) * 100));

          return (
            <div
              key={idx}
              style={{
                padding: '20px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: isDone ? '1px solid var(--accent-bamboo)' : '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {block.icon}
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {block.title}
                    </span>
                  </div>
                  {isDone ? (
                    <span style={{ fontSize: '11px', color: 'var(--accent-bamboo)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={13} /> Complete
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Target: {block.target}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, marginBottom: '6px' }}>
                  {block.chinese} • {block.type}
                </div>

                <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {block.desc}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>Completed</span>
                  <span>{block.currentMinutes}m / {block.targetMinutes}m</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-base)', borderRadius: '3px', overflow: 'hidden', marginBottom: '12px' }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: isDone ? 'var(--accent-bamboo)' : 'var(--accent-indigo, #3498db)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                <button
                  onClick={block.action}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    padding: '8px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontWeight: 500
                  }}
                >
                  <span>{block.actionText}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Week Timeline / Milestones */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600 }}>
          The 6-Week Fluency Timeline (What to Expect)
        </h4>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          <div style={{ padding: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#e74c3c' }}>WEEK 1: HIGH FRICTION</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Everything will feel difficult. Struggling to produce sentences from memory. Normal friction where learning begins.
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#f39c12' }}>WEEK 2-3: PATTERNS CLICK</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              20-30% of sentences recall instantly. Ear adjusts to full native speed. Grammar absorbs naturally.
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-bamboo)' }}>WEEK 4-5: BASIC CONVERSATIONS</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Respond with real sentences on your topics. Sentences that took 3 seconds now recall in 1.
            </p>
          </div>

          <div style={{ padding: '12px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-gold)' }}>WEEK 6: CONVERSATIONAL</span>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              Express real thoughts without freezing. Full functional fluency across your chosen language islands.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
