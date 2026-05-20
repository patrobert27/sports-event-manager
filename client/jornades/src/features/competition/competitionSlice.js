import { createSlice } from "@reduxjs/toolkit";

// Estat inicial de les competicions (jornades) guardat a Redux
const initialState = {
  
  competitions: [],             // llista completa de totes les jornades (GET /jornades)
  
  currentCompetition: null,     // detall de la competicio que l'usuari està mirant (GET /jornades/:id)
  
  isLoadingCompetitions: false, // serveix per a ensenyar la rodeta de carrega (Spinner)
  
  error: null,                  // missatge d'error si alguna accio de jornades peta
  
  success: null,                // cartellet verd quan creem o editem una competicio de luxe
  
  activities: [],               // esports disponibles per als selects dels formularis
  
  fields: [],                   // instal·lacions actives (pistes, pavellons...)
  
};

const competitionSlice = createSlice({
  name: "competition",
  initialState: initialState,
  
  reducers: {
    
    // controlem la rodeta de carrega global per a les jornades
    setIsLoadingCompetitions(state, action) {
      const isCurrentlyLoading = action.payload;
      
      state.isLoadingCompetitions = isCurrentlyLoading;
    },

    // guardem missatges en vermell al slice per mostrar-los si quelcom falla
    setError(state, action) {
      const errorMessage = action.payload;
      
      state.error = errorMessage;
    },

    // missatges temporals d'exit per als formularis de les jornades
    setSuccess(state, action) {
      const successMessage = action.payload;
      
      state.success = successMessage;
    },

    // col·loquem el llistat sencer de jornades a la graella principal
    setCompetitions(state, action) {
      const competitionsList = action.payload;
      
      state.competitions = competitionsList || [];
    },

    // desem de forma activa els detalls d'una jornada esportiva concreta
    setCompetition(state, action) {
      const competitionDetail = action.payload;
      
      state.currentCompetition = competitionDetail;
    },

    // llista dels esports que el professor pot triar
    setActivities(state, action) {
      const activitiesList = action.payload;
      
      state.activities = activitiesList || [];
    },

    // llista de pavellons i pistes carregada del backend
    setFields(state, action) {
      const fieldsList = action.payload;
      
      state.fields = fieldsList || [];
    },

  },
});

// exportem les accions sense tocar-ne cap de nom ni de paràmetre
export const {
  setIsLoadingCompetitions,
  setError,
  setSuccess,
  setCompetitions,
  setCompetition,
  setActivities,
  setFields,
} = competitionSlice.actions;

export default competitionSlice.reducer;
