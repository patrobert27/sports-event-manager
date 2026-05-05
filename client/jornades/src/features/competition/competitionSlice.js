/**
 * SLICE DE COMPETICIONS
 * 
 * Aquest fitxer gestiona l'estat de les jornades esportives a Redux.
 * Aquí guardem la llista de totes les competicions, els detalls d'una 
 * competició concreta quan l'estem veient, i dades auxiliars com 
 * els esports (activitats) i les instal·lacions (camps).
 */

import { createSlice } from "@reduxjs/toolkit";

// --- ESTAT INICIAL ---

const initialState = {
  // Llista completa de competicions (GET /competitions)
  competitions: [],           

  // Detall de la competició seleccionada (GET /competitions/:id)
  currentCompetition: null,   

  // Booleà per saber si estem esperant dades del servidor
  isLoadingCompetitions: false,

  // Guardem missatges d'error si alguna operació falla
  error: null,

  // Guardem missatges d'èxit per donar feedback a l'usuari (ex: "Creat amb èxit")
  success: null,              

  // Llista d'activitats disponibles al sistema (per als selectors dels formularis)
  activities: [],

  // Llista de camps o instal·lacions disponibles
  fields: [],
};

// --- DEFINICIÓ DEL SLICE ---

const competitionSlice = createSlice({
  name: "competition",
  initialState: initialState,
  reducers: {
    
    /**
     * Activa o desactiva l'indicador de càrrega.
     */
    setIsLoadingCompetitions(state, action) {
      const isCurrentlyLoading = action.payload;
      state.isLoadingCompetitions = isCurrentlyLoading;
    },

    /**
     * Guarda un missatge d'error.
     */
    setError(state, action) {
      const errorMessage = action.payload;
      state.error = errorMessage;
    },

    /**
     * Guarda un missatge d'èxit.
     */
    setSuccess(state, action) {
      const successMessage = action.payload;
      state.success = successMessage;
    },

    /**
     * Actualitza la llista completa de competicions.
     * S'executa després de carregar totes les jornades de l'API.
     */
    setCompetitions(state, action) {
      const competitionsList = action.payload;
      state.competitions = competitionsList || [];
    },

    /**
     * Guarda les dades d'una sola competició concreta.
     */
    setCompetition(state, action) {
      const competitionDetail = action.payload;
      state.currentCompetition = competitionDetail;
    },

    /**
     * Guarda la llista d'activitats (esports).
     */
    setActivities(state, action) {
      const activitiesList = action.payload;
      state.activities = activitiesList || [];
    },

    /**
     * Guarda la llista de camps/pavellons.
     */
    setFields(state, action) {
      const fieldsList = action.payload;
      state.fields = fieldsList || [];
    },
  },
});

// Exportem les accions perquè els components i thunks les puguin utilitzar
export const {
  setIsLoadingCompetitions,
  setError,
  setSuccess,
  setCompetitions,
  setCompetition,
  setActivities,
  setFields,
} = competitionSlice.actions;

// Exportem el reducer per a la store principal
export default competitionSlice.reducer;
