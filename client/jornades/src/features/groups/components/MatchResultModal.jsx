import { useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Clock, Trophy, Edit3 } from "lucide-react";

/**
 * MatchResultModal
 *
 * Props mínimes: match, onSave, onClose, isLoading
 */
export default function MatchResultModal({
  match,
  onSave,
  onClose,
  isLoading,
}) {
  const [goalsLocal, setGoalsLocal] = useState(match?.goals_local ?? 0);
  const [goalsVisitor, setGoalsVisitor] = useState(match?.goals_visitor ?? 0);
  const [finished, setFinished] = useState(match?.finished ?? false);
  const [winnerId, setWinnerId] = useState(match?.winner_id || null);

  if (!match) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      goals_local: Number(goalsLocal),
      goals_visitor: Number(goalsVisitor),
      finished,
      winner_id: Number(goalsLocal) === Number(goalsVisitor) ? winnerId : null,
    });
  };

  const isTie = Number(goalsLocal) === Number(goalsVisitor);
  const isElimination = match.phase !== "GROUP_STAGE";

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Edit3 size={16} className="text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Editar resultat
            </span>
          </div>
          <p className="font-bold text-dark">
            {match.team_local?.code || "Pendent"} vs{" "}
            {match.team_visitor?.code || "Pendent"}
          </p>
          <p className="text-xs text-muted mt-0.5">
            Pista {match.court_number}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Marcador */}
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {match.team_local?.code || "Pendent"}
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={goalsLocal}
                onChange={(e) => setGoalsLocal(e.target.value)}
                className="w-full text-center text-4xl font-bold text-dark border-2 border-gray-200 rounded-2xl py-3 focus:outline-none focus:border-primary transition-colors bg-gray-50"
              />
            </div>

            <span className="text-2xl font-bold text-muted/40 pt-5">—</span>

            <div className="flex-1 text-center">
              <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                {match.team_visitor?.code || "Pendent"}
              </label>
              <input
                type="number"
                min={0}
                max={99}
                value={goalsVisitor}
                onChange={(e) => setGoalsVisitor(e.target.value)}
                className="w-full text-center text-4xl font-bold text-dark border-2 border-gray-200 rounded-2xl py-3 focus:outline-none focus:border-primary transition-colors bg-gray-50"
              />
            </div>
          </div>

          {/* Finalitzat toggle */}
          <button
            type="button"
            onClick={() => setFinished((v) => !v)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
              finished
                ? "bg-green-50 text-green-700 border-2 border-green-200"
                : "bg-gray-50 text-muted border-2 border-gray-200 hover:border-gray-300"
            }`}
          >
            {finished ? (
              <>
                <CheckCircle2 size={16} className="text-green-600" />
                Marcat com a finalitzat
              </>
            ) : (
              <>
                <Clock size={16} />
                Marcar com a finalitzat
              </>
            )}
          </button>

          {/* Guanyador en cas d'empat (Eliminatòries) */}
          {isTie && isElimination && finished && (
            <div className="p-3 bg-primary/5 rounded-2xl border border-primary/10 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black text-primary uppercase tracking-widest text-center mb-2">
                Empat detectat: Tria el guanyador
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWinnerId(match.team_local?.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    winnerId === match.team_local?.id
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-dark border border-gray-100"
                  }`}
                >
                  {match.team_local?.code || "Pendent"}
                </button>
                <button
                  type="button"
                  onClick={() => setWinnerId(match.team_visitor?.id)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    winnerId === match.team_visitor?.id
                      ? "bg-primary text-white shadow-md"
                      : "bg-white text-dark border border-gray-100"
                  }`}
                >
                  {match.team_visitor?.code || "Pendent"}
                </button>
              </div>
            </div>
          )}

          {/* Botons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-muted font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel·lar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? (
                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                <Trophy size={15} />
              )}
              Desar
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
