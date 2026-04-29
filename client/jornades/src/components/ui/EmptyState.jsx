import React from "react";

export default function EmptyState({ title = "No hi ha jornada activa actualment", description = "Quan es creï una jornada activa, la veuràs aquí.", cta }) {
  return (
    <div className="bg-white rounded-2xl p-6 text-center shadow-lg border border-primary/10">
      <div className="mx-auto max-w-xs">
        <div className="w-20 h-20 mx-auto rounded-full bg-primary/5 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c1.657 0 3-.895 3-2s-1.343-2-3-2-3 .895-3 2 1.343 2 3 2zM6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-dark">{title}</h3>
        <p className="text-sm text-muted mt-2">{description}</p>
        {cta && <div className="mt-4">{cta}</div>}
      </div>
    </div>
  );
}
