import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, Plus, X } from "lucide-react";
import {
  loadCompetitions
} from "../features/competition/competitionThunks";
import {
  selectCompetitions,
  selectIsLoadingCompetitions,
  selectCompetitionError,
  selectCompetitionSuccess
} from "../features/competition/competitionSelectors";
import { setSuccess, setError } from "../features/competition/competitionSlice";

import CompetitionForm from "../features/competition/components/CompetitionForm";
import EditCompetitionModal from "../features/competition/components/EditCompetitionModal";
import CompetitionList from "../features/competition/components/CompetitionList";
import RoleRule from "../components/auth/RoleRule";
import { ErrorAlert } from "../components/ui/Alerts";
import Spinner from "../components/ui/Spinner";

import { ROLES } from "../constants/roles";

/**
 * Pàgina principal de gestió de competicions.
 * Ara inclou cerca, filtratge i edició via modal per coherència amb la app.
 */
export default function CompetitionsPage() {
  const dispatch = useDispatch();
  
  // Selectors des de Redux
  const competitions = useSelector(selectCompetitions);
  const isLoading = useSelector(selectIsLoadingCompetitions);
  const error = useSelector(selectCompetitionError);
  const success = useSelector(selectCompetitionSuccess);

  // Estats locals de la interfície
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState(null);

  // Debounce per a la cerca (espera 500ms després de l'última tecla)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Càrrega de dades inicials i cada cop que canvia la cerca
  useEffect(() => {
    dispatch(loadCompetitions({ search: debouncedSearch }));
  }, [dispatch, debouncedSearch]);

  return (
    <div className="space-y-8">
      {/* Capçalera: Títol i barra de cerca */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl md:text-3xl font-bold text-dark uppercase tracking-tight">Competicions / Jornades</h2>
          <p className="text-muted text-sm font-medium">Gestiona els esdeveniments esportius i les instal·lacions.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted/60" />
            </div>
            <input
              type="text"
              placeholder="Cerca pel nom de la competició..."
              className="block w-full pl-11 pr-4 py-3 bg-white border border-primary/10 rounded-2xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm shadow-primary/5"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <RoleRule allowedRoles={[ROLES.ADMIN]}>
            <button
              onClick={() => setIsAddOpen((prev) => !prev)}
              className={`group flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300 cursor-pointer shadow-lg ${
                isAddOpen
                  ? "bg-white text-dark border border-primary/10 hover:bg-gray-100 shadow-primary/5"
                  : "bg-primary text-white hover:bg-primary-hover shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isAddOpen ? (
                <>
                  <X size={20} strokeWidth={3} />
                  <span>Cancel·lar</span>
                </>
              ) : (
                <>
                  <Plus size={20} strokeWidth={3} />
                  <span>Nova Jornada</span>
                </>
              )}
            </button>
          </RoleRule>
        </div>

        {/* Formulari de Creació (visible només per a Admin) */}
        {isAddOpen && (
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-primary/5 shadow-xl animate-in slide-in-from-top-4 fade-in duration-300">
            <h3 className="text-lg md:text-xl font-bold text-dark mb-6">Detalls de la nova competició</h3>
            <CompetitionForm 
              onSuccess={() => setIsAddOpen(false)} 
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        )}
      </div>

      {/* Alertes de feedback */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-error" />
          <span className="flex-1">{error}</span>
          <button onClick={() => dispatch(setError(null))} className="text-error/50 hover:text-error transition-colors">
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="flex-1">{success}</span>
          <button onClick={() => dispatch(setSuccess(null))} className="text-success/50 hover:text-success transition-colors">
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {isLoading && !competitions.length ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" message="Buscant competicions..." />
          </div>
        ) : (
          <CompetitionList 
            competitions={competitions} 
            onEdit={(c) => setEditingCompetition(c)} 
          />
        )}
      </div>

      {/* Modals de l'aplicació */}
      {editingCompetition && (
        <EditCompetitionModal
          competition={editingCompetition}
          onClose={() => setEditingCompetition(null)}
        />
      )}
    </div>
  );
}
