import { apiFetch } from "../../services/api";

const fieldService = {
  /** Llista tots els camps amb buscador opcional */
  async fetchFields({ search = "" } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    return await apiFetch(`/fields?${params.toString()}`);
  },

  /** Crea un nou camp */
  async createField(data) {
    return await apiFetch("/fields", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Actualitza un camp existent */
  async updateField(id, data) {
    return await apiFetch(`/fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Elimina un camp */
  async deleteField(id) {
    return await apiFetch(`/fields/${id}`, {
      method: "DELETE",
    });
  },
};

export default fieldService;
