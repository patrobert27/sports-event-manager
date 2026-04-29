import React from 'react';
import JornadaCard from './JornadaCard';

// Llista presentacional de jornades
export default function CompetitionsList({ jornades = [], onEdit, onDelete }) {
  if (!jornades.length) {
    return <p className="text-muted">No hi ha jornades.</p>;
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {jornades.map((j) => (
        <div key={j.id} className="w-full">
          <JornadaCard jornada={j} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}
    </div>
  );
}
