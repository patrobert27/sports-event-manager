import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, loadRoles } from "../userThunks";
import { selectUserRoles, selectIsLoadingUsers } from "../userSelectors";
import UserAvatar from "../../../components/ui/UserAvatar";

export default function EditUserModal({ user, onClose }) {
  const dispatch = useDispatch();
  const roles = useSelector(selectUserRoles);
  const isLoading = useSelector(selectIsLoadingUsers);

  const [formData, setFormData] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    role_id: user.role?.id || "",
  });

  useEffect(() => {
    if (!roles.length) {
      dispatch(loadRoles());
    }
  }, [dispatch, roles.length]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateUser(user.id, {
          ...formData,
          role_id: formData.role_id ? Number(formData.role_id) : undefined,
        })
      );
      onClose();
    } catch (err) {
      alert(err.message || "Error a l'actualitzar l'usuari");
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-start sm:items-center justify-center p-4 bg-dark/60 backdrop-blur-sm overflow-hidden animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh] border border-blue-50/50 mt-12 sm:mt-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Capçalera del modal */}
        <div className="px-6 py-5 sm:px-8 border-b border-gray-100 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-dark">Dades de l'usuari</h3>
          <button 
            onClick={onClose} 
            className="text-muted hover:text-dark p-2 hover:bg-gray-50 rounded-full transition-all active:scale-90"
            aria-label="Tancar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cos scrollable del modal */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          
          <div className="flex items-center gap-4 mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <UserAvatar user={user} size={64} />
            <div>
              <h4 className="font-bold text-dark text-lg">{user.first_name} {user.last_name}</h4>
              <p className="text-sm text-muted">{user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Nom</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-dark mb-1">Cognoms</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Correu electrònic</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-1">Rol</label>
              <select
                name="role_id"
                value={formData.role_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 text-sm rounded-xl border border-gray-200 focus:border-primary focus:ring focus:ring-primary/20 outline-none transition cursor-pointer"
              >
                <option value="">Selecciona un rol...</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 mt-8 border-t border-gray-50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-dark hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel·lar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-hover transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 cursor-pointer active:scale-95"
              >
                {isLoading ? "Guardant..." : "Guardar canvis"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>,
    document.body
  );
}
