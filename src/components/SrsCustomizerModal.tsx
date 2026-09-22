import React, { useState, useEffect } from 'react';
import { X, Sliders, RotateCcw, Check, Zap, Shield, Sparkles, HelpCircle } from 'lucide-react';
import {
  type SrsCustomizerSettings,
  DEFAULT_SRS_SETTINGS,
  getSrsSettings,
  saveSrsSettings
} from '../services/srsStore';

interface SrsCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: SrsCustomizerSettings) => void;
}

export const SrsCustomizerModal: React.FC<SrsCustomizerModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const [settings, setSettings] = useState<SrsCustomizerSettings>(DEFAULT_SRS_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getSrsSettings());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreset = (preset: 'standard' | 'cram' | 'relaxed') => {
    if (preset === 'standard') {
      setSettings(DEFAULT_SRS_SETTINGS);
    } else if (preset === 'cram') {
      setSettings({
        initialInterval: 1,
        secondInterval: 2,
        minEaseFactor: 1.2,
        initialEaseFactor: 2.2,
        easyBonusMultiplier: 1.15,
        hardIntervalFactor: 1.1,
        failureInterval: 1,
      });
    } else if (preset === 'relaxed') {
      setSettings({
        initialInterval: 2,
        secondInterval: 6,
        minEaseFactor: 1.4,
        initialEaseFactor: 2.6,
        easyBonusMultiplier: 1.4,
        hardIntervalFactor: 1.25,
        failureInterval: 1,
      });
    }
  };

  const handleSave = () => {
    saveSrsSettings(settings);
    setSavedSuccess(true);
    if (onSave) onSave(settings);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SRS_SETTINGS);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-subtle)',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(212, 160, 23, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <Sliders size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                SM-2 SRS Algorithm Customizer
              </h3>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                Fine-tune memory intervals, graduation steps, and ease modifiers (SRS-010)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Preset Buttons */}
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Pacing Presets
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePreset('standard')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span style={{ fontWeight: 600 }}>Standard SM-2</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1d → 4d (Balanced)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset('cram')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--accent-coral)' }}>Intensive Cram</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>1d → 2d (Exam prep)</span>
              </button>

              <button
                type="button"
                onClick={() => handlePreset('relaxed')}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--accent-bamboo)' }}>Relaxed Long-Term</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>2d → 6d (Casual)</span>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Interval & Multiplier Parameters
            </div>

            {/* Step 1 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Initial Interval (Step 1)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days until first review after learning a card</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={settings.initialInterval}
                  onChange={(e) => setSettings({ ...settings, initialInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>days</span>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Second Interval (Step 2)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days after passing initial graduation review</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="2"
                  max="30"
                  value={settings.secondInterval}
                  onChange={(e) => setSettings({ ...settings, secondInterval: Math.max(2, parseInt(e.target.value) || 2) })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>days</span>
              </div>
            </div>

            {/* Initial Ease Factor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Initial Ease Factor</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Starting multiplier for new cards (standard: 2.50)</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  step="0.05"
                  min="1.3"
                  max="3.5"
                  value={settings.initialEaseFactor}
                  onChange={(e) => setSettings({ ...settings, initialEaseFactor: parseFloat(e.target.value) || 2.5 })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>x</span>
              </div>
            </div>

            {/* Minimum Ease Factor */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Minimum Ease Factor Floor</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Prevents "ease hell" for repeatedly missed cards</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.0"
                  value={settings.minEaseFactor}
                  onChange={(e) => setSettings({ ...settings, minEaseFactor: parseFloat(e.target.value) || 1.3 })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>x</span>
              </div>
            </div>

            {/* Easy Bonus Multiplier */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Easy Rating Bonus Multiplier</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Additional bonus leap applied when rated "Easy (4)"</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  step="0.05"
                  min="1.0"
                  max="2.0"
                  value={settings.easyBonusMultiplier}
                  onChange={(e) => setSettings({ ...settings, easyBonusMultiplier: parseFloat(e.target.value) || 1.3 })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>x</span>
              </div>
            </div>

            {/* Failure Lapse Interval */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', backgroundColor: 'var(--bg-base)', borderRadius: '6px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Lapse Interval (Fail)</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Days until review after failing a card</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={settings.failureInterval}
                  onChange={(e) => setSettings({ ...settings, failureInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                  style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)', textAlign: 'center' }}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-base)',
          borderRadius: '0 0 var(--radius-lg) var(--radius-lg)'
        }}>
          <button
            type="button"
            onClick={handleReset}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px'
            }}
          >
            <RotateCcw size={13} /> Reset to Defaults
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'var(--accent-gold)',
                color: '#000',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {savedSuccess ? <Check size={14} /> : <Sliders size={14} />}
              {savedSuccess ? 'Saved!' : 'Save Parameters'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
