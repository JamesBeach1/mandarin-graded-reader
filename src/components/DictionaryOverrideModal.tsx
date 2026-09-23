import React from 'react';
import { Modal } from './common/Modal';

interface DictionaryOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: string;
  pinyin: string;
  definition: string;
  hasExistingOverride: boolean;
  onPinyinChange: (pinyin: string) => void;
  onDefinitionChange: (def: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export const DictionaryOverrideModal: React.FC<DictionaryOverrideModalProps> = ({
  isOpen,
  onClose,
  character,
  pinyin,
  definition,
  hasExistingOverride,
  onPinyinChange,
  onDefinitionChange,
  onSave,
  onReset
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Definition" maxWidth="480px">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <span style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'var(--font-zh)' }}>{character}</span>
        <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Define custom pronunciation and definition for this character.</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>Pinyin</label>
          <input
            type="text"
            value={pinyin}
            onChange={(e) => onPinyinChange(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label style={{ fontSize: '12px', fontWeight: 500, display: 'block', marginBottom: '4px' }}>English Definition</label>
          <textarea
            value={definition}
            onChange={(e) => onDefinitionChange(e.target.value)}
            className="form-input"
            style={{ minHeight: '70px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={onSave} className="generate-button" style={{ flex: 2 }}>
            Save Definition
          </button>
          {hasExistingOverride && (
            <button onClick={onReset} className="control-button" style={{ flex: 1, color: 'var(--accent-seal)' }}>
              Reset Standard
            </button>
          )}
          <button onClick={onClose} className="control-button" style={{ flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
