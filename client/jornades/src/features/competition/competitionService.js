/**
 * SERVEI DE COMPETICIONS
 * 
 * Aquest fitxer conté les crides directes a l'API del servidor per a tot el que
 * tingui a veure amb les jornades esportives.
 */

import { apiFetch } from "../../services/api";

const competitionService = {
  
  /**
   * Demana la llista de totes les competicions.
   */
  async fetchCompetitions() {
    const competitionsData = await apiFetch("/jornades/competicions");
    
    return competitionsData;
  },

  /**
   * Demana les dades d'una competició específica per ID.
   */
  async fetchCompetitionById(competitionId) {
    const competitionDetail = await apiFetch(
      `/jornades/competicions/${competitionId}`
    );
    
    return competitionDetail;
  },

  /**
   * Crea una competició nova.
   */
  async createCompetition(competitionPayload) {
    const createdCompetition = await apiFetch(
      "/jornades/competicions", 
      {
        method: "POST",
        body: JSON.stringify(competitionPayload),
      }
    );
    
    return createdCompetition;
  },

  /**
   * Actualitza les dades d'una competició existent.
   */
  async updateCompetition(competitionId, competitionPayload) {
    const updatedCompetition = await apiFetch(
      `/jornades/competicions/${competitionId}`, 
      {
        method: "PATCH",
        body: JSON.stringify(competitionPayload),
      }
    );
    
    return updatedCompetition;
  },

  /**
   * Elimina una competició.
   */
  async deleteCompetition(competitionId) {
    const deletionResult = await apiFetch(
      `/jornades/competicions/${competitionId}`, 
      {
        method: "DELETE",
      }
    );
    
    return deletionResult;
  },

  /**
   * Obté la llista d'activitats i esports del sistema.
   * Si falla, retornem una llista buida per no bloquejar la UI.
   */
  async fetchActivities() {
    try {
      const activitiesData = await apiFetch("/activities");
      
      return activitiesData;
    } catch (error) {
      return [];
    }
  },

  /**
   * Obté la llista d'instal·lacions esportives (camps).
   */
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
