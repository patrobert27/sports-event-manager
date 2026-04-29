import React, { useContext } from "react";
import { UserContext } from '../../../context/userContext';

export default function CompetitionList({ competitions = [], onEdit, onDelete }) {
  const { user } = useContext(UserContext) || {};
  const isAdmin = user?.role?.name === "admin";

  if (!competitions.length) return <p>No hi ha jornades.</p>;

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {competitions.map((c) => (
        <div key={c.id} className="bg-white rounded-xl p-4 border">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold">{c.name}</h4>
              <p className="text-sm text-muted">{c.status} · {c.available_courts} pistes</p>
            </div>
            <div className="text-right text-sm text-muted">
              <div>{c.date ? new Date(c.date).toLocaleDateString() : "—"}</div>
              <div className="mt-1">{c.start_time ?? ""}</div>
            </div>
          </div>

          <p className="text-xs text-muted mt-3">Activitat: {c.activity?.name ?? c.activity_id ?? '—'}</p>
          <p className="text-xs text-muted">Pavelló: {c.field?.name ?? c.field_id ?? '—'}</p>

          {isAdmin && (
            <div className="flex gap-2 mt-4">
              <button
                className="px-3 py-1 bg-primary text-white rounded"
                onClick={() => onEdit && onEdit(c)}
              >
                Editar
              </button>
              <button
                className="px-3 py-1 bg-danger text-white rounded"
                onClick={() => onDelete && onDelete(c.id)}
              >
                Eliminar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
