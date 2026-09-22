import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Trophy, Zap, Shield, AlertTriangle, Star, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';
import type { CourseNode, OdysseyExercise, DiagnosticReport } from '../../types/Course';
import { odysseyAudio } from '../../services/odysseyAudio';
import { AdaptiveEngine, type RemedialConcept } from '../../services/adaptiveEngine';

// Exercise Components
import { BlindDictation } from './exercises/BlindDictation';
import { MinimalPairTriage } from './exercises/MinimalPairTriage';
import { PitchShadowing } from './exercises/PitchShadowing';
import { RoleplayDialogue } from './exercises/RoleplayDialogue';
import { SentenceBuilderWithDistractors } from './exercises/SentenceBuilderWithDistractors';
import { StrokeOrderQuiz } from './exercises/StrokeOrderQuiz';
import { SrsAmbush } from './exercises/SrsAmbush';
import { SpeedReadingSprint } from './exercises/SpeedReadingSprint';
import { MultipleChoiceOdyssey } from './exercises/MultipleChoiceOdyssey';
import { VocabIntroOdyssey } from './exercises/VocabIntroOdyssey';

interface AdaptiveLessonEngineProps {
  node: CourseNode;
  onComplete: (score: number, stars: number, masteryUpdates: Record<string, number>, identifiedWeaknesses: string[]) => void;
  onClose: () => void;
}

export const AdaptiveLessonEngine: React.FC<AdaptiveLessonEngineProps> = ({ node, onComplete, onClose }) => {
  // Exercise queue (supports dynamic remedial insertions and Duolingo-style mistake reviews)
  const [exerciseQueue, setExerciseQueue] = useState<OdysseyExercise[]>([...node.exercises]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCurrentStepPassed, setIsCurrentStepPassed] = useState(false);
  const [isCurrentStepFailed, setIsCurrentStepFailed] = useState(false);
  const [mistakeExplanation, setMistakeExplanation] = useState('');

  // Duolingo-style Mistake Review Cycle
  const [reviewQueue, setReviewQueue] = useState<OdysseyExercise[]>([]);
  const [isReviewIntermission, setIsReviewIntermission] = useState(false);
  const [isInReviewMode, setIsInReviewMode] = useState(false);

  // Metacognitive Gamification State
  const [healthDiamonds, setHealthDiamonds] = useState(3);
  const [comboCount, setComboCount] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [identifiedWeaknesses, setIdentifiedWeaknesses] = useState<string[]>([]);
  const [masteryGains, setMasteryGains] = useState<Record<string, number>>({});

  // Performance timings
  const lessonStartTimeRef = useRef<number>(Date.now());
  const stepStartTimeRef = useRef<number>(Date.now());
  const [isDiagnosticFinished, setIsDiagnosticFinished] = useState(false);

  const activeExercise = exerciseQueue[currentIndex];
  const totalExercises = exerciseQueue.length;

  useEffect(() => {
    stepStartTimeRef.current = Date.now();
    setIsCurrentStepPassed(false);
    setIsCurrentStepFailed(false);
    setMistakeExplanation('');
  }, [currentIndex, isInReviewMode]);

  const handleExerciseSuccess = () => {
    setIsCurrentStepPassed(true);
    setIsCurrentStepFailed(false);
    setTotalCorrect(prev => prev + 1);
    setTotalAttempts(prev => prev + 1);

    const newCombo = comboCount + 1;
    setComboCount(newCombo);
    if (newCombo > maxCombo) setMaxCombo(newCombo);

    // Update mastery for target vocabulary in this node
    if (activeExercise?.targetConcept) {
      setMasteryGains(prev => ({
        ...prev,
        [activeExercise.targetConcept!]: 95
      }));
    } else {
      node.targetVocabulary.forEach(word => {
        setMasteryGains(prev => ({
          ...prev,
          [word]: 90
        }));
      });
    }
  };

  const handleExerciseError = (mistakeDescription: string) => {
    setComboCount(0);
    setTotalAttempts(prev => prev + 1);

    // Deduct Health Diamond (soft health: doesn't terminate run; influences star rating)
    setHealthDiamonds(prev => Math.max(0, prev - 1));

    // Show non-blocking Duolingo error continuation banner
    setIsCurrentStepFailed(true);
    setIsCurrentStepPassed(false);
    setMistakeExplanation(mistakeDescription);

    // Record weakness
    if (!identifiedWeaknesses.includes(mistakeDescription)) {
      setIdentifiedWeaknesses(prev => [...prev, mistakeDescription]);
    }

    // Add to Duolingo-style mistake review queue if not already queued
    if (activeExercise) {
      setReviewQueue(prev => {
        if (!prev.some(ex => ex.id === activeExercise.id)) {
          return [...prev, { ...activeExercise, isRemedial: true }];
        }
        return prev;
      });
    }
  };

  const handleNextStep = () => {
    if (currentIndex < exerciseQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsCurrentStepPassed(false);
      setIsCurrentStepFailed(false);
    } else {
      // Reached the end of current exercise queue!
      if (reviewQueue.length > 0) {
        // Transition to Duolingo-style review intermission
        setIsReviewIntermission(true);
      } else {
        // All items cleared!
        odysseyAudio.playVictoryFanfare();
        setIsDiagnosticFinished(true);
      }
    }
  };

  const handleStartMistakeReview = () => {
    setExerciseQueue([...reviewQueue]);
    setReviewQueue([]);
    setCurrentIndex(0);
    setIsInReviewMode(true);
    setIsReviewIntermission(false);
    setIsCurrentStepPassed(false);
    setIsCurrentStepFailed(false);
  };

  const calculateFinalStats = (): DiagnosticReport => {
    const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 100;
    
    // Rigorous star calibration:
    // 3 Stars: 3 health diamonds remaining (flawless, 0 mistakes) AND accuracy >= 85%
    // 2 Stars: 1-2 health diamonds remaining AND accuracy >= 60%
    // 1 Star: 0 health diamonds or accuracy < 60% (survived mistake review)
    let stars = 1;
    if (healthDiamonds === 3 && accuracy >= 85) {
      stars = 3;
    } else if (healthDiamonds >= 1 && accuracy >= 60) {
      stars = 2;
    } else {
      stars = 1;
    }

    const baseScore = Math.round((accuracy * 0.7) + (maxCombo * 5));
    const xp = baseScore * 10 * stars;

    // Calculate legitimate reading speed CPM from actual characters read and elapsed time
    const elapsedMinutes = Math.max(0.08, (Date.now() - lessonStartTimeRef.current) / 60000);
    const totalChars = exerciseQueue.reduce((acc, ex) => {
      let len = 0;
      if (ex.payload) {
        const p = ex.payload as any;
        if (typeof p.sentence === 'string') len += p.sentence.replace(/[^\u4e00-\u9fa5]/g, '').length;
        if (typeof p.promptAudioText === 'string') len += p.promptAudioText.replace(/[^\u4e00-\u9fa5]/g, '').length;
        if (typeof p.targetCharacter === 'string') len += p.targetCharacter.length;
        if (Array.isArray(p.words)) {
          p.words.forEach((w: any) => {
            if (w.character) len += String(w.character).replace(/[^\u4e00-\u9fa5]/g, '').length;
          });
        }
        if (Array.isArray(p.dialogueTurns)) {
          p.dialogueTurns.forEach((t: any) => {
            if (t.speakerZh) len += String(t.speakerZh).replace(/[^\u4e00-\u9fa5]/g, '').length;
          });
        }
      }
      return acc + Math.max(len, 6);
    }, 0);
    const calculatedCPM = Math.min(600, Math.max(45, Math.round(totalChars / elapsedMinutes)));

    return {
      accuracyPercentage: accuracy,
      exercisesCompleted: totalCorrect,
      heartsRemaining: healthDiamonds,
      comboStreakMax: maxCombo,
      readingSpeedCPM: calculatedCPM,
      weaknessesIdentified: identifiedWeaknesses,
      masteryGains,
      xpEarned: xp,
      stars
    };
  };

  // DIAGNOSTIC COMPLETION SCREEN
  if (isDiagnosticFinished) {
    const report = calculateFinalStats();

    return (
      <div style={{
        maxWidth: '560px',
        margin: '20px auto',
        padding: '36px 28px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px'
      }}>
        {/* Trophy / Crest Badge */}
        <div style={{
          width: '76px',
          height: '76px',
          borderRadius: '50%',
          backgroundColor: 'rgba(56, 161, 105, 0.1)',
          border: '2px solid rgba(56, 161, 105, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38a169'
        }}>
          <Trophy size={40} />
        </div>

        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Node Conquered: {node.title}
          </h2>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {node.description}
          </p>
        </div>

        {/* Stars Display */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {[1, 2, 3].map(starNum => (
            <Star
              key={starNum}
              size={28}
              fill={starNum <= report.stars ? '#d69e2e' : 'none'}
              color={starNum <= report.stars ? '#d69e2e' : 'var(--border-strong)'}
            />
          ))}
        </div>

        {/* Diagnostic Metrics Matrix */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
          width: '100%'
        }}>
          <div style={{ padding: '14px 10px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Accuracy</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>
              {report.accuracyPercentage}%
            </div>
          </div>

          <div style={{ padding: '14px 10px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Max Combo</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--accent-indigo)', marginTop: '4px' }}>
              {report.comboStreakMax}x
            </div>
          </div>

          <div style={{ padding: '14px 10px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>XP Earned</div>
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#38a169', marginTop: '4px' }}>
              +{report.xpEarned}
            </div>
          </div>
        </div>

        {/* Weakness Diagnostic & Adaptive Insight */}
        {report.weaknessesIdentified.length > 0 ? (
          <div style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(229, 62, 62, 0.06)',
            border: '1px solid rgba(229, 62, 62, 0.2)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#e53e3e', marginBottom: '4px' }}>
              <AlertTriangle size={14} /> Adaptive Course Memory Flagged Weakness:
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              {report.weaknessesIdentified.slice(0, 2).map((w, idx) => (
                <li key={idx}>{w}</li>
              ))}
            </ul>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
              ℹ️ The Odyssey engine has woven this into your future SRS Ambush queue.
            </div>
          </div>
        ) : (
          <div style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(56, 161, 105, 0.08)',
            border: '1px solid rgba(56, 161, 105, 0.2)',
            fontSize: '13px',
            color: '#38a169'
          }}>
            ✨ <strong>Flawless automaticity!</strong> No phonetic or grammatical hesitations detected.
          </div>
        )}

        <button
          type="button"
          onClick={() => onComplete(report.accuracyPercentage, report.stars, report.masteryGains, report.weaknessesIdentified)}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px' }}
        >
          Collect Rewards &amp; Return to Map
        </button>
      </div>
    );
  }

  // DUOLINGO-STYLE MISTAKE REVIEW INTERMISSION SCREEN
  if (isReviewIntermission) {
    return (
      <div style={{
        maxWidth: '540px',
        margin: '20px auto',
        padding: '36px 28px',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '20px',
        boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: 'rgba(99, 102, 241, 0.12)',
          border: '2px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-indigo)'
        }}>
          <RefreshCw size={34} />
        </div>

        <div>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-indigo)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Target Practice Round
          </span>
          <h2 style={{ margin: '6px 0 0 0', fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Let's Review the Ones You Missed!
          </h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Great effort so far! Revisit the {reviewQueue.length} exercise(s) you hesitated on to lock them into long-term memory.
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartMistakeReview}
          className="btn btn-primary"
          style={{ width: '100%', padding: '14px', fontSize: '15px', gap: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <span>Start Review Round ({reviewQueue.length})</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ACTIVE EXERCISE HUD
  const progressPercent = ((currentIndex + 1) / totalExercises) * 100;

  return (
    <div style={{
      maxWidth: '680px',
      margin: '0 auto',
      borderRadius: 'var(--radius-md)',
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Top HUD: Health Diamonds, Combo, Progress Bar, Close */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {node.title}
              </h3>
              {isInReviewMode && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(214, 158, 46, 0.15)',
                  color: '#d69e2e',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <RefreshCw size={10} /> REVIEW ROUND
                </span>
              )}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Exercise {currentIndex + 1} of {totalExercises} {activeExercise.isRemedial && '• ⚡ Focused Recall'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Combo Multiplier Badge */}
            {comboCount > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-indigo)',
                fontSize: '11px',
                fontWeight: 700
              }}>
                <Zap size={12} fill="currentColor" /> {comboCount}x COMBO
              </div>
            )}

            {/* Geometric Health Diamonds (45 degree rotation) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} title={`${healthDiamonds} Health Diamonds Remaining`}>
              {[1, 2, 3].map(diamondNum => {
                const isLost = diamondNum > healthDiamonds;
                return (
                  <div
                    key={diamondNum}
                    style={{
                      width: '12px',
                      height: '12px',
                      transform: 'rotate(45deg)',
                      backgroundColor: isLost ? 'var(--border-strong)' : '#e53e3e',
                      transition: 'background-color 0.3s ease',
                      boxShadow: isLost ? 'none' : '0 0 6px rgba(229, 62, 62, 0.4)'
                    }}
                  />
                );
              })}
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--text-muted)' }}
              title="Exit to Campaign Map"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Linear Progress Indicator */}
        <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: isInReviewMode ? '#d69e2e' : activeExercise.isRemedial ? '#d69e2e' : 'var(--accent-indigo)',
              transition: 'width 0.3s ease'
            }}
          />
        </div>
      </div>

      {/* Exercise Content Area */}
      <div style={{ padding: '28px 24px', minHeight: '380px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <span style={{
            display: 'inline-block',
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            padding: '3px 8px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isInReviewMode ? 'rgba(214, 158, 46, 0.15)' : activeExercise.isRemedial ? 'rgba(214, 158, 46, 0.15)' : 'var(--bg-base)',
            color: isInReviewMode ? '#d69e2e' : activeExercise.isRemedial ? '#d69e2e' : 'var(--accent-indigo)',
            marginBottom: '6px'
          }}>
            {isInReviewMode ? '🔁 MISTAKE REVIEW' : activeExercise.type.replace(/_/g, ' ')}
          </span>
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
            {activeExercise.title}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
            {activeExercise.instructions}
          </p>
        </div>

        {/* Dynamic Exercise Component Dispatch with Component Lifecycle Keys */}
        {activeExercise.type === 'blind_dictation' && (
          <BlindDictation
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'minimal_pair_triage' && (
          <MinimalPairTriage
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'pitch_shadowing' && (
          <PitchShadowing
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'roleplay_dialogue' && (
          <RoleplayDialogue
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'sentence_builder_distractors' && (
          <SentenceBuilderWithDistractors
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'stroke_order_quiz' && (
          <StrokeOrderQuiz
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'srs_ambush' && (
          <SrsAmbush
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'speed_reading_sprint' && (
          <SpeedReadingSprint
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'multiple_choice' && (
          <MultipleChoiceOdyssey
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}

        {activeExercise.type === 'vocab_intro' && (
          <VocabIntroOdyssey
            key={`${activeExercise.id}-${currentIndex}-${isInReviewMode ? 'rev' : 'main'}`}
            payload={activeExercise.payload as any}
            onSuccess={handleExerciseSuccess}
            onError={handleExerciseError}
          />
        )}
      </div>

      {/* Sticky Bottom Progression Banner (Success) */}
      {isCurrentStepPassed && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'rgba(56, 161, 105, 0.1)',
          borderTop: '1px solid rgba(56, 161, 105, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38a169' }}>
            <CheckCircle size={20} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Stage Cleared!</div>
              <div style={{ fontSize: '11px' }}>Advancing down the Odyssey path.</div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="btn btn-bamboo"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 20px', fontSize: '14px' }}
          >
            <span>Continue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Sticky Bottom Progression Banner (Duolingo-style Error Feedback & Continuation) */}
      {isCurrentStepFailed && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'rgba(229, 62, 62, 0.12)',
          borderTop: '1px solid rgba(229, 62, 62, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: '#e53e3e', flex: 1 }}>
            <AlertTriangle size={20} style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>Not quite — We'll revisit this at the end!</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {mistakeExplanation || 'Take note of this concept. It has been added to your end-of-lesson review queue.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNextStep}
            className="btn btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              fontSize: '14px',
              backgroundColor: 'var(--border-strong)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-subtle)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>Continue</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
};
