import React, { useState, useEffect } from 'react';
import { Volume2, RotateCcw, Check, Sparkles, AlertCircle, Award } from 'lucide-react';
import { AzureSpeechService } from '../services/azureSpeech';

export interface AuditoryJigsawItem {
  id: string;
  targetSentence: string;
  pinyin: string;
  english: string;
  hskLevel: number;
  tokens: string[]; // Grammatically intact token chips
}

export const AUDITORY_JIGSAW_CURRICULUM: AuditoryJigsawItem[] = [
  {
    id: 'jigsaw-1',
    targetSentence: '我每天早上都在公园跑步。',
    pinyin: 'Wǒ měitiān zǎoshang dōu zài gōngyuán pǎobù.',
    english: 'I run in the park every morning.',
    hskLevel: 2,
    tokens: ['我', '每天早上', '都', '在公园', '跑步']
  },
  {
    id: 'jigsaw-2',
    targetSentence: '虽然天气很冷，但是他依然去游泳了。',
    pinyin: 'Suīrán tiānqì hěn lěng, dànshì tā yīrán qù yóuyǒng le.',
    english: 'Although the weather was very cold, he still went swimming.',
    hskLevel: 3,
    tokens: ['虽然', '天气很冷', '但是', '他依然', '去游泳了']
  },
  {
    id: 'jigsaw-3',
    targetSentence: '请你把桌子上的书拿给我。',
    pinyin: 'Qǐng nǐ bǎ zhuōzi shàng de shū ná gěi wǒ.',
    english: 'Please pass me the book on the table.',
    hskLevel: 3,
    tokens: ['请你', '把', '桌子上的书', '拿给', '我']
  },
  {
    id: 'jigsaw-4',
    targetSentence: '随着经济的发展，人们的生活越来越便利。',
    pinyin: 'Suízhe jīngjì de fāzhǎn, rénmen de shēnghuó yuèláiyuè biànlì.',
    english: 'With economic development, people\'s lives have become increasingly convenient.',
    hskLevel: 4,
    tokens: ['随着', '经济的发展', '人们的生活', '越来越', '便利']
  },
  {
    id: 'jigsaw-5',
    targetSentence: '不管遇到什么困难，我们都不能轻易放弃。',
    pinyin: 'Bùguǎn yùdào shénme kùnnan, wǒmen dōu bù néng qīngyì fàngqì.',
    english: 'No matter what difficulties we encounter, we must not give up easily.',
    hskLevel: 4,
    tokens: ['不管', '遇到什么困难', '我们', '都不能', '轻易放弃']
  },
  {
    id: 'jigsaw-6',
    targetSentence: '关于这个方案的可行性，大家进行了深入的探讨。',
    pinyin: 'Guānyú zhège fāng\'àn de kěxíngxìng, dàjiā jìnxíng le shēnrù de tàntǎo.',
    english: 'Regarding the feasibility of this proposal, everyone held in-depth discussions.',
    hskLevel: 5,
    tokens: ['关于', '这个方案的可行性', '大家', '进行了', '深入的探讨']
  }
];

export const SentenceMixingTrainer: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scrambledPool, setScrambledPool] = useState<string[]>([]);
  const [userSlots, setUserSlots] = useState<string[]>([]);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentItem = AUDITORY_JIGSAW_CURRICULUM[currentIndex];

  // Initialize and scramble tokens for current exercise
  useEffect(() => {
    loadExercise(currentIndex);
  }, [currentIndex]);

  const loadExercise = (idx: number) => {
    const item = AUDITORY_JIGSAW_CURRICULUM[idx];
    // Deterministic shuffle ensuring scrambled order differs from original
    const shuffled = [...item.tokens];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    // If accidentally same order, reverse
    if (shuffled.join('') === item.tokens.join('') && shuffled.length > 1) {
      shuffled.reverse();
    }

    setScrambledPool(shuffled);
    setUserSlots([]);
    setIsAnswerRevealed(false);
    setIsCorrect(null);

    // Play native prompt audio
    playAudio(item.targetSentence);
  };

  const playAudio = (text: string) => {
    setIsPlayingAudio(true);
    AzureSpeechService.speak(text, { rate: 0.9 }, () => {
      setIsPlayingAudio(false);
    });
  };

  const handleSelectPoolChip = (token: string, chipIndex: number) => {
    if (isAnswerRevealed) return;
    // Move from pool to slots
    setUserSlots(prev => [...prev, token]);
    setScrambledPool(prev => prev.filter((_, i) => i !== chipIndex));
  };

  const handleDeselectSlotChip = (token: string, slotIndex: number) => {
    if (isAnswerRevealed) return;
    // Move from slots back to pool
    setUserSlots(prev => prev.filter((_, i) => i !== slotIndex));
    setScrambledPool(prev => [...prev, token]);
  };

  const handleCheckOrder = () => {
    const constructed = userSlots.join('');
    const targetClean = currentItem.targetSentence.replace(/[。！？]/g, '');
    const userClean = constructed.replace(/[。！？]/g, '');

    const correct = userClean === targetClean;
    setIsCorrect(correct);
    setIsAnswerRevealed(true);

    if (correct) {
      playAudio(currentItem.targetSentence);
    }
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % AUDITORY_JIGSAW_CURRICULUM.length;
    setCurrentIndex(nextIdx);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      maxWidth: '800px',
      margin: '0 auto',
      width: '100%'
    }}>
      {/* Exercise Card */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent-gold)' }}>
              🎧 Auditory Jigsaw Drill (ALS-008)
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', color: 'var(--text-primary)' }}>
              Sentence Reconstruction
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-panel)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}>
              HSK {currentItem.hskLevel}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {currentIndex + 1} / {AUDITORY_JIGSAW_CURRICULUM.length}
            </span>
          </div>
        </div>

        {/* Audio Listening Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '16px 20px',
          backgroundColor: 'var(--bg-panel)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => playAudio(currentItem.targetSentence)}
            className="btn btn-primary"
            style={{ width: '48px', height: '48px', borderRadius: '50%', padding: 0 }}
            title="Listen to Target Sentence"
          >
            <Volume2 size={22} />
          </button>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-primary)' }}>
              Listen carefully to the spoken sentence
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Reassemble the scrambled compound chips below into the exact syntactic order heard in the audio.
            </div>
          </div>
        </div>

        {/* Assembly Dropzone (User Slots) */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Reconstructed Sentence Order:
          </div>
          <div style={{
            minHeight: '68px',
            padding: '12px',
            backgroundColor: 'var(--bg-surface)',
            border: `2px dashed ${isAnswerRevealed ? (isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)') : 'var(--border-strong)'}`,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}>
            {userSlots.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 auto' }}>
                Tap chips from the pool below to assemble the sentence
              </span>
            ) : (
              userSlots.map((token, slotIdx) => (
                <button
                  key={`slot-${slotIdx}`}
                  onClick={() => handleDeselectSlotChip(token, slotIdx)}
                  disabled={isAnswerRevealed}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface-hover)',
                    border: '1px solid var(--border-strong)',
                    fontFamily: 'var(--font-serif-zh)',
                    fontSize: '18px',
                    color: 'var(--text-primary)',
                    cursor: isAnswerRevealed ? 'default' : 'pointer'
                  }}
                  title="Click to remove from sentence"
                >
                  {token}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Available Scrambled Token Chips Pool */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Scrambled Word Chips:
          </div>
          <div style={{
            minHeight: '68px',
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            alignItems: 'center'
          }}>
            {scrambledPool.length === 0 ? (
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', margin: '0 auto' }}>
                All word chips placed in the sentence above
              </span>
            ) : (
              scrambledPool.map((token, chipIdx) => (
                <button
                  key={`pool-${chipIdx}`}
                  onClick={() => handleSelectPoolChip(token, chipIdx)}
                  disabled={isAnswerRevealed}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'var(--font-serif-zh)',
                    fontSize: '18px',
                    color: 'var(--text-primary)',
                    cursor: isAnswerRevealed ? 'default' : 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {token}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Feedback Banner */}
        {isAnswerRevealed && (
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isCorrect ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)'}`,
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px', color: isCorrect ? 'var(--accent-bamboo)' : 'var(--accent-seal)' }}>
              {isCorrect ? <Check size={18} /> : <AlertCircle size={18} />}
              {isCorrect ? 'Correct! Syntax and word order confirmed.' : 'Incorrect Word Order'}
            </div>
            <div style={{ marginTop: '8px', fontFamily: 'var(--font-serif-zh)', fontSize: '18px', color: 'var(--text-primary)' }}>
              {currentItem.targetSentence}
            </div>
            <div style={{ fontSize: '13px', fontFamily: 'var(--font-mono)', color: 'var(--accent-gold)', marginTop: '2px' }}>
              {currentItem.pinyin}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
              "{currentItem.english}"
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={() => loadExercise(currentIndex)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}
          >
            <RotateCcw size={14} /> Reset Chips
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isAnswerRevealed ? (
              <button
                onClick={handleCheckOrder}
                disabled={userSlots.length === 0}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                <Check size={16} /> Check Order
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="btn btn-primary"
                style={{ padding: '8px 20px' }}
              >
                Next Sentence →
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
