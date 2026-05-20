import { createSlice } from '@reduxjs/toolkit';

// Estat inicial de la fase de grups i eliminatories a Redux
const initialState = {
  
  groups: [],             // llista de grups amb equips assignats (Grup A, Grup B...)
  
  groupStageMatches: [],  // partits de la lligueta inicial de grups
  
  semifinalMatches: [],   // partits de semifinals generats automaticament
  
  finalMatches: [],       // partits de la gran final
  
  thirdPlaceMatches: [],  // partits de consolacio (tercer i quart lloc)
  
  standings: [],          // classificacions completes de cadascun dels grups
  
  isLoadingGroups: false, // serveix per a mostrar la rodeta (Spinner) a la fase competitiva
  
  error: null,            // missatges d'error a pintar
  
  success: null,          // avisos verds d'exit de regeneracio de partits o grups
  
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  
  reducers: {
    
    // loading per a saber si el profe està regenerant partits o grups
    setIsLoadingGroups(state, action) {
      state.isLoadingGroups = action.payload;
    },

    // guardem l'error del servidor
    setError(state, action) {
      state.error = action.payload;
    },

    // missatges temporals d'exit per als avisos
    setSuccess(state, action) {
      state.success = action.payload;
    },

    // desem la configuracio de grups del torneig
    setGroups(state, action) {
      state.groups = action.payload || [];
    },

    // desem els partits de la lligueta
    setGroupStageMatches(state, action) {
      state.groupStageMatches = action.payload || [];
    },

    // desem els partits de les semifinals
    setSemifinalMatches(state, action) {
      state.semifinalMatches = action.payload || [];
    },

    // desem els partits de la final
    setFinalMatches(state, action) {
      state.finalMatches = action.payload || [];
    },

    // desem els partits pel tercer lloc
    setThirdPlaceMatches(state, action) {
      state.thirdPlaceMatches = action.payload || [];
    },

    // desem les classificacions provisionals per grups
    setStandings(state, action) {
      state.standings = action.payload || [];
    },

  },
});

// exportem exactament les mateixes accions del llistat
export const {
  setIsLoadingGroups,
  setError,
  setSuccess,
  setGroups,
  setGroupStageMatches,
  setSemifinalMatches,
  setFinalMatches,
  setThirdPlaceMatches,
  setStandings,
} = groupSlice.actions;

export default groupSlice.reducer;
