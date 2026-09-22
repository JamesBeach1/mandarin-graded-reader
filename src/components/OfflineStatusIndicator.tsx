import React, { useState, useEffect } from 'react';

export const OfflineStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11px',
        padding: '5px 9px',
        borderRadius: 'var(--radius-sm)',
        background: 'var(--bg-surface)',
        color: isOnline ? 'var(--accent-bamboo)' : 'var(--accent-seal)',
        border: '1px solid var(--border-subtle)',
        fontWeight: 500,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        userSelect: 'none',
        marginRight: '6px'
      }}
      title={isOnline ? "Online: Cloud neural speech & AI models accessible" : "Offline: Zero-backend local storage & dictionary active"}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isOnline ? 'var(--accent-bamboo)' : 'var(--accent-seal)'
        }}
      />
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

