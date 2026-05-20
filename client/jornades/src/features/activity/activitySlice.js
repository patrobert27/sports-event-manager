import { createSlice } from "@reduxjs/toolkit";

// Estat inicial de les activitats de la jornada escolar
const initialState = {
  list: [],             // guardem aqui els esports o activitats (futbol, ping-pong...)
  isLoading: false,     // loading serveix per saber si hem de mostrar l'spinner
  error: null,          // guardem error per poder ensenyar-lo en un cartell vermell
  success: null,        // missatge verd d'exit quan el profe crea un esport
};

const activitySlice = createSlice({
  name: "activity",
  initialState,
  
  reducers: {
    
    // activem o desactivem el selector de carrega global d'activitats
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },

    // guardem l'error del servidor
    setError(state, action) {
      state.error = action.payload;
    },

    // guardem missatge d'exit temporal
    setSuccess(state, action) {
      state.success = action.payload;
    },

    // fiquem la llista sencera que ve de la base de dades
    setActivities(state, action) {
      state.list = action.payload || [];
    },

  },
});

// exportem exactament les mateixes accions del slice d'esports
export const {
  setIsLoading,
  setError,
  setSuccess,
  setActivities,
} = activitySlice.actions;

export default activitySlice.reducer;
