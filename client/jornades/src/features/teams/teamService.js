import { apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a la llista d'equips, membres i professors
const teamService = {
  
  // Demana tots els equips participants al sistema, podent filtrar per ID de la jornada
  async fetchTeams(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = `/teams${query ? `?${query}` : ""}`;
    
    return await apiFetch(url);
  },

  // Demana la informació completa d'un equip particular
  async fetchTeamById(id) {
    const url = `/teams/${id}`;
    
    return await apiFetch(url);
  },

  // Crea un nou equip participant amb els camps configurats per l'alumne
  async createTeam(payload) {
    return await apiFetch("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // Modifica el tutor de l'equip o el seu nom
  async updateTeam(id, payload) {
    return await apiFetch(`/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  // Esborra definitivament un equip participant
  async deleteTeam(id) {
    return await apiFetch(`/teams/${id}`, {
      method: "DELETE",
    });
  },

  // Envia una sol·licitud per a unir-se com a membre d'un equip particular
  async joinTeam(teamId) {
    return await apiFetch(`/teams/${teamId}/join`, {
      method: "POST",
    });
  },

  // El capità accepta la petició d'un alumne d'unir-se al seu grup
  async acceptMember(playerRecordId) {
    return await apiFetch(`/teams/members/${playerRecordId}/accept`, {
      method: "PATCH",
    });
  },

  // El capità rebutja una sol·licitud o expulsa un integrant de l'equip
  async removeMember(playerRecordId) {
    return await apiFetch(`/teams/members/${playerRecordId}`, {
      method: "DELETE",
    });
  },

  // Obté tota la llista de professors del centre per als selectors de tutors (fins a 100 de cop)
  async fetchTeachers() {
    const url = "/users/teachers?limit=100";
    
    return await apiFetch(url);
  },

  // Cerca un professor pel seu nom o cognom amb límit estricte de 10 resultats
  async searchTeachers(query) {
    const q = new URLSearchParams({ 
      search: query, 
      limit: 10 
    }).toString();
    
    const url = `/users/teachers?${q}`;
    
    return await apiFetch(url);
  },

  // El capità cedeix el rol de capità a un altre integrant de l'equip
  async transferCaptaincy(teamId, newCaptainId) {
    return await apiFetch(`/teams/${teamId}/transfer-captain`, {
      method: "PATCH",
      body: JSON.stringify({ 
        newCaptainId: newCaptainId 
      }),
    });
  },

  // Un administrador mou un membre directament cap a un altre equip de destí
  async moveMember(playerRecordId, targetTeamId) {
    return await apiFetch(`/teams/members/${playerRecordId}/move`, {
      method: "PATCH",
      body: JSON.stringify({ 
        targetTeamId: targetTeamId 
      }),
    });
  },
};

export default teamService;
