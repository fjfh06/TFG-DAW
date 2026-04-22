import React from 'react';

interface LoaderProps {
  text?: string;
  fullPage?: boolean;
  compact?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ text = "Cargando...", fullPage = false, compact = false }) => {
  const content = (
    <div className={compact ? "loader-compact" : "loader-container"}>
      <span className={compact ? "loader-small" : "loader"}></span>
      {text && <p className={compact ? "loader-text-small" : "loader-text"}>{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}>
        {content}
      </div>
    );
  }

  return content;
};
