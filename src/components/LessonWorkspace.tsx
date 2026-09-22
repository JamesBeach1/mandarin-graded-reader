import React, { useState, useEffect } from 'react';
import type { Lesson } from '../types/Lesson';
import type { Course, CourseNode } from '../types/Course';
import { LessonEngine } from './LessonEngine';
import { CampaignMap } from './odyssey/CampaignMap';
import { AdaptiveLessonEngine } from './odyssey/AdaptiveLessonEngine';
import { SyllabusGeneratorModal } from './odyssey/SyllabusGeneratorModal';
import { HSK_CURRICULUM, SCQF_HIGHER_MANDARIN } from '../services/curriculum';
import {
  getAllCourses,
  getCourse,
  saveCourse,
  getActiveCourseId,
  setActiveCourseId,
  updateNodeProgress,
  createDefaultTaipeiCampaign
} from '../services/courseStore';
import { SyllabusGenerator } from '../services/syllabusGenerator';
import { LessonRoutineGenerator } from '../services/lessonRoutineGenerator';
import { PinyinImeDrillModal } from './PinyinImeDrillModal';
import { Sparkles, GraduationCap, Award, BookCheck, Compass, MapPin, Keyboard } from 'lucide-react';

interface LessonWorkspaceProps {
  activeLesson: Lesson | null;
  setActiveLesson: (lesson: Lesson | null) => void;
  lessonTopic: string;
  setLessonTopic: (topic: string) => void;
  lessonHskLevel: string;
  setLessonHskLevel: (level: string) => void;
  loadingLesson: boolean;
  onGenerateLesson: (e: React.FormEvent) => void;
  apiKey: string;
  onOpenDiagnosticTest: () => void;
}

export const LessonWorkspace: React.FC<LessonWorkspaceProps> = ({
  activeLesson,
  setActiveLesson,
  lessonTopic,
  setLessonTopic,
  lessonHskLevel,
  setLessonHskLevel,
  loadingLesson,
  onGenerateLesson,
  apiKey,
  onOpenDiagnosticTest
}) => {
  // Navigation & Sub-Workspace Modes
  const [workspaceMode, setWorkspaceMode] = useState<'campaign' | 'quick_practice' | 'curriculum'>('campaign');

  // Odyssey Campaign Engine State
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeOdysseyNode, setActiveOdysseyNode] = useState<CourseNode | null>(null);
  const [isSyllabusModalOpen, setIsSyllabusModalOpen] = useState(false);
  const [isGeneratingRoutine, setIsGeneratingRoutine] = useState(false);
  const [generatingNodeTitle, setGeneratingNodeTitle] = useState('');
  const [isImeDrillOpen, setIsImeDrillOpen] = useState(false);

  // Hydrate courses from IndexedDB
  useEffect(() => {
    getAllCourses().then(loadedCourses => {
      const normalized = loadedCourses.map(c => SyllabusGenerator.normalizeCourseDAG(c));
      setCourses(normalized);
      const savedActiveId = getActiveCourseId();
      const current = normalized.find(c => c.id === savedActiveId) || normalized[0] || SyllabusGenerator.normalizeCourseDAG(createDefaultTaipeiCampaign());
      setActiveCourse(current);
    }).catch(() => {
      const fallback = SyllabusGenerator.normalizeCourseDAG(createDefaultTaipeiCampaign());
      setCourses([fallback]);
      setActiveCourse(fallback);
    });
  }, []);

  const handleSwitchCourse = async (courseId: string) => {
    setActiveCourseId(courseId);
    const target = courses.find(c => c.id === courseId);
    if (target) {
      setActiveCourse(SyllabusGenerator.normalizeCourseDAG(target));
      setActiveOdysseyNode(null);
    }
  };

  const handleCourseCreated = async (newCourse: Course) => {
    const normalized = SyllabusGenerator.normalizeCourseDAG(newCourse);
    setActiveCourseId(normalized.id);
    setCourses(prev => [normalized, ...prev.filter(c => c.id !== normalized.id)]);
    setActiveCourse(normalized);
    setActiveOdysseyNode(null);
    setWorkspaceMode('campaign');

    try {
      await saveCourse(normalized);
    } catch (err) {
      console.error('Failed to persist course to IndexedDB:', err);
    }
  };

  const handleSelectOdysseyNode = async (node: CourseNode) => {
    if (!activeCourse) return;

    if (node.exercises && node.exercises.length >= 6) {
      setActiveOdysseyNode(node);
      return;
    }

    setIsGeneratingRoutine(true);
    setGeneratingNodeTitle(node.title);

    try {
      const routine = await LessonRoutineGenerator.getOrGenerateRoutine(activeCourse, node, apiKey);
      const updatedNode = { ...node, exercises: routine };
      setActiveOdysseyNode(updatedNode);
    } catch (err) {
      console.error('Failed to generate on-demand routine:', err);
      const chapter = activeCourse.chapters.find(ch => ch.id === node.chapterId) || activeCourse.chapters[0];
      const fallbackRoutine = LessonRoutineGenerator.generateOfflineRoutine(node, chapter, activeCourse);
      const updatedNode = { ...node, exercises: fallbackRoutine };
      setActiveOdysseyNode(updatedNode);
    } finally {
      setIsGeneratingRoutine(false);
      setGeneratingNodeTitle('');
    }
  };

  const handleCompleteOdysseyNode = async (
    score: number,
    stars: number,
    masteryUpdates: Record<string, number>,
    weaknesses: string[]
  ) => {
    if (!activeCourse || !activeOdysseyNode) return;

    try {
      const updatedCourse = await updateNodeProgress(
        activeCourse.id,
        activeOdysseyNode.id,
        score,
        stars,
        masteryUpdates,
        weaknesses
      );

      setActiveCourse(updatedCourse);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setActiveOdysseyNode(null);
    } catch (err) {
      console.error('Failed to update node progress:', err);
      setActiveOdysseyNode(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* MODE SELECTOR HEADER BAR */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '16px 20px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            color: 'var(--accent-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Structured Learning Subsystem
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Adaptive Odyssey Campaign Map &bull; Item Response Theory (IRT) Pedagogy
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-base)',
          padding: '4px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('campaign');
              setActiveOdysseyNode(null);
              setActiveLesson(null);
            }}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: workspaceMode === 'campaign' ? 'var(--border-strong)' : 'transparent',
              color: workspaceMode === 'campaign' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Compass size={13} /> Campaign Odyssey
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('quick_practice');
              setActiveOdysseyNode(null);
            }}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: workspaceMode === 'quick_practice' ? 'var(--border-strong)' : 'transparent',
              color: workspaceMode === 'quick_practice' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} /> Quick Practice
          </button>

          <button
            type="button"
            onClick={() => {
              setWorkspaceMode('curriculum');
              setActiveOdysseyNode(null);
              setActiveLesson(null);
            }}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: workspaceMode === 'curriculum' ? 'var(--border-strong)' : 'transparent',
              color: workspaceMode === 'curriculum' ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            <GraduationCap size={13} /> Standards
          </button>

          <button
            type="button"
            onClick={() => setIsImeDrillOpen(true)}
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              color: 'var(--accent-gold)',
              transition: 'all 0.15s ease'
            }}
            title="Practice Chinese QWERTY typing and IME candidate selection (AIM-003)"
          >
            <Keyboard size={13} /> Pinyin Typing
          </button>
        </div>
      </div>

      {/* MODE 1: CAMPAIGN ODYSSEY */}
      {workspaceMode === 'campaign' && (
        <>
          {activeOdysseyNode ? (
            <AdaptiveLessonEngine
              node={activeOdysseyNode}
              onComplete={handleCompleteOdysseyNode}
              onClose={() => setActiveOdysseyNode(null)}
            />
          ) : activeCourse ? (
            <CampaignMap
              course={activeCourse}
              onSelectNode={handleSelectOdysseyNode}
              onOpenSyllabusGenerator={() => setIsSyllabusModalOpen(true)}
              allCourses={courses}
              onSwitchCourse={handleSwitchCourse}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading Odyssey Campaign Map...
            </div>
          )}
        </>
      )}

      {/* MODE 2: QUICK PRACTICE (LEGACY 4-STAGE GENERATOR) */}
      {workspaceMode === 'quick_practice' && (
        <>
          {!activeLesson ? (
            <div className="container">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 600, color: 'var(--text-main)' }}>
                    Single Session Quick Practice
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Generate an isolated 4-stage drill (Vocabulary, Quiz, Sentence Assembly, Dialogue).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onOpenDiagnosticTest}
                  className="control-button"
                  title="Calibrate your proficiency level"
                >
                  <Award size={14} /> Diagnostic Placement Test
                </button>
              </div>

              <form onSubmit={onGenerateLesson} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Lesson Topic or Scenario
                  </label>
                  <input
                    type="text"
                    value={lessonTopic}
                    onChange={(e) => setLessonTopic(e.target.value)}
                    placeholder="e.g. Ordering dim sum in Guangzhou, Airport baggage claim..."
                    className="form-input"
                    required
                    disabled={loadingLesson}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                    Target Proficiency Level
                  </label>
                  <select
                    value={lessonHskLevel}
                    onChange={(e) => setLessonHskLevel(e.target.value)}
                    className="form-select"
                    disabled={loadingLesson}
                    style={{ width: '100%' }}
                  >
                    <option value="1">HSK 1 - Beginner (150 words)</option>
                    <option value="2">HSK 2 - Elementary (300 words)</option>
                    <option value="3">HSK 3 - Intermediate (600 words)</option>
                    <option value="4">HSK 4 - Upper-Intermediate (1,200 words)</option>
                    <option value="5">HSK 5 - Advanced (2,500 words)</option>
                    <option value="6">HSK 6 - Mastery (5,000+ words)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="generate-button"
                  disabled={loadingLesson || !apiKey}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <Sparkles size={16} />
                  {loadingLesson ? 'Generating Interactive Lesson...' : 'Start Custom Lesson'}
                </button>

                {!apiKey && (
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--accent-cinnabar)' }}>
                    ⚠️ Configure your Gemini API Key in Settings to generate structured lessons.
                  </p>
                )}
              </form>
            </div>
          ) : (
            <LessonEngine
              lesson={activeLesson}
              onLessonComplete={() => {
                setActiveLesson(null);
                alert('Congratulations! Lesson completed successfully.');
              }}
              onClose={() => setActiveLesson(null)}
            />
          )}
        </>
      )}

      {/* MODE 3: CURRICULUM FRAMEWORK & DIAGNOSTIC TEST */}
      {workspaceMode === 'curriculum' && (
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-main)' }}>
                Curriculum Alignment &amp; Standards
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                Standardized progression models calibrated to international Chinese language benchmarks.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenDiagnosticTest}
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <Award size={14} /> Diagnostic Placement Test
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* HSK 3.0 Framework */}
            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <GraduationCap size={16} color="var(--accent-gold)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {HSK_CURRICULUM.name}
                </h4>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {HSK_CURRICULUM.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {HSK_CURRICULUM.levels.map(lvl => (
                  <div
                    key={lvl.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-base)',
                      fontSize: '13px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>{lvl.label}:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{lvl.grammarOverview}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* SQA Higher Mandarin / SCQF Level 6 */}
            <div style={{ padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <BookCheck size={16} color="var(--accent-bamboo)" />
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {SCQF_HIGHER_MANDARIN.name}
                </h4>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {SCQF_HIGHER_MANDARIN.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {SCQF_HIGHER_MANDARIN.levels.map(lvl => (
                  <div
                    key={lvl.id}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-base)',
                      fontSize: '13px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <strong style={{ color: 'var(--text-primary)' }}>{lvl.label}:</strong>{' '}
                    <span style={{ color: 'var(--text-secondary)' }}>{lvl.grammarOverview}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* GENERATIVE SYLLABUS MODAL */}
      <SyllabusGeneratorModal
        isOpen={isSyllabusModalOpen}
        onClose={() => setIsSyllabusModalOpen(false)}
        onCourseCreated={handleCourseCreated}
        knownWeaknesses={activeCourse?.weaknesses || []}
        apiKey={apiKey}
      />

      {/* ON-DEMAND LESSON ROUTINE SYNTHESIS OVERLAY */}
      {isGeneratingRoutine && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 120,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '460px',
            width: '100%',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            padding: '32px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-indigo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={28} />
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                On-Demand Lesson Synthesis
              </span>
              <h3 style={{ margin: '6px 0 6px 0', fontSize: '18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                Synthesizing 8-Stage Routine...
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Generating bespoke acoustic triage, blind dictation, sentence construction, and scenario roleplay for <strong>{generatingNodeTitle}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* AIM-003: Pinyin Typing Practice & IME Simulator Modal */}
      <PinyinImeDrillModal
        isOpen={isImeDrillOpen}
        onClose={() => setIsImeDrillOpen(false)}
      />
    </div>
  );
};
