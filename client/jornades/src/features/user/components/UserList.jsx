import { useState } from "react";
import { useDispatch } from "react-redux";
import { Trash2, Edit2 } from "lucide-react";
import UserAvatar from "../../../components/ui/UserAvatar";
import EditUserModal from "./EditUserModal";
import ConfirmModal from "../../../components/ui/ConfirmModal";
import { removeUser } from "../userThunks";

export default function UserList({ users, pagination, onPageChange }) {
  const dispatch = useDispatch();
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  if (!users?.length) {
    return (
      <div className="text-center py-8 text-muted">
        No s'han trobat usuaris.
      </div>
    );
  }

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await dispatch(removeUser(userToDelete.id));
      setUserToDelete(null);
    } catch (error) {
      console.error("Error al eliminar usuari:", error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Vista de Taula (Desktop) */}
      <div className="hidden md:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] text-muted font-black uppercase tracking-widest">
                <th className="p-6">Usuari / Identitat</th>
                <th className="p-6">Correu Electrònic</th>
                <th className="p-6">Rol de Sistema</th>
                <th className="p-6">Registre</th>
                <th className="p-6 text-right">Accions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => {
                const isStudent = user.role?.name === "estudiant";
                const isTeacher = user.role?.name === "professor";
                const isAdmin = user.role?.name === "admin";

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <UserAvatar user={user} size={44} />
                          <div
                            className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${isAdmin ? "bg-primary" : isTeacher ? "bg-indigo-500" : "bg-accent"}`}
                          />
                        </div>
                        <div>
                          <p className="font-bold text-dark group-hover:text-primary transition-colors">
                            {user.first_name} {user.last_name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="text-sm font-medium text-muted/80">
                        {user.email}
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isAdmin
                            ? "bg-primary/10 text-primary"
                            : isTeacher
                              ? "bg-indigo-50 text-indigo-600"
                              : "bg-accent/10 text-accent"
                        }`}
                      >
                        {user.role?.name || "Sense Rol"}
                      </span>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-medium text-muted/60 tabular-nums">
                        {new Date(user.created_at).toLocaleDateString("ca-ES", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2.5 rounded-xl transition-all duration-200 active:scale-95 bg-primary/10 text-primary shadow-sm md:shadow-none md:bg-gray-50 md:text-muted md:hover:bg-primary/10 md:hover:text-primary"
                          title="Gestionar usuari"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-2.5 rounded-xl transition-all duration-200 active:scale-95 bg-red-50 text-red-600 shadow-sm md:shadow-none md:bg-gray-50 md:text-muted md:hover:bg-red-50 md:hover:text-red-600"
                          title="Eliminar usuari"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Targetes (Mòbil) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => {
          const isAdmin = user.role?.name === "admin";
          const isTeacher = user.role?.name === "professor";

          return (
            <div
              key={user.id}
              className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-in slide-in-from-bottom-2 duration-300"
            >
              <div className="flex items-center gap-4">
                <UserAvatar user={user} size={56} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-black text-dark truncate leading-none">
                      {user.first_name} {user.last_name}
                    </p>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter ${
                        isAdmin
                          ? "bg-primary text-white"
                          : isTeacher
                            ? "bg-indigo-500 text-white"
                            : "bg-accent text-white"
                      }`}
                    >
                      {user.role?.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted font-medium truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-muted font-bold uppercase">
                    Membre des de
                  </span>
                  <span className="text-xs font-bold text-dark/60">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setUserToDelete(user)}
                    className="p-2.5 rounded-xl transition-all duration-200 bg-red-50 text-red-600 shadow-sm active:scale-95"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="p-2.5 rounded-xl transition-all duration-200 bg-primary/10 text-primary shadow-sm active:scale-95"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginació */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between p-4 bg-white md:bg-gray-50/50 rounded-2xl border md:border-t md:rounded-t-none shadow-sm md:shadow-none">
          <p className="text-sm text-muted order-2 sm:order-1">
            Mostrant <span className="font-bold text-dark">{users.length}</span>{" "}
            de <span className="font-bold text-dark">{pagination.total}</span>{" "}
            usuaris
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold border rounded-xl hover:bg-white disabled:opacity-30 transition bg-white sm:bg-transparent"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-dark font-bold bg-primary/10 rounded-xl">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold border rounded-xl hover:bg-white disabled:opacity-30 transition bg-white sm:bg-transparent"
            >
              Següent
            </button>
          </div>
        </div>
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      <ConfirmModal
        isOpen={!!userToDelete}
        onCancel={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Eliminar Usuari"
        message={`Estàs segur que vols eliminar permanentment a ${userToDelete?.first_name} ${userToDelete?.last_name}? Aquesta acció no es pot desfer i l'usuari perdrà tot el seu historial i crèdits.`}
      />
    </div>
  );
}
