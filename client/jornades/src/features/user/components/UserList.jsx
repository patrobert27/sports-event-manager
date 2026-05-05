import { useState } from "react";
import UserAvatar from "../../../components/ui/UserAvatar";
import EditUserModal from "./EditUserModal";

export default function UserList({ users, pagination, onPageChange }) {
  const [editingUser, setEditingUser] = useState(null);

  if (!users?.length) {
    return <div className="text-center py-8 text-muted">No s'han trobat usuaris.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Vista de Taula (Desktop) */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b text-sm text-dark font-semibold">
                <th className="p-4">Usuari</th>
                <th className="p-4">Email</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Data registre</th>
                <th className="p-4 text-right">Accions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b hover:bg-primary/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar user={user} size={40} />
                      <div>
                        <p className="font-semibold text-dark">{user.first_name} {user.last_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-muted text-sm">{user.email}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-vote/20 text-vote rounded text-xs font-semibold">
                      {user.role?.name || "N/A"}
                    </span>
                  </td>
                  <td className="p-4 text-muted text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Veure més
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vista de Targetes (Mòbil) */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size={48} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-dark truncate">{user.first_name} {user.last_name}</p>
                <p className="text-xs text-muted truncate">{user.email}</p>
              </div>
              <span className="px-2 py-1 bg-vote/20 text-vote rounded text-[10px] font-bold uppercase">
                {user.role?.name || "N/A"}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <span className="text-[11px] text-muted">
                Registrat: {new Date(user.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => setEditingUser(user)}
                className="text-sm font-bold text-primary px-3 py-1 rounded-lg bg-primary/5 active:bg-primary/10 transition"
              >
                Veure més
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginació */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:justify-between p-4 bg-white md:bg-gray-50/50 rounded-2xl border md:border-t md:rounded-t-none shadow-sm md:shadow-none">
          <p className="text-sm text-muted order-2 sm:order-1">
            Mostrant <span className="font-bold text-dark">{users.length}</span> de <span className="font-bold text-dark">{pagination.total}</span> usuaris
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
    </div>
  );
}
