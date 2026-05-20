import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";

/**
 * Pàgina d'error 403 (Accés Denegat).
 * Es mostra quan un usuari intenta accedir a una secció per la qual no té permisos.
 */
export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        {/* Icona d'alerta gran i visual */}
        <div className="relative mx-auto w-24 h-24 bg-danger/10 rounded-full flex items-center justify-center">
          <ShieldAlert size={48} className="text-danger" />
          <div className="absolute inset-0 bg-danger/20 rounded-full animate-ping opacity-25" />
        </div>

        {/* Text explicatiu */}
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-dark tracking-tight">Accés Denegat</h1>
          <p className="text-muted text-lg">
            Ho sentim, però no tens els permisos necessaris per veure aquesta secció.
          </p>
        </div>

        {/* Botons d'acció */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-dark rounded-2xl font-bold hover:bg-gray-50 transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
            <span>Tornar enrere</span>
          </button>
          
          <button
            onClick={() => navigate("/jornades")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home size={18} />
            <span>Anar al Panell</span>
          </button>
        </div>

        {/* Detall tècnic (discret) */}
        <div className="pt-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted/40">
            HTTP Error 403: Forbidden
          </span>
        </div>
      </div>
    </div>
  );
}
