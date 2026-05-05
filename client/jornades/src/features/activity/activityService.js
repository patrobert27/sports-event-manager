import { apiFetch } from "../../services/api";

const activityService = {
  /** Obté totes les activitats amb cerca opcional */
  async fetchActivities({ search = "" } = {}) {
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    return await apiFetch(`/activities?${params.toString()}`);
  },

  /** Crea una nova activitat */
  async createActivity(data) {
    return await apiFetch("/activities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  /** Actualitza una activitat existent */
  async updateActivity(id, data) {
    return await apiFetch(`/activities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  /** Elimina una activitat */
  async deleteActivity(id) {
    return await apiFetch(`/activities/${id}`, {
      method: "DELETE",
    });
  },
};

export default activityService;
