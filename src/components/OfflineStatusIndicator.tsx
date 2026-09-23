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
      className="header-status"
      style={{
        color: isOnline ? 'var(--accent-bamboo)' : 'var(--accent-seal)'
      }}
      title={isOnline ? "Online: Cloud neural speech & AI models accessible" : "Offline: Zero-backend local storage & dictionary active"}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isOnline ? 'var(--accent-bamboo)' : 'var(--accent-seal)',
          display: 'inline-block'
        }}
      />
      <span className="header-status-text">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
};
