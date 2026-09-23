import React, { useState } from 'react';
import {
  WritingGraderEngine,
  type EvaluationResult
} from '../utils/writingGraderEngine';
import {
  X, Edit3, Sparkles, CheckCircle2, AlertTriangle, Info,
  Copy, BookOpen, RotateCcw, Award, Check
} from 'lucide-react';

interface WritingGraderModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey?: string;
  onLoadIntoReader?: (title: string, rawText: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    title: '我的周末 (My Weekend)',
    text: '上个星期天，我去了一个咖啡店。我点了一个热咖啡和一个蛋糕。服务员跑的很快。咖啡有一点儿贵，可是味道好极了。昨天我不去了，因为天气不好。'
  },
  {
    title: '我的猫 (My Pet Cat)',
    text: '我家里有一个猫，它的名字叫小花。它跑的非常快，每天在房间里认真的睡觉。我很喜欢它。'
  },
  {
    title: '学习汉语 (Learning Chinese)',
    text: '我学习中文两个月了。虽然汉字有一点难，但是我天天努力的写汉字。老师说我学得很好。'
  }
];

export const WritingGraderModal: React.FC<WritingGraderModalProps> = ({
  isOpen,
  onClose,
  apiKey = '',
  onLoadIntoReader
}) => {
  const [essayText, setEssayText] = useState(SAMPLE_PROMPTS[0].text);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleEvaluate = async () => {
    if (!essayText.trim()) return;
    setIsEvaluating(true);
    try {
      if (apiKey) {
        const res = await WritingGraderEngine.evaluateWithGemini(essayText, apiKey);
        setResult(res);
      } else {
        const res = WritingGraderEngine.evaluateOffline(essayText);
        setResult(res);
      }
    } catch (e) {
      console.warn('Evaluation failed, falling back:', e);
      setResult(WritingGraderEngine.evaluateOffline(essayText));
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCopyCorrected = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.correctedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadInReader = () => {
    if (!result || !onLoadIntoReader) return;
    onLoadIntoReader('学生作文批改', result.correctedText);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-float)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-seal)',
              color: '#F6EFE2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Edit3 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                作文语法批改 · AI Writing & Grammar Grader (AIM-001)
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                Instant syntax, particle placement (的/得/地), and measure word evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="control-button"
            style={{ padding: '6px', border: 'none', background: 'transparent', color: 'var(--text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Sample Prompts Row */}
          <div>
            <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
              Sample Prompts:
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
              {SAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => { setEssayText(p.text); setResult(null); }}
                  className="control-button"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span>Your Mandarin Composition (输入你的中文句子或作文):</span>
              <span>{essayText.replace(/[^\u4E00-\u9FFF]/g, '').length} characters</span>
            </div>
            <textarea
              value={essayText}
              onChange={(e) => setEssayText(e.target.value)}
              placeholder="Write your Chinese essay or sentences here..."
              rows={4}
              className="form-input"
              style={{
                fontFamily: 'var(--font-serif-zh)',
                fontSize: '16px',
                lineHeight: '1.7',
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Evaluate Action Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {apiKey ? '✨ Online Gemini 1.5 Linguistic Grading active' : '⚡ Local Heuristic Linguistic Engine active'}
            </span>
            <button
              onClick={handleEvaluate}
              disabled={isEvaluating || !essayText.trim()}
              className="btn btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              {isEvaluating ? (
                <>Evaluating...</>
              ) : (
                <><Sparkles size={14} /> Evaluate & Grade</>
              )}
            </button>
          </div>

          {/* Evaluation Results Stage */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
              
              {/* Score Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '12px',
                backgroundColor: 'var(--bg-base)',
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score</div>
                  <div style={{ fontSize: '26px', fontWeight: 700, color: result.score >= 85 ? 'var(--accent-bamboo)' : 'var(--accent-gold)' }}>
                    {result.score} <span style={{ fontSize: '14px', fontWeight: 400 }}>/ 100</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Estimated Level</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {result.estimatedHsk}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Hanzi Count</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {result.characterCount} 字
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Grammar Issues</div>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: result.issues.length === 0 ? 'var(--accent-bamboo)' : 'var(--accent-seal)' }}>
                    {result.issues.length}
                  </div>
                </div>
              </div>

              {/* Native Examiner Comment */}
              <div style={{
                padding: '12px 16px',
                backgroundColor: 'rgba(76, 107, 83, 0.08)',
                borderLeft: '3px solid var(--accent-bamboo)',
                borderRadius: '0 4px 4px 0',
                fontSize: '13px',
                color: 'var(--text-primary)',
                lineHeight: '1.6'
              }}>
                <b>评语 (Examiner Feedback):</b> {result.nativeComment}
              </div>

              {/* Diff-Highlighted Corrections View */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Diff-Highlighted Corrections (修改对比):
                  </span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={handleCopyCorrected}
                      className="control-button"
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      {copied ? <><Check size={12} color="var(--accent-bamboo)" /> Copied</> : <><Copy size={12} /> Copy Clean Text</>}
                    </button>
                    {onLoadIntoReader && (
                      <button
                        onClick={handleLoadInReader}
                        className="control-button"
                        style={{ fontSize: '12px', padding: '4px 10px', color: 'var(--accent-gold)' }}
                      >
                        <BookOpen size={12} /> Read in Theater
                      </button>
                    )}
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  backgroundColor: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontFamily: 'var(--font-serif-zh)',
                  fontSize: '17px',
                  lineHeight: '2.0',
                  color: 'var(--text-primary)'
                }}>
                  {result.diffSegments.map((seg, idx) => {
                    if (seg.type === 'removed') {
                      return (
                        <span
                          key={idx}
                          style={{
                            textDecoration: 'line-through',
                            color: 'var(--accent-seal)',
                            backgroundColor: 'rgba(163, 59, 59, 0.15)',
                            padding: '1px 3px',
                            margin: '0 2px',
                            borderRadius: '2px'
                          }}
                          title="Original snippet (removed)"
                        >
                          {seg.text}
                        </span>
                      );
                    }
                    if (seg.type === 'added') {
                      return (
                        <span
                          key={idx}
                          style={{
                            fontWeight: 700,
                            color: 'var(--accent-bamboo)',
                            backgroundColor: 'rgba(76, 107, 83, 0.15)',
                            padding: '1px 3px',
                            margin: '0 2px',
                            borderRadius: '2px',
                            borderBottom: '2px solid var(--accent-bamboo)'
                          }}
                          title="Correction (recommended)"
                        >
                          {seg.text}
                        </span>
                      );
                    }
                    return <span key={idx}>{seg.text}</span>;
                  })}
                </div>
              </div>

              {/* Grammar Issues Breakdown Cards */}
              {result.issues.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                    Detailed Issue Breakdown ({result.issues.length}):
                  </span>
                  {result.issues.map((iss, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-panel)',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: `3px solid ${iss.severity === 'error' ? 'var(--accent-seal)' : 'var(--accent-gold)'}`,
                        borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {iss.title}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          color: iss.severity === 'error' ? 'var(--accent-seal)' : 'var(--accent-gold)'
                        }}>
                          {iss.severity}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', fontFamily: 'var(--font-serif-zh)', color: 'var(--text-secondary)' }}>
                        原句：<span style={{ textDecoration: 'line-through', color: 'var(--accent-seal)' }}>{iss.originalSnippet}</span> → 建议修改为：<b style={{ color: 'var(--accent-bamboo)' }}>{iss.replacementSnippet}</b>
                      </div>
                      <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                        {iss.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            ✍️ Moyun (墨韵) AIM-001 · Writing & Grammar Analysis Engine
          </span>
          <button onClick={onClose} className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: '12px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
