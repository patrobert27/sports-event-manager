import { createSlice } from "@reduxjs/toolkit";

// Estat inicial de la gestio d'equips del torneig
const initialState = {
  teams: [],              // llista general de tots els equips inscrits a la jornada
  currentTeam: null,      // equip concret seleccionat del que mirem el detall
  isLoadingTeams: false,  // boleà per a ensenyar la rodeta de carrega a la llista d'equips
  error: null,            // missatges d'error a pintar
  success: null,          // avisos d'exit verd al crear o unir-se a un equip
};

const teamSlice = createSlice({
  name: "teams",
  initialState,
  
  reducers: {
    
    // loading per saber si hem de mostrar l'spinner de carrega d'equips
    setIsLoadingTeams(state, action) {
      state.isLoadingTeams = action.payload;
    },

    // error es guarda per poder ensenyar un missatge en vermell a l'usuari
    setError(state, action) {
      state.error = action.payload;
    },

    // guardem missatges d'exit dels formularis
    setSuccess(state, action) {
      state.success = action.payload;
    },

    // canviem tota la graella de equips de cop
    setTeams(state, action) {
      state.teams = action.payload || [];
    },

    // guardem el detall del equip seleccionat de forma activa
    setTeam(state, action) {
      state.currentTeam = action.payload;
    },

  },
});

// exportem les accions sense tocar-ne cap de nom ni de paràmetre
export const {
  setIsLoadingTeams,
  setError,
  setSuccess,
  setTeams,
  setTeam,
} = teamSlice.actions;

export default teamSlice.reducer;
