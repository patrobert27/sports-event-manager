import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Clock,
  Crown,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  Mail,
  Palette,
  Edit,
  UserPlus
} from "lucide-react";

import {
  loadTeamById,
  acceptMember,
  removeMember,
  transferCaptaincy,
  joinTeam
} from "../features/teams/teamThunks";
import {
  selectCurrentTeam,
  selectIsLoadingTeams,
  selectTeamsError,
  selectTeamsSuccess,
  selectUserInAnyTeam
} from "../features/teams/teamSelectors";
import { setError, setSuccess } from "../features/teams/teamSlice";
import Spinner from "../components/ui/Spinner";
import { ErrorAlert, SuccessAlert } from "../components/ui/Alerts";
import ConfirmModal from "../components/ui/ConfirmModal";
import RoleRule from "../components/auth/RoleRule";
import { ADMIN_VARIANTS, ROLES } from "../constants/roles";
import EditTeamModal from "../features/teams/components/EditTeamModal";

/**
 * Pàgina de Detalls de l'Equip (Refactoritzada)
 */
export default function TeamDetailsPage() {
  const { competitionId, teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const team = useSelector(selectCurrentTeam);
  const isLoading = useSelector(selectIsLoadingTeams);
  const error = useSelector(selectTeamsError);
  const success = useSelector(selectTeamsSuccess);
  const currentUser = useSelector((state) => state.auth.user);
  const competition = useSelector((state) => state.competition.currentCompetition);
  const userInAnyTeam = useSelector(state => selectUserInAnyTeam(state, competitionId, currentUser?.id));

  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToPromote, setMemberToPromote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (teamId) dispatch(loadTeamById(teamId));
    return () => {
      dispatch(setError(null));
      dispatch(setSuccess(null));
    };
  }, [dispatch, teamId]);

  if (isLoading && !team) return <Spinner message="Carregant detalls..." />;
  if (!team) return <div className="p-8 text-center"><ErrorAlert message="No s'ha trobat l'equip." /></div>;

  // Lògica de permisos
  const isCaptain = team.captain?.id === currentUser?.id;
  const isTutor = team.teacher?.id === currentUser?.id;
  const roleName = currentUser?.role?.name?.toLowerCase();
  const isAdmin = ADMIN_VARIANTS.includes(roleName);
  const canManage = isCaptain || isTutor || isAdmin;

  // Lògica de registre/edició
  const now = new Date();
  const registrationStart = competition?.registration_start ? new Date(competition.registration_start) : null;
  const registrationDeadline = competition?.registration_deadline ? new Date(competition.registration_deadline) : null;

  const isRegistrationOpen = competition?.status === 'REGISTRATION' && 
    (!registrationStart || registrationStart <= now) &&
    (!registrationDeadline || registrationDeadline > now);

  const isFinished = competition?.status === 'FINISHED';
  const canEdit = isAdmin || (isCaptain && isRegistrationOpen) || (isTutor && !isFinished);
  const pendingRecord = team.players?.find(p => p.user?.id === currentUser?.id && !p.confirmed);

  // Membres separats
  const pendingMembers = team.players?.filter(p => !p.confirmed) || [];
  const acceptedMembers = team.players?.filter(p => p.confirmed) || [];

  const handleAction = async (action, pid, label) => {
    if (action === 'accept') await dispatch(acceptMember(pid, competitionId, teamId));
    else if (action === 'delete') setMemberToDelete({ id: pid, label });
  };

  const handleJoin = async () => {
    if (isRegistrationOpen) {
      await dispatch(joinTeam(team.id, competitionId));
      dispatch(loadTeamById(teamId)); // Recarregar per actualitzar l'estat local
    }
  };

  const handleWithdraw = async () => {
    if (pendingRecord) {
      setMemberToDelete({ id: pendingRecord.id, label: 'Retirar sol·licitud', isWithdraw: true });
    }
  };

  const handleLeave = () => {
    const me = acceptedMembers.find(p => p.user?.id === currentUser?.id);
    if (me) {
      setMemberToDelete({ id: me.id, label: 'Abandonar Equip', isLeave: true });
    }
  };

  const primaryColor = team.primary_color || '#3b82f6';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* HEADER NAVEGACIÓ */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/jornades/competicions/${competitionId}`)}
          className="flex items-center gap-2 text-muted hover:text-dark font-bold text-sm transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Tornar a la competició
        </button>

        <div className="flex gap-3">
          {canEdit && (
            <button
              onClick={() => setShowEditModal(true)}
              className="px-5 py-2.5 bg-white border border-gray-200 text-dark rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
              <Edit size={18} /> Editar Equip
            </button>
          )}

          <RoleRule allowedRoles={[ROLES.STUDENT]}>
            {!userInAnyTeam && isRegistrationOpen && !pendingRecord && (
              <button
                onClick={handleJoin}
                className="px-5 py-2.5 bg-success/10 border-2 border-success/20 text-success rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-success hover:text-white transition-all shadow-sm"
              >
                <UserPlus size={18} /> Sol·licitar Unió
              </button>
            )}
            
            {pendingRecord && isRegistrationOpen && (
              <button
                onClick={handleWithdraw}
                className="px-5 py-2.5 bg-amber-500 text-white rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Clock size={18} /> Retirar sol·licitud
              </button>
            )}

            {!isCaptain && acceptedMembers.some(p => p.user?.id === currentUser?.id) && isRegistrationOpen && (
              <button
                onClick={handleLeave}
                className="px-5 py-2.5 bg-white border border-danger/20 text-danger rounded-2xl flex items-center gap-2 font-bold text-sm hover:bg-danger/5 transition-all"
              >
                <XCircle size={18} /> Abandonar Equip
              </button>
            )}
          </RoleRule>
        </div>
      </div>

      <SuccessAlert message={success} />
      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* COLUMNA ESQUERRA: INFO EQUIP */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: primaryColor }} />

            {/* ESCUT */}
            <div className="flex flex-col items-center text-center space-y-4">
              {team.shield ? (
                <img src={team.shield} alt="Shield" className="w-40 h-40 rounded-3xl object-cover shadow-2xl border-4 border-white" />
              ) : (
                <div
                  className="w-40 h-40 rounded-3xl flex items-center justify-center text-white text-6xl font-black shadow-2xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {team.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black text-dark">{team.name}</h1>
                <p className="text-xs font-mono text-muted mt-2 tracking-widest uppercase">
                  {team.code ? `CODI: ${team.code}` : "Pendent d'assignar codi"}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-50">
              <InfoRow icon={<Crown className="text-amber-500" />} label="Capità" value={`${team.captain?.first_name} ${team.captain?.last_name}`} />
              {team.teacher && (
                <InfoRow icon={<ShieldCheck className="text-primary" />} label="Tutor" value={`${team.teacher?.first_name} ${team.teacher?.last_name}`} />
              )}
            </div>

            {/* BARRA DE PROGRÉS */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">Capacitat de l'equip</span>
                <span className="text-sm font-bold text-dark">{team.confirmedCount} / {team.maxPlayers || '∞'}</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${team.confirmedCount < team.minPlayers ? 'bg-danger' : 'bg-success'}`}
                  style={{ width: `${Math.min((team.confirmedCount / (team.maxPlayers || 12)) * 100, 100)}%` }}
                />
              </div>
              {team.confirmedCount < team.minPlayers && (
                <p className="text-[10px] text-danger font-bold text-center">Falten {team.minPlayers - team.confirmedCount} per al mínim</p>
              )}
            </div>
          </div>
        </div>

        {/* COLUMNA DRETA: MEMBRES I SOL·LICITUDS */}
        <div className="lg:col-span-8 space-y-8">

          {/* SECCIÓ SOL·LICITUDS PENDENTS */}
          {canManage && pendingMembers.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-lg font-black text-dark flex items-center gap-2">
                <Clock className="text-amber-500" /> Sol·licituds Pendents
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-lg">{pendingMembers.length}</span>
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {pendingMembers.map(p => (
                  <MemberRow key={p.id} member={p} isPending onAction={handleAction} canManage={canManage} />
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓ MEMBRES CONFIRMATS */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-dark flex items-center gap-2">
              <Users className="text-primary" /> Membres Confirmats
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-lg">{acceptedMembers.length}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acceptedMembers.map(p => (
                <MemberCard
                  key={p.id}
                  member={p}
                  isMe={p.user?.id === currentUser?.id}
                  isCaptain={p.user?.id === team.captain?.id}
                  canManage={canManage}
                  isAdminOrCaptain={isAdmin || isCaptain}
                  onAction={handleAction}
                  onPromote={() => setMemberToPromote({ id: p.user.id, name: `${p.user.first_name} ${p.user.last_name}` })}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* MODALS DE CONFIRMACIÓ */}
      <ConfirmModal
        isOpen={!!memberToDelete}
        title={memberToDelete?.label || "Eliminar Membre"}
        message={
          memberToDelete?.isLeave 
            ? "Estàs segur que vols abandonar aquest equip? Aquesta acció no es pot desfer si el període d'inscripció es tanca."
            : memberToDelete?.isWithdraw
              ? "Vols retirar la teva sol·licitud d'unió a aquest equip?"
              : `Estàs segur que vols ${memberToDelete?.label?.toLowerCase() || "eliminar"} a aquest membre de l'equip?`
        }
        onConfirm={async () => {
          await dispatch(removeMember(memberToDelete.id, competitionId, teamId));
          setMemberToDelete(null);
          dispatch(loadTeamById(teamId)); // Forçar recàrrega per eliminar el botó de retirar immediatament
        }}
        onCancel={() => setMemberToDelete(null)}
      />

      <ConfirmModal
        isOpen={!!memberToPromote}
        title="Traspassar Capitania"
        message={`Vols fer capità a ${memberToPromote?.name}? Tu deixaràs de tenir el control de l'equip.`}
        onConfirm={async () => {
          await dispatch(transferCaptaincy(team.id, memberToPromote.id, competitionId));
          setMemberToPromote(null);
        }}
        onCancel={() => setMemberToPromote(null)}
      />

      {showEditModal && (
        <EditTeamModal
          team={team}
          competitionId={competitionId}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

// COMPONENTS INTERNS DE SUPORT (Més net)

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-gray-50 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] text-muted font-bold uppercase">{label}</p>
        <p className="text-sm font-bold text-dark">{value}</p>
      </div>
    </div>
  );
}

function MemberRow({ member, onAction }) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-50 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold">
          {member.user?.first_name?.charAt(0)}
        </div>
        <span className="font-bold text-dark">{member.user?.first_name} {member.user?.last_name}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAction('accept', member.id)} className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-success-dark transition-all shadow-sm">Acceptar</button>
        <button onClick={() => onAction('delete', member.id, 'Rebutjar')} className="bg-white text-danger border border-danger/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-danger hover:text-white transition-all">Rebutjar</button>
      </div>
    </div>
  );
}

function MemberCard({ member, isMe, isCaptain, canManage, isAdminOrCaptain, onAction, onPromote }) {
  return (
    <div className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group relative ${isMe ? 'bg-primary/5 border-primary/20 shadow-sm' : 'bg-gray-50 border-transparent hover:border-gray-200'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${isMe ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
        {member.user?.first_name?.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-dark truncate">{member.user?.first_name} {member.user?.last_name}</p>
          {isMe && <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-md font-black uppercase">Tu</span>}
        </div>
        <p className="text-[10px] text-muted font-bold tracking-tight flex items-center gap-1 mt-1 uppercase">
          {isCaptain ? <><Crown size={10} className="text-amber-500" /> Capità</> : "Membre Confirmat"}
        </p>
      </div>

      {canManage && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isAdminOrCaptain && !isCaptain && (
            <button onClick={onPromote} className="p-2 text-gray-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" title="Fes Capità"><Crown size={18} /></button>
          )}
          {!isCaptain && (
            <button onClick={() => onAction('delete', member.id, 'Expulsar')} className="p-2 text-gray-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-all" title="Expulsar"><Trash2 size={18} /></button>
          )}
        </div>
      )}
    </div>
  );
}
