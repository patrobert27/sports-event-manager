import React, { useState } from "react";
import { Edit2, Trash2, Users as UsersIcon } from "lucide-react";
import RoleRule from "../../../components/auth/RoleRule";
import { InfoAlert } from "../../../components/ui/Alerts";
import ConfirmModal from "../../../components/ui/ConfirmModal";

// Aquest component mostra la quadrícula amb tots els esports o activitats donats d'alta
const ActivityList = ({ activities, onEdit, onDelete }) => {
  
  // guardem en calent l'activitat que el profe vol eliminar per obrir el modal de confirmació
  const [activityToDelete, setActivityToDelete] = useState(null);

  // si no tenim cap esport definit o la cerca ha quedat en blanc, ensenyem estat buit
  if (!activities || activities.length === 0) {
    return (
      <InfoAlert 
        message="No s'han trobat activitats que coincideixin amb la cerca." 
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {activities.map((activity) => {
          return (
            <div
              key={activity.id}
              className="group relative bg-white rounded-2xl border border-primary/10 p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              
              {/* Indicador superior de color propi de l'esport per diferenciar-los d'un cop d'ull */}
              <div
                className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl opacity-80"
                style={{ 
                  backgroundColor: activity.color || "#4FA8F5" 
                }}
              />

              <div className="flex flex-col gap-4">
                
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                      {activity.name}
                    </h3>
                  </div>

                  {/* Accions de control (només per a administradors) */}
                  <RoleRule allowedRoles={["admin"]}>
                    <div className="flex gap-2 items-center">
                      
                      <button
                        onClick={() => {
                          onEdit(activity);
                        }}
                        className="p-2.5 rounded-xl bg-primary/10 text-primary md:bg-gray-50 md:text-muted md:hover:bg-primary/10 md:hover:text-primary transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button
                        onClick={() => {
                          setActivityToDelete(activity);
                        }}
                        className="p-2.5 rounded-xl bg-red-50 text-red-600 md:bg-gray-50 md:text-muted md:hover:bg-red-50 md:hover:text-red-600 transition-all duration-200 cursor-pointer shadow-sm md:shadow-none"
                        title="Eliminar"
                      >
                        <Trash2 size={16} />
                      </button>

                    </div>
                  </RoleRule>
                </div>

                {/* Resum de jugadors per equip de l'esport */}
                <div className="flex items-center gap-6 pt-2">
                  
                  {/* Mínim de jugadors: important perquè els equips siguin equilibrats */}
                  <div className="flex flex-col">
                    
                    <span className="text-[10px] text-muted uppercase font-bold tracking-tight mb-1 opacity-70">
                      Mín. Jugadors
                    </span>
                    
                    <div className="flex items-center gap-2 text-dark">
                      
                      <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                        <UsersIcon size={14} className="text-primary" />
                      </div>
                      
                      <span className="text-sm font-bold">
                        {activity.min_players !== null && activity.min_players !== undefined
                          ? activity.min_players
                          : "—"}
                      </span>

                    </div>
                  </div>

                  <div className="w-px h-8 bg-primary/10" />

                  {/* Màxim de jugadors: evita que un equip s'ompli massa i deixi els altres buits */}
                  <div className="flex flex-col">
                    
                    <span className="text-[10px] text-muted uppercase font-bold tracking-tight mb-1 opacity-70">
                      Màx. Jugadors
                    </span>
                    
                    <div className="flex items-center gap-2 text-dark">
                      
                      <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                        <UsersIcon size={14} className="text-primary" />
                      </div>
                      
                      <span className="text-sm font-bold">
                        {activity.max_players !== null && activity.max_players !== undefined
                          ? activity.max_players
                          : "—"}
                      </span>

                    </div>
                  </div>

                </div>

              </div>

            </div>
          );
        })}

      </div>

      {/* Modal de seguretat per evitar que el profe elimini un esport sense voler */}
      {activityToDelete && (
        <ConfirmModal
          isOpen={!!activityToDelete}
          title="Eliminar activitat"
          message={`Estàs segur que vols eliminar "${activityToDelete.name}"? Aquesta acció no es pot desfer.`}
          onConfirm={() => {
            const id = activityToDelete.id;
            setActivityToDelete(null);
            onDelete(id);
          }}
          onCancel={() => {
            setActivityToDelete(null);
          }}
        />
      )}
    </>
  );
};

export default ActivityList;
