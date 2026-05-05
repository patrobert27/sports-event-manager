import { apiFetch } from "../../services/api";

const userService = {
  /** Obté la llista d'usuaris paginada amb cerca opcional */
  async fetchUsers({ page = 1, limit = 10, search = "" } = {}) {
    const params = new URLSearchParams({ page, limit });
    if (search.trim()) params.set("search", search.trim());
    return await apiFetch(`/users?${params.toString()}`);
  },

  /** Actualitza un usuari per ID */
  async updateUser(id, payload) {
    return await apiFetch(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  /** Obté tots els rols disponibles */
  async fetchRoles() {
    try {
      return await apiFetch("/users/roles");
    } catch {
      return [];
    }
  },
};

export default userService;
