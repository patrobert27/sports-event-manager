import { apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a la llista de prediccions i apostes de l'estudiant
export const predictionService = {
  
  // Crea una nova aposta d'un partit posant el marcador previst i els crèdits jugats
  createPrediction: async (matchId, goals_local, goals_visitor, bet_amount) => {
    const url = "/predictions";
    
    return await apiFetch(url, {
      method: "POST",
      body: JSON.stringify({ 
        matchId: matchId, 
        goals_local: goals_local, 
        goals_visitor: goals_visitor, 
        bet_amount: bet_amount 
      }),
    });
  },

  // Obté totes les apostes fetes per l'estudiant, opcionalment filtrades per jornada
  getMyPredictions: async (competitionId = null) => {
    const query = competitionId ? `?competitionId=${competitionId}` : '';
    const url = `/predictions/me${query}`;
    
    return await apiFetch(url);
  },

  // Elimina una aposta abans que el partit hagi començat per a recuperar els crèdits
  deletePrediction: async (predictionId) => {
    const url = `/predictions/${predictionId}`;
    
    return await apiFetch(url, {
      method: "DELETE",
    });
  },

  // Canvia la puntuació prevista o crèdits d'una aposta ja feta
  updatePrediction: async (predictionId, goals_local, goals_visitor, bet_amount) => {
    const url = `/predictions/${predictionId}`;
    
    return await apiFetch(url, {
      method: "PUT",
      body: JSON.stringify({ 
        goals_local: goals_local, 
        goals_visitor: goals_visitor, 
        bet_amount: bet_amount 
      }),
    });
  },
};
