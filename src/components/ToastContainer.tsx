import React, { useEffect, useState, useRef } from 'react';
import { ToastStore, type ToastItem, type ConfirmDialogOptions, type PromptDialogOptions } from '../services/toastStore';
import { 
  CheckCircle2, AlertCircle, Info, AlertTriangle, 
  X, Check, Trash2, HelpCircle 
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const [, setTick] = useState(0);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [promptValue, setPromptValue] = useState('');

  useEffect(() => {
    const unsubscribe = ToastStore.subscribe(() => {
      setTick(t => t + 1);
    });
    return unsubscribe;
  }, []);

  const toasts = ToastStore.getToasts();
  const activeConfirm = ToastStore.getActiveConfirm();
  const activePrompt = ToastStore.getActivePrompt();

  // Reset or initialize prompt input value when prompt opens
  useEffect(() => {
    if (activePrompt) {
      setPromptValue(activePrompt.options.defaultValue || '');
      setTimeout(() => {
        promptInputRef.current?.focus();
        promptInputRef.current?.select();
      }, 50);
    }
  }, [activePrompt?.id]);

  // Handle ESC key for closing modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeConfirm) {
          ToastStore.resolveConfirm(false);
        } else if (activePrompt) {
          ToastStore.resolvePrompt(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeConfirm, activePrompt]);

  return (
    <>
      {/* 1. Floating Toast Stack */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '420px',
          width: 'calc(100vw - 48px)',
          pointerEvents: 'none'
        }}>
          {toasts.map(toast => {
            const isSuccess = toast.type === 'success';
            const isError = toast.type === 'error';
            const isWarning = toast.type === 'warning';

            const accentColor = isSuccess 
              ? 'var(--accent-bamboo, #10b981)' 
              : isError 
              ? 'var(--accent-seal, #ef4444)' 
              : isWarning 
              ? 'var(--accent-gold, #f59e0b)' 
              : 'var(--accent-indigo, #6366f1)';

            return (
              <div
                key={toast.id}
                style={{
                  pointerEvents: 'auto',
                  backgroundColor: 'var(--bg-surface, #1e1e24)',
                  color: 'var(--text-primary, #f3f4f6)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: `1px solid ${accentColor}`,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  animation: 'fadeInUp 0.2s ease-out forwards',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <div style={{ color: accentColor, marginTop: '2px', flexShrink: 0 }}>
                  {isSuccess && <CheckCircle2 size={18} />}
                  {isError && <AlertCircle size={18} />}
                  {isWarning && <AlertTriangle size={18} />}
                  {!isSuccess && !isError && !isWarning && <Info size={18} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  {toast.title && (
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {toast.title}
                    </div>
                  )}
                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary, #d1d5db)', lineHeight: 1.4, wordBreak: 'break-word' }}>
                    {toast.message}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => ToastStore.dismissToast(toast.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted, #9ca3af)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                  title="Dismiss notification"
                >
                  <X size={15} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. App-Native Confirmation Modal */}
      {activeConfirm && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.68)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => ToastStore.resolveConfirm(false)}
        >
          <div
            className="editorial-card"
            style={{
              backgroundColor: 'var(--bg-surface, #1e1e24)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              maxWidth: '430px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: activeConfirm.options.type === 'danger' 
                  ? 'rgba(239, 68, 68, 0.15)' 
                  : 'rgba(245, 158, 11, 0.15)',
                color: activeConfirm.options.type === 'danger' 
                  ? 'var(--accent-seal, #ef4444)' 
                  : 'var(--accent-gold, #f59e0b)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {activeConfirm.options.type === 'danger' ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {activeConfirm.options.title}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeConfirm.options.message}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '8px'
            }}>
              <button
                type="button"
                onClick={() => ToastStore.resolveConfirm(false)}
                className="btn btn-secondary"
                style={{ fontSize: '13px', padding: '8px 16px' }}
              >
                {activeConfirm.options.cancelText || 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => ToastStore.resolveConfirm(true)}
                className={activeConfirm.options.type === 'danger' ? 'btn btn-danger' : 'btn btn-bamboo'}
                style={{
                  fontSize: '13px',
                  padding: '8px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: activeConfirm.options.type === 'danger' ? 'var(--accent-seal, #ef4444)' : undefined,
                  borderColor: activeConfirm.options.type === 'danger' ? 'var(--accent-seal, #ef4444)' : undefined
                }}
              >
                {activeConfirm.options.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. App-Native Prompt Input Modal */}
      {activePrompt && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.68)',
            backdropFilter: 'blur(4px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => ToastStore.resolvePrompt(null)}
        >
          <div
            className="editorial-card"
            style={{
              backgroundColor: 'var(--bg-surface, #1e1e24)',
              borderRadius: 'var(--radius-lg, 12px)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              maxWidth: '450px',
              width: '100%',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activePrompt.options.title}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {activePrompt.options.message}
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                ToastStore.resolvePrompt(promptValue);
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <input
                ref={promptInputRef}
                type="text"
                value={promptValue}
                onChange={(e) => setPromptValue(e.target.value)}
                placeholder={activePrompt.options.placeholder || 'Enter value...'}
                className="form-input"
                style={{ width: '100%', fontSize: '14px', padding: '10px 12px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => ToastStore.resolvePrompt(null)}
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', padding: '8px 16px' }}
                >
                  {activePrompt.options.cancelText || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-bamboo"
                  style={{ fontSize: '13px', padding: '8px 18px' }}
                >
                  {activePrompt.options.confirmText || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
