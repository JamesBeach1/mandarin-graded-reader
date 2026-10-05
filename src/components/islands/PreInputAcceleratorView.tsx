import React, { useState } from 'react';
import type { LanguageIsland, IslandSentence, TranscriptAnalysisResult } from '../../types/Island';
import { IslandAiService } from '../../services/islandAiService';
import { 
  Rocket, Sparkles, Volume2, Plus, Check, 
  BookOpen, HelpCircle, AlertCircle, RefreshCw, ArrowRight
} from 'lucide-react';
import { AzureSpeechService } from '../../services/azureSpeech';
import { StorageService, STORAGE_KEYS } from '../../services/storage';

interface PreInputAcceleratorViewProps {
  onIslandCreatedFromTranscript: (island: LanguageIsland, sentences: IslandSentence[]) => void;
  onNavigateToHub: () => void;
}

const SAMPLE_TRANSCRIPTS = [
  {
    title: 'Beijing Street Food Vlog (北京小吃街访谈)',
    text: `今天我们来到了北京最有名的牛街。这里的清真小吃特别地道！
师傅，您好，请问这一锅牛肉包子还要等多久？
师傅说大概三分钟就能出锅。
这边的芝麻烧饼也是一绝，外酥里嫩，刚出炉的时候香气扑鼻。
老板，给我来两个烧饼，再加一碗热豆汁儿。
吃不惯豆汁儿的朋友可以换成面茶或者羊杂汤。
价格非常亲民，这一整顿下来才花了二十块钱。`
  },
  {
    title: 'Tech & AI Discussion (科技与人工智能随聊)',
    text: `大家好，今天我们来聊一聊最新的人工智能大模型发展。
随着算力的提升，语音交互已经变得越来越自然了。
很多人担心自己的工作会不会被自动化取代，但业内专家认为这更多是工具的升级。
关键在于我们要学会如何用好这些工具，提高日常效率。
比如在语言学习领域，你现在随时可以拥有一个全天候的专属中文私教。`
  }
];

export const PreInputAcceleratorView: React.FC<PreInputAcceleratorViewProps> = ({
  onIslandCreatedFromTranscript,
  onNavigateToHub
}) => {
  const [transcriptText, setTranscriptText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TranscriptAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Audio testing
  const [playingSentenceIdx, setPlayingSentenceIdx] = useState<number | null>(null);

  const handleAnalyze = async () => {
    if (!transcriptText.trim()) {
      setErrorMsg('Please paste a transcript first.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await IslandAiService.analyzeTranscriptForPreStudy(transcriptText);
      setAnalysisResult(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to analyze transcript. Check your Gemini API Key in Settings.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlayPreview = (chinese: string, idx: number) => {
    setPlayingSentenceIdx(idx);
    AzureSpeechService.speak(
      chinese,
      {},
      () => setPlayingSentenceIdx(null),
      () => setPlayingSentenceIdx(null)
    );
  };

  const handleExportToNewIsland = () => {
    if (!analysisResult) return;
    setIsExporting(true);

    const islandId = `island-transcript-${Date.now()}`;
    const newIsland: LanguageIsland = {
      id: islandId,
      title: analysisResult.title,
      icon: 'Rocket',
      category: 'media',
      description: `Pre-study island generated from native transcript: "${analysisResult.summary}"`,
      colorTheme: '#e67e22',
      isCustom: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const newSentences: IslandSentence[] = analysisResult.extractedSentences.map((s, idx) => ({
      id: `sent-tr-${Date.now()}-${idx}`,
      islandId: islandId,
      english: s.english,
      chinese: s.chinese,
      pinyin: s.pinyin,
      notes: s.notes,
      hskLevel: 3,
      masteryLevel: 0,
      timesReviewed: 0,
      struggleCount: 0,
      createdAt: Date.now() + idx
    }));

    onIslandCreatedFromTranscript(newIsland, newSentences);
    setIsExporting(false);
    onNavigateToHub();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Accelerator Banner */}
      <div style={{
        padding: '20px 24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '20px' }}>🚀</span>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              The Accelerator: Pre-Input Comprehension
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              backgroundColor: 'rgba(230,126,34,0.15)',
              color: '#e67e22',
              borderRadius: 'var(--radius-pill)',
              fontWeight: 600
            }}>
              50%+ Boost
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Don't drown in incomprehensible native media. Paste the transcript of a YouTube video or podcast first. Pre-study the core sentences and vocabulary so your comprehension jumps to 70–90% <em>before</em> you press play.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div style={{
        padding: '24px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Paste Native Video / Podcast Transcript
          </label>

          {/* Preset Samples */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Load Sample:</span>
            {SAMPLE_TRANSCRIPTS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setTranscriptText(s.text)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '3px 10px',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer'
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={transcriptText}
          onChange={(e) => setTranscriptText(e.target.value)}
          placeholder="Paste Chinese or bilingual subtitles/transcript from YouTube description, podcast notes, or article...&#10;e.g.&#10;今天我们来到了北京最有名的牛街。这里的清真小吃特别地道！师傅，请问这一锅牛肉包子还要等多久？"
          className="form-input"
          style={{
            width: '100%',
            height: '140px',
            fontSize: '13.5px',
            lineHeight: 1.6,
            resize: 'vertical',
            padding: '12px'
          }}
        />

        {errorMsg && (
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(231,76,60,0.1)',
            border: '1px solid rgba(231,76,60,0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#e74c3c',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !transcriptText.trim()}
            className="btn btn-bamboo"
            style={{
              padding: '10px 22px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600
            }}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw size={15} className="spin" />
                <span>Extracting Pre-Study Blueprint...</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Extract Pre-Study Blueprint</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Blueprint Results Display */}
      {analysisResult && (
        <div style={{
          padding: '28px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}>
          {/* Top Header Card */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '20px',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {analysisResult.title}
              </h4>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                {analysisResult.summary}
              </p>
            </div>

            {/* Estimated Comprehension Gauge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 18px',
              backgroundColor: 'rgba(88,204,2,0.1)',
              border: '1px solid rgba(88,204,2,0.3)',
              borderRadius: 'var(--radius-pill)'
            }}>
              <span style={{ fontSize: '22px' }}>🎯</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-bamboo)' }}>
                  {analysisResult.estimatedReadinessPercent}% Projected Comprehension
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Unlocked after pre-studying these phrases
                </div>
              </div>
            </div>
          </div>

          {/* Section A: Extracted Reusable Sentence Islands */}
          <div>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              1. High-Value Conversational Sentences ({analysisResult.extractedSentences.length})
            </h5>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysisResult.extractedSentences.map((sent, i) => (
                <div
                  key={i}
                  style={{
                    padding: '14px 18px',
                    backgroundColor: 'var(--bg-base)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '3px' }}>
                      <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-serif-zh)' }}>
                        {sent.chinese}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        {sent.pinyin}
                      </span>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      "{sent.english}"
                    </div>

                    {sent.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        💡 {sent.notes}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handlePlayPreview(sent.chinese, i)}
                    className="btn btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Volume2 size={13} className={playingSentenceIdx === i ? 'spin' : ''} />
                    <span>Play</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Key Unfamiliar Vocabulary Cheat Sheet */}
          <div>
            <h5 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              2. Core Vocabulary Cheat-Sheet ({analysisResult.keyVocabulary.length})
            </h5>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '10px'
            }}>
              {analysisResult.keyVocabulary.map((vocab, i) => (
                <div
                  key={i}
                  style={{
                    padding: '10px 14px',
                    backgroundColor: 'var(--bg-base)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {vocab.chinese}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {vocab.pinyin}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {vocab.english}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action: Export to New Island */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={handleExportToNewIsland}
              disabled={isExporting}
              className="btn btn-bamboo"
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus size={15} />
              <span>Create Language Island from this Media & Start Practicing ➔</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
