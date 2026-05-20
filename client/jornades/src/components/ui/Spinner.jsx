import React from 'react';
import { createPortal } from 'react-dom';

export default function Spinner({ message = 'Carregant dades...', fullPage = false, size = 'md' }) {
  // Map spinner sizes
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-10 h-10 border-3';

  if (fullPage) {
    return createPortal(
      <div className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 bg-white rounded-3xl p-8 shadow-2xl border border-gray-100/50 animate-fade-in max-w-xs w-full">
          <div
            className={`${sizeClasses} border-primary/30 border-t-primary rounded-full animate-spin shrink-0`}
            role="status"
            aria-label={message}
          />
          {message && <p className="text-muted text-sm font-semibold text-center leading-relaxed">{message}</p>}
        </div>
      </div>,
      document.body
    );
  }

  return (
    <div className="w-full py-16 min-h-[300px] flex flex-col items-center justify-center gap-3 shrink-0">
      <div
        className={`${sizeClasses} border-primary/30 border-t-primary rounded-full animate-spin shrink-0`}
        role="status"
        aria-label={message}
      />
      {message && <p className="text-muted text-xs font-semibold text-center leading-relaxed">{message}</p>}
    </div>
  );
}
