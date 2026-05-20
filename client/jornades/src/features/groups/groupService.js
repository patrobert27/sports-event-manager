import { apiFetch } from '../../services/api';

// funció auxiliar simple per a no repetir la ruta base de les crides a l'API de cada jornada
const BASE = (id) => {
  const path = `/jornades/${id}`;
  
  return path;
};

// aquest servei nomes fa de pont amb el backend per a tot el relacionat amb grups i eliminatories
const groupService = {

  // ─── Grups i Fase Inicial ──────────────────────────────────────────────────

  // demana la llista de grups ja generats de la jornada activa
  async fetchGroups(competitionId) {
    const url = `${BASE(competitionId)}/groups`;
    
    return await apiFetch(url);
  },

  // crea o regenera la distribució dels equips de la jornada en grups aleatoris/equilibrats
  async generateGroups(competitionId) {
    const url = `${BASE(competitionId)}/groups/generate`;
    
    return await apiFetch(url, { 
      method: 'POST' 
    });
  },

  // ─── Partits i Resultats ───────────────────────────────────────────────────

  // agafa els partits jugats o pendents, filtrats opcionalment per la seva fase de joc
  async fetchMatches(competitionId, phase = null) {
    const query = phase ? `?phase=${phase}` : '';
    const url = `${BASE(competitionId)}/matches${query}`;
    
    return await apiFetch(url);
  },

  // genera automàticament el calendari de partits creuats entre tots els equips de la fase de grups
  async generateMatches(competitionId) {
    const url = `${BASE(competitionId)}/matches/generate`;
    
    return await apiFetch(url, { 
      method: 'POST' 
    });
  },

  // actualitza els gols locals/visitants i l'estat d'un partit al panell d'admin
  async updateMatchResult(competitionId, matchId, data) {
    const url = `${BASE(competitionId)}/matches/${matchId}`;
    
    return await apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // ─── Classificacions generals ──────────────────────────────────────────────

  // demana els punts, gols a favor i partits de cada equip per dibuixar la classificacio
  async fetchStandings(competitionId) {
    const url = `${BASE(competitionId)}/standings`;
    
    return await apiFetch(url);
  },

  // ─── Fases Eliminatòries finals ────────────────────────────────────────────

  // agafa els 2 primers classificats de cada grup i genera els encreuaments de semifinals
  async generateSemifinals(competitionId) {
    const url = `${BASE(competitionId)}/semifinals/generate`;
    
    return await apiFetch(url, { 
      method: 'POST' 
    });
  },

  // genera el partit de final i el de tercer i quart lloc quan les semifinals s'han acabat
  async generateFinal(competitionId, payload = {}) {
    const url = `${BASE(competitionId)}/final/generate`;
    
    return await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

export default groupService;
