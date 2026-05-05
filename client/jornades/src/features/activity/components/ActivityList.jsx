import React, { useState } from 'react';
import { Edit2, Trash2, Users as UsersIcon } from 'lucide-react';
import RoleRule from '../../../components/auth/RoleRule';
import { InfoAlert } from '../../../components/ui/Alerts';
import ConfirmModal from '../../../components/ui/ConfirmModal';

const ActivityList = ({ activities, onEdit, onDelete }) => {
  const [activityToDelete, setActivityToDelete] = useState(null);

  if (!activities || activities.length === 0) {
    return <InfoAlert message="No s'han trobat activitats que coincideixin amb la cerca." />;
  }

  console.log(activities)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="group relative bg-white rounded-2xl border border-primary/10 p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            {/* Indicador de color */}
            <div
              className="absolute top-0 left-0 w-full h-1.5 rounded-t-2xl opacity-80"
              style={{ backgroundColor: activity.color || '#4FA8F5' }}
            />

            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <h3 className="text-xl font-bold text-dark group-hover:text-primary transition-colors">
                    {activity.name}
                  </h3>
                </div>

                <RoleRule allowedRoles={["admin"]}>
                  <div className="flex gap-1 items-center bg-gray-50 p-1 rounded-2xl border border-primary/5">
                    <button
                      onClick={() => onEdit(activity)}
                      className="p-2.5 rounded-xl text-muted hover:bg-white hover:text-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 size={18} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => setActivityToDelete(activity)}
                      className="p-2.5 rounded-xl text-muted hover:bg-white hover:text-danger hover:shadow-md transition-all duration-200 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </button>
                  </div>
                </RoleRule>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-tight mb-1 opacity-70">Mín. Jugadors</span>
                  <div className="flex items-center gap-2 text-dark">
                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                      <UsersIcon size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold">
                      {activity.min_players !== null && activity.min_players !== undefined ? activity.min_players : '—'}
                    </span>
                  </div>
                </div>

                <div className="w-px h-8 bg-primary/10" />

                <div className="flex flex-col">
                  <span className="text-[10px] text-muted uppercase font-bold tracking-tight mb-1 opacity-70">Màx. Jugadors</span>
                  <div className="flex items-center gap-2 text-dark">
                    <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center">
                      <UsersIcon size={14} className="text-primary" />
                    </div>
                    <span className="text-sm font-bold">
                      {activity.max_players !== null && activity.max_players !== undefined ? activity.max_players : '—'}
                    </span>
                  </div>
                </div>
              </div>


            </div>
          </div>
        ))}
      </div>

      {/* Modal de confirmació d'eliminació */}
      {activityToDelete && (
        <ConfirmModal
          isOpen={!!activityToDelete}
          title="Eliminar activitat"
          message={`Estàs segur que vols eliminar "${activityToDelete.name}"? Aquesta acció no es pot desfer.`}
          onConfirm={async () => {
            await onDelete(activityToDelete.id);
            setActivityToDelete(null);
          }}
          onCancel={() => setActivityToDelete(null)}
        />
      )}
    </>
  );
};

export default ActivityList;
