import { createSlice } from "@reduxjs/toolkit";

/**
 * Estat inicial del mòdul d'usuaris.
 * Hem simplificat la gestió per afavorir la consistència mitjançant re-càrregues des de l'API.
 */
const initialState = {
  users: [], // Llista d'usuaris paginada (abans era 'list')
  pagination: { 
    total: 0, 
    page: 1, 
    limit: 10, 
    totalPages: 0 
  },
  isLoading: false,
  error: null,
  roles: [], // Metadades de rols per als desplegables d'edició
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    // Control d'estats de càrrega i errors
    setIsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },

    // Setter principal per a la llista i la paginació
    setUsers(state, action) {
      state.users = action.payload.data || [];
      state.pagination = action.payload.pagination || initialState.pagination;
    },

    // Setter per a la llista de rols disponibles
    setRoles(state, action) {
      state.roles = action.payload || [];
    },
  },
});

export const {
  setIsLoading,
  setError,
  setUsers,
  setRoles,
} = userSlice.actions;

export default userSlice.reducer;
