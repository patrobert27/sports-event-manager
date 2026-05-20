import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Trash2,
  Settings,
  Clock,
  UserPlus,
  Eye,
  Crown,
  GraduationCap,
  Users,
  Edit,
} from "lucide-react";

import { joinTeam, removeMember, deleteTeam } from "../teamThunks";
import {
  selectUserInAnyTeam,
  selectIsRegistrationOpen,
  selectIsCurrentUserAdmin,
  selectIsCompetitionFinished,
} from "../teamSelectors";
import { ROLES } from "../../../constants/roles";
import RoleRule from "../../../components/auth/RoleRule";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import EditTeamModal from "./EditTeamModal";

// Aquesta card mostra les dades generals d'un equip inscrit per a la vista pública de l'escola o alumne
export default function TeamCard({ team }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [team.shield]);

  const currentUser = useSelector((state) => {
    return state.auth.user;
  });
  
  const competition = useSelector((state) => {
    return state.competition.currentCompetition;
  });
  
  const userInAnyTeam = useSelector((state) => {
    return selectUserInAnyTeam(state, competition?.id, currentUser?.id);
  });

  const isAdmin = useSelector(selectIsCurrentUserAdmin);
  const isRegistrationOpen = useSelector(selectIsRegistrationOpen);
  const isFinished = useSelector(selectIsCompetitionFinished);

  // Calculem les relacions en calent de l'usuari amb l'equip (si és tutor, capità o membre confirmat)
  const { isMember, isCaptain, isTutor, pendingRecord, confirmedCount } = React.useMemo(() => {
    
    if (!currentUser) {
      return { 
        isMember: false, 
        isCaptain: false, 
        isTutor: false, 
        pendingRecord: null, 
        confirmedCount: 0 
      };
    }
    
    return {
      isMember: team.players?.some((p) => {
        return p.user?.id === currentUser.id && p.confirmed;
      }),
      isCaptain: team.captain?.id === currentUser.id,
      isTutor: team.teacher?.id === currentUser.id,
      pendingRecord: team.players?.find((p) => {
        return p.user?.id === currentUser.id && !p.confirmed;
      }),
      confirmedCount: team.players?.filter((p) => {
        return p.confirmed;
      }).length || 0
    };
  }, [team.players, team.captain, team.teacher, currentUser]);

  const minPlayers = competition?.activity?.min_players || 0;
  const maxPlayers = competition?.activity?.max_players || 0;

  const canManage = isCaptain || isTutor || isAdmin;
  const readOnly = (!isRegistrationOpen || competition?.status !== "REGISTRATION") && !isAdmin;
  const canEdit = isAdmin || (isCaptain && isRegistrationOpen) || (isTutor && !isFinished);

  // Handler per sol·licitar unir-se a l'equip si la inscripció està oberta
  const handleJoin = React.useCallback(() => {
    if (!isRegistrationOpen) {
      return;
    }
    dispatch(
      joinTeam(team.id, competition.id)
    );
  }, [dispatch, team.id, competition?.id, isRegistrationOpen]);

  // Handler per retirar la petició de forma còmoda abans que el capità l'accepti
  const handleWithdraw = React.useCallback(() => {
    if (!isRegistrationOpen) {
      return;
    }
    if (pendingRecord) {
      dispatch(
        removeMember(pendingRecord.id, competition.id, null, "Sol·licitud d'unió retirada correctament.")
      );
    }
  }, [dispatch, pendingRecord, competition?.id, isRegistrationOpen]);

  const handleDelete = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = React.useCallback(() => {
    dispatch(
      deleteTeam(team.id, competition.id)
    );
    setShowDeleteConfirm(false);
  }, [dispatch, team.id, competition?.id]);

  const primaryColor = team.primary_color || "#3b82f6";

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all space-y-5 relative group overflow-hidden"
      style={{ 
        borderTop: `4px solid ${primaryColor}` 
      }}
    >
      
      {/* Botó de l'admin per eliminar directament l'equip amb confirmació de seguretat */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 text-danger bg-danger/10 md:bg-white/80 md:text-muted md:hover:text-danger md:hover:bg-danger/5 p-2 rounded-xl transition-all z-10 backdrop-blur-sm shadow-sm cursor-pointer"
          title="Eliminar equip"
        >
          <Trash2 size={18} />
        </button>
      )}

      {canEdit && (
        <button
          onClick={() => {
            setShowEditModal(true);
          }}
          className={`absolute top-3 ${isAdmin ? "right-14" : "right-3"} text-primary bg-primary/10 md:bg-white/80 md:text-muted md:hover:text-primary md:hover:bg-primary/5 p-2 rounded-xl transition-all z-10 backdrop-blur-sm shadow-sm cursor-pointer`}
          title="Editar equip"
        >
          <Edit size={18} />
        </button>
      )}

      <div className="flex items-center gap-4">
        
        {/* Vista prèvia de l'escut */}
        <div className="relative">
          {team.shield && !imageError ? (
            <img
              src={team.shield}
              alt="Shield"
              onError={() => {
                setImageError(true);
              }}
              className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm"
            />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
              style={{
                backgroundColor: primaryColor,
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {(team.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          
          {isCaptain && (
            <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-lg shadow-md">
              <Crown size={12} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-dark truncate leading-tight">
            {team.name}
          </h3>
          
          <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">
            {team.code ? `CODI: ${team.code}` : "Pendent de codi"}
          </p>
        </div>

      </div>

      <div className="space-y-3 pt-2">
        
        {/* Capità del grup */}
        <InfoLine
          icon={<Crown size={14} className="text-amber-500 shrink-0" />}
          label="Capità"
          value={
            team.captain?.first_name 
              ? `${team.captain.first_name} ${team.captain.last_name || ""}`.trim()
              : "Sense capità assignat"
          }
          isPlaceholder={!team.captain?.first_name}
        />
        
        {/* Tutor del grup */}
        <InfoLine
          icon={<GraduationCap size={14} className="text-primary shrink-0" />}
          label="Tutor"
          value={
            team.teacher?.first_name 
              ? `${team.teacher.first_name} ${team.teacher.last_name || ""}`.trim()
              : "Sense tutor assignat"
          }
          isPlaceholder={!team.teacher?.first_name}
        />

        {/* Informació de jugadors confirmats en aquest equip */}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
          
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
            <div className="flex items-center gap-1.5 text-muted">
              <Users size={14} />
              <span>Jugadors</span>
            </div>
            
            <span
              className={
                confirmedCount < minPlayers ? "text-danger" : "text-success"
              }
            >
              {confirmedCount}
              {maxPlayers ? ` / ${maxPlayers}` : ""}
            </span>
          </div>
          
          {/* Barra de progés de capacitat d'equip */}
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${confirmedCount < minPlayers ? "bg-danger" : "bg-success"}`}
              style={{
                width: `${Math.min((confirmedCount / (maxPlayers || 12)) * 100, 100)}%`,
              }}
            />
          </div>
          
          {/* Si falten jugadors per al mínim, avisem còmodament al capità */}
          {confirmedCount < minPlayers && (
            <p className="text-[9px] text-danger font-bold flex items-center gap-1">
              <Clock size={10} /> 
              Falten {minPlayers - confirmedCount} per al mínim
            </p>
          )}

        </div>
      </div>

      <div className="pt-2 space-y-2">
        
        {readOnly && !canManage && (
          <div className="mb-2 p-2 bg-gray-50 rounded-xl text-[10px] text-muted font-bold flex items-center gap-2 uppercase tracking-tight">
            <Clock size={12} className="text-amber-500" /> 
            Accés només lectura
          </div>
        )}

        <button
          onClick={() => {
            const competitionId = team.competition?.id || competition?.id;
            if (competitionId) {
              navigate(
                `/jornades/${competitionId}/teams/${team.id}`,
              );
            }
          }}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm cursor-pointer ${
            canManage
              ? "bg-dark text-white hover:bg-black shadow-lg shadow-gray-200"
              : "bg-gray-100 text-muted hover:bg-gray-200"
          }`}
        >
          {canManage ? <Settings size={18} /> : <Eye size={18} />}
          {canManage ? "Gestionar Equip" : "Veure Equip"}
        </button>

        {/* Botó de petició d'unió per a alumnes lliures */}
        {!isMember &&
          !pendingRecord &&
          !userInAnyTeam &&
          !readOnly &&
          isRegistrationOpen && (
            <RoleRule allowedRoles={[ROLES.STUDENT]}>
              <button
                onClick={handleJoin}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-success/20 text-success hover:bg-success hover:text-white transition-all font-bold text-sm cursor-pointer"
              >
                <UserPlus size={18} /> 
                Sol·licitar Unió
              </button>
            </RoleRule>
          )}

        {/* Avís i acció de retirar sol·licitud si hi ha una petició pendent de revisió per part del capità */}
        {pendingRecord && !readOnly && isRegistrationOpen && (
          <div className="bg-amber-50 p-3 rounded-2xl space-y-2 border border-amber-100 text-center">
            
            <p className="text-[10px] text-amber-600 font-bold flex items-center justify-center gap-2 uppercase tracking-wider">
              <Clock size={12} /> 
              Sol·licitud pendent
            </p>
            
            <button
              onClick={handleWithdraw}
              className="w-full py-1 text-[9px] text-amber-700 underline font-black uppercase hover:text-amber-900 transition-colors cursor-pointer"
            >
              Retirar sol·licitud
            </button>

          </div>
        )}

      </div>

      {/* Modal de confirmació de seguretat abans d'esborrar equips sencer */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Equip"
        message={`Estàs segur que vols eliminar l'equip "${team.name}"? Aquesta acció no es pot desfer i eliminarà tots els membres de l'equip.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteConfirm(false);
        }}
      />

      {showEditModal && (
        <EditTeamModal
          team={team}
          competitionId={competition?.id}
          onClose={() => {
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

// Component auxiliar net per a representar cadascuna de les files d'informació superior de la card
function InfoLine({ icon, label, value, isPlaceholder }) {
  return (
    <div className="flex items-center gap-2 text-sm text-dark">
      
      {icon}
      
      <span className="text-muted font-medium">
        {label}:
      </span>
      
      <span
        className={`font-bold truncate ${isPlaceholder ? "text-muted/50 italic font-medium" : ""}`}
      >
        {value}
      </span>

    </div>
  );
}
