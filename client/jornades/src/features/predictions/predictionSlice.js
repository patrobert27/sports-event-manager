import { createSlice } from '@reduxjs/toolkit';

// Estat inicial per les prediccions i apostes de l'estudiant
const initialState = {
  predictions: [],        // guardem la llista de quinieles de l'alumne
  isLoading: false,       // loading per saber si hem de mostrar l'spinner
  error: null,            // missatge d'error de l'api per als cartellets
  success: null,          // avisos verds d'exit quan guardes o elimines apostes
  isBettingOpen: false,   // comprova si el profe te les apostes obertes en aquest moment
  isRankingVisible: true, // boolean per a saber si el rànquing es public o esta ocult
};

const predictionSlice = createSlice({
  name: 'predictions',
  initialState,
  
  reducers: {
    
    // actualitza si el periode d'apostes esta obert o tancat pel professor
    setBettingStatus(state, action) {
      state.isBettingOpen = action.payload;
    },

    // serveix per a mostrar o amagar la pestanya de rànquing de crèdits
    setRankingVisibility(state, action) {
      state.isRankingVisible = action.payload;
    },

    // guardem missatge temporal d'exit
    setSuccess(state, action) {
      state.success = action.payload;
    },

    // netegem a la vegada els cartellets d'error o d'exit del panell
    clearMessages(state) {
      state.success = null;
      state.error = null;
    },

    // activem loading quan comencem a buscar les nostres apostes
    fetchPredictionsStart(state) {
      state.isLoading = true;
      state.error = null;
    },

    // si la cerca del backend surt de luxe, fiquem les dades i parem la rodeta
    fetchPredictionsSuccess(state, action) {
      state.isLoading = false;
      state.predictions = action.payload;
    },

    // si el fetch de prediccions falla, parem rodeta i desem el motiu
    fetchPredictionsFailure(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // col·loquem una aposta nova a dalt de tot de la llista general
    addPrediction(state, action) {
      state.predictions.unshift(action.payload);
    },

    // esborrem una aposta de la llista
    removePrediction(state, action) {
      state.predictions = state.predictions.filter((p) => {
        return p.id !== action.payload;
      });
    },

  },
});

// exportem exactament les mateixes accions del slice d'apostes
export const {
  fetchPredictionsStart,
  fetchPredictionsSuccess,
  fetchPredictionsFailure,
  addPrediction,
  removePrediction,
  setSuccess,
  clearMessages,
  setBettingStatus,
  setRankingVisibility,
} = predictionSlice.actions;

export default predictionSlice.reducer;
