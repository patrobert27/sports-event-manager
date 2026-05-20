import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { Plus, X, Filter } from "lucide-react";

import {
  loadCompetitions,
  deleteCompetition,
  loadActivities,
} from "../features/competition/competitionThunks";

import {
  selectCompetitions,
  selectIsLoadingCompetitions,
  selectCompetitionError,
  selectCompetitionSuccess,
  selectCompetitionActivities,
} from "../features/competition/competitionSelectors";

import { setSuccess, setError } from "../features/competition/competitionSlice";

import CompetitionForm from "../features/competition/components/CompetitionForm";
import EditCompetitionModal from "../features/competition/components/EditCompetitionModal";
import CompetitionList from "../features/competition/components/CompetitionList";
import RoleRule from "../components/auth/RoleRule";
import Spinner from "../components/ui/Spinner";
import ConfirmModal from "../components/ui/ConfirmModal";
import { ROLES } from "../constants/roles";

// llista d'estats pels que pot passar una competicio al llarg del curs escolar
const STATUS_OPTIONS = [
  { value: "", label: "Tots els estats" },
  { value: "REGISTRATION_PENDING", label: "Inscripcions pendents" },
  { value: "REGISTRATION_OPEN", label: "Inscripcions obertes" },
  { value: "REGISTRATION_CLOSED", label: "Inscripcions tancades" },
  { value: "GROUP_STAGE", label: "Fase de grups" },
  { value: "SEMIFINALS", label: "Semifinals" },
  { value: "FINAL_STAGE", label: "Final" },
  { value: "FINISHED", label: "Finalitzades" },
];

/**
 * Pàgina principal de gestió de competicions.
 * Els filtres d'activitat i estat s'emmagatzemen a la URL (useSearchParams).
 */
export default function CompetitionsPage() {
  const dispatch = useDispatch();

  // ── URL Params per a persistir els filtres de cerca a la URL ──
  const [searchParams, setSearchParams] = useSearchParams();
  const activityId   = searchParams.get("activity_id") || "";
  const statusFilter = searchParams.get("status")      || "";

  // selectors de Redux per a obtenir l'estat global de competicions
  const competitions   = useSelector(selectCompetitions);
  const isLoading      = useSelector(selectIsLoadingCompetitions);
  const error          = useSelector(selectCompetitionError);
  const success        = useSelector(selectCompetitionSuccess);
  const activitiesList = useSelector(selectCompetitionActivities);

  // estats per a controlar els modals de creacio, edicio o eliminacio
  const [isAddOpen,           setIsAddOpen]           = useState(false);
  const [editingCompetition,  setEditingCompetition]  = useState(null);
  const [competitionToDelete, setCompetitionToDelete] = useState(null);

  // guardem el filtre a la url per a no perdre'l si l'usuari fa F5 a la pestanya
  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      
      return next;
    });
  };

  // esborrem tots els filtres actius alhora
  const clearFilters = () => {
    setSearchParams({});
  };

  // netegem els missatges d'exit als 5 segons per a no tenir la pantalla plena de color verd
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(setSuccess(null));
      }, 5000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [success, dispatch]);

  // al entrar demanem totes les activitats esportives que tenim al backend (futbol, basquet, etc)
  useEffect(() => {
    dispatch(loadActivities());
  }, [dispatch]);

  // tornem a carregar les competicions del servidor quan l'usuari canvia d'activitat
  useEffect(() => {
    const params = {};
    
    if (activityId) {
      params.activity_id = activityId;
    }
    
    dispatch(loadCompetitions(params));
  }, [dispatch, activityId]);

  // Filtrem les competicions localment per a garantir consistència de zones horàries i velocitat instantània
  const filteredCompetitions = useMemo(() => {
    const now = new Date();
    return competitions.filter((comp) => {
      if (!statusFilter) {
        return true;
      }
      
      if (statusFilter === "REGISTRATION_PENDING") {
        return comp.status === "REGISTRATION" && 
               comp.registration_start && 
               new Date(comp.registration_start) > now;
      }
      
      if (statusFilter === "REGISTRATION_OPEN") {
        return comp.status === "REGISTRATION" && 
               (!comp.registration_start || new Date(comp.registration_start) <= now) &&
               (!comp.registration_deadline || new Date(comp.registration_deadline) >= now);
      }
      
      if (statusFilter === "REGISTRATION_CLOSED") {
        return comp.status === "REGISTRATION" && 
               comp.registration_deadline && 
               new Date(comp.registration_deadline) < now;
      }
      
      return comp.status === statusFilter;
    });
  }, [competitions, statusFilter]);

  // recompte per pintar si hi ha filtres seleccionats a la UI
  const activeFilterCount = [activityId, statusFilter].filter(Boolean).length;

  // obrim el modal de confirmacio d'eliminacio
  const handleDeleteClick = (id) => {
    setCompetitionToDelete(id);
  };

  // confirmem l'esborrat de la jornada de forma permanent a la base de dades
  const confirmDelete = async () => {
    if (competitionToDelete) {
      await dispatch(deleteCompetition(competitionToDelete));
      setCompetitionToDelete(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* capçalera de la pagina */}
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-dark uppercase tracking-tight">
            Competicions / Jornades
          </h2>
          <p className="text-muted text-sm font-medium mt-1">
            Gestiona els esdeveniments esportius i les instal·lacions del centre.
          </p>
        </div>

        {/* barres de seleccio i filtres de cerca */}
        <div className="flex flex-wrap items-end gap-3">

          {/* filtre d'activitats */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <Filter size={10} /> Activitat
            </label>
            
            <select
              id="filter-activity"
              value={activityId}
              onChange={(e) => {
                setFilter("activity_id", e.target.value);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[160px]"
            >
              <option value="">Tots els esports</option>
              {activitiesList.map((a) => {
                return (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* filtre de l'estat del torneig */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-1">
              <Filter size={10} /> Estat
            </label>
            
            <select
              id="filter-status"
              value={statusFilter}
              onChange={(e) => {
                setFilter("status", e.target.value);
              }}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-dark bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer min-w-[180px]"
            >
              {STATUS_OPTIONS.map((opt) => {
                return (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* boto per netejar tots els filtres si n'hi ha algun actiu */}
          {activeFilterCount > 0 && (
            <button
              id="clear-filters-btn"
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 self-end rounded-xl text-xs font-bold text-danger bg-danger/5 hover:bg-danger/10 border border-danger/20 transition-all cursor-pointer"
            >
              <X size={12} strokeWidth={3} />
              Netejar ({activeFilterCount})
            </button>
          )}

          {/* empenyem el boto de nova jornada a la dreta */}
          <div className="flex-1" />

          {/* boto per a obrir el formulari de creacio (nomes per a administradors) */}
          <RoleRule allowedRoles={[ROLES.ADMIN]}>
            <button
              id="add-competition-btn"
              onClick={() => {
                setIsAddOpen((prev) => {
                  return !prev;
                });
              }}
              className={`flex items-center gap-2 px-5 py-2 rounded-2xl font-bold text-sm transition-all cursor-pointer shadow-md self-end ${
                isAddOpen
                  ? "bg-white text-dark border border-gray-200 shadow-sm"
                  : "bg-primary text-white hover:bg-primary-hover shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isAddOpen ? (
                <>
                  <X size={16} strokeWidth={3} />
                  <span>Cancel·lar</span>
                </>
              ) : (
                <>
                  <Plus size={16} strokeWidth={3} />
                  <span>Nova Jornada</span>
                </>
              )}
            </button>
          </RoleRule>

        </div>

        {/* formulari de creacio de jornada en cas de tindre'l obert */}
        {isAddOpen && (
          <div className="bg-white rounded-2xl md:rounded-3xl p-5 md:p-8 border border-primary/5 shadow-xl animate-fade-in">
            <h3 className="text-lg md:text-xl font-bold text-dark mb-6">
              Detalls de la nova competició
            </h3>
            
            <CompetitionForm
              onSuccess={() => {
                setIsAddOpen(false);
              }}
              onCancel={() => {
                setIsAddOpen(false);
              }}
            />
          </div>
        )}
      </div>

      {/* modal de confirmacio d'esborrat permanent */}
      <ConfirmModal
        isOpen={!!competitionToDelete}
        title="Eliminar Jornada"
        message="Estàs segur que vols eliminar aquesta jornada? Aquesta acció no es pot desfer i esborrarà els equips i partits associats."
        onConfirm={confirmDelete}
        onCancel={() => {
          setCompetitionToDelete(null);
        }}
      />

      {/* cartellets d'error o d'exit del panell general */}
      {error && (
        <div className="p-4 bg-danger/5 border border-danger/20 rounded-2xl text-danger text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-danger shrink-0" />
          <span className="flex-1">{error}</span>
          <button 
            onClick={() => {
              dispatch(setError(null));
            }} 
            className="text-danger/50 hover:text-danger cursor-pointer"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {success && (
        <div className="p-4 bg-success/5 border border-success/20 rounded-2xl text-success text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-success shrink-0" />
          <span className="flex-1">{success}</span>
          <button 
            onClick={() => {
              dispatch(setSuccess(null));
            }} 
            className="text-success/50 hover:text-success cursor-pointer"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* recompte total de jornades trobades */}
      {!isLoading && (
        <p className={`text-xs text-muted font-medium ${filteredCompetitions.length === 0 ? 'mb-8 pb-4' : '-mb-4'}`}>
          {filteredCompetitions.length === 0
            ? "Cap jornada trobada amb aquests filtres"
            : `${filteredCompetitions.length} jornada${filteredCompetitions.length !== 1 ? "s" : ""} trobada${filteredCompetitions.length !== 1 ? "s" : ""}`}
          
          {activeFilterCount > 0 && (
            <span className="ml-2 text-primary font-bold">
              ({activeFilterCount} filtre{activeFilterCount !== 1 ? "s" : ""} actiu{activeFilterCount !== 1 ? "s" : ""})
            </span>
          )}
        </p>
      )}

      {/* llista de targetes de les jornades esportives */}
      <div className="space-y-6">
        {isLoading && !filteredCompetitions.length ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" message="Buscant competicions..." />
          </div>
        ) : (
          <CompetitionList
            competitions={filteredCompetitions}
            onEdit={(c) => {
              setEditingCompetition(c);
            }}
            onDelete={handleDeleteClick}
          />
        )}
      </div>

      {/* modal per a editar la configuracio de la competicio */}
      {editingCompetition && (
        <EditCompetitionModal
          competition={editingCompetition}
          onClose={() => {
            setEditingCompetition(null);
          }}
        />
      )}

    </div>
  );
}
