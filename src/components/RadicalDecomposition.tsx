import React from 'react';
import type { HanziItem } from '../types/HanziItem';

interface RadicalDecompositionProps {
  item: HanziItem;
  onClose?: () => void;
}

// Common Kangxi Radicals reference dictionary for etymological breakdown
const KANGXI_RADICALS_INFO: Record<string, { pinyin: string; english: string; category: string }> = {
  '人': { pinyin: 'rén', english: 'Person / Human', category: 'Human / Actions' },
  '亻': { pinyin: 'rén', english: 'Person (standing radical)', category: 'Human / Actions' },
  '口': { pinyin: 'kǒu', english: 'Mouth / Opening', category: 'Body & Speech' },
  '土': { pinyin: 'tǔ', english: 'Earth / Soil', category: 'Nature & Elements' },
  '女': { pinyin: 'nǚ', english: 'Woman / Female', category: 'Human & Family' },
  '心': { pinyin: 'xīn', english: 'Heart / Mind', category: 'Emotions & Thoughts' },
  '忄': { pinyin: 'xīn', english: 'Heart (vertical radical)', category: 'Emotions & Thoughts' },
  '手': { pinyin: 'shǒu', english: 'Hand', category: 'Actions & Tools' },
  '扌': { pinyin: 'shǒu', english: 'Hand (action radical)', category: 'Actions & Tools' },
  '日': { pinyin: 'rì', english: 'Sun / Day', category: 'Nature & Time' },
  '月': { pinyin: 'yuè', english: 'Moon / Flesh', category: 'Nature & Body' },
  '木': { pinyin: 'mù', english: 'Tree / Wood', category: 'Nature & Flora' },
  '水': { pinyin: 'shuǐ', english: 'Water', category: 'Nature & Liquids' },
  '氵': { pinyin: 'shuǐ', english: 'Water (three dots radical)', category: 'Nature & Liquids' },
  '火': { pinyin: 'huǒ', english: 'Fire', category: 'Nature & Energy' },
  '灬': { pinyin: 'huǒ', english: 'Fire (four dots radical)', category: 'Nature & Energy' },
  '纟': { pinyin: 'sī', english: 'Silk / Thread', category: 'Crafts & Textiles' },
  '糸': { pinyin: 'mì', english: 'Silk / Fine thread', category: 'Crafts & Textiles' },
  '讠': { pinyin: 'yán', english: 'Speech / Language', category: 'Communication' },
  '言': { pinyin: 'yán', english: 'Words / Speech', category: 'Communication' },
  '辶': { pinyin: 'chuò', english: 'Walk / Movement', category: 'Motion & Paths' },
  '钅': { pinyin: 'jīn', english: 'Metal / Gold', category: 'Minerals & Metals' },
  '金': { pinyin: 'jīn', english: 'Metal / Gold', category: 'Minerals & Metals' },
  '目': { pinyin: 'mù', english: 'Eye / Sight', category: 'Sense Organs' },
  '草': { pinyin: 'cǎo', english: 'Grass / Herb', category: 'Flora' },
  '艹': { pinyin: 'cǎo', english: 'Grass radical', category: 'Flora' },
  '宀': { pinyin: 'mián', english: 'Roof / Shelter', category: 'Buildings & Home' },
  '广': { pinyin: 'guǎng', english: 'Shelter / Building', category: 'Buildings & Home' },
  '竹': { pinyin: 'zhú', english: 'Bamboo', category: 'Flora & Utensils' },
  '⺮': { pinyin: 'zhú', english: 'Bamboo radical', category: 'Flora & Utensils' },
  '走': { pinyin: 'zǒu', english: 'Run / Walk', category: 'Movement' },
  '足': { pinyin: 'zú', english: 'Foot / Leg', category: 'Body & Movement' },
  '车': { pinyin: 'chē', english: 'Cart / Vehicle', category: 'Transportation' },
  '门': { pinyin: 'mén', english: 'Door / Gate', category: 'Architecture' },
  '食': { pinyin: 'shí', english: 'Food / Eat', category: 'Nutrition' },
  '饣': { pinyin: 'shí', english: 'Food radical', category: 'Nutrition' },
};

export const RadicalDecomposition: React.FC<RadicalDecompositionProps> = ({ item, onClose }) => {
  const radical = item.radical || '';
  const radicalInfo = KANGXI_RADICALS_INFO[radical] || null;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '13px',
      boxShadow: 'var(--shadow-main)',
      maxWidth: '320px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--accent-cinnabar)', fontSize: '14px' }}>
          部首分解 Radical Decomposition
        </span>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            ✕
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
        <div style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: 'var(--accent-indigo)',
          lineHeight: 1,
          fontFamily: 'var(--font-serif-cn)'
        }}>
          {item.character}
        </div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{item.pinyin}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{item.definition}</div>
        </div>
      </div>

      <div style={{
        background: 'var(--bg-primary)',
        padding: '8px 12px',
        borderRadius: '6px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '6px',
        marginBottom: '10px'
      }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Radical 部首: </span>
          <strong style={{ color: 'var(--accent-cinnabar)', fontSize: '15px' }}>{radical || 'N/A'}</strong>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Total Strokes: </span>
          <strong>{item.stroke_count || 'N/A'}</strong>
        </div>
        {item.radical_code && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Kangxi Index: </span>
            <span>#{item.radical_code}</span>
          </div>
        )}
        {item.frequency_rank && (
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Rank: </span>
            <span>#{item.frequency_rank}</span>
          </div>
        )}
      </div>

      {radicalInfo && (
        <div style={{
          borderTop: '1px dashed var(--border-color)',
          paddingTop: '8px',
          fontSize: '12px',
          color: 'var(--text-secondary)'
        }}>
          <div><strong>Radical Meaning:</strong> {radicalInfo.english} ({radicalInfo.pinyin})</div>
          <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
            Semantic Category: <em>{radicalInfo.category}</em>
          </div>
        </div>
      )}
    </div>
  );
};
