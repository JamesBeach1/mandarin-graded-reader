import React, { useState } from 'react';
import { X, CheckCircle, Award, ArrowRight } from 'lucide-react';

interface DiagnosticQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  level: number;
  explanation: string;
}

const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // HSK 1 Questions
  {
    id: 1,
    question: 'Choose the correct Pinyin for "中国" (China):',
    options: ['Zhōngguó', 'Zhòngguó', 'Shànghǎi', 'Běijīng'],
    correctIndex: 0,
    level: 1,
    explanation: '"中国" is pronounced Zhōngguó.'
  },
  {
    id: 2,
    question: 'Which word means "friend"?',
    options: ['老师 (lǎoshī)', '朋友 (péngyou)', '医生 (yīshēng)', '同学 (tóngxué)'],
    correctIndex: 1,
    level: 1,
    explanation: '朋友 means friend.'
  },
  {
    id: 3,
    question: 'Complete the sentence: 我____吃米饭。 (I want to eat rice)',
    options: ['想 (xiǎng)', '的 (de)', '吗 (ma)', '和 (hé)'],
    correctIndex: 0,
    level: 1,
    explanation: '想 expresses want/desire.'
  },

  // HSK 2 Questions
  {
    id: 4,
    question: 'Choose the correct comparative sentence:',
    options: ['哥哥比我大两岁。', '哥哥和大我两岁。', '哥哥是比我大两岁。', '哥哥我比两岁大。'],
    correctIndex: 0,
    level: 2,
    explanation: 'Comparison formula: A + 比 + B + Adjective + Difference.'
  },
  {
    id: 5,
    question: 'What does "虽然...但是..." express?',
    options: ['Because... so...', 'Although... but...', 'Not only... but also...', 'If... then...'],
    correctIndex: 1,
    level: 2,
    explanation: '虽然...但是... connects concessive contrasting clauses.'
  },

  // HSK 3 Questions
  {
    id: 6,
    question: 'Select the grammatically correct "把" (disposal) sentence:',
    options: ['他把作业写完了。', '他写完了把作业。', '把作业他写完了。', '他写作业把完了。'],
    correctIndex: 0,
    level: 3,
    explanation: 'Disposal sentence: Subject + 把 + Object + Verb + Complement.'
  },
  {
    id: 7,
    question: 'Which sentence correctly uses "除了...以外"?',
    options: ['除了苹果以外，我还喜欢吃香蕉。', '苹果除了我还喜欢香蕉以外。', '除了我以外苹果喜欢吃香蕉。', '除了喜欢吃以外苹果香蕉。'],
    correctIndex: 0,
    level: 3,
    explanation: '除了...以外 specifies inclusions or exceptions.'
  },

  // HSK 4 Questions
  {
    id: 8,
    question: 'Choose the sentence with correct passive "被" construction:',
    options: ['自行车被小偷偷走了。', '小偷偷走了被自行车。', '自行车小偷被偷走了。', '被自行车偷走了小偷。'],
    correctIndex: 0,
    level: 4,
    explanation: 'Passive: Receiver + 被 + Agent + Action.'
  },
  {
    id: 9,
    question: 'What is the meaning of "不管...都..."?',
    options: ['Regardless of... / No matter...', 'Because... therefore...', 'Neither... nor...', 'Unless...'],
    correctIndex: 0,
    level: 4,
    explanation: '不管...都... indicates that conditions do not alter the outcome.'
  },

  // HSK 5 Questions
  {
    id: 10,
    question: 'Identify the idiom (成语) meaning "to persist through continuous effort without giving up":',
    options: ['坚持不懈 (jiānchí-bùxiè)', '马马虎虎 (mǎmǎ-hūhū)', '画蛇添足 (huàshé-tiānzú)', '守株待兔 (shǒuzhū-dàitù)'],
    correctIndex: 0,
    level: 5,
    explanation: '坚持不懈 describes unyielding perseverance.'
  },
  {
    id: 11,
    question: 'Which word best fills the formal context: "这篇学术论文经过了严格的____。"',
    options: ['审核 (shěnhé)', '打算 (dǎsuan)', '聊天 (liáotiān)', '帮忙 (bāngmáng)'],
    correctIndex: 0,
    level: 5,
    explanation: '审核 denotes formal audit, review, or verification.'
  },
  {
    id: 12,
    question: 'Choose the appropriate sentence expressing "Taking proactive measures beforehand":',
    options: ['防患于未然', '拔苗助长', '掩耳盗铃', '井底之蛙'],
    correctIndex: 0,
    level: 5,
    explanation: '防患于未然 means to prevent catastrophe before it arises.'
  },
  {
    id: 13,
    question: 'Select the sentence using the formal concessive "固然...但...":',
    options: ['成绩固然重要，但身心健康更不可忽视。', '成绩但重要，固然身心健康。', '固然身心健康，但成绩。', '成绩重要固然，身心健康但。'],
    correctIndex: 0,
    level: 5,
    explanation: '固然...但... acknowledges an undeniable premise while asserting a vital contrast.'
  },

  // HSK 6 Questions
  {
    id: 14,
    question: 'What does the formal expression "不言而喻" mean?',
    options: ['It goes without saying / Self-evident', 'Speaking indistinctly', 'Refusing to communicate', 'Contradicting oneself'],
    correctIndex: 0,
    level: 6,
    explanation: '不言而喻 means self-evident, needing no explanation.'
  },
  {
    id: 15,
    question: 'Which pair of words conveys the relationship of mutual supplementation?',
    options: ['相辅相成 (xiāngfǔ-xiāngchéng)', '貌合神离 (màohé-shénlí)', '鱼目混珠 (yúmù-hùnzhū)', '自暴自弃 (zìbào-zìqì)'],
    correctIndex: 0,
    level: 6,
    explanation: '相辅相成 means complementing and reinforcing each other.'
  },
  {
    id: 16,
    question: 'Complete the literary idiom: "路遥知马力，日久____。"',
    options: ['见人心', '知风雨', '明事理', '识英雄'],
    correctIndex: 0,
    level: 6,
    explanation: 'Proverb: Distance tests a horse\'s strength; time reveals a person\'s heart.'
  },
  {
    id: 17,
    question: 'Select the sentence demonstrating accurate use of the inversion particle "唯独":',
    options: ['大家都同意这个提案，唯独他持保留态度。', '唯独大家都同意，他持保留态度。', '大家持保留态度，唯独同意这个提案。', '他持保留态度，唯独大家都同意。'],
    correctIndex: 0,
    level: 6,
    explanation: '唯独 singles out an exception ("only / solely").'
  },
  {
    id: 18,
    question: 'Identify the word synonymous with "潜移默化" (subtle imperceptible influence):',
    options: ['耳濡目染 (ěrrú-mùrǎn)', '惊慌失措 (jīnghuāng-shīcuò)', '随波逐流 (suíbō-zhúliú)', '急功近利 (jígōng-jìnlì)'],
    correctIndex: 0,
    level: 6,
    explanation: '耳濡目染 describes absorbing ambient influence gradually over time.'
  },
  {
    id: 19,
    question: 'What nuance is conveyed by the classical particle "毋庸置疑"?',
    options: ['Beyond any doubt / Indisputable', 'Without hesitation', 'Lacking evidence', 'Unnecessary to debate'],
    correctIndex: 0,
    level: 6,
    explanation: '毋庸置疑 means indisputable, brook no doubt.'
  },
  {
    id: 20,
    question: 'Which sentence correctly executes the classical structure "与其...不如...":',
    options: ['与其临渊羡鱼，不如退而结网。', '不如临渊羡鱼，与其退而结网。', '与其退而结网，临渊羡鱼不如。', '临渊羡鱼与其，不如退而结网。'],
    correctIndex: 0,
    level: 6,
    explanation: 'Classic adage: Rather than yearning for fish at the water\'s edge, retreat and weave a net.'
  }
];

interface DiagnosticTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyLevel: (level: string) => void;
}

export const DiagnosticTestModal: React.FC<DiagnosticTestModalProps> = ({
  isOpen,
  onClose,
  onApplyLevel
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);

  if (!isOpen) return null;

  const currentQ = DIAGNOSTIC_QUESTIONS[currentIdx];

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx
    }));
  };

  const handleNext = () => {
    if (currentIdx < DIAGNOSTIC_QUESTIONS.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Calculate diagnostic result
  let correctCount = 0;
  DIAGNOSTIC_QUESTIONS.forEach(q => {
    if (selectedAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const percentage = Math.round((correctCount / DIAGNOSTIC_QUESTIONS.length) * 100);
  let recommendedLevel = '1';
  if (percentage >= 90) recommendedLevel = '6';
  else if (percentage >= 75) recommendedLevel = '5';
  else if (percentage >= 60) recommendedLevel = '4';
  else if (percentage >= 45) recommendedLevel = '3';
  else if (percentage >= 25) recommendedLevel = '2';
  else recommendedLevel = '1';

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '18px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-zh)', color: 'var(--text-primary)' }}>
              🎯 Diagnostic Placement Test
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)' }}>
              Question {currentIdx + 1} of {DIAGNOSTIC_QUESTIONS.length}
            </span>
          </div>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 10px' }}>
            <X size={16} />
          </button>
        </div>

        {!isFinished ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-base)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${((currentIdx + 1) / DIAGNOSTIC_QUESTIONS.length) * 100}%`, height: '100%', backgroundColor: 'var(--accent-bamboo)', transition: 'width 0.3s ease', borderRadius: 'var(--radius-pill)' }} />
            </div>

            <div style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {currentQ.question}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedAnswers[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className="btn btn-secondary"
                    style={{
                      justifyContent: 'flex-start',
                      padding: '14px 18px',
                      textAlign: 'left',
                      borderRadius: 'var(--radius-md)',
                      borderColor: isSelected ? 'var(--accent-bamboo)' : undefined,
                      borderBottomColor: isSelected ? '#46A302' : undefined,
                      backgroundColor: isSelected ? 'rgba(88, 204, 2, 0.12)' : undefined,
                      fontWeight: isSelected ? 700 : 500
                    }}
                  >
                    <span style={{ width: '24px', fontWeight: 'bold', color: isSelected ? 'var(--accent-bamboo)' : 'var(--text-muted)' }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span style={{ fontSize: '15px' }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={handleNext}
                disabled={selectedAnswers[currentQ.id] === undefined}
                className="btn btn-primary"
              >
                {currentIdx < DIAGNOSTIC_QUESTIONS.length - 1 ? 'Next Question' : 'Finish Diagnostic'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: 'rgba(88, 204, 2, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-bamboo)' }}>
              <Award size={36} />
            </div>

            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: 700, fontFamily: 'var(--font-zh)', color: 'var(--text-primary)' }}>
              Diagnostic Complete!
            </h3>

            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>
              You scored <strong>{correctCount} / {DIAGNOSTIC_QUESTIONS.length} ({percentage}%)</strong>
            </p>

            <div style={{
              padding: '18px 24px',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)',
              width: '100%',
              maxWidth: '380px'
            }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                Recommended Starting Placement:
              </span>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--accent-seal)', margin: '4px 0' }}>
                HSK {recommendedLevel}
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {recommendedLevel === '1' ? 'Beginner foundations (150 words)' :
                 recommendedLevel === '2' ? 'Elementary reading (300 words)' :
                 recommendedLevel === '3' ? 'Intermediate mastery (600 words)' :
                 recommendedLevel === '4' ? 'Upper-intermediate discourse (1,200 words)' :
                 recommendedLevel === '5' ? 'Advanced fluency & rhetoric (2,500 words)' :
                 'Mastery & literary proficiency (5,000+ words)'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Keep Current Settings
              </button>
              <button
                onClick={() => {
                  onApplyLevel(recommendedLevel);
                  onClose();
                }}
                className="btn btn-primary"
              >
                <CheckCircle size={16} /> Apply HSK {recommendedLevel} Everywhere
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
