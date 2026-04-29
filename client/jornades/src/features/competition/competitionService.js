import { API_URL, apiFetch } from "../../services/api";

const competitionService = {
  async fetchCompetitions() {
    return await apiFetch("/jornades/competicions");
  },

  async fetchCompetitionById(id) {
    return await apiFetch(`/jornades/competicions/${id}`);
  },

  async createCompetition(payload) {
    return await apiFetch("/jornades/competicions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateCompetition(id, payload) {
    return await apiFetch(`/jornades/competicions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  async deleteCompetition(id) {
    return await apiFetch(`/jornades/competicions/${id}`, {
      method: "DELETE",
    });
  },

  // Minimal attempts to fetch related data; backend may not expose these endpoints,
  // but we try them so the UI can present selects. If unavailable, callers should
  // handle failure and render empty lists.
  async fetchActivities() {
    try {
      return await apiFetch("/activities");
    } catch {
      return [];
    }
  },

  async fetchFields() {
    try {
      return await apiFetch("/fields");
    } catch {
      return [];
    }
  },
};

export default competitionService;
