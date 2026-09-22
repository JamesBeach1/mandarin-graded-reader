import React from 'react';
import { X, BarChart3, CheckCircle2, Info } from 'lucide-react';

interface FrequencyWord {
  character: string;
  rank: number;
  pinyin: string;
  definition: string;
}

interface FrequencyCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalChinese: number;
  top100Count: number;
  top250Count: number;
  top500Count: number;
  rareCount: number;
  topWords: FrequencyWord[];
}

export const FrequencyCoverageModal: React.FC<FrequencyCoverageModalProps> = ({
  isOpen,
  onClose,
  totalChinese,
  top100Count,
  top250Count,
  top500Count,
  rareCount,
  topWords
}) => {
  if (!isOpen) return null;

  const top500Percentage = totalChinese > 0 ? Math.round((top500Count / totalChinese) * 100) : 0;
  const top100Percentage = totalChinese > 0 ? Math.round((top100Count / totalChinese) * 100) : 0;
  const top250Percentage = totalChinese > 0 ? Math.round((top250Count / totalChinese) * 100) : 0;
  const rarePercentage = totalChinese > 0 ? Math.round((rareCount / totalChinese) * 100) : 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '640px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-panel)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="var(--accent-bamboo)" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Top 500 Hanzi Coverage Analytics (TRC-007)
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Main Coverage Hero */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            backgroundColor: 'var(--bg-panel)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                High-Yield Lexical Coverage
              </div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent-bamboo)', lineHeight: 1.2 }}>
                {top500Percentage}%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {top500Count} of {totalChinese} characters are among the Top 500 most frequent in the Chinese language.
              </div>
            </div>

            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              border: '6px solid var(--accent-bamboo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--accent-bamboo)'
            }}>
              {top500Percentage}%
            </div>
          </div>

          {/* Progress Breakdown Tiers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top 1–100 Hanzi</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {top100Count} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>({top100Percentage}%)</span>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top 101–250 Hanzi</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {top250Count} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>({top250Percentage}%)</span>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Top 251–500 Hanzi</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                {top500Count - top250Count - top100Count} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>({Math.max(0, top500Percentage - top250Percentage - top100Percentage)}%)</span>
              </div>
            </div>

            <div style={{ padding: '12px', backgroundColor: 'var(--bg-panel)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Beyond Top 500</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '4px' }}>
                {rareCount} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-muted)' }}>({rarePercentage}%)</span>
              </div>
            </div>
          </div>

          {/* Pedagogical Note */}
          <div style={{
            display: 'flex',
            gap: '10px',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(56, 189, 248, 0.08)',
            border: '1px solid rgba(56, 189, 248, 0.2)',
            fontSize: '12px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)'
          }}>
            <Info size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Why the Top 500 Matters:</strong> According to linguistic frequency analyses of modern Chinese corpora, mastering the top 500 most frequent characters yields an immediate ~75–80% reading comprehension rate across everyday conversations, public signs, and graded literature.
            </div>
          </div>

          {/* Sample Top Words Cloud */}
          {topWords.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Sample High-Frequency Characters in this Story:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {topWords.slice(0, 32).map(w => (
                  <span
                    key={w.character}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--bg-panel)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '14px',
                      fontFamily: 'var(--font-serif-zh)',
                      color: 'var(--text-primary)',
                      cursor: 'default'
                    }}
                    title={`#${w.rank} | ${w.pinyin} | ${w.definition}`}
                  >
                    {w.character}
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginLeft: '4px' }}>#{w.rank}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
