// Slice d'autenticació
// Aquest fitxer defineix l'estat, accions i reducers relacionats amb l'autenticació de l'usuari a Redux.
// Gestiona el token, l'usuari i si està autenticat, i sincronitza amb localStorage.
import { createSlice } from "@reduxjs/toolkit";

// Funció auxiliar per decodificar un JWT (sense llibreria externa)
function decodeJwt(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Llegeix el token i l'usuari de localStorage quan arrenca l'aplicació
const persistedToken = localStorage.getItem("token");
const persistedUser = localStorage.getItem("user");

// Estat inicial d'autenticació
const initialState = {
  token: persistedToken || null,
  user: persistedUser ? JSON.parse(persistedUser) : null,
  isAuthenticated: !!persistedToken,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Desa el token i l'usuari, i marca com autenticat
    setCredentials(state, action) {
      const { token, user } = action.payload;
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    // Desa només el token i marca com autenticat
    setToken(state, action) {
      const token = action.payload;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
    },
    // Desa només l'usuari
    setUser(state, action) {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    // Elimina tota la informació d'autenticació (logout)
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

// Exporta les accions i el reducer d'autenticació
export const { setCredentials, setToken, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
