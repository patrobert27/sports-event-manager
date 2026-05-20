import { createSlice } from "@reduxjs/toolkit";

// Estat inicial de la llista general d'usuaris
const initialState = {
  
  users: [],        // llista de companys o usuaris paginada
  
  pagination: {     // dades de control de pagines per la taula
    total: 0, 
    page: 1, 
    limit: 10, 
    totalPages: 0 
  },
  
  isLoading: false, // loading serveix per saber si demanem dades
  error: null,      // error es guarda per poder ensenyar cartells vermells
  success: null,    // cartell verd si actualitzem rols d'un company
  roles: [],        // rols disponibles pel select d'edicio (admin, alumne...)
  
};

const userSlice = createSlice({
  name: "user",
  initialState,
  
  reducers: {
    
    // activem el carregant del buscador de companys
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },

    // error al canviar rols o guardar dades
    setError(state, action) {
      state.error = action.payload;
    },

    // missatges temporals de que tot ha anat de luxe
    setSuccess(state, action) {
      state.success = action.payload;
    },

    // guardem la llista de companys que ens torna la base dades paginada
    setUsers(state, action) {
      state.users = action.payload.data || [];
      state.pagination = action.payload.pagination || initialState.pagination;
    },

    // desem la configuracio dels rols possibles
    setRoles(state, action) {
      state.roles = action.payload || [];
    },

  },
});

// exportem les mateixes accions del llistat d'usuaris d'abans
export const {
  setIsLoading,
  setError,
  setSuccess,
  setUsers,
  setRoles,
} = userSlice.actions;

export default userSlice.reducer;
