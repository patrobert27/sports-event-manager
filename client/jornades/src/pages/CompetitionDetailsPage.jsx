import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Edit2, Trash2, ArrowLeft, X, Users, Zap, Calendar, Trophy, MapPin } from "lucide-react";

// Impotacions d'accions asíncrones (Thunks) per a les competicions
import {
  deleteCompetition,
  updateCompetition,
  loadActivities,
  loadFields,
  loadCompetitionById
} from "../features/competition/competitionThunks";

// Selectors centralitzats per demanar informació de l'estat de Redux
import {
  selectCompetitionActivities,
  selectCompetitionFields,
  selectCurrentCompetition,
  selectIsLoadingCompetitions,
  selectCompetitionError,
  selectCompetitionSuccess
} from "../features/competition/competitionSelectors";

// Accions síncrones per netejar missatges de Redux
import {
  setError,
  setSuccess
} from "../features/competition/competitionSlice";

// Components auxiliars de la Interfície d'Usuari (UI)
import JornadaStatusBadge from "../components/ui/JornadaStatusBadge";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert } from "../components/ui/Alerts";
import ConfirmModal from "../components/ui/ConfirmModal";
import EditCompetitionModal from "../features/competition/components/EditCompetitionModal";
import RoleRule from "../components/auth/RoleRule";

// Panells i llistes específiques per a cada pestanya
import TeamList from "../features/teams/components/TeamList";
import { useTeamSocket } from "../features/teams/useTeamSocket";
import GroupStagePanel from "../features/groups/components/GroupStagePanel";
import MyPredictionsPanel from "../features/predictions/components/MyPredictionsPanel";

// Thunks per carregar l'estat d'apostes
import {
  loadBettingStatus
} from "../features/predictions/predictionThunks";

// Constants dels rols d'administració
import { ADMIN_VARIANTS } from "../constants/roles";

/**
 * PÀGINA DE DETALLS DE LA COMPETICIÓ
 * 
 * En aquesta pàgina mostrem tota la informació d'una jornada concreta:
 * l'esport, el pavelló, l'estat actual, les pistes i la llista d'equips.
 * També és el lloc on els administradors poden editar o esborrar la jornada.
 */
export default function CompetitionDetailsPage() {

  // HOOKS I RUTAS  

  // Obtenim l'ID de la competició directament de l'URL (/jornades/:id)
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();


  // DADES DE REDUX (ESTAT GLOBAL) 

  const competition = useSelector(selectCurrentCompetition);
  const activities = useSelector(selectCompetitionActivities);
  const fields = useSelector(selectCompetitionFields);
  const isLoading = useSelector(selectIsLoadingCompetitions);
  const error = useSelector(selectCompetitionError);
  const success = useSelector(selectCompetitionSuccess);
  const isRankingVisible = useSelector((state) => {
    return state.predictions.isRankingVisible;
  });
  const user = useSelector((state) => {
    return state.auth.user;
  });

  // Comprovem si el rol de l'usuari actual és administrador
  const isAdmin = ADMIN_VARIANTS.includes(
    (user?.role?.name || "").toLowerCase()
  );


  // ESTATS LOCALS (INTERFÍCIE)

  // Controlen si els modals de modificació i eliminació estan oberts
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Controla la pestanya activa en pantalles grans ('equips', 'competicio' o 'prediccions')
  const [viewTab, setViewTab] = useState("equips");


  // EFECTES 

  // Esborra automàticament els missatges d'èxit de Redux després de 5 segons
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

  // Sincronitza l'estat dels equips en temps real via sockets
  useTeamSocket({ competitionId: id });

  // Demana tota la informació de la jornada quan entrem o canvia l'ID
  useEffect(() => {
    if (id) {
      // 1. Dades de la competició específica
      dispatch(loadCompetitionById(id));

      // 2. Estat actual de les apostes del sistema
      dispatch(loadBettingStatus());
    }
  }, [id, dispatch]);

  // Carrega les dades auxiliars (activitats i camps) només quan l'admin obre el formulari
  useEffect(() => {
    if (showEditModal) {
      dispatch(loadActivities());
      dispatch(loadFields());
    }
  }, [showEditModal, dispatch]);


  // ── FORMATEIG DE VALORS ──

  // Format de la data general de la jornada (Català)
  const formattedEventDate = competition?.date
    ? new Date(competition.date).toLocaleDateString("ca-ES")
    : "Sense data";

  // Format del límit d'inscripció de la jornada
  const formattedDeadline = competition?.registration_deadline
    ? new Date(competition.registration_deadline).toLocaleDateString("ca-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
    : "Oberta permanentment";


  // ── ACCIONS I CONTROLADORS (HANDLERS) ──

  /**
   * Modifica les dades d'una competició mitjançant Redux Thunk
   */
  const handleUpdateCompetition = async (compId, updatedData) => {
    try {
      await dispatch(updateCompetition(compId, updatedData));

      // Si tot ha anat bé, tanquem el formulari
      setShowEditModal(false);
    } catch (err) {
      // Els errors ja es capturen a l'estat global de Redux
    }
  };

  /**
   * Elimina la jornada de forma permanent
   */
  const handleConfirmDeletion = async () => {
    try {
      await dispatch(deleteCompetition(id));

      // En cas d'èxit, tornem al llistat general
      navigate("/jornades");
    } catch (err) {
      // Tanquem el modal d'esborrat per no bloquejar la visualització de l'error
      setShowDeleteModal(false);
    }
  };


  // ── PANTALLES DE CARREGANT I ERRORES ──

  // Si estem carregant i no tenim cap dada a la memòria de Redux
  if (isLoading && !competition) {
    return (
      <Spinner
        message="Estem recuperant els detalls de la jornada..."
      />
    );
  }

  // Si no s'ha trobat cap competició
  const isNotFound = !isLoading && !competition;

  if (error || isNotFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ErrorAlert
          message={error || "Ho sentim, no hem trobat la jornada que busques."}
        />

        <button
          onClick={() => {
            navigate("/jornades");
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


  // ── RENDERING PRINCIPAL (JSX) ──

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-full overflow-x-hidden px-px">

      {/* 💻 VISTA WEB: Capçalera i targeta gran de detalls (només es veu a PC/Tablet) */}
      <div className="hidden md:block space-y-6">
        
        {/* SECCIÓ SUPERIOR WEB */}
        <div className="flex items-center justify-between gap-6 mb-6">
          <nav className="flex items-center gap-2 text-sm font-medium">
            <button
              onClick={() => navigate("/jornades")}
              className="text-muted hover:text-primary transition-colors"
            >
              Jornades
            </button>
            <span className="text-muted/30">/</span>
            <span className="text-dark font-bold">Detalls de la competició</span>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/jornades")}
              className="text-muted hover:text-primary transition-all font-medium flex items-center gap-2 group"
            >
              <div className="p-2 rounded-xl group-hover:bg-primary/5 transition-all">
                <ArrowLeft size={18} />
              </div>
              <span className="text-sm font-semibold">Enrere</span>
            </button>

            <RoleRule allowedRoles={["admin"]}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(`/jornades/${id}/equips`)}
                  className="bg-primary text-white hover:bg-primary-hover px-6 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95"
                >
                  <Users size={18} />
                  <span>Gestionar Equips</span>
                </button>

                <div className="flex gap-1 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2.5 rounded-xl bg-primary/10 text-primary md:bg-white md:text-muted md:hover:bg-primary/5 md:hover:text-primary transition-all duration-200"
                    title="Editar dades de la jornada"
                  >
                    <Edit2 size={18} />
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2.5 rounded-xl bg-danger/10 text-danger md:bg-white md:text-muted md:hover:bg-danger/5 md:hover:text-danger transition-all duration-200"
                    title="Eliminar jornada"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </RoleRule>
          </div>
        </div>

        {/* TARGETA DE DETALLS DE LA JORNADA ORIGINAL WEB (la que a tu t'encanta) */}
        <div className="bg-white rounded-3xl p-5 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div>
              <h1 className="text-3xl font-bold text-dark">{competition.name}</h1>
              {isAdmin && <p className="text-muted mt-2 text-xs">ID del sistema: {competition.id}</p>}
            </div>
            <JornadaStatusBadge
              status={competition.status}
              registrationStart={competition.registration_start}
              registrationDeadline={competition.registration_deadline}
            />
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Informació de l'esdeveniment</h3>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Esport / Activitat:</span>
                    <span className="font-bold text-dark text-base">{competition.activity?.name ?? "No especificat"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Data previst:</span>
                    <span className="font-bold text-dark text-base">{formattedEventDate}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Hora d'inici:</span>
                    <span className="font-bold text-dark text-base">{competition.start_time ?? "No definida"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-3">Logística i instal·lacions</h3>
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Instal·lació:</span>
                    <span className="font-bold text-dark text-base">{competition.field?.name ?? "Pendent d'assignar"}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Pistes disponibles:</span>
                    <span className="font-bold text-dark text-base">{competition.available_courts}</span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-sm text-muted">Final de les inscripcions:</span>
                    <span className="font-bold text-dark text-base">{formattedDeadline}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 📱 VISTA MÒBIL: Capçalera i targeta de detalls compacta adaptada a mòbil (només es veu a telèfons) */}
      <div className="md:hidden space-y-4 w-full max-w-full overflow-hidden">
        
        {/* SECCIÓ SUPERIOR MÒBIL */}
        <div className="flex items-center justify-between gap-3">
          <nav className="text-xs font-semibold text-muted">
            Jornades <span className="mx-1 text-muted/30">/</span> <span className="text-dark font-bold">Detalls</span>
          </nav>
          
          <button
            onClick={() => navigate("/jornades")}
            className="text-muted hover:text-primary transition-all font-medium flex items-center gap-1 group text-xs"
          >
            <ArrowLeft size={14} />
            <span>Enrere</span>
          </button>
        </div>

        {/* TARGETA DE DETALLS DE LA JORNADA MÒBIL (Estil 100% clonat de CompetitionCard per a adaptació perfecta a mòbil) */}
        <div className="group relative bg-white rounded-2xl border border-gray-100 pl-5 pr-4 py-4 md:pl-6 md:pr-5 md:py-5 shadow-sm hover-lift premium-shadow animate-fade-in flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 overflow-hidden w-full max-w-full">
          
          {/* Barra lateral de color segons l'esport triat */}
          <div
            className="absolute left-0 top-0 h-full w-2 opacity-80"
            style={{
              backgroundColor: competition.activity?.color || "#4FA8F5",
            }}
          />

          <div className="flex-1 w-full pl-0">
            
            {/* FILA SUPERIOR: Títol de la jornada i Botons d'acció de l'admin o alumne */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                  {competition.name}
                </h4>

                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Etiqueta de l'esport */}
                  <span
                    className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white uppercase tracking-wider"
                    style={{
                      backgroundColor: competition.activity?.color || "#4FA8F5",
                    }}
                  >
                    {competition.activity?.name}
                  </span>

                  {/* Estat actual */}
                  <JornadaStatusBadge 
                    status={competition.status}
                    registrationStart={competition.registration_start}
                    registrationDeadline={competition.registration_deadline}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                
                {/* Grilla principal de botons d'acció */}
                <div className="flex gap-2 w-full sm:w-auto flex-1 sm:flex-initial">
                  
                  <button
                    onClick={() => navigate("/jornades")}
                    className="flex-1 sm:flex-none sm:w-[140px] bg-primary/10 text-primary hover:bg-primary hover:text-white border border-transparent px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    Tornar
                  </button>

                  <RoleRule allowedRoles={["admin"]}>
                    <button
                      onClick={() => navigate(`/jornades/${id}/equips`)}
                      className="flex-1 sm:flex-none sm:w-[140px] bg-white border border-primary/20 text-primary hover:bg-primary hover:text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]"
                      title="Gestionar Equips"
                    >
                      <Users size={16} />
                      <span>Equips</span>
                    </button>
                  </RoleRule>

                </div>

                {/* Botons d'edició/esborrat per a l'administrador */}
                <RoleRule allowedRoles={["admin"]}>
                  <div className="flex items-center justify-end sm:justify-start gap-2 w-full sm:w-auto border-t sm:border-none border-gray-100 pt-3 sm:pt-0">
                    <span className="text-[9px] font-black text-muted uppercase tracking-wider mr-auto sm:hidden">
                      Opcions de gestió
                    </span>
                    
                    <button
                      onClick={() => setShowEditModal(true)}
                      className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm active:scale-95"
                      title="Editar Jornada"
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-red-50 text-red-600 hover:bg-red-500 hover:text-white shadow-sm active:scale-95"
                      title="Eliminar Jornada"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </RoleRule>

              </div>
            </div>

            {/* FILA INFERIOR: Informació de localització, data i pistes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 pt-3.5 border-t border-gray-100 text-xs sm:text-sm text-muted">
              <div className="flex items-center gap-2">
                <Calendar size={15} className="text-primary/60 shrink-0" />
                <span>{formattedEventDate} {competition.start_time ? `a les ${competition.start_time}` : ""}</span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-primary/60 shrink-0" />
                <span className="truncate">{competition.field?.name ?? "Sense pavelló assignat"}</span>
              </div>

              <div className="flex items-center gap-2">
                <Users size={15} className="text-primary/60 shrink-0" />
                <span>{competition.available_courts} Pistes totals</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Alertes d'Error locals */}
      {error && (
        <div className="mb-6 p-4 bg-danger/5 border border-danger/20 rounded-2xl text-danger text-sm font-medium flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-danger" />
          <span className="flex-1">{error}</span>
          <button
            onClick={() => {
              dispatch(setError(null));
            }}
            className="text-danger/50 hover:text-danger transition-colors"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* Alertes d'Èxit locals */}
      {success && (
        <div className="mb-6 p-4 bg-success/5 border border-success/20 rounded-2xl text-success text-sm font-medium flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="flex-1">{success}</span>
          <button
            onClick={() => {
              dispatch(setSuccess(null));
            }}
            className="text-success/50 hover:text-success transition-colors"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>
      )}

      {/*
        Barra de pestanyes (tabs) de navegació.
        FIX RESPONSIVE (A3):
        - overflow-x-auto: si les tabs no caben en pantalla petita, l'usuari pot fer scroll horitzontal
        - pb-0: evitem doble border al fer scroll
        - whitespace-nowrap a cada botó: evitem que el text de la tab es parteixi en dues línies
        Sense aquest fix, "Les meves prediccions" quedava tallada o desbordava en 360px.
      */}
      <div className="border-b border-gray-200 overflow-x-auto w-full max-w-full">
        <div className="flex gap-1 sm:gap-3 w-full justify-between sm:justify-start">

          {/* Tab Equips */}
          <button
            onClick={() => {
              setViewTab("equips");
            }}
            className={`py-2 px-2 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${viewTab === "equips"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-dark"
              }`}
          >
            Equips
          </button>

          {/* Tab Fase competitiva */}
          <button
            onClick={() => {
              setViewTab("competicio");
            }}
            className={`py-2 px-2 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${viewTab === "competicio"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-dark"
              }`}
          >
            <span className="hidden sm:inline">Fase competitiva</span>
            <span className="sm:hidden">Competició</span>
          </button>

          {/* Tab Prediccions — només visible si les apostes estan obertes o si és admin */}
          {(isRankingVisible || isAdmin) && (
            <button
              onClick={() => {
                setViewTab("prediccions");
              }}
              className={`py-2 px-2 sm:px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors whitespace-nowrap flex-1 sm:flex-none text-center ${viewTab === "prediccions"
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-dark"
                }`}
            >
              <span className="hidden sm:inline">Les meves prediccions</span>
              <span className="sm:hidden">Prediccions</span>
            </button>
          )}

        </div>
      </div>

      {/* Contingut dinàmic segons la pestanya seleccionada (dins de contenidor amb desbordament controlat) */}
      <div className="w-full max-w-full overflow-x-auto rounded-3xl">
        {viewTab === "equips" && (
          <TeamList
            competitionId={id}
          />
        )}

        {viewTab === "competicio" && (
          <GroupStagePanel />
        )}

        {viewTab === "prediccions" && (
          <MyPredictionsPanel />
        )}
      </div>

      {/* MODALS D'ADMINISTRACIÓ DE LA JORNADA */}
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
