import { apiFetch } from "../../services/api";

const teamService = {
  /**
   * Obté la llista d'equips. Pot filtrar-se per competició.
   */
  async fetchTeams(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/teams${query ? `?${query}` : ""}`;
    return await apiFetch(url);
  },

  /**
   * Obté un equip pel seu ID.
   */
  async fetchTeamById(id) {
    return await apiFetch(`/teams/${id}`);
  },

  /**
   * Crea un nou equip.
   */
  async createTeam(payload) {
    return await apiFetch("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Actualitza la informació d'un equip.
   */
  async updateTeam(id, payload) {
    return await apiFetch(`/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Elimina un equip.
   */
  async deleteTeam(id) {
    return await apiFetch(`/teams/${id}`, {
      method: "DELETE",
    });
  },

  /**
   * Sol·licita unir-se a un equip.
   */
  async joinTeam(teamId) {
    return await apiFetch(`/teams/${teamId}/join`, {
      method: "POST",
    });
  },

  /**
   * Accepta un membre a l'equip.
   */
  async acceptMember(playerRecordId) {
    return await apiFetch(`/teams/members/${playerRecordId}/accept`, {
      method: "PATCH",
    });
  },

  /**
   * Rebutja o elimina un membre (retirar sol·licitud o expulsió).
   */
  async removeMember(playerRecordId) {
    return await apiFetch(`/teams/members/${playerRecordId}`, {
      method: "DELETE",
    });
  },
  /**
   * Obté la llista de professors.
   */
  async fetchTeachers() {
    return await apiFetch("/users/teachers");
  },
  /**
   * Transfereix la capitania a un altre membre.
   */
  async transferCaptaincy(teamId, newCaptainId) {
    return await apiFetch(`/teams/${teamId}/transfer-captain`, {
      method: "PATCH",
      body: JSON.stringify({ newCaptainId }),
    });
  },
};

export default teamService;
