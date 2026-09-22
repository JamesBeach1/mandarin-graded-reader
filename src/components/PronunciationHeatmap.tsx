import React, { useState, useMemo } from 'react';
import { PronunciationTracker, type PhonemeRecord, type PhonemeCategory } from '../utils/pronunciationTracker';
import { AzureSpeechService } from '../services/azureSpeech';
import { SpeechRecognitionService } from '../services/speechRecognition';
import { Activity, Volume2, Mic, CheckCircle2, AlertTriangle, RotateCcw, Sparkles } from 'lucide-react';

export const PronunciationHeatmap: React.FC = () => {
  const [records, setRecords] = useState<PhonemeRecord[]>(() => PronunciationTracker.getRecords());
  const [selectedPhoneme, setSelectedPhoneme] = useState<PhonemeRecord | null>(() => records[0] || null);
  const [filterCategory, setFilterCategory] = useState<'all' | 'weaknesses' | PhonemeCategory>('all');
  const [isRecording, setIsRecording] = useState(false);
  const [feedback, setFeedback] = useState<{ char: string; correct: boolean; message: string } | null>(null);

  // Calculate overall metrics
  const stats = useMemo(() => {
    let totalAttempts = 0;
    let correctAttempts = 0;
    let weaknessCount = 0;

    records.forEach(r => {
      totalAttempts += r.totalAttempts;
      correctAttempts += r.correctAttempts;
      if (PronunciationTracker.getAccuracy(r) < 65) {
        weaknessCount += 1;
      }
    });

    const overallAccuracy = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 100;
    return { overallAccuracy, totalAttempts, weaknessCount };
  }, [records]);

  const filteredRecords = useMemo(() => {
    if (filterCategory === 'weaknesses') {
      return records.filter(r => PronunciationTracker.getAccuracy(r) < 65);
    }
    if (filterCategory === 'all') {
      return records;
    }
    return records.filter(r => r.category === filterCategory);
  }, [records, filterCategory]);

  const handleSpeak = (text: string) => {
    AzureSpeechService.speak(text, 0.9);
  };

  const handleTestSpeech = async (targetWord: { char: string; pinyin: string; english: string }) => {
    if (!SpeechRecognitionService.isSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    try {
      setIsRecording(true);
      setFeedback(null);

      const result = await SpeechRecognitionService.listenOnce('zh-CN');
      setIsRecording(false);

      const recognized = (result.transcript || '').trim();
      const isCorrect = recognized.includes(targetWord.char);

      if (selectedPhoneme) {
        PronunciationTracker.recordEvaluation(selectedPhoneme.id, isCorrect);
        setRecords(PronunciationTracker.getRecords());
      }

      setFeedback({
        char: targetWord.char,
        correct: isCorrect,
        message: isCorrect
          ? `✨ Accurate! Recognized "${recognized}".`
          : `Heard "${recognized || 'nothing'}". Target was "${targetWord.char}" (${targetWord.pinyin}). Try again!`
      });
    } catch (err) {
      setIsRecording(false);
      setFeedback({
        char: targetWord.char,
        correct: false,
        message: 'Could not access microphone. Please check browser permissions.'
      });
    }
  };

  const renderGridSection = (title: string, items: PhonemeRecord[]) => {
    if (items.length === 0) return null;
    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title} ({items.length})
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
          {items.map(r => {
            const acc = PronunciationTracker.getAccuracy(r);
            const style = PronunciationTracker.getStatusColor(r);
            const isSelected = selectedPhoneme?.id === r.id;

            return (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedPhoneme(r);
                  setFeedback(null);
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: style.bg,
                  border: isSelected ? '2px solid var(--text-primary)' : `1px solid ${style.border}`,
                  cursor: 'pointer',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transition: 'transform 0.1s ease',
                  boxShadow: isSelected ? '0 0 0 1px var(--text-primary)' : 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {r.symbol}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {r.ipa}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: style.text }}>
                    {acc}%
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>
                    {r.totalAttempts} tries
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Overall Pronunciation Accuracy
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--accent-bamboo)', marginTop: '4px' }}>
            {stats.overallAccuracy}%
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Across {stats.totalAttempts} spoken evaluations
          </span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Persistent Weakness Targets
          </span>
          <div style={{ fontSize: '26px', fontWeight: 700, color: stats.weaknessCount > 0 ? 'var(--accent-seal)' : 'var(--accent-bamboo)', marginTop: '4px' }}>
            {stats.weaknessCount} Areas
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Accuracy &lt; 65% needing targeted drill
          </span>
        </div>

        <div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Heatmap Legend
          </span>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '11px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-bamboo)' }}>
              🟢 &ge;85% Mastery
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)' }}>
              🟡 65-84%
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-seal)' }}>
              🔴 &lt;65% Alert
            </span>
          </div>
        </div>
      </div>

      {/* Main Split: Heatmap Grid + Drill Inspector */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Category Filter and Grids */}
        <div style={{ backgroundColor: 'var(--bg-surface)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilterCategory('all')}
              className={`btn ${filterCategory === 'all' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              All Phonemes
            </button>
            <button
              onClick={() => setFilterCategory('weaknesses')}
              className={`btn ${filterCategory === 'weaknesses' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              🔴 High Weakness Only ({stats.weaknessCount})
            </button>
            <button
              onClick={() => setFilterCategory('initial')}
              className={`btn ${filterCategory === 'initial' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Initials (声母)
            </button>
            <button
              onClick={() => setFilterCategory('final')}
              className={`btn ${filterCategory === 'final' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Finals (韵母)
            </button>
            <button
              onClick={() => setFilterCategory('tone')}
              className={`btn ${filterCategory === 'tone' ? 'btn-bamboo' : 'btn-secondary'}`}
              style={{ padding: '5px 12px', fontSize: '12px' }}
            >
              Tones (声调)
            </button>
          </div>

          {/* Grids by category */}
          {(filterCategory === 'all' || filterCategory === 'initial' || filterCategory === 'weaknesses') &&
            renderGridSection('Initials (声母: Retroflex, Dentals & Stops)', filteredRecords.filter(r => r.category === 'initial'))}

          {(filterCategory === 'all' || filterCategory === 'final' || filterCategory === 'weaknesses') &&
            renderGridSection('Finals (韵母: Nasal Codas & Umlauts)', filteredRecords.filter(r => r.category === 'final'))}

          {(filterCategory === 'all' || filterCategory === 'tone' || filterCategory === 'weaknesses') &&
            renderGridSection('Tones (声调: Pitch Register Contours)', filteredRecords.filter(r => r.category === 'tone'))}
        </div>

        {/* Right Column: Targeted Phoneme Drill Inspector */}
        {selectedPhoneme && (
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {/* Inspector Header */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedPhoneme.symbol}
                </span>
                <span style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                  IPA: {selectedPhoneme.ipa}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Group: <strong>{selectedPhoneme.groupName}</strong>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Accuracy: <strong>{PronunciationTracker.getAccuracy(selectedPhoneme)}%</strong> ({selectedPhoneme.correctAttempts}/{selectedPhoneme.totalAttempts})
                </span>
                <button
                  onClick={() => handleSpeak(selectedPhoneme.symbol.replace(/\(.*\)/, ''))}
                  className="btn btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Hear phoneme audio"
                >
                  <Volume2 size={12} /> Listen
                </button>
              </div>
            </div>

            {/* Target Words Practice Cards */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                Target Practice Words:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {selectedPhoneme.sampleWords.map((word, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '10px 12px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 600, fontFamily: 'var(--font-serif-zh)', color: 'var(--text-primary)' }}>
                          {word.char}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 600 }}>
                          {word.pinyin}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {word.english}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleSpeak(word.char)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                        title="Listen to native pronunciation"
                      >
                        <Volume2 size={16} />
                      </button>
                      <button
                        onClick={() => handleTestSpeech(word)}
                        disabled={isRecording}
                        className="btn btn-bamboo"
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Record your voice to test pronunciation"
                      >
                        <Mic size={12} /> Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Feedback Notice */}
            {feedback && (
              <div style={{
                padding: '12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: feedback.correct ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: feedback.correct ? '1px solid var(--accent-bamboo)' : '1px solid var(--accent-seal)',
                fontSize: '12px',
                lineHeight: 1.5,
                color: feedback.correct ? 'var(--accent-bamboo)' : 'var(--accent-seal)'
              }}>
                {feedback.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
