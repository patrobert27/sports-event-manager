import { createSlice } from '@reduxjs/toolkit';

// Estat inicial de les instal·lacions esportives (camps o pistes)
const initialState = {
  fields: [],       // llista de pavellons o camps de joc de l'escola
  isLoading: false, // loading serveix per saber si hem de mostrar l'spinner
  error: null,      // error es guarda per poder ensenyar un missatge en vermell
  success: null,    // cartell d'exit verd en crear o editar una pista de joc
};

const fieldSlice = createSlice({
  name: 'field',
  initialState,
  
  reducers: {
    
    // actualitza la llista de instal·lacions
    setFields(state, action) {
      state.fields = action.payload;
    },

    // activem o desactivem el carregant de la llista de pistes
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },

    // desem l'error de peticions a la base de dades
    setError(state, action) {
      state.error = action.payload;
    },

    // missatges temporals d'exit per als avisos
    setSuccess(state, action) {
      state.success = action.payload;
    },

  },
});

// exportem les accions sense tocar-ne cap de nom ni de paràmetre
export const { 
  setFields, 
  setIsLoading, 
  setError, 
  setSuccess 
} = fieldSlice.actions;

export default fieldSlice.reducer;
