// 1. Imports de biblioteques
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Edit2, Trash2, ArrowLeft, X } from "lucide-react";

// 2. Imports de Redux (Accions, Thunks i Selectors)
import { 
  deleteCompetition, 
  updateCompetition, 
  loadActivities, 
  loadFields, 
  loadCompetitionById 
} from "../features/competition/competitionThunks";

import { 
  selectCompetitionActivities, 
  selectCompetitionFields, 
  selectCurrentCompetition, 
  selectIsLoadingCompetitions,
  selectCompetitionError,
  selectCompetitionSuccess
} from "../features/competition/competitionSelectors";

import { 
  setError, 
  setSuccess 
} from "../features/competition/competitionSlice";

// 3. Imports de components d'UI
import JornadaStatusBadge from "../components/ui/JornadaStatusBadge";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert } from "../components/ui/Alerts";
import ConfirmModal from "../components/ui/ConfirmModal";
import EditCompetitionModal from "../features/competition/components/EditCompetitionModal";
import RoleRule from "../components/auth/RoleRule";
import TeamList from "../features/teams/components/TeamList";

/**
 * PÀGINA DE DETALLS DE LA COMPETICIÓ
 * 
 * En aquesta pàgina mostrem tota la informació d'una jornada concreta:
 * l'esport, el pavelló, l'estat actual, les pistes i la llista d'equips.
 * També és el lloc on els administradors poden editar o esborrar la jornada.
 */
export default function CompetitionDetailsPage() {
  // --- 2. Hooks ---
  
  // Obtenim l'ID de la competició de l'URL (/jornades/competicions/:id)
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Obtenim totes les dades de Redux
  const competition = useSelector(selectCurrentCompetition);
  const activities = useSelector(selectCompetitionActivities);
  const fields = useSelector(selectCompetitionFields);
  const isLoading = useSelector(selectIsLoadingCompetitions);
  const error = useSelector(selectCompetitionError);
  const success = useSelector(selectCompetitionSuccess);
  
  // Estats locals per controlar la visibilitat dels modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);


  // --- 3. Variables derivades ---

  // Formatem les dates per a una millor visualització
  const formattedEventDate = competition?.date 
    ? new Date(competition.date).toLocaleDateString("ca-ES") 
    : "Sense data";

  const formattedDeadline = competition?.registration_deadline 
    ? new Date(competition.registration_deadline).toLocaleDateString("ca-ES", { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : "Oberta permanentment";


  // --- 4. Efectes (Side Effects) ---

  /**
   * Quan entrem a la pàgina, demanem tota la informació necessària al servidor.
   */
  useEffect(() => {
    // 1. Dades de la competició específica
    dispatch(
      loadCompetitionById(id)
    );
    
    // 2. Llista d'activitats i camps (per si volem editar)
    dispatch(
      loadActivities()
    );
    
    dispatch(
      loadFields()
    );
  }, [id, dispatch]);


  // --- 5. Handlers ---

  /**
   * S'executa quan l'usuari guarda canvis al modal d'edició.
   */
  const handleUpdateCompetition = async (compId, updatedData) => {
    try {
      await dispatch(
        updateCompetition(compId, updatedData)
      );
      
      // Si tot va bé, tanquem el modal
      setShowEditModal(false);
    } catch (err) {
      // Els errors ja es guarden a l'estat global de Redux
    }
  };

  /**
   * S'executa quan l'usuari confirma que vol eliminar la jornada definitivament.
   */
  const handleConfirmDeletion = async () => {
    try {
      await dispatch(
        deleteCompetition(id)
      );
      
      // Si s'esborra, ja no podem estar en aquesta pàgina, tornem al llistat
      navigate("/jornades/competicions");
    } catch (err) {
      // Tanquem el modal d'esborrat per mostrar l'error a la pantalla
      setShowDeleteModal(false);
    }
  };


  // --- 6. Renderitzats condicionals (Pantalles de càrrega i error) ---

  // Si estem carregant i encara no tenim la competició en memòria
  if (isLoading && !competition) {
    return (
      <Spinner 
        message="Estem recuperant els detalls de la jornada..." 
      />
    );
  }

  // Si hi ha hagut un error o la competició no s'ha trobat
  const isNotFound = !isLoading && !competition;

  if (error || isNotFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorAlert 
          message={error || "Ho sentim, no hem trobat la jornada que busques."} 
        />
        
        <button 
          onClick={() => {
            navigate("/jornades/competicions");
          }} 
          className="mt-4 text-primary hover:underline font-medium flex items-center gap-2"
        >
          <ArrowLeft 
            size={16} 
          /> 
          Tornar al llistat general
        </button>
      </div>
    );
  }


  // --- 7. Render principal (JSX) ---

  return (
    <div className="space-y-8">
      
      {/* CAPÇALERA: Navegació (Breadcrumbs) i Botons d'Acció */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        
        {/* Camí de navegació */}
        <nav className="flex items-center gap-2 text-sm font-medium">
          <button 
            onClick={() => {
              navigate("/jornades/competicions");
            }}
            className="text-muted hover:text-primary transition-colors"
          >
            Jornades
          </button>
          <span className="text-muted/30">/</span>
          <span className="text-dark font-bold">
            Detalls de la competició
          </span>
        </nav>

        <div className="flex items-center gap-3">
          {/* Botó per tornar enrere */}
          <button 
            onClick={() => {
              navigate("/jornades/competicions");
            }} 
            className="text-muted hover:text-primary transition-all font-medium flex items-center gap-2 group"
          >
            <div className="p-2 rounded-xl group-hover:bg-primary/5 transition-all">
              <ArrowLeft 
                size={18} 
              />
            </div>
            <span>Enrere</span>
          </button>

          {/* Botons d'administració (Editar / Esborrar) */}
          <RoleRule 
            allowedRoles={["admin"]}
          >
            <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <button
                onClick={() => {
                  setShowEditModal(true);
                }}
                className="p-2.5 rounded-xl text-muted hover:bg-primary/5 hover:text-primary transition-all duration-200"
                title="Editar dades de la jornada"
              >
                <Edit2 
                  size={18} 
                />
              </button>
              
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                }}
                className="p-2.5 rounded-xl text-muted hover:bg-danger/5 hover:text-danger transition-all duration-200"
                title="Eliminar jornada definitivament"
              >
                <Trash2 
                  size={18} 
                />
              </button>
            </div>
          </RoleRule>
        </div>
      </div>

      {/* ALERTES DE FEEDBACK (Errors o Èxits) */}
      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-error" />
          <span className="flex-1">
            {error}
          </span>
          <button 
            onClick={() => {
              dispatch(setError(null));
            }} 
            className="text-error/50 hover:text-error transition-colors"
          >
            <X 
              size={16} 
              strokeWidth={3} 
            />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="flex-1">
            {success}
          </span>
          <button 
            onClick={() => {
              dispatch(setSuccess(null));
            }} 
            className="text-success/50 hover:text-success transition-colors"
          >
            <X 
              size={16} 
              strokeWidth={3} 
            />
          </button>
        </div>
      )}

      {/* TARGETA PRINCIPAL D'INFORMACIÓ */}
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Títol i Estat */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-dark">
              {competition.name}
            </h1>
            <p className="text-muted mt-2 text-xs">
              ID del sistema: {competition.id}
            </p>
          </div>
          
          <JornadaStatusBadge 
            status={competition.status} 
          />
        </div>

        {/* Graella d'informació (GRID) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Bloc Esquerre: Detalls de l'esdeveniment */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                Informació de l'esdeveniment
              </h3>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Esport / Activitat:</span>
                  <span className="font-bold text-dark">
                    {competition.activity?.name ?? "No especificat"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Data previst:</span>
                  <span className="font-bold text-dark">
                    {formattedEventDate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Hora d'inici:</span>
                  <span className="font-bold text-dark">
                    {competition.start_time ?? "No definida"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bloc Dret: Logística i Instal·lacions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">
                Logística i instal·lacions
              </h3>
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Instal·lació:</span>
                  <span className="font-bold text-dark">
                    {competition.field?.name ?? "Pendent d'assignar"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Pistes disponibles:</span>
                  <span className="font-bold text-dark">
                    {competition.available_courts}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted">Final de les inscripcions:</span>
                  <span className="font-bold text-dark text-right">
                    {formattedDeadline}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* SECCIÓ D'EQUIPS: Component independent que mostra els equips d'aquesta jornada */}
      <TeamList 
        competitionId={id} 
      />

      {/* MODALS (Es renderitzen només quan calgui) */}
      
      {showEditModal && (
        <EditCompetitionModal
          competition={competition}
          activities={activities}
          fields={fields}
          onClose={() => {
            setShowEditModal(false);
          }}
          onUpdate={handleUpdateCompetition}
        />
      )}

      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Eliminar Jornada"
          message={`Estàs segur que vols eliminar la jornada "${competition.name}" definitivament? Aquesta acció esborrarà tots els equips i resultats associats i no es pot desfer.`}
          onConfirm={handleConfirmDeletion}
          onCancel={() => {
            setShowDeleteModal(false);
          }}
        />
      )}

    </div>
  );
}
