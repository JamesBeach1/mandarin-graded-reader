import React, { useState } from 'react';
import type { Lesson } from '../types/Lesson';
import { getThemeIcon } from '../utils/iconMap';
import { VocabIntro } from './exercises/VocabIntro';
import { MultipleChoice } from './exercises/MultipleChoice';
import { SentenceBuilder } from './exercises/SentenceBuilder';
import { DialogueReading } from './exercises/DialogueReading';
import { X, Award, Trophy, ArrowRight } from 'lucide-react';

interface LessonEngineProps {
  lesson: Lesson;
  onLessonComplete: () => void;
  onClose: () => void;
}

export const LessonEngine: React.FC<LessonEngineProps> = ({ lesson, onLessonComplete, onClose }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStepComplete, setIsStepComplete] = useState(false);
  const [isLessonFinished, setIsLessonFinished] = useState(false);

  const totalSteps = lesson.exercises.length;
  const activeExercise = lesson.exercises[currentStepIndex];
  const ThemeIcon = getThemeIcon(lesson.themeTag);

  const handleExerciseComplete = () => {
    setIsStepComplete(true);
  };

  const handleNextStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setIsStepComplete(false);
    } else {
      setIsLessonFinished(true);
    }
  };

  const progressPercent = (currentStepIndex / totalSteps) * 100;

  if (isLessonFinished) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-card)',
        maxWidth: '500px',
        margin: '40px auto',
        gap: '20px'
      }}>
        <style>{`
          @keyframes float-trophy {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          @keyframes slide-up {
            from { transform: translateY(15px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'var(--accent-glow)',
          color: 'var(--accent-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'float-trophy 2s infinite ease-in-out'
        }}>
          <Trophy size={48} />
        </div>
        
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
          Lesson Completed!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
          Great job! You have completed the <strong>{lesson.title}</strong> module.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          width: '100%',
          marginTop: '10px'
        }}>
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>HSK Level</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--accent-color)' }}>HSK {lesson.hskLevel}</div>
          </div>
          <div style={{ background: 'var(--bg-primary)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Exercises Done</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#38a169' }}>{totalSteps} / {totalSteps}</div>
          </div>
        </div>

        <button
          onClick={onLessonComplete}
          className="generate-button"
          style={{ width: '100%', padding: '14px', marginTop: '10px' }}
        >
          Finish Lesson
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-card)',
      borderRadius: '16px',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-card)',
      width: '100%',
      maxWidth: '650px',
      margin: '20px auto',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{`
        @keyframes float-trophy {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes slide-up {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      {/* Header section */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--bg-primary)',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--accent-glow)',
            color: 'var(--accent-color)'
          }}>
            <ThemeIcon size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)', margin: 0 }}>
              {lesson.title}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 'bold' }}>
              Exercise {currentStepIndex + 1} of {totalSteps}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '50%',
            color: 'var(--text-muted)'
          }}
          title="Exit Lesson"
        >
          <X size={20} />
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', position: 'relative' }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, var(--accent-color) 0%, #3182ce 100%)',
          transition: 'width 0.4s ease-out'
        }} />
      </div>

      {/* Active Exercise Content Area */}
      <div style={{ padding: '24px 20px', minHeight: '340px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <span style={{
            background: 'var(--bg-primary)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            color: 'var(--accent-color)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {activeExercise.type.replace('_', ' ')}
          </span>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', margin: '8px 0 4px 0' }}>
            {activeExercise.title}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            {activeExercise.instructions}
          </p>
        </div>

        {/* Dynamically render exercise based on type */}
        {activeExercise.type === 'vocab_intro' && (
          <VocabIntro
            payload={activeExercise.payload as any}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeExercise.type === 'multiple_choice' && (
          <MultipleChoice
            payload={activeExercise.payload as any}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeExercise.type === 'sentence_builder' && (
          <SentenceBuilder
            payload={activeExercise.payload as any}
            onComplete={handleExerciseComplete}
          />
        )}
        {activeExercise.type === 'dialogue_reading' && (
          <DialogueReading
            payload={activeExercise.payload as any}
            onComplete={handleExerciseComplete}
          />
        )}
      </div>

      {/* Continue Footer Banner */}
      {isStepComplete && (
        <div style={{
          background: 'rgba(56, 161, 105, 0.1)',
          borderTop: '1px solid rgba(56, 161, 105, 0.2)',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'slide-up 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2f855a' }}>
            <Award size={24} />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Awesome Work!</div>
              <div style={{ fontSize: '12px' }}>You successfully completed this stage.</div>
            </div>
          </div>
          <button
            onClick={handleNextStep}
            className="generate-button"
            style={{
              background: '#38a169',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              boxShadow: '0 4px 10px rgba(56, 161, 105, 0.3)'
            }}
          >
            <span>Continue</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
