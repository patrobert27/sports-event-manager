import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import JornadaStatusBadge from '../../../components/ui/JornadaStatusBadge';
import { UserContext } from '../../../context/userContext';

// Componente presentacional per una jornada
export default function JornadaCard({ jornada, onEdit, onDelete, isActive = false }) {
  const { user } = useContext(UserContext) || {};
  const isAdmin = user?.role?.name === 'admin';
  const navigate = useNavigate();

  const name = (jornada.activity?.name || '').toLowerCase();
  let activityBorder = 'border-transparent';
  let activityHover = '';
  if (name.includes('fut') || name.includes('soccer') || name.includes('football')) {
    activityBorder = 'border-success';
    activityHover = 'hover:border-success/90';
  } else if (name.includes('bas') || name.includes('basket')) {
    activityBorder = 'border-accent';
    activityHover = 'hover:border-accent/90';
  } else if (name.includes('volei') || name.includes('vole') || name.includes('volley')) {
    activityBorder = 'border-vote';
    activityHover = 'hover:border-vote/90';
  }

  const baseClass = isActive
    ? `w-full relative bg-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-[0_14px_40px_rgba(10,10,25,0.12)] transition-transform duration-200 transform hover:scale-[1.01] hover:shadow-[0_20px_60px_rgba(10,10,25,0.18)] ${activityHover}`
    : `w-full relative bg-white rounded-xl p-4 shadow-sm transition-transform duration-150 transform hover:shadow-[0_12px_30px_rgba(10,10,25,0.12)] hover:-translate-y-1 ${activityHover}`;

  const handleView = () => navigate(`/jornades/competicions/${jornada.id}`);

  return (
    <div className={baseClass}>
      {/* left-side colored bar (glossy) */}
      <div
        className={`absolute left-0 top-0 h-full w-2 rounded-l-xl pointer-events-none ${
          name.includes('fut') || name.includes('soccer') || name.includes('football')
            ? 'bg-gradient-to-b from-success to-success/60' : name.includes('bas') || name.includes('basket')
            ? 'bg-gradient-to-b from-accent to-accent/60' : name.includes('volei') || name.includes('vole') || name.includes('volley')
            ? 'bg-gradient-to-b from-vote to-vote/60' : 'bg-transparent'
        }`}>
        <div className="absolute inset-0 opacity-60 blur-sm" />
      </div>
      <div className="flex-1 pl-4 sm:pl-6 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-dark">{jornada.name}</h4>
            <p className="text-sm text-muted mt-1">{jornada.activity?.name ?? '—'} · {jornada.date ? new Date(jornada.date).toLocaleDateString('ca-ES') : '—'}</p>
          </div>
          <div>
            <JornadaStatusBadge status={jornada.status} />
          </div>
        </div>
      </div>

      <div className="mt-3 sm:mt-0 sm:flex-shrink-0 flex items-center gap-3">
        {isActive && (
          <button onClick={handleView} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-hover transition">
            Ver més
          </button>
        )}

        {isAdmin && (
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-primary text-white rounded" onClick={() => onEdit && onEdit(jornada)}>Editar</button>
            <button className="px-3 py-1 bg-danger text-white rounded" onClick={() => onDelete && onDelete(jornada.id)}>Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
}
