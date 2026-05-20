import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, LayoutGrid, Users, Search } from "lucide-react";

import { 
  loadTeams, 
  deleteTeam, 
  moveMemberBetweenTeams 
} from "../features/teams/teamThunks";

import { 
  selectTeams, 
  selectIsLoadingTeams, 
  selectTeamsError, 
  selectTeamsSuccess 
} from "../features/teams/teamSelectors";

import { loadCompetitionById } from "../features/competition/competitionThunks";
import { selectCurrentCompetition } from "../features/competition/competitionSelectors";
import { setError, setSuccess } from "../features/teams/teamSlice";
import { useTeamSocket } from "../features/teams/useTeamSocket";

import AdminTeamCard from "../features/teams/components/AdminTeamCard";
import MoveMemberModal from "../features/teams/components/MoveMemberModal";
import EditTeamModal from "../features/teams/components/EditTeamModal";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert, SuccessAlert } from "../components/ui/Alerts";
import ConfirmModal from "../components/ui/ConfirmModal";

/**
 * AdminTeamsManagementPage
 * Pantalla per a que els administradors puguin gestionar i equilibrar equips en temps real.
 */
export default function AdminTeamsManagementPage() {
  const { id: competitionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // selectors de Redux pel llistat d'equips i els errors del panell d'admin
  const teams = useSelector(selectTeams);
  const competition = useSelector(selectCurrentCompetition);
  const isLoading = useSelector(selectIsLoadingTeams);
  const error = useSelector(selectTeamsError);
  const success = useSelector(selectTeamsSuccess);

  // estats locals pel filtre del cercador i el control de jugadors o equips seleccionats
  const [searchTerm, setSearchTerm] = useState("");
  const [movingMember, setMovingMember] = useState(null);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [isMoving, setIsMoving] = useState(false);

  // filtrem els equips en temps real pel nom que escrigui el administrador al cercador
  const filteredTeams = teams.filter((team) => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // mirem de sincronitzar els equips en temps real per websockets si un alumne es canvia el nom
  useTeamSocket({ competitionId });

  // demanem la informacio del torneig i els equips quan entrem a la pantalla
  useEffect(() => {
    if (competitionId) {
      dispatch(loadCompetitionById(competitionId));
      dispatch(loadTeams({ competition_id: competitionId }));
    }
  }, [dispatch, competitionId]);

  // netegem el banner d'exit verd de forma automatica als 5 segons per a no tenir la pantalla plena
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

  // handler per obrir el modal per a transferir un jugador d'equip
  const handleOpenMoveModal = (playerRecord, sourceTeamId) => {
    setMovingMember({ playerRecord, sourceTeamId });
  };

  // bloquegem el boto mentre es mou el membre a un altre equip per evitar dobles clics
  const handleConfirmMove = async (targetTeamId) => {
    if (!movingMember) {
      return;
    }
    
    setIsMoving(true);
    
    try {
      await dispatch(moveMemberBetweenTeams(
        movingMember.playerRecord.id, 
        targetTeamId, 
        competitionId
      ));
      
      setMovingMember(null);
    } catch (err) {
      // deixem passar l'error perque Redux Slice ja guarda el missatge d'error general
    } finally {
      setIsMoving(false);
    }
  };

  // confirmacio de l'esborrat d'un equip sencer de la jornada competitiva
  const handleDeleteTeam = async () => {
    if (!teamToDelete) {
      return;
    }
    
    try {
      await dispatch(deleteTeam(teamToDelete.id, competitionId));
      setTeamToDelete(null);
    } catch (err) {
      // errors capturats automàticament per Redux
    }
  };

  // ensenyem roda de càrrega si encara no hem obtingut dades del backend
  if (isLoading && !teams.length) {
    return (
      <Spinner 
        message="Carregant equips de la jornada..." 
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* barra de dalt de títol i cercador d'equips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          
          <button 
            onClick={() => {
              navigate(-1);
            }}
            className="group flex items-center gap-2 text-primary font-bold text-sm hover:translate-x-[-4px] transition-all cursor-pointer"
          >
            <ArrowLeft size={18} strokeWidth={3} />
            TORNAR ENRERE
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary rounded-2xl text-white shadow-lg shadow-primary/20">
              <LayoutGrid size={24} />
            </div>
            
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-dark uppercase tracking-tight leading-none">
                Gestió d'Equips
              </h1>
              <p className="text-muted text-sm font-medium mt-1">
                {competition?.name || "Carregant jornada..."} • {teams.length} equips inscrits
              </p>
            </div>
          </div>

        </div>

        {/* camp del cercador text per a buscar equips rapidament pel seu nom */}
        <div className="relative w-full md:max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted/60" />
          </div>
          
          <input
            type="text"
            placeholder="Cerca equip pel nom..."
            className="block w-full pl-11 pr-4 py-3 bg-white border border-primary/10 rounded-2xl text-dark placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
          />
        </div>

      </div>

      {/* avisos generals d'error o d'exit del panell de control */}
      <div className="space-y-3">
        {error && (
          <ErrorAlert 
            message={error} 
            onClose={() => {
              dispatch(setError(null));
            }} 
          />
        )}
        
        {success && (
          <SuccessAlert 
            message={success} 
          />
        )}
      </div>

      {/* graella principal amb les targetes de tots els equips del torneig */}
      {teams.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
            <Users size={40} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-dark">
              No hi ha equips
            </h3>
            
            <p className="text-muted max-w-xs">
              Encara no s'ha creat cap equip per a aquesta jornada esportiva.
            </p>
          </div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-dashed border-gray-200 text-center">
          <p className="text-muted">
            No s'han trobat equips amb el nom "<span className="font-bold text-dark">{searchTerm}</span>"
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTeams.map((team) => {
            return (
              <AdminTeamCard 
                key={team.id}
                team={team}
                competitionId={competitionId}
                onMoveMember={(player, sourceId) => {
                  handleOpenMoveModal(player, sourceId);
                }}
                onEditTeam={(t) => {
                  setTeamToEdit(t);
                }}
                onDeleteTeam={(id, name) => {
                  setTeamToDelete({ id, name });
                }}
              />
            );
          })}
        </div>
      )}

      {/* modal interactiu per a moure o traspassar estudiants d'equip en temps real */}
      <MoveMemberModal 
        isOpen={!!movingMember}
        onClose={() => {
          setMovingMember(null);
        }}
        userName={movingMember?.playerRecord?.user?.first_name + " " + movingMember?.playerRecord?.user?.last_name}
        currentTeamId={movingMember?.sourceTeamId}
        teams={teams}
        onConfirm={handleConfirmMove}
        isLoading={isMoving}
      />

      {/* modal per a que l'administrador pugui editar el nom o logo de l'equip */}
      {teamToEdit && (
        <EditTeamModal 
          team={teamToEdit}
          competitionId={competitionId}
          onClose={() => {
            setTeamToEdit(null);
          }}
        />
      )}

      {/* modal de seguretat abans de borrar un equip, informant del llimb dels estudiants */}
      <ConfirmModal 
        isOpen={!!teamToDelete}
        title="Eliminar Equip"
        message={`Estàs segur que vols eliminar l'equip "${teamToDelete?.name}"? Aquesta acció mourà els seus membres al llimb o els eliminarà de la jornada segons la configuració.`}
        onConfirm={handleDeleteTeam}
        onCancel={() => {
          setTeamToDelete(null);
        }}
      />

    </div>
  );
}
