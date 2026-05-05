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
  ShieldCheck,
  Users,
  Edit
} from "lucide-react";

import { joinTeam, removeMember, deleteTeam } from "../teamThunks";
import { selectUserInAnyTeam } from "../teamSelectors";
import { ROLES, STUDENT_VARIANTS, ADMIN_VARIANTS } from "../../../constants/roles";
import RoleRule from "../../../components/auth/RoleRule";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import EditTeamModal from "./EditTeamModal";

/**
 * TeamCard - Smart Component
 * Gestiona la seva pròpia lògica i accions mitjançant Redux.
 */
export default function TeamCard({ team }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Dades de l'estat global
  const currentUser = useSelector((state) => state.auth.user);
  const competition = useSelector((state) => state.competition.currentCompetition);
  const userInAnyTeam = useSelector(state => selectUserInAnyTeam(state, competition?.id, currentUser?.id));

  // Dades calculades (DTO del backend)
  const confirmedCount = team.confirmedCount || 0;
  const maxPlayers = team.maxPlayers;
  const minPlayers = team.minPlayers || 0;

  // Lògica d'usuari
  const roleName = (currentUser?.role?.name || "").toString().toLowerCase();
  const isAdmin = ADMIN_VARIANTS.includes(roleName);
  const isMember = team.players?.some(p => p.user?.id === currentUser?.id && p.confirmed);
  const isCaptain = team.captain?.id === currentUser?.id;
  const isTutor = team.teacher?.id === currentUser?.id;
  const pendingRecord = team.players?.find(p => p.user?.id === currentUser?.id && !p.confirmed);

  // Permisos de gestió
  const now = new Date();
  const registrationStart = competition?.registration_start ? new Date(competition.registration_start) : null;
  const registrationDeadline = competition?.registration_deadline ? new Date(competition.registration_deadline) : null;

  const isRegistrationOpen = competition?.status === 'REGISTRATION' && 
    (!registrationStart || registrationStart <= now) &&
    (!registrationDeadline || registrationDeadline > now);
  
  const canManage = isCaptain || isTutor || isAdmin;
  const readOnly = (!isRegistrationOpen || competition?.status !== 'REGISTRATION') && !isAdmin;

  // Lògica específica per a l'edició
  const isFinished = competition?.status === 'FINISHED';
  const canEdit = isAdmin || (isCaptain && isRegistrationOpen) || (isTutor && !isFinished);

  // Accions directes al Redux
  const handleJoin = () => {
    if (!isRegistrationOpen) return;
    dispatch(joinTeam(team.id, competition.id));
  };
  
  const handleWithdraw = () => {
    if (!isRegistrationOpen) return;
    if (pendingRecord) dispatch(removeMember(pendingRecord.id, competition.id));
  };
  
  const handleDelete = () => setShowDeleteConfirm(true);
  
  const confirmDelete = () => {
    dispatch(deleteTeam(team.id, competition.id));
    setShowDeleteConfirm(false);
  };

  const primaryColor = team.primary_color || '#3b82f6';

  return (
    <div
      className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all space-y-5 relative group overflow-hidden"
      style={{ borderTop: `4px solid ${primaryColor}` }}
    >
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 text-gray-200 hover:text-red-500 transition-colors z-10"
          title="Eliminar equip"
        >
          <Trash2 size={18} />
        </button>
      )}

      {canEdit && (
        <button
          onClick={() => setShowEditModal(true)}
          className={`absolute top-4 ${isAdmin ? 'right-12' : 'right-4'} text-gray-400 hover:text-primary transition-colors z-10`}
          title="Editar equip"
        >
          <Edit size={18} />
        </button>
      )}

      {/* Capçalera: Escut i Nom */}
      <div className="flex items-center gap-4">
        <div className="relative">
          {team.shield ? (
            <img src={team.shield} alt="Shield" className="w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-sm" />
          ) : (
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
              style={{ backgroundColor: primaryColor }}
            >
              {team.name.charAt(0)}
            </div>
          )}
          {isCaptain && (
            <div className="absolute -top-2 -left-2 bg-amber-500 text-white p-1 rounded-lg shadow-md">
              <Crown size={12} />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-black text-dark truncate leading-tight">{team.name}</h3>
          <p className="text-[10px] text-muted font-bold tracking-widest uppercase mt-1">
            {team.code ? `CODI: ${team.code}` : "Pendent de codi"}
          </p>
        </div>
      </div>

      {/* Informació de Responsables */}
      <div className="space-y-3 pt-2">
        <InfoLine icon={<Crown size={14} className="text-amber-500 shrink-0" />} label="Capità" value={`${team.captain?.first_name} ${team.captain?.last_name}`} />
        {team.teacher && (
          <InfoLine icon={<ShieldCheck size={14} className="text-primary shrink-0" />} label="Tutor" value={`${team.teacher?.first_name} ${team.teacher?.last_name}`} />
        )}

        {/* Estat de jugadors */}
        <div className="bg-gray-50 rounded-2xl p-3 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
            <div className="flex items-center gap-1.5 text-muted"><Users size={14} /><span>Jugadors</span></div>
            <span className={confirmedCount < minPlayers ? 'text-danger' : 'text-success'}>
              {confirmedCount}{maxPlayers ? ` / ${maxPlayers}` : ""}
            </span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${confirmedCount < minPlayers ? 'bg-danger' : 'bg-success'}`}
              style={{ width: `${Math.min((confirmedCount / (maxPlayers || 12)) * 100, 100)}%` }}
            />
          </div>
          {confirmedCount < minPlayers && (
            <p className="text-[9px] text-danger font-bold flex items-center gap-1">
              <Clock size={10} /> Falten {minPlayers - confirmedCount} per al mínim
            </p>
          )}
        </div>
      </div>

      {/* Accions */}
      <div className="pt-2 space-y-2">
        {readOnly && !canManage && (
          <div className="mb-2 p-2 bg-gray-50 rounded-xl text-[10px] text-muted font-bold flex items-center gap-2 uppercase tracking-tight">
            <Clock size={12} className="text-amber-500" /> Accés només lectura
          </div>
        )}

        <button
          onClick={() => navigate(`/jornades/competicions/${team.competition?.id}/teams/${team.id}`)}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm ${canManage
              ? "bg-dark text-white hover:bg-black shadow-lg shadow-gray-200"
              : "bg-gray-100 text-muted hover:bg-gray-200"
            }`}
        >
          {canManage ? <Settings size={18} /> : <Eye size={18} />}
          {canManage ? "Gestionar Equip" : "Veure Equip"}
        </button>

        {!isMember && !pendingRecord && !userInAnyTeam && !readOnly && isRegistrationOpen && (
          <RoleRule allowedRoles={[ROLES.STUDENT]}>
            <button
              onClick={handleJoin}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-success/20 text-success hover:bg-success hover:text-white transition-all font-bold text-sm"
            >
              <UserPlus size={18} /> Sol·licitar Unió
            </button>
          </RoleRule>
        )}

        {pendingRecord && !readOnly && isRegistrationOpen && (
          <div className="bg-amber-50 p-3 rounded-2xl space-y-2 border border-amber-100 text-center">
            <p className="text-[10px] text-amber-600 font-bold flex items-center justify-center gap-2 uppercase tracking-wider">
              <Clock size={12} /> Sol·licitud pendent
            </p>
            <button
              onClick={handleWithdraw}
              className="w-full py-1 text-[9px] text-amber-700 underline font-black uppercase hover:text-amber-900 transition-colors"
            >
              Retirar sol·licitud
            </button>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Eliminar Equip"
        message={`Estàs segur que vols eliminar l'equip "${team.name}"? Aquesta acció no es pot desfer i eliminarà tots els membres de l'equip.`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {showEditModal && (
        <EditTeamModal
          team={team}
          competitionId={competition?.id}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

/**
 * Component auxiliar per mostrar una fila d'informació amb icona.
 * S'utilitza per a les línies de "Capità" i "Tutor" de forma consistent.
 */
function InfoLine({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-sm text-dark">
      {/* Icona visual a l'esquerra */}
      {icon}

      {/* Etiqueta descriptiva en color gris/muted */}
      <span className="text-muted font-medium">{label}:</span>

      {/* Valor real en negreta amb 'truncate' per si el nom és massa llarg */}
      <span className="font-bold truncate">{value}</span>
    </div>
  );
}
