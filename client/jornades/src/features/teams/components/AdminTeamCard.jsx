import { useState, useEffect } from "react";
import {
  Crown,
  GraduationCap,
  User,
  Trash2,
  ArrowRightLeft,
  Eye,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";

// Aquesta card mostra una targeta especialitzada per a que el professorat gestioni cadascun dels equips inscrits
export default function AdminTeamCard({
  team,
  onMoveMember,
  onEditTeam,
  onDeleteTeam,
  competitionId,
}) {
  const {
    confirmedCount,
    minPlayers,
    maxPlayers,
    players,
    shield,
    primary_color,
  } = team;

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [shield]);

  // Aquesta lògica decideix si l'equip té prou jugadors confirmats, si hi ha excés o està sota el mínim requerit
  const getStatusInfo = () => {
    
    if (confirmedCount < minPlayers) {
      return {
        color: "text-danger bg-danger/10 border-danger/20",
        dot: "bg-danger",
        label: "Sota el mínim",
        iconColor: "text-danger",
      };
    }
    
    if (confirmedCount === minPlayers) {
      return {
        color: "text-warning bg-warning/10 border-warning/20",
        dot: "bg-warning",
        label: "Mínim assolit",
        iconColor: "text-warning",
      };
    }
    
    if (maxPlayers && confirmedCount > maxPlayers) {
      return {
        color: "text-danger bg-danger/10 border-danger/20",
        dot: "bg-danger",
        label: "Excés de jugadors",
        iconColor: "text-danger",
      };
    }
    
    return {
      color: "text-success bg-success/10 border-success/20",
      dot: "bg-success",
      label: "Equilibrat",
      iconColor: "text-success",
    };
  };

  const status = getStatusInfo();

  // Ordenem la llista de jugadors per posar primer el capità, després el tutor i a la fi els jugadors comuns
  const sortedPlayers = [...players].sort((a, b) => {
    const isACaptain = a.user?.id === team.captain?.id;
    const isBCaptain = b.user?.id === team.captain?.id;
    const isATeacher = a.user?.id === team.teacher?.id;
    const isBTeacher = b.user?.id === team.teacher?.id;

    if (isACaptain) {
      return -1;
    }
    if (isBCaptain) {
      return 1;
    }
    if (isATeacher) {
      return -1;
    }
    if (isBTeacher) {
      return 1;
    }
    
    return 0;
  });

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden group">
      
      {/* Barra superior pintada amb el color primari de l'equip triat */}
      <div
        className="h-1.5 w-full transition-all duration-500"
        style={{ 
          backgroundColor: primary_color || "#3b82f6" 
        }}
      />

      <div className="p-6 pb-4">
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-4">
            
            {/* Escut d'equip: si té URL d'escut la carreguem, sinó pintem un cercle elegant amb la primera lletra */}
            <div className="relative group/shield">
              <div className="w-14 h-14 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-primary/20 transition-all duration-300">
                {shield && !imageError ? (
                  <img
                    src={shield}
                    alt={team.name}
                    onError={() => {
                      setImageError(true);
                    }}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-white font-black text-2xl shadow-inner"
                    style={{
                      backgroundColor: primary_color || "#3b82f6",
                      textShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    {(team.name || "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-dark leading-tight group-hover:text-primary transition-colors">
                {team.name}
              </h3>
              
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${status.color} flex items-center gap-1.5`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`}
                  />
                  {confirmedCount} / {maxPlayers || "∞"}
                </span>
              </div>
            </div>

          </div>

          {/* Botons de gestió d'equip per a l'administrador */}
          <div className="flex gap-2 transition-all">
            
            <button 
              onClick={() => {
                onEditTeam(team);
              }}
              className="p-2.5 rounded-xl bg-primary/10 text-primary md:bg-white md:text-muted md:hover:bg-primary/10 md:hover:text-primary transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
              title="Editar equip"
            >
              <Edit size={16} />
            </button>
            
            <button 
              onClick={() => {
                onDeleteTeam(team.id, team.name);
              }}
              className="p-2.5 rounded-xl bg-red-50 text-red-600 md:bg-white md:text-muted md:hover:bg-red-50 md:hover:text-red-600 transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
              title="Eliminar equip"
            >
              <Trash2 size={16} />
            </button>

          </div>
        </div>

      </div>

      {/* Llista interna scrollable de membres del mateix equip */}
      <div className="flex-1 px-4 overflow-hidden">
        <div className="bg-gray-50/50 rounded-2xl p-2 max-h-64 overflow-y-auto custom-scrollbar">
          
          {sortedPlayers.length === 0 ? (
            <div className="py-8 text-center text-muted/50 text-xs italic">
              Sense membres encara
            </div>
          ) : (
            <div className="space-y-1">
              
              {sortedPlayers.map((p) => {
                const isCaptain = p.user?.id === team.captain?.id;
                const isTeacher = p.user?.id === team.teacher?.id;

                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-gray-100 hover:border-primary/20 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCaptain
                            ? "bg-warning/10 text-warning"
                            : isTeacher
                              ? "bg-primary/10 text-primary"
                              : "bg-gray-100 text-muted"
                        }`}
                      >
                        {isCaptain ? (
                          <Crown size={14} />
                        ) : isTeacher ? (
                          <GraduationCap size={14} />
                        ) : (
                          <User size={14} />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-dark truncate">
                          {p.user?.first_name
                            ? `${p.user.first_name} ${p.user.last_name || ""}`.trim()
                            : "Usuari sense nom"}
                        </span>
                        
                        {(isCaptain || isTeacher) && (
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${
                              isCaptain ? "text-warning" : "text-primary"
                            }`}
                          >
                            {isCaptain ? "Capità" : "Professor"}
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Botó per a moure ràpidament un participant d'aquest equip cap a un altre */}
                    <button
                      onClick={() => {
                        onMoveMember(p, team.id);
                      }}
                      className="p-2 bg-primary/5 text-primary md:bg-transparent md:text-muted md:hover:text-primary md:hover:bg-primary/10 rounded-lg transition-all shrink-0 cursor-pointer"
                      title="Moure a un altre equip"
                    >
                      <ArrowRightLeft size={14} />
                    </button>

                  </div>
                );
              })}

            </div>
          )}

        </div>
      </div>

      {/* Botó del peu per veure el perfil complet de l'equip com a admin */}
      <div className="p-4 mt-auto">
        <Link
          to={`/jornades/${competitionId}/teams/${team.id}`}
          className="w-full py-3 px-4 bg-white border border-primary/10 rounded-2xl text-primary font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
        >
          <Eye size={16} />
          Ver equip
        </Link>
      </div>

    </div>
  );
}
