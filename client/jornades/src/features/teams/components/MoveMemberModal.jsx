import React, { useState } from "react";
import { X, ArrowRightLeft, Search, Loader2 } from "lucide-react";
import { useSelector } from "react-redux";
import { selectTeams } from "../teamSelectors";
import { createPortal } from "react-dom";

// Aquest modal serveix per a moure ràpidament un participant d'aquest equip cap a un altre de diferent
export default function MoveMemberModal({ 
  isOpen,           // Opcional si es vol controlar visibilitat externa
  member,           // Objecte membre (usat a TeamDetailsPage)
  userName,         // Nom string (usat a AdminTeamsManagementPage)
  currentTeamId,    // ID de l'equip actual per excloure'l del llistat
  onClose,          // Tancar modal
  onConfirm,        // Acció de moure
  teams: propTeams, // Llista d'equips passada manualment (opcional)
  isLoading         // Estat de càrrega per al botó
}) {
  const reduxTeams = useSelector(selectTeams);
  const [searchTerm, setSearchTerm] = useState("");

  // Decidim quina llista d'equips fem servir
  const teamsToUse = propTeams || reduxTeams || [];

  // Filtrem i ordenem els equips:
  // 1. Excloem l'equip actual del jugador
  // 2. Excloem equips que ja estiguin plens (confirmedCount >= maxPlayers) per no desequilibrar
  // 3. Ordenem de més buits a més plens
  // 4. Apliquem el filtre de cerca per nom
  const otherTeams = teamsToUse
    .filter((t) => {
      const isCurrentTeam = t.id === parseInt(currentTeamId);
      const isFull = t.maxPlayers && t.confirmedCount >= t.maxPlayers;
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      return !isCurrentTeam && !isFull && matchesSearch;
    })
    .sort((a, b) => {
      // Ordenació: de menys jugadors a més jugadors
      return (a.confirmedCount || 0) - (b.confirmedCount || 0);
    });

  const displayUserName = userName || (member?.user?.first_name ? `${member.user.first_name} ${member.user.last_name || ""}`.trim() : "Usuari");

  // Si usem 'isOpen' i és fals, no pintem res de res
  if (isOpen === false) {
    return null;
  }

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-dark/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] border border-blue-50/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER DEL MODAL */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <ArrowRightLeft size={20} />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-dark">
                Moure Jugador
              </h3>
              <p className="text-[10px] text-muted font-bold uppercase tracking-wider">
                A quin equip vols moure a {displayUserName}?
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="p-2 text-muted hover:text-dark hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>

        </div>

        {/* CERCADOR D'EQUIPS DESTÍ */}
        <div className="p-4 bg-white border-b border-gray-50 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
            
            <input 
              type="text" 
              placeholder="Cerca equip destí..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm transition-all outline-none"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
              }}
              autoFocus
            />
          </div>
        </div>

        {/* LLISTAT D'EQUIPS DISPONIBLES PER A L'ENVIAMENT */}
        <div className="overflow-y-auto p-4 space-y-2 custom-scrollbar flex-1">
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              
              <p className="text-xs text-muted font-bold uppercase tracking-widest text-center">
                Movent jugador...
              </p>
            </div>
          ) : otherTeams.length > 0 ? (
            
            otherTeams.map((team) => {
              const count = team.confirmedCount || 0;
              const min = team.minPlayers || team.competition?.activity?.min_players || 0;
              const max = team.maxPlayers || team.competition?.activity?.max_players || 12;
              
              // Determinem el color de la barra segons la ràtio de capacitat actual de l'equip destí
              let statusColor = "bg-success";
              let badgeStyle = "bg-success/10 text-success border-success/20";
              
              if (count < min) {
                statusColor = "bg-danger";
                badgeStyle = "bg-danger/10 text-danger border-danger/20";
              } else if (count === min) {
                statusColor = "bg-warning";
                badgeStyle = "bg-warning/10 text-warning border-warning/20";
              }

              const capacityPercent = Math.min((count / max) * 100, 100);

              return (
                <button
                  key={team.id}
                  onClick={() => {
                    onConfirm(team.id);
                  }}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0"
                      style={{ 
                        backgroundColor: team.primary_color || '#3b82f6' 
                      }}
                    >
                      {team.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-dark group-hover:text-primary transition-colors truncate">
                          {team.name}
                        </p>
                        
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${badgeStyle}`}>
                          {count} / {max || '∞'}
                        </span>
                      </div>

                      {/* Barra de progrés amb color dinàmic per triar a cop d'ull els equips amb més necessitats */}
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-700 ${statusColor}`}
                          style={{ 
                            width: `${capacityPercent}%` 
                          }}
                        />
                      </div>

                    </div>

                  </div>
                  
                  <ArrowRightLeft size={16} className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all ml-4 shrink-0" />
                </button>
              );
            })

          ) : (
            <div className="py-10 text-center space-y-2">
              <p className="text-sm text-muted font-medium italic">
                No s'han trobat altres equips disponibles.
              </p>
            </div>
          )}

        </div>

        {/* FOOTER DEL MODAL */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-muted hover:text-dark transition-colors cursor-pointer"
          >
            Cancel·lar
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
