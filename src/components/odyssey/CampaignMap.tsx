import React, { useState, useEffect } from 'react';
import {
  Compass,
  Trophy,
  Lock,
  Check,
  Star,
  Sparkles,
  Shield,
  Crown,
  Play,
  Flame,
  PlusCircle,
  GitBranch,
  HelpCircle,
  ChevronRight,
  Info,
  Zap
} from 'lucide-react';
import type { Course, Chapter, CourseNode, BiomeType } from '../../types/Course';
import { odysseyAudio } from '../../services/odysseyAudio';

/**
 * Resolves a friendly, vibrant emoji to personalize each node on the map,
 * matching Duolingo / HelloChinese style thematic iconography.
 */
export const resolveNodeEmoji = (node: CourseNode): string => {
  if (node.icon && node.icon.trim()) {
    return node.icon.trim();
  }
  const title = (node.title || '').toLowerCase();
  const desc = (node.description || '').toLowerCase();
  const vocab = (node.targetVocabulary || []).join(' ');
  const combined = `${title} ${desc} ${vocab}`.toLowerCase();

  if (node.type === 'boss_capstone') return '👑';
  if (node.type === 'review_ambush') return '⚡';
  if (node.branchType === 'side_quest') return '💎';

  if (combined.includes('trombone') || combined.includes('brass') || combined.includes('music') || combined.includes('sound') || combined.includes('song') || combined.includes('乐器') || combined.includes('长号')) return '🎺';
  if (combined.includes('dog') || combined.includes('pup') || combined.includes('canine') || combined.includes('pet') || combined.includes('bark') || combined.includes('小狗') || combined.includes('狗')) return '🐶';
  if (combined.includes('parent') || combined.includes('in-law') || combined.includes('family') || combined.includes('tea') || combined.includes('dinner') || combined.includes('岳父') || combined.includes('岳母') || combined.includes('家')) return '🍵';
  if (combined.includes('tax') || combined.includes('fraud') || combined.includes('finance') || combined.includes('ledger') || combined.includes('invoice') || combined.includes('audit') || combined.includes('发票') || combined.includes('税')) return '📊';
  if (combined.includes('crime') || combined.includes('misdemeanor') || combined.includes('thief') || combined.includes('heist') || combined.includes('steal') || combined.includes('police') || combined.includes('detective') || combined.includes('alibi') || combined.includes('逃') || combined.includes('警察')) return '🕵️';
  if (combined.includes('market') || combined.includes('taipei') || combined.includes('street') || combined.includes('lantern') || combined.includes('夜市')) return '🏮';
  if (combined.includes('food') || combined.includes('dim sum') || combined.includes('dumpling') || combined.includes('eat') || combined.includes('dish') || combined.includes('restaurant') || combined.includes('吃') || combined.includes('点心')) return '🥟';
  if (combined.includes('hotpot') || combined.includes('spicy') || combined.includes('sichuan') || combined.includes('火锅')) return '🍲';
  if (combined.includes('panda') || combined.includes('bamboo') || combined.includes('chengdu') || combined.includes('熊猫')) return '🐼';
  if (combined.includes('business') || combined.includes('meeting') || combined.includes('negotiat') || combined.includes('company') || combined.includes('商务') || combined.includes('公司')) return '💼';
  if (combined.includes('hospital') || combined.includes('doctor') || combined.includes('medical') || combined.includes('health') || combined.includes('医院') || combined.includes('医生')) return '🏥';
  if (combined.includes('coffee') || combined.includes('cafe') || combined.includes('barista') || combined.includes('咖啡')) return '☕';
  if (combined.includes('train') || combined.includes('flight') || combined.includes('travel') || combined.includes('hotel') || combined.includes('trip') || combined.includes('旅行') || combined.includes('机场')) return '🚄';
  if (combined.includes('tone') || combined.includes('pronunciation') || combined.includes('acoustic') || combined.includes('listen') || combined.includes('听')) return '🎧';
  if (combined.includes('read') || combined.includes('character') || combined.includes('stroke') || combined.includes('document') || combined.includes('读') || combined.includes('字')) return '📜';
  if (combined.includes('speak') || combined.includes('dialogue') || combined.includes('conversation') || combined.includes('chat') || combined.includes('说') || combined.includes('对话')) return '💬';
  if (combined.includes('question') || combined.includes('inquiry') || combined.includes('search') || combined.includes('问')) return '🔍';

  return '🏮';
};

interface CampaignMapProps {
  course: Course;
  onSelectNode: (node: CourseNode) => void;
  onOpenSyllabusGenerator: () => void;
  allCourses: Course[];
  onSwitchCourse: (courseId: string) => void;
}

export const CampaignMap: React.FC<CampaignMapProps> = ({
  course,
  onSelectNode,
  onOpenSyllabusGenerator,
  allCourses,
  onSwitchCourse
}) => {
  const [activeChapterId, setActiveChapterId] = useState<string>(
    course.chapters[0]?.id || ''
  );
  const [selectedNodePreview, setSelectedNodePreview] = useState<CourseNode | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  // Sync active chapter whenever a new course campaign is selected or synthesized
  useEffect(() => {
    if (course.chapters && course.chapters.length > 0) {
      setActiveChapterId(course.chapters[0].id);
    }
  }, [course.id]);

  const activeChapter = course.chapters.find(c => c.id === activeChapterId) || course.chapters[0];
  const biome = activeChapter?.themeBiome || 'city';

  // Biome CSS variable mappings
  const biomeThemeStyles: Record<BiomeType, { bg: string; border: string; accent: string; pathStroke: string; pathGlow: string }> = {
    city: {
      bg: 'var(--bg-surface)',
      border: 'var(--border-subtle)',
      accent: 'var(--accent-indigo)',
      pathStroke: '#6366f1',
      pathGlow: 'rgba(99, 102, 241, 0.4)'
    },
    forest: {
      bg: 'var(--bg-surface)',
      border: 'rgba(56, 161, 105, 0.25)',
      accent: 'var(--accent-bamboo)',
      pathStroke: '#38a169',
      pathGlow: 'rgba(56, 161, 105, 0.4)'
    },
    mountains: {
      bg: 'var(--bg-surface)',
      border: 'rgba(214, 158, 46, 0.25)',
      accent: 'var(--accent-gold)',
      pathStroke: '#d69e2e',
      pathGlow: 'rgba(214, 158, 46, 0.4)'
    }
  };

  const currentTheme = biomeThemeStyles[biome];

  // Canvas coordinate system for exact SVG path rendering
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 1000;

  // Guarantee safe vertical headroom (>= 50px) so top milestone bubbles and bottom labels are never clipped
  const getSafeY = (pct: number) => {
    return 16 + ((Math.max(10, Math.min(90, pct)) - 10) / 80) * (86 - 16);
  };

  const toCanvasX = (pct: number) => (pct / 100) * CANVAS_WIDTH;
  const toCanvasY = (pct: number) => (getSafeY(pct) / 100) * CANVAS_HEIGHT;

  // Compute all DAG connections (Main links and Branch links)
  interface PathConnection {
    id: string;
    fromNode: CourseNode;
    toNode: CourseNode;
    isBranch: boolean;
    isCompleted: boolean;
    isActive: boolean;
  }

  const connections: PathConnection[] = [];
  if (activeChapter) {
    const nodeMap = new Map<string, CourseNode>();
    activeChapter.nodes.forEach(n => nodeMap.set(n.id, n));

    activeChapter.nodes.forEach(node => {
      if (node.connectedTo && node.connectedTo.length > 0) {
        node.connectedTo.forEach(targetId => {
          const target = nodeMap.get(targetId);
          if (target) {
            const isBranch = target.branchType === 'side_quest' || node.branchType === 'side_quest';
            const isCompleted = node.status === 'completed' && target.status === 'completed';
            const isActive = node.status === 'completed' && target.status === 'active';
            connections.push({
              id: `${node.id}->${target.id}`,
              fromNode: node,
              toNode: target,
              isBranch,
              isCompleted,
              isActive
            });
          }
        });
      }
    });
  }

  const handleNodeClick = (node: CourseNode) => {
    odysseyAudio.playChipConnect();
    setSelectedNodePreview(node);
  };

  const handleLaunchNode = (node: CourseNode) => {
    setSelectedNodePreview(null);
    onSelectNode(node);
  };

  // Node counts
  const completedCount = activeChapter?.nodes.filter(n => n.status === 'completed').length || 0;
  const totalCount = activeChapter?.nodes.length || 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* CAMPAIGN OVERVIEW & BIOME HEADER */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: `1px solid ${currentTheme.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* ROW 1: TOP METADATA & HOMOGENOUS ACTION TOOLBAR */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '14px'
        }}>
          {/* Left: Level, Biome & Progress Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              color: currentTheme.accent
            }}>
              {course.level} Odyssey
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)'
            }}>
              Biome: <strong style={{ textTransform: 'capitalize', color: currentTheme.accent }}>{biome}</strong>
            </span>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)'
            }}>
              Progress: <strong style={{ color: 'var(--text-primary)' }}>{completedCount} / {totalCount} Nodes</strong>
            </span>
          </div>

          {/* Right: Homogenous Unified Action Toolbar (all 32px height, consistent styling) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 1. Rank & XP Pill */}
            <div style={{
              height: '32px',
              padding: '0 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-base)',
              border: '1px solid var(--border-subtle)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap'
            }}>
              <Flame size={14} color="#d69e2e" />
              <span>{course.currentRank || 'Apprentice'}</span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>&bull; {course.totalXp} XP</span>
            </div>

            {/* 2. Course Switcher Dropdown (32px matching height) */}
            {allCourses.length > 1 && (
              <select
                value={course.id}
                onChange={(e) => onSwitchCourse(e.target.value)}
                className="form-select"
                style={{
                  height: '32px',
                  fontSize: '12px',
                  padding: '0 10px',
                  margin: 0,
                  maxWidth: '190px',
                  textOverflow: 'ellipsis'
                }}
                title="Switch active campaign"
              >
                {allCourses.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            )}

            {/* 3. Map Legend Button (32px height) */}
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="btn btn-secondary"
              style={{
                height: '32px',
                fontSize: '12px',
                padding: '0 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
              title="How this learning tree works"
            >
              <Info size={14} />
              <span>{showGuide ? 'Hide Legend' : 'Map Legend'}</span>
            </button>

            {/* 4. New Campaign Button (32px height) */}
            <button
              type="button"
              onClick={onOpenSyllabusGenerator}
              className="btn btn-primary"
              style={{
                height: '32px',
                fontSize: '12px',
                padding: '0 14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <PlusCircle size={14} />
              <span>New Campaign</span>
            </button>
          </div>
        </div>

        {/* ROW 2: FULL-WIDTH TITLE & NARRATIVE PREMISE (NEVER SHIFTS CONTROLS) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.3
          }}>
            {course.title}
          </h2>
          {course.targetGoal && (
            <p style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.4
            }}>
              {course.targetGoal}
            </p>
          )}
        </div>

        {/* ROW 3: CHAPTER / ACT SWITCHER GRID (NO HORIZONTAL SCROLLBAR) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '16px'
        }}>
          {course.chapters.map((ch, idx) => {
            const isActive = ch.id === activeChapter.id;
            const chCompleted = ch.nodes.filter(n => n.status === 'completed').length;
            const cleanSubtitle = ch.title
              .replace(/^(Act|Chapter)\s*\d+[:：\s-]*/i, '')
              .trim() || ch.title;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  if (ch.isUnlocked) {
                    setActiveChapterId(ch.id);
                    odysseyAudio.playChipConnect();
                  }
                }}
                disabled={!ch.isUnlocked}
                title={`${ch.title} (${chCompleted}/${ch.nodes.length} completed)`}
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isActive ? 'var(--border-strong)' : 'var(--bg-base)',
                  border: `1px solid ${isActive ? currentTheme.accent : 'var(--border-subtle)'}`,
                  color: !ch.isUnlocked ? 'var(--text-muted)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: ch.isUnlocked ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  textAlign: 'left',
                  opacity: ch.isUnlocked ? 1 : 0.6,
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? `0 0 0 1px ${currentTheme.accent} inset` : 'none',
                  minWidth: 0,
                  position: 'relative'
                }}
              >
                {/* Card Top: Act Tag + Status / Progress */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!ch.isUnlocked ? (
                      <Lock size={12} color="var(--text-muted)" />
                    ) : (
                      <Compass size={12} color={isActive ? currentTheme.accent : 'var(--text-muted)'} />
                    )}
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: isActive ? currentTheme.accent : 'var(--text-muted)'
                    }}>
                      Act {idx + 1}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    color: chCompleted === ch.nodes.length && chCompleted > 0 ? 'var(--accent-bamboo)' : 'var(--text-muted)'
                  }}>
                    {chCompleted}/{ch.nodes.length} Nodes
                  </span>
                </div>

                {/* Card Bottom: Chapter Subtitle with elegant ellipsis */}
                <div style={{
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {cleanSubtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* MAP LEGEND & HOW IT WORKS GUIDE (Collapsible / Toggleable) */}
        {showGuide && (
          <div style={{
            padding: '16px 20px',
            backgroundColor: 'var(--bg-base)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <GitBranch size={16} color={currentTheme.accent} />
              <span>How the Adaptive Odyssey Learning DAG Works:</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: currentTheme.accent, display: 'inline-block' }} />
                <span><strong>Main Line Node:</strong> Core sequential lessons.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#38a169', display: 'inline-block' }} />
                <span><strong>Side Quest Branch:</strong> Optional culture, slang, and audio drills (+bonus XP).</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', transform: 'rotate(45deg)', backgroundColor: '#e53e3e', display: 'inline-block' }} />
                <span><strong>Spaced Ambush:</strong> Mid-chapter checkpoint reviewing weak flashcards.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crown size={14} color="#d69e2e" />
                <span><strong>Boss Gate:</strong> Capstone battle unlocking the next Biome.</span>
              </div>
            </div>

            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
              Complete the active glowing node to advance down the trail. You can branch into side quests or follow the main path directly to the Boss Gate!
            </p>
          </div>
        )}
      </div>

      {/* TOPOGRAPHICAL CAMPAIGN MAP SVG STAGE */}
      <div style={{
        position: 'relative',
        width: '100%',
        minHeight: '840px',
        backgroundColor: 'var(--bg-base)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        overflow: 'hidden',
        boxShadow: 'inset 0 4px 16px rgba(0,0,0,0.25)'
      }}>
        {/* Topographical Contour Grid Pattern */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: 0.12
          }}
        >
          <pattern id="topoGridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#topoGridPattern)" />
        </svg>

        {/* 2D DAG Winding & Branching Paths SVG Layer */}
        <svg
          viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          <defs>
            <linearGradient id="mainPathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentTheme.accent} stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38a169" stopOpacity="0.85" />
            </linearGradient>
            <filter id="glowPath" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {connections.map(conn => {
            const fromX = toCanvasX(conn.fromNode.mapCoordinates.x);
            const fromY = toCanvasY(conn.fromNode.mapCoordinates.y);
            const toX = toCanvasX(conn.toNode.mapCoordinates.x);
            const toY = toCanvasY(conn.toNode.mapCoordinates.y);
            const midY = (fromY + toY) / 2;

            // Smooth cubic Bezier S-curve
            const d = `M ${fromX} ${fromY} C ${fromX} ${midY}, ${toX} ${midY}, ${toX} ${toY}`;

            return (
              <g key={conn.id}>
                {/* 1. Underlying path shadow / roadbed */}
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.07)"
                  strokeWidth={conn.isBranch ? 8 : 12}
                  strokeLinecap="round"
                />

                {/* 2. Primary visible connection line */}
                <path
                  d={d}
                  fill="none"
                  stroke={
                    conn.isCompleted
                      ? '#38a169'
                      : conn.isActive
                      ? currentTheme.accent
                      : 'var(--border-strong)'
                  }
                  strokeWidth={conn.isBranch ? 3.5 : 5}
                  strokeDasharray={conn.isBranch ? '8 6' : 'none'}
                  strokeLinecap="round"
                  filter={conn.isActive ? 'url(#glowPath)' : 'none'}
                  style={{
                    opacity: conn.isCompleted || conn.isActive ? 1 : 0.45,
                    transition: 'stroke 0.3s ease'
                  }}
                />

                {/* 3. Stepping stone milestone dot at curve midpoint */}
                <circle
                  cx={(fromX + toX) / 2}
                  cy={midY}
                  r={conn.isBranch ? 3 : 4}
                  fill={conn.isCompleted ? '#38a169' : currentTheme.accent}
                  opacity={conn.isCompleted || conn.isActive ? 0.9 : 0.3}
                />
              </g>
            );
          })}
        </svg>

        {/* HTML Absolute Nodes Interactive Layer */}
        <div style={{ position: 'relative', width: '100%', height: '840px' }}>
          {activeChapter.nodes.map(node => {
            const isCompleted = node.status === 'completed';
            const isActive = node.status === 'active';
            const isLocked = node.status === 'locked';
            const isBranch = node.branchType === 'side_quest';
            const isBoss = node.type === 'boss_capstone';
            const isAmbush = node.type === 'review_ambush';

            const nodeEmoji = resolveNodeEmoji(node);

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.mapCoordinates.x}%`,
                  top: `${getSafeY(node.mapCoordinates.y)}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: isActive ? 20 : 10
                }}
              >
                {/* Floating Mascot Companion Speech Bubble on the Active Milestone */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    left: '50%',
                    bottom: '100%',
                    marginBottom: '14px',
                    backgroundColor: 'rgba(24, 24, 32, 0.96)',
                    backdropFilter: 'blur(8px)',
                    border: `2px solid ${isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent}`,
                    borderRadius: '16px',
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap',
                    animation: 'floatBounce 2.4s ease-in-out infinite',
                    zIndex: 25,
                    pointerEvents: 'none'
                  }}>
                    <span style={{ fontSize: '20px' }}>🐼</span>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        color: isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em'
                      }}>
                        {isBoss ? '👑 Boss Encounter!' : isBranch ? '💎 Bonus Side Quest!' : isAmbush ? '⚡ Surprise Ambush!' : 'Current Challenge'}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {node.title} {nodeEmoji}
                      </span>
                    </div>
                    {/* Beak Pointer */}
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 0,
                      height: 0,
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: `6px solid ${isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent}`
                    }} />
                  </div>
                )}

                {/* Node Interactive 3D Stepping Stone Button */}
                <button
                  type="button"
                  onClick={() => handleNodeClick(node)}
                  className={`odyssey-node-btn ${node.status}`}
                  style={{
                    width: isBoss ? '68px' : isBranch ? '48px' : '58px',
                    height: isBoss ? '68px' : isBranch ? '48px' : '58px',
                    borderRadius: isBoss ? '20px' : isBranch ? '14px' : '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: isBoss ? '30px' : isBranch ? '22px' : '26px',
                    border: isCompleted
                      ? '2px solid #86efac'
                      : isActive
                      ? isBranch
                        ? '2px solid #fbcfe8'
                        : isBoss
                        ? '2px solid #fde68a'
                        : isAmbush
                        ? '2px solid #fca5a5'
                        : '2px solid #a5b4fc'
                      : '2px solid #3f3f46',
                    background: isCompleted
                      ? 'linear-gradient(180deg, #22c55e 0%, #16a34a 100%)'
                      : isActive
                      ? isBranch
                        ? 'linear-gradient(180deg, #ec4899 0%, #db2777 100%)'
                        : isBoss
                        ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)'
                        : isAmbush
                        ? 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)'
                      : 'linear-gradient(180deg, #27272a 0%, #18181b 100%)',
                    boxShadow: isCompleted
                      ? '0 5px 0 #15803d, 0 8px 16px rgba(22, 163, 74, 0.35)'
                      : isActive
                      ? isBranch
                        ? '0 5px 0 #9d174d, 0 10px 20px rgba(236, 72, 153, 0.45)'
                        : isBoss
                        ? '0 7px 0 #b45309, 0 12px 28px rgba(245, 158, 11, 0.5)'
                        : isAmbush
                        ? '0 5px 0 #991b1b, 0 10px 20px rgba(239, 68, 68, 0.45)'
                        : '0 6px 0 #3730a3, 0 10px 22px rgba(99, 102, 241, 0.45)'
                      : '0 4px 0 #09090b',
                    color: 'white'
                  }}
                  title={node.title}
                >
                  {isLocked ? (
                    <Lock size={isBoss ? 22 : isBranch ? 16 : 18} color="#71717a" />
                  ) : (
                    <span style={{ userSelect: 'none', filter: isCompleted ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' : 'none' }}>
                      {nodeEmoji}
                    </span>
                  )}

                  {/* Completed Check Badge */}
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '2px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.35)',
                      zIndex: 3
                    }}>
                      <Check size={11} strokeWidth={3.5} color="white" />
                    </div>
                  )}

                  {/* Dynamic Earned Stars Mini Badge on Completed Stepping Stone */}
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-7px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                      backgroundColor: 'rgba(15, 15, 20, 0.95)',
                      padding: '2px 5px',
                      borderRadius: '8px',
                      border: '1px solid rgba(245, 158, 11, 0.5)',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.5)',
                      zIndex: 4,
                      pointerEvents: 'none'
                    }}>
                      {[1, 2, 3].map(s => {
                        const earned = (node.stars && node.stars >= 1) ? node.stars : 1;
                        const isFilled = s <= earned;
                        return (
                          <Star
                            key={s}
                            size={8}
                            fill={isFilled ? '#f59e0b' : 'rgba(255,255,255,0.12)'}
                            color={isFilled ? '#f59e0b' : 'rgba(255,255,255,0.25)'}
                          />
                        );
                      })}
                    </div>
                  )}

                  {/* Side Quest Bonus XP Badge */}
                  {isBranch && !isLocked && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: '#ec4899',
                      color: 'white',
                      fontSize: '9px',
                      fontWeight: 800,
                      padding: '1px 5px',
                      borderRadius: '8px',
                      whiteSpace: 'nowrap',
                      border: '1px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                    }}>
                      +50 XP
                    </div>
                  )}

                  {/* Pulsing Active Aura Ring */}
                  {isActive && (
                    <span
                      style={{
                        position: 'absolute',
                        top: -7,
                        left: -7,
                        right: -7,
                        bottom: -7,
                        borderRadius: isBoss ? '24px' : isBranch ? '18px' : '50%',
                        border: `2px solid ${isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent}`,
                        animation: 'pulseRing 2s infinite cubic-bezier(0.4, 0, 0.6, 1)',
                        pointerEvents: 'none'
                      }}
                    />
                  )}
                </button>

                {/* Node Pill Label & Status */}
                <div
                  onClick={() => handleNodeClick(node)}
                  style={{
                    textAlign: 'center',
                    backgroundColor: isActive
                      ? 'rgba(28, 28, 38, 0.95)'
                      : 'rgba(18, 18, 24, 0.88)',
                    backdropFilter: 'blur(6px)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    border: `1px solid ${
                      isActive
                        ? isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent
                        : isCompleted ? 'rgba(34, 197, 94, 0.35)' : 'var(--border-subtle)'
                    }`,
                    whiteSpace: 'nowrap',
                    cursor: isLocked ? 'default' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '11px' }}>{nodeEmoji}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: isActive ? 'var(--text-primary)' : isCompleted ? '#86efac' : 'var(--text-secondary)'
                    }}>
                      {node.title}
                    </span>
                  </div>

                  {/* Stars / Status Indicator */}
                  {isCompleted ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {[1, 2, 3].map(s => {
                        const earned = (node.stars && node.stars >= 1) ? node.stars : 1;
                        const isFilled = s <= earned;
                        return (
                          <Star
                            key={s}
                            size={9}
                            fill={isFilled ? '#f59e0b' : 'rgba(255,255,255,0.12)'}
                            color={isFilled ? '#f59e0b' : 'rgba(255,255,255,0.25)'}
                          />
                        );
                      })}
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        color: (node.stars || 1) === 3 ? '#f59e0b' : '#86efac',
                        marginLeft: '2px'
                      }}>
                        {node.stars || 1}/3★
                      </span>
                    </div>
                  ) : isActive ? (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      color: isBranch ? '#ec4899' : isBoss ? '#f59e0b' : currentTheme.accent,
                      letterSpacing: '0.04em'
                    }}>
                      ▶ READY
                    </span>
                  ) : (
                    <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                      Locked
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NODE BRIEFING & START MODAL */}
      {selectedNodePreview && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            {/* Modal Header with Thematic Emoji Avatar */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {resolveNodeEmoji(selectedNodePreview)}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-base)',
                    color: selectedNodePreview.type === 'boss_capstone'
                      ? '#d69e2e'
                      : selectedNodePreview.branchType === 'side_quest'
                      ? '#ec4899'
                      : selectedNodePreview.type === 'review_ambush'
                      ? '#ef4444'
                      : currentTheme.accent
                  }}>
                    {selectedNodePreview.type === 'boss_capstone'
                      ? '👑 Checkpoint Boss Battle'
                      : selectedNodePreview.branchType === 'side_quest'
                      ? '💎 Bonus Side Branch (+50 XP)'
                      : selectedNodePreview.type === 'review_ambush'
                      ? '⚡ Spaced Ambush Checkpoint'
                      : 'Milestone Lesson'}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    HSK {selectedNodePreview.hskLevel}
                  </span>
                  {selectedNodePreview.status === 'completed' && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      padding: '2px 7px',
                      borderRadius: '8px'
                    }}>
                      {[1, 2, 3].map(s => {
                        const earned = (selectedNodePreview.stars && selectedNodePreview.stars >= 1) ? selectedNodePreview.stars : 1;
                        const isFilled = s <= earned;
                        return (
                          <Star
                            key={s}
                            size={11}
                            fill={isFilled ? '#f59e0b' : 'none'}
                            color={isFilled ? '#f59e0b' : 'var(--border-strong)'}
                          />
                        );
                      })}
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', marginLeft: '2px' }}>
                        {selectedNodePreview.stars || 1}/3 Stars
                      </span>
                      {selectedNodePreview.score != null && (
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '3px' }}>
                          ({selectedNodePreview.score}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <h3 style={{ margin: '8px 0 0 0', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedNodePreview.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedNodePreview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '20px',
                  padding: '4px',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {selectedNodePreview.description}
            </p>

            {/* Target Vocabulary Chips */}
            {selectedNodePreview.targetVocabulary && selectedNodePreview.targetVocabulary.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  Target Vocabulary ({selectedNodePreview.targetVocabulary.length})
                </span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {selectedNodePreview.targetVocabulary.map(v => (
                    <span
                      key={v}
                      style={{
                        fontSize: '13px',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                        fontFamily: 'var(--font-serif-zh)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 8-Stage Exercise Routine Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              padding: '8px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: 'var(--accent-indigo)'
            }}>
              <Zap size={14} />
              <span>
                {selectedNodePreview.exercises && selectedNodePreview.exercises.length >= 6
                  ? `Comprehensive ${selectedNodePreview.exercises.length}-Stage Adaptive Routine Ready`
                  : '8-Stage Tailored Adaptive Routine (Generated On-Demand)'}
              </span>
            </div>

            {/* Status & Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
              <button
                onClick={() => setSelectedNodePreview(null)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '12px', borderRadius: '12px' }}
              >
                Close
              </button>
              {selectedNodePreview.status !== 'locked' ? (
                <button
                  onClick={() => handleLaunchNode(selectedNodePreview)}
                  style={{
                    flex: 2,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: '#22c55e',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 0 #15803d, 0 6px 16px rgba(34, 197, 94, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Play size={16} fill="white" /> {selectedNodePreview.status === 'completed' ? 'Replay Lesson' : 'Start Lesson'}
                </button>
              ) : (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{ flex: 2, padding: '12px', borderRadius: '12px', opacity: 0.6, cursor: 'not-allowed', gap: '6px' }}
                >
                  <Lock size={14} /> Node Locked
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
