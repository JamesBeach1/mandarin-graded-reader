import React, { useState, useMemo } from 'react';
import { InkWashGenerator } from '../utils/inkWashGenerator';
import { Sparkles, RefreshCw, Eye, EyeOff } from 'lucide-react';

interface StoryIllustrationProps {
  title: string;
  isDarkTheme?: boolean;
}

export const StoryIllustration: React.FC<StoryIllustrationProps> = ({
  title,
  isDarkTheme = true
}) => {
  const [seedOffset, setSeedOffset] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const svgContent = useMemo(() => {
    return InkWashGenerator.generateIllustrationSvg(title + (seedOffset ? `-${seedOffset}` : ''), isDarkTheme);
  }, [title, isDarkTheme, seedOffset]);

  if (!isVisible) {
    return (
      <div style={{ textAlign: 'right', marginBottom: '8px' }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '11px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Show traditional Chinese ink wash illustration"
        >
          <Eye size={12} /> Show Illustration (水墨插画)
        </button>
      </div>
    );
  }

  return (
    <div style={{
      marginBottom: '20px',
      position: 'relative',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'none'
    }}>
      <div
        dangerouslySetInnerHTML={{ __html: svgContent }}
        style={{ width: '100%', height: 'auto', maxHeight: '200px', display: 'flex' }}
      />
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        display: 'flex',
        gap: '6px',
        zIndex: 5
      }}>
        <button
          onClick={() => setSeedOffset(s => s + 1)}
          className="control-button"
          style={{
            backgroundColor: 'rgba(20, 20, 22, 0.65)',
            backdropFilter: 'blur(4px)',
            color: '#E5E5E5',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '3px 8px',
            fontSize: '10.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
          title="Regenerate traditional ink-wash artwork"
        >
          <RefreshCw size={10} /> Redraw (重画)
        </button>
        <button
          onClick={() => setIsVisible(false)}
          className="control-button"
          style={{
            backgroundColor: 'rgba(20, 20, 22, 0.65)',
            backdropFilter: 'blur(4px)',
            color: 'var(--text-muted)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '3px 8px',
            fontSize: '10.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
          title="Hide illustration"
        >
          <EyeOff size={10} /> Hide
        </button>
      </div>
    </div>
  );
};
