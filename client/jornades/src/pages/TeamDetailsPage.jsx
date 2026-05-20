import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Clock,
  Crown,
  Trash2,
  Edit,
  UserPlus,
  ArrowRightLeft,
  XCircle,
} from "lucide-react";

import {
  loadTeamById,
  acceptMember,
  removeMember,
  transferCaptaincy,
  joinTeam,
  loadTeams,
  moveMemberBetweenTeams,
} from "../features/teams/teamThunks";
import { loadCompetitionById } from "../features/competition/competitionThunks";

import {
  selectCurrentTeam,
  selectIsLoadingTeams,
  selectTeamsError,
  selectTeamsSuccess,
  selectUserInAnyTeam,
  selectUserTeamRole,
  selectCanEditTeam,
  selectIsRegistrationOpen,
  selectPendingMembers,
  selectAcceptedMembers,
  selectUserPendingRecord,
} from "../features/teams/teamSelectors";

import { setError, setSuccess } from "../features/teams/teamSlice";

import { useTeamSocket } from "../features/teams/useTeamSocket";

import Spinner from "../components/ui/Spinner";
import { ErrorAlert, SuccessAlert } from "../components/ui/Alerts";
import ConfirmModal from "../components/ui/ConfirmModal";
import RoleRule from "../components/auth/RoleRule";
import { ROLES } from "../constants/roles";
import EditTeamModal from "../features/teams/components/EditTeamModal";
import MoveMemberModal from "../features/teams/components/MoveMemberModal";

export default function TeamDetailsPage() {

  // dades de la url: necessitem l'id del equip i el de la competicio de la url per a cridar el server
  const { competitionId, teamId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // informacio del state de redux
  const team = useSelector(selectCurrentTeam);
  const isLoading = useSelector(selectIsLoadingTeams);
  const error = useSelector(selectTeamsError);
  const success = useSelector(selectTeamsSuccess);
  
  const isRankingVisible = useSelector((state) => {
    return state.predictions.isRankingVisible;
  });
  
  const currentUser = useSelector((state) => {
    return state.auth.user;
  });
  
  // comprovem si l'estudiant ja està en algun altre equip d'aquesta competicio perque no pugui demanar entrar a dos a la vegada
  const userInAnyTeam = useSelector((state) => {
    return selectUserInAnyTeam(state, competitionId, currentUser?.id);
  });

  // control de rols de l'equip (capità, tutor o admin)
  const { isCaptain, isAdmin, canManage } = useSelector(selectUserTeamRole);
  
  const canEdit = useSelector(selectCanEditTeam);
  const isRegistrationOpen = useSelector(selectIsRegistrationOpen);
  
  // separem els membres en llistes de pendents (esperant que els acceptin) i ja confirmats
  const pendingMembers = useSelector(selectPendingMembers);
  const acceptedMembers = useSelector(selectAcceptedMembers);
  const pendingRecord = useSelector(selectUserPendingRecord);

  // sockets per sincronitzar l'equip en viu per a que no calgui anar refrescant amb F5
  useTeamSocket({ competitionId, teamId });

  // estats de la interficie pels modals
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [memberToPromote, setMemberToPromote] = useState(null);
  const [memberToMove, setMemberToMove] = useState(null);
  
  const [isMoving, setIsMoving] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  // si canvien l'escut, resetejem l'error de la imatge per si de cas la nova URL sí que funciona
  useEffect(() => {
    setImageError(false);
  }, [team?.shield]);

  // netegem el missatge d'exit als 5 segons per a no tenir el banner verd tota la estona a la cara
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

  // carreguem les dades al obrir la pagina. si no tenim ids no fem res
  useEffect(() => {
    if (teamId) {
      dispatch(loadTeamById(teamId));
    }

    if (competitionId) {
      dispatch(loadCompetitionById(competitionId));
      dispatch(loadTeams({ competition_id: competitionId }));
    }

    // al marxar de la pàgina ho deixem tot net per a que en entrar a un altre equip no surtin dades velles
    return () => {
      dispatch(setError(null));
      dispatch(setSuccess(null));
    };
  }, [dispatch, teamId, competitionId]);

  // acceptar o carregar el modal de confirmacio. l'acció pot ser 'accept' o 'delete'
  const handleAction = async (action, pid, label) => {
    if (action === "accept") {
      await dispatch(acceptMember(pid, competitionId, teamId));
    } else if (action === "delete") {
      setMemberToDelete({ 
        id: pid, 
        label: label 
      });
    }
  };

  // sol·licitud d'unio per a estudiants. només es pot fer si les inscripcions estan obertes
  const handleJoin = async () => {
    if (isRegistrationOpen) {
      await dispatch(joinTeam(team.id, competitionId));
    }
  };

  // obrim confirmacio per treure la sol·licitud pendent
  const handleWithdraw = async () => {
    if (pendingRecord) {
      setMemberToDelete({
        id: pendingRecord.id,
        label: "Retirar sol·licitud",
        isWithdraw: true,
      });
    }
  };

  // obrim confirmacio per marxar de l'equip
  const handleLeave = () => {
    const me = acceptedMembers.find((p) => {
      return p.user?.id === currentUser?.id;
    });

    if (me) {
      setMemberToDelete({ 
        id: me.id, 
        label: "Abandonar Equip", 
        isLeave: true 
      });
    }
  };

  // confirmar moure de jugador a un altre equip (només admin del sistema)
  const handleConfirmMove = async (targetTeamId) => {
    if (!memberToMove) {
      return;
    }
    
    setIsMoving(true);
    try {
      await dispatch(
        moveMemberBetweenTeams(
          memberToMove.id,
          targetTeamId,
          competitionId,
          teamId
        )
      );
      
      setMemberToMove(null);
    } catch (err) {
      // els errors es guarden al state de redux
    } finally {
      setIsMoving(false);
    }
  };

  if (isLoading && !team) {
    return (
      <Spinner 
        message="Carregant detalls..." 
      />
    );
  }

  if (!team) {
    return (
      <div className="p-8 text-center">
        <ErrorAlert 
          message="No s'ha trobat l'equip." 
        />
      </div>
    );
  }

  // color principal per pintar la fitxa de l'equip (triat del formulari d'editar)
  const primaryColor = team.primary_color || "#3b82f6";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* boto enrere i accions de dalt */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <button
          onClick={() => {
            navigate(`/jornades/${competitionId}`);
          }}
          className="flex items-center gap-2 text-muted hover:text-dark font-bold text-sm transition-colors group w-fit"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Tornar a la competició
        </button>

        <div className="flex flex-wrap gap-3">
          {canEdit && (
            <button
              onClick={() => {
                setShowEditModal(true);
              }}
              className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-gray-200 text-dark rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-gray-50 transition-all shadow-sm"
            >
              <Edit size={18} /> 
              Editar Equip
            </button>
          )}

          {/* accions per estudiants per a unir-se, retirar o abandonar */}
          <RoleRule allowedRoles={[ROLES.STUDENT]}>
            {!userInAnyTeam && isRegistrationOpen && !pendingRecord && (
              <button
                onClick={handleJoin}
                className="flex-1 md:flex-none px-5 py-2.5 bg-success/10 border-2 border-success/20 text-success rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-success hover:text-white transition-all shadow-sm"
              >
                <UserPlus size={18} /> 
                Sol·licitar Unió
              </button>
            )}

            {pendingRecord && isRegistrationOpen && (
              <button
                onClick={handleWithdraw}
                className="flex-1 md:flex-none px-5 py-2.5 bg-amber-500 text-white rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
              >
                <Clock size={18} /> 
                Retirar sol·licitud
              </button>
            )}

            {!isCaptain &&
              acceptedMembers.some((p) => {
                return p.user?.id === currentUser?.id;
              }) &&
              isRegistrationOpen && (
                <button
                  onClick={handleLeave}
                  className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-danger/20 text-danger rounded-2xl flex items-center justify-center gap-2 font-bold text-sm hover:bg-danger/5 transition-all"
                >
                  <XCircle size={18} /> 
                  Abandonar Equip
                </button>
              )}
          </RoleRule>
        </div>
      </div>

      <SuccessAlert message={success} />
      <ErrorAlert message={error} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* fitxa de l'equip a l'esquerra amb escut i tutor */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-full h-2"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="flex flex-col items-center text-center space-y-4">
              {team.shield && !imageError ? (
                <img
                  src={team.shield}
                  alt="Shield"
                  onError={() => {
                    setImageError(true);
                  }}
                  className="w-40 h-40 rounded-3xl object-cover shadow-2xl border-4 border-white"
                />
              ) : (
                <div
                  className="w-40 h-40 rounded-3xl flex items-center justify-center text-white text-6xl font-black shadow-2xl"
                  style={{ backgroundColor: primaryColor }}
                >
                  {(team.name || "?").charAt(0).toUpperCase()}
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-black text-dark">{team.name}</h1>
                <p className="text-xs font-mono text-muted mt-2 tracking-widest uppercase">
                  {team.code ? `CODI: ${team.code}` : "Pendent d'assignar codi"}
                </p>
              </div>
            </div>

            {/* capità i tutor assignats */}
            <div className="space-y-4 pt-4 border-t border-gray-50">
              <InfoRow
                icon={<Crown className="text-amber-500" />}
                label="Capità"
                value={
                  team.captain?.first_name
                    ? `${team.captain.first_name} ${team.captain.last_name || ""}`.trim()
                    : "Sense capità assignat"
                }
              />
              <InfoRow
                icon={<ShieldCheck className="text-primary" />}
                label="Tutor"
                value={
                  team.teacher?.first_name
                    ? `${team.teacher.first_name} ${team.teacher.last_name || ""}`.trim()
                    : "Sense tutor assignat"
                }
              />
            </div>

            {/* barra amb la capacitat real versus màxima permès */}
            <div className="space-y-3 pt-4 border-t border-gray-50">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-muted uppercase tracking-widest">
                  Capacitat de l'equip
                </span>
                <span className="text-sm font-bold text-dark">
                  {team.confirmedCount} / {team.maxPlayers || "∞"}
                </span>
              </div>
              
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    team.confirmedCount < team.minPlayers ? "bg-danger" : "bg-success"
                  }`}
                  style={{
                    width: `${Math.min((team.confirmedCount / (team.maxPlayers || 12)) * 100, 100)}%`,
                  }}
                />
              </div>
              
              {team.confirmedCount < team.minPlayers && (
                <p className="text-[10px] text-danger font-bold text-center">
                  Falten {team.minPlayers - team.confirmedCount} jugadors per al mínim regulat.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* membres de l'equip a la dreta */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* sol·licituds pendents per a acceptar o rebutjar */}
          {canManage && pendingMembers.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
              <h3 className="text-lg font-black text-dark flex items-center gap-2">
                <Clock className="text-amber-500" /> 
                Sol·licituds Pendents
                
                <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-lg">
                  {pendingMembers.length}
                </span>
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {pendingMembers.map((p) => {
                  return (
                    <MemberRow
                      key={p.id}
                      member={p}
                      onAction={handleAction}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* membres ja confirmats de l'equip */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-dark flex items-center gap-2">
              <Users className="text-primary" /> 
              Membres Confirmats
              
              <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-lg">
                {acceptedMembers.length}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {acceptedMembers.map((p) => {
                return (
                  <MemberCard
                    key={p.id}
                    member={p}
                    isMe={p.user?.id === currentUser?.id}
                    isCaptain={p.user?.id === team.captain?.id}
                    canManage={canManage}
                    isAdmin={isAdmin}
                    isRegistrationOpen={isRegistrationOpen}
                    onAction={handleAction}
                    onPromote={() => {
                      setMemberToPromote({
                        id: p.user.id,
                        name: p.user.first_name
                          ? `${p.user.first_name} ${p.user.last_name || ""}`.trim()
                          : "Usuari sense nom",
                      });
                    }}
                    onMove={() => {
                      setMemberToMove(p);
                    }}
                  />
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* modal per esborrar o rebutjar un membre de l'equip */}
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
          let customMsg = "Membre eliminat correctament.";
          if (memberToDelete?.isLeave) {
            customMsg = "Has abandonat l'equip correctament.";
          } else if (memberToDelete?.isWithdraw) {
            customMsg = "Sol·licitud d'unió retirada correctament.";
          } else if (memberToDelete?.label === "Rebutjar") {
            customMsg = "Sol·licitud d'unió rebutjada.";
          } else if (memberToDelete?.label === "Expulsar") {
            customMsg = "Membre expulsat de l'equip.";
          }

          try {
            await dispatch(
              removeMember(memberToDelete.id, competitionId, teamId, customMsg)
            );
          } catch (err) {
            // L'error ja es guarda a l'estat de redux i es mostra en pantalla
          } finally {
            setMemberToDelete(null);
          }
        }}
        onCancel={() => {
          setMemberToDelete(null);
        }}
      />

      {/* modal per fer capità a un altre i treure't el control a tu mateix */}
      <ConfirmModal
        isOpen={!!memberToPromote}
        title="Traspassar Capitania"
        message={
          !isRegistrationOpen
            ? "No es pot canviar el capità fora del període d'inscripció."
            : isCaptain
              ? `Vols fer capità a ${memberToPromote?.name}? Tu deixaràs de tenir el control de l'equip.`
              : `Vols fer capità a ${memberToPromote?.name}?`
        }
        confirmText={!isRegistrationOpen ? null : "Confirmar"}
        cancelText={!isRegistrationOpen ? "Tancar" : "Cancel·lar"}
        onConfirm={
          !isRegistrationOpen
            ? null
            : async () => {
                try {
                  await dispatch(
                    transferCaptaincy(team.id, memberToPromote.id, competitionId)
                  );
                } catch (err) {
                  // L'error ja es guarda a l'estat de redux i es mostra en pantalla
                } finally {
                  setMemberToPromote(null);
                }
              }
        }
        onCancel={() => {
          setMemberToPromote(null);
        }}
      />

      {/* modal per moure jugador (només si ets admin del sistema) */}
      {memberToMove && (
        <MoveMemberModal
          member={memberToMove}
          currentTeamId={teamId}
          onClose={() => {
            setMemberToMove(null);
          }}
          onConfirm={handleConfirmMove}
          isLoading={isMoving}
        />
      )}

      {/* modal per editar la informacio de l'equip (escut, colors, nom) */}
      {showEditModal && (
        <EditTeamModal
          team={team}
          competitionId={competitionId}
          onClose={() => {
            setShowEditModal(false);
          }}
        />
      )}

    </div>
  );
}

// fila amb icona per a ensenyar el tutor o el capità
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

// fila per a demanar entrar a l'equip (capitans / tutors)
function MemberRow({ member, onAction }) {
  return (
    <div className="flex items-center justify-between p-4 bg-amber-50/50 border border-amber-100 rounded-2xl hover:bg-amber-50 transition-all group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-bold">
          {member.user?.first_name?.charAt(0)}
        </div>
        
        <span className="font-bold text-dark">
          {member.user?.first_name
            ? `${member.user.first_name} ${member.user.last_name || ""}`.trim()
            : "Usuari sense nom"}
        </span>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => {
            onAction("accept", member.id);
          }}
          className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-success-dark transition-all shadow-sm"
        >
          Acceptar
        </button>
        
        <button
          onClick={() => {
            onAction("delete", member.id, "Rebutjar");
          }}
          className="bg-white text-danger border border-danger/10 px-4 py-2 rounded-xl text-xs font-bold hover:bg-danger hover:text-white transition-all"
        >
          Rebutjar
        </button>
      </div>
    </div>
  );
}

// targeta de cada membre confirmat de l'equip on surten els botons de accions si ets admin/capità
function MemberCard({
  member,
  isMe,
  isCaptain,
  canManage,
  isAdmin,
  isRegistrationOpen,
  onAction,
  onPromote,
  onMove,
}) {
  return (
    <div
      className={`flex items-center gap-4 p-5 rounded-2xl border transition-all group relative ${
        isMe 
          ? "bg-primary/5 border-primary/20 shadow-sm" 
          : "bg-gray-50 border-transparent hover:border-gray-200"
      }`}
    >
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold ${
          isMe ? "bg-primary text-white" : "bg-primary/10 text-primary"
        }`}
      >
        {member.user?.first_name?.charAt(0)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-bold text-dark truncate">
            {member.user?.first_name
              ? `${member.user.first_name} ${member.user.last_name || ""}`.trim()
              : "Usuari sense nom"}
          </p>
          {isMe && (
            <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-md font-black uppercase">
              Tu
            </span>
          )}
          {member.user?.role?.name && (
            <span className={`text-[8px] px-1.5 py-0.5 rounded-md font-black uppercase tracking-wider ${
              member.user.role.name.toLowerCase() === 'admin' 
                ? 'bg-danger/10 text-danger' 
                : member.user.role.name.toLowerCase() === 'professor' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-600'
            }`}>
              {member.user.role.name}
            </span>
          )}
        </div>
        
        <p className="text-[10px] text-muted font-bold tracking-tight flex items-center gap-1 mt-1 uppercase">
          {isCaptain ? (
            <>
              <Crown size={10} className="text-amber-500" /> 
              Capità
            </>
          ) : (
            "Membre Confirmat"
          )}
        </p>
      </div>

      {/* botons de gestio si tens permisos */}
      {canManage && (
        <div
          className={`flex gap-1 transition-opacity ${
            isAdmin ? "opacity-100" : "opacity-100 md:opacity-0 md:group-hover:opacity-100"
          }`}
        >
          {canManage && !isCaptain && (
            <button
              onClick={onPromote}
              className={`p-2.5 rounded-xl transition-all duration-200 cursor-pointer ${
                !isRegistrationOpen
                  ? "bg-gray-100/50 text-gray-400 md:bg-transparent md:text-gray-300 md:hover:text-amber-500"
                  : "bg-amber-50 text-amber-600 shadow-sm md:shadow-none md:bg-transparent md:text-gray-400 md:hover:text-amber-600 md:hover:bg-amber-50"
              }`}
              title={
                !isRegistrationOpen
                  ? "No es pot canviar el capità fora del període d'inscripció"
                  : "Fes Capità"
              }
            >
              <Crown size={16} />
            </button>
          )}
          
          {isAdmin && (
            <button
              onClick={onMove}
              className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-primary/10 text-primary shadow-sm md:shadow-none md:bg-transparent md:text-gray-400 md:hover:text-primary md:hover:bg-primary/5"
              title="Moure a un altre equip"
            >
              <ArrowRightLeft size={16} />
            </button>
          )}
          
          {(!isCaptain || isAdmin) && (
            <button
              onClick={() => {
                onAction("delete", member.id, "Expulsar");
              }}
              className="p-2.5 rounded-xl transition-all duration-200 cursor-pointer bg-red-50 text-red-600 shadow-sm md:shadow-none md:bg-transparent md:text-gray-400 md:hover:text-red-600 md:hover:bg-red-50"
              title="Expulsar"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )}

    </div>
  );
}
