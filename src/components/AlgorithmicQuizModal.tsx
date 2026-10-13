import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Volume2, RotateCcw, Shuffle, Sparkles, HelpCircle } from 'lucide-react';
import {
  AlgorithmicQuizGenerator,
  type AlgorithmicClozeQuestion,
  type AlgorithmicJigsawSentence
} from '../utils/algorithmicQuizGenerator';
import type { HanziItem } from '../types/HanziItem';
import { AzureSpeechService } from '../services/azureSpeech';
import { addCard } from '../services/srsStore';

interface AlgorithmicQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: HanziItem[];
  storyTitle: string;
}

export const AlgorithmicQuizModal: React.FC<AlgorithmicQuizModalProps> = ({
  isOpen,
  onClose,
  tokens,
  storyTitle
}) => {
  const [drillType, setDrillType] = useState<'cloze' | 'jigsaw'>('cloze');
  
  // Cloze State
  const [clozeQuestions, setClozeQuestions] = useState<AlgorithmicClozeQuestion[]>(() =>
    AlgorithmicQuizGenerator.generateClozeQuestions(tokens, 5)
  );
  const [clozeIndex, setClozeIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [clozeScore, setClozeScore] = useState(0);

  // Jigsaw State
  const fullText = tokens.map(t => t.character).join('');
  const [jigsawSentences, setJigsawSentences] = useState<AlgorithmicJigsawSentence[]>(() =>
    AlgorithmicQuizGenerator.generateJigsawSentences(fullText, 4)
  );
  const [jigsawIndex, setJigsawIndex] = useState(0);
  const [assembledChips, setAssembledChips] = useState<string[]>([]);
  const [jigsawFeedback, setJigsawFeedback] = useState<'correct' | 'incorrect' | null>(null);

  if (!isOpen) return null;

  const currentCloze = clozeQuestions[clozeIndex % (clozeQuestions.length || 1)];
  const currentJigsaw = jigsawSentences[jigsawIndex % (jigsawSentences.length || 1)];

  const handleSpeak = (text: string) => {
    AzureSpeechService.speak(text, { rate: 0.9 });
  };

  const handleSelectClozeOption = async (option: string) => {
    if (!currentCloze || selectedOption !== null) return;
    setSelectedOption(option);
    const isCorrect = option === currentCloze.targetWord;
    if (isCorrect) {
      setClozeScore(prev => prev + 1);
      handleSpeak(currentCloze.targetWord);
      // Auto-feed into local SRS queue
      await addCard({
        character: currentCloze.targetWord,
        pinyin: currentCloze.targetPinyin,
        definition: currentCloze.targetDefinition,
        exampleSentence: currentCloze.sentenceWithBlank.replace('【 ___ 】', currentCloze.targetWord)
      });
    }
  };

  const handleNextCloze = () => {
    setSelectedOption(null);
    setClozeIndex(prev => prev + 1);
  };

  const handleRegenerateCloze = () => {
    const fresh = AlgorithmicQuizGenerator.generateClozeQuestions(tokens, 5);
    setClozeQuestions(fresh);
    setClozeIndex(0);
    setSelectedOption(null);
    setClozeScore(0);
  };

  // Jigsaw Handlers
  const handleChipClick = (chip: string, chipIndex: number) => {
    if (jigsawFeedback !== null) return;
    setAssembledChips(prev => [...prev, chip]);
  };

  const handleRemoveChip = (indexToRemove: number) => {
    if (jigsawFeedback !== null) return;
    setAssembledChips(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleCheckJigsaw = () => {
    if (!currentJigsaw) return;
    const answer = assembledChips.join('');
    const target = currentJigsaw.correctOrder.join('');
    if (answer === target) {
      setJigsawFeedback('correct');
      handleSpeak(currentJigsaw.originalSentence);
    } else {
      setJigsawFeedback('incorrect');
    }
  };

  const handleNextJigsaw = () => {
    setAssembledChips([]);
    setJigsawFeedback(null);
    setJigsawIndex(prev => prev + 1);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-surface, #13171f)',
          borderRadius: 'var(--radius-lg, 12px)',
          border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-panel)'
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              ⚡ 无模型习题工坊 Algorithmic Quiz Studio (NONLLM-005)
            </h3>
            <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
              100% Client-Side Drills Synthesized from "{storyTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Drill Type Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setDrillType('cloze')}
            style={{
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: drillType === 'cloze' ? '2px solid var(--accent-bamboo)' : '2px solid transparent',
              color: drillType === 'cloze' ? 'var(--accent-bamboo)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            填空挑战 (Smart Cloze Recall)
          </button>
          <button
            onClick={() => setDrillType('jigsaw')}
            style={{
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: drillType === 'jigsaw' ? '2px solid var(--accent-bamboo)' : '2px solid transparent',
              color: drillType === 'jigsaw' ? 'var(--accent-bamboo)' : 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            连词成句 (Sentence Jigsaw)
          </button>
        </div>

        {/* Drill Body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* DRILL 1: CLOZE */}
          {drillType === 'cloze' && currentCloze && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Question {(clozeIndex % clozeQuestions.length) + 1} of {clozeQuestions.length}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                  Score: {clozeScore} / {clozeQuestions.length}
                </span>
              </div>

              {/* Cloze Sentence Box */}
              <div
                style={{
                  padding: '20px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '18px',
                  lineHeight: 1.6,
                  fontFamily: 'var(--font-serif-zh)',
                  color: 'var(--text-primary)',
                  textAlign: 'center'
                }}
              >
                {currentCloze.sentenceWithBlank}
              </div>

              {/* 4 Choices */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {currentCloze.options.map((opt, i) => {
                  const isChosen = selectedOption === opt;
                  const isRight = opt === currentCloze.targetWord;
                  let bg = 'var(--bg-panel)';
                  let border = 'var(--border-subtle)';
                  let color = 'var(--text-primary)';

                  if (selectedOption !== null) {
                    if (isRight) {
                      bg = 'rgba(74, 222, 128, 0.15)';
                      border = 'var(--accent-bamboo)';
                      color = '#4ade80';
                    } else if (isChosen) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = '#ef4444';
                      color = '#f87171';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={selectedOption !== null}
                      onClick={() => handleSelectClozeOption(opt)}
                      style={{
                        padding: '14px',
                        borderRadius: '8px',
                        backgroundColor: bg,
                        border: `1px solid ${border}`,
                        color,
                        fontSize: '16px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-serif-zh)',
                        cursor: selectedOption !== null ? 'default' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Explanation */}
              {selectedOption !== null && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    backgroundColor: selectedOption === currentCloze.targetWord ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${selectedOption === currentCloze.targetWord ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: '13px',
                    lineHeight: 1.5,
                    color: 'var(--text-secondary)'
                  }}
                >
                  <div style={{ fontWeight: 600, color: selectedOption === currentCloze.targetWord ? '#4ade80' : '#f87171', marginBottom: '4px' }}>
                    {selectedOption === currentCloze.targetWord ? '✔ 正确！Correct!' : '✘ 答错了！Incorrect.'}
                  </div>
                  <div>{currentCloze.explanation}</div>
                </div>
              )}

              {/* Footer Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <button
                  onClick={handleRegenerateCloze}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw size={13} /> 重新生成 (Shuffle)
                </button>
                {selectedOption !== null && (
                  <button onClick={handleNextCloze} className="btn btn-primary" style={{ fontSize: '13px' }}>
                    下一题 Next Question →
                  </button>
                )}
              </div>
            </>
          )}

          {/* DRILL 2: JIGSAW */}
          {drillType === 'jigsaw' && currentJigsaw && (
            <>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Puzzle {(jigsawIndex % jigsawSentences.length) + 1} of {jigsawSentences.length}: Assemble words into correct order
              </div>

              {/* Assembly Area */}
              <div
                style={{
                  minHeight: '80px',
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-panel)',
                  border: '2px dashed var(--border-subtle)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                  alignItems: 'center'
                }}
              >
                {assembledChips.length === 0 ? (
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    Tap word chips below in sequence to assemble the sentence...
                  </span>
                ) : (
                  assembledChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveChip(idx)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--accent-bamboo)',
                        color: '#000',
                        fontSize: '15px',
                        fontWeight: 600,
                        fontFamily: 'var(--font-serif-zh)',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      title="Click to remove"
                    >
                      {chip} ×
                    </button>
                  ))
                )}
              </div>

              {/* Scrambled Chips Pool */}
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Available Word Chips:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {currentJigsaw.scrambledChips.map((chip, idx) => {
                    const timesUsedInAssembled = assembledChips.filter(c => c === chip).length;
                    const timesInScrambled = currentJigsaw.scrambledChips.filter(c => c === chip).length;
                    const isExhausted = timesUsedInAssembled >= timesInScrambled;

                    return (
                      <button
                        key={idx}
                        disabled={isExhausted}
                        onClick={() => handleChipClick(chip, idx)}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '6px',
                          backgroundColor: isExhausted ? 'var(--bg-panel)' : 'var(--bg-surface)',
                          border: '1px solid var(--border-subtle)',
                          color: isExhausted ? 'var(--text-muted)' : 'var(--text-primary)',
                          fontSize: '15px',
                          fontFamily: 'var(--font-serif-zh)',
                          fontWeight: 500,
                          cursor: isExhausted ? 'default' : 'pointer',
                          opacity: isExhausted ? 0.4 : 1
                        }}
                      >
                        {chip}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Banner */}
              {jigsawFeedback && (
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: jigsawFeedback === 'correct' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${jigsawFeedback === 'correct' ? 'rgba(74, 222, 128, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    fontSize: '13px',
                    color: jigsawFeedback === 'correct' ? '#4ade80' : '#f87171',
                    fontWeight: 600
                  }}
                >
                  {jigsawFeedback === 'correct' ? '✔ 语序正确！Sentence order perfect!' : '✘ 顺序不正确，再试一次！Order is incorrect.'}
                </div>
              )}

              {/* Jigsaw Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                <button
                  onClick={() => { setAssembledChips([]); setJigsawFeedback(null); }}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px' }}
                >
                  清空 Reset
                </button>

                {jigsawFeedback === 'correct' ? (
                  <button onClick={handleNextJigsaw} className="btn btn-primary" style={{ fontSize: '13px' }}>
                    下一句 Next Sentence →
                  </button>
                ) : (
                  <button
                    disabled={assembledChips.length < currentJigsaw.correctOrder.length}
                    onClick={handleCheckJigsaw}
                    className="btn btn-primary"
                    style={{ fontSize: '13px' }}
                  >
                    验证 Check Order
                  </button>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
