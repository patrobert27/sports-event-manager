import { createSlice } from "@reduxjs/toolkit";

// Estat inicial de la llista de comunicats que reben els alumnes
const initialState = {
  list: [],            // guardem aqui els comunicats que venen del backend
  unreadCount: 0,      // recompte de notis per llegir al header
  error: null,         // missatges d'error de l'api per poder-los pintar
  success: null,       // cartell verd de tot ha anat super bé
};

const announcementSlice = createSlice({
  name: "announcement",
  initialState,
  
  reducers: {
    
    // canviem tota la llista de comunicats de cop al fer fetch
    setAnnouncements(state, action) {
      state.list = action.payload;
    },

    // afegim un comunicat nou al principi de tot
    addAnnouncement(state, action) {
      const exists = state.list.find((a) => {
        return a.id === action.payload.id;
      });
      
      // si ja existeix a la llista pel socket, no el fiquem repetit
      if (!exists) {
        state.list = [action.payload, ...state.list];
      }
    },

    // eliminem un comunicat de la llista pel seu ID
    removeAnnouncement(state, action) {
      state.list = state.list.filter((a) => {
        return a.id !== action.payload;
      });
    },

    // modifiquem el numero de comunicats pendents de llegir
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },

    // guardem error per a poder ensenyar un missatge a l'estudiant
    setError(state, action) {
      state.error = action.payload;
    },

    // guardem missatge d'exit temporal
    setSuccess(state, action) {
      state.success = action.payload;
    }

  }
});

// exportem exactament les mateixes accions d'abans
export const { 
  setAnnouncements, 
  addAnnouncement, 
  removeAnnouncement, 
  setUnreadCount, 
  setError, 
  setSuccess 
} = announcementSlice.actions;

export default announcementSlice.reducer;
