import React, { useState, useEffect } from 'react';
import { X, Sparkles, Compass, AlertTriangle, CheckCircle2, Loader2, Zap } from 'lucide-react';
import type { Course } from '../../types/Course';
import { SyllabusGenerator } from '../../services/syllabusGenerator';

interface SyllabusGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseCreated: (course: Course) => Promise<void> | void;
  knownWeaknesses?: string[];
  apiKey?: string;
}

const GENERATION_STEPS = [
  'Summoning story architect & analyzing premise...',
  'Composing bespoke 3-act narrative arc & witty title...',
  'Architecting branching DAG skill tree & side quests...',
  'Calibrating vocabulary, tone drills & IRT parameters...',
  'Finalizing campaign map...'
];

export const SyllabusGeneratorModal: React.FC<SyllabusGeneratorModalProps> = ({
  isOpen,
  onClose,
  onCourseCreated,
  knownWeaknesses = [],
  apiKey
}) => {
  const [goal, setGoal] = useState('2-Week Trip to Taipei (Transit, Night Markets & Culture)');
  const [targetHskLevel, setTargetHskLevel] = useState('2');
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Cycle through live narrative synthesis steps while generating
  useEffect(() => {
    if (!isGenerating) {
      setStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStepIndex(prev => (prev + 1) % GENERATION_STEPS.length);
    }, 2200);
    return () => clearInterval(interval);
  }, [isGenerating]);

  if (!isOpen) return null;

  const handleInstantOffline = async () => {
    if (!goal.trim()) return;
    setIsGenerating(true);
    setErrorMsg('');
    try {
      const fallback = SyllabusGenerator.generateOfflineCampaign(goal.trim(), targetHskLevel, knownWeaknesses);
      await onCourseCreated(fallback);
      onClose();
    } catch (err) {
      console.error('Failed to create instant campaign:', err);
      setErrorMsg('Failed to create instant campaign.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isGenerating) return;

    setIsGenerating(true);
    setErrorMsg('');

    try {
      const effectiveApiKey = apiKey || localStorage.getItem('gemini_api_key') || (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
      const course = await SyllabusGenerator.generateCampaign({
        goal: goal.trim(),
        targetHskLevel,
        knownWeaknesses,
        apiKey: effectiveApiKey
      });

      await onCourseCreated(course);
      onClose();
    } catch (err: any) {
      console.error('Failed to generate course syllabus:', err);
      try {
        const fallback = SyllabusGenerator.generateOfflineCampaign(goal.trim(), targetHskLevel, knownWeaknesses);
        await onCourseCreated(fallback);
        onClose();
      } catch (fallbackErr) {
        console.error('Failed to apply fallback campaign:', fallbackErr);
        setErrorMsg('Error generating course campaign. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleGoals = [
    '2-Week Trip to Taipei (Transit, Night Markets & Culture)',
    'Ordering Dim Sum & Cantonese Delicacies in Guangzhou',
    'Chengdu Panda Base & Spicy Sichuan Hotpot Adventure',
    'Tech Startup & Business Meetings in Shenzhen / Shanghai',
    'Survival Medical & Hospital Chinese'
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 110,
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Compass size={18} color="var(--accent-indigo)" />
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                Generate Course Campaign
              </h3>
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              Synthesize an interconnected multi-week campaign map with custom biomes, Boss Capstones, and IRT pedagogy.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Your Target Destination or Immersion Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. 2-week trip to Taipei, Hospital visit, Renting an apartment..."
              className="form-input"
              style={{ width: '100%', fontSize: '14px' }}
              required
              disabled={isGenerating}
            />
          </div>

          {/* Quick Idea Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {sampleGoals.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setGoal(sample)}
                className="btn btn-secondary"
                style={{ fontSize: '11px', padding: '3px 8px' }}
                disabled={isGenerating}
              >
                {sample.split('(')[0]}
              </button>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
              Target Proficiency Level
            </label>
            <select
              value={targetHskLevel}
              onChange={(e) => setTargetHskLevel(e.target.value)}
              className="form-select"
              style={{ width: '100%', fontSize: '14px' }}
              disabled={isGenerating}
            >
              <option value="1">HSK 1 - Beginner (150 Words)</option>
              <option value="2">HSK 2 - Elementary (300 Words)</option>
              <option value="3">HSK 3 - Intermediate (600 Words)</option>
              <option value="4">HSK 4 - Upper-Intermediate (1,200 Words)</option>
              <option value="5">HSK 5 - Advanced (2,500 Words)</option>
            </select>
          </div>

          {/* Known Weakness Cross-Pollination Warning */}
          {knownWeaknesses.length > 0 && !isGenerating && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(214, 158, 46, 0.08)',
              border: '1px solid rgba(214, 158, 46, 0.25)',
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              🧠 <strong>Cross-Pollination Active:</strong> The generator will automatically weave drills for your flagged weaknesses ({knownWeaknesses.slice(0, 2).join(', ')}) into the early chapters.
            </div>
          )}

          {/* ACTIVE SYNTHESIS PROGRESS CARD */}
          {isGenerating && (
            <div style={{
              padding: '14px 16px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="spin" color="var(--accent-indigo)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    AI Game Master at Work...
                  </span>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                  Step {stepIndex + 1} of {GENERATION_STEPS.length}
                </span>
              </div>

              {/* Step label */}
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                &ldquo;{GENERATION_STEPS[stepIndex]}&rdquo;
              </div>

              {/* Progress Bar */}
              <div style={{
                height: '4px',
                width: '100%',
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: '2px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${((stepIndex + 1) / GENERATION_STEPS.length) * 100}%`,
                  backgroundColor: 'var(--accent-indigo)',
                  borderRadius: '2px',
                  transition: 'width 0.4s ease'
                }} />
              </div>

              {/* Instant Synthesis Skip Option */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={handleInstantOffline}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline'
                  }}
                  title="Skip Gemini wait time and use instant high-speed generative synthesis"
                >
                  <Zap size={11} color="var(--accent-bamboo)" />
                  Don&apos;t want to wait? Click for Instant Synthesis (100ms)
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: '12px', color: '#e53e3e' }}>
              {errorMsg}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px' }}
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, padding: '10px', gap: '6px' }}
              disabled={isGenerating || !goal.trim()}
            >
              <Sparkles size={15} />
              {isGenerating ? 'Synthesizing Course...' : 'Generate Odyssey'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
