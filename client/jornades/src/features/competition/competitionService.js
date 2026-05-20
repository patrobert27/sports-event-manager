import { apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a la seccio de jornades i competicions
const competitionService = {
  
  // Demana la llista completa de totes les jornades de l'escola amb filtres opcionals
  async fetchCompetitions(params = {}) {
    const { search, activity_id, status } = params;
    const query = new URLSearchParams();

    if (search) {
      query.set('search', search);
    }
    
    if (activity_id) {
      query.set('activity_id', activity_id);
    }
    
    if (status) {
      query.set('status', status);
    }

    const qs = query.toString();
    const url = `/jornades${qs ? `?${qs}` : ''}`;

    return await apiFetch(url);
  },

  // Demana els detalls i pistes d'una jornada concreta utilitzant el seu ID
  async fetchCompetitionById(competitionId) {
    const competitionDetail = await apiFetch(
      `/jornades/${competitionId}`
    );
    
    return competitionDetail;
  },

  // Crea una competició nova al backend enviant el payload configurat pel professor
  async createCompetition(competitionPayload) {
    const createdCompetition = await apiFetch(
      "/jornades", 
      {
        method: "POST",
        body: JSON.stringify(competitionPayload),
      }
    );
    
    return createdCompetition;
  },

  // Actualitza les opcions (preus, dates de registre) d'una jornada activa
  async updateCompetition(competitionId, competitionPayload) {
    const updatedCompetition = await apiFetch(
      `/jornades/${competitionId}`, 
      {
        method: "PATCH",
        body: JSON.stringify(competitionPayload),
      }
    );
    
    return updatedCompetition;
  },

  // Elimina una competició de la base de dades definitiament
  async deleteCompetition(competitionId) {
    const deletionResult = await apiFetch(
      `/jornades/${competitionId}`, 
      {
        method: "DELETE",
      }
    );
    
    return deletionResult;
  },

  // demana els esports per omplir els desplegables.
  // si falla, es torna un array buit per a no trencar la pantalla del profe!
  async fetchActivities() {
    try {
      
      const activitiesData = await apiFetch("/activities");
      
      return activitiesData;
      
    } catch (error) {
      return [];
    }
  },

  // demana totes les pistes i pavellons registrats a l'escola
  async fetchFields() {
    try {
      
      const fieldsData = await apiFetch("/fields");
      
      return fieldsData;
      
    } catch (error) {
      return [];
    }
  },
};

export default competitionService;
