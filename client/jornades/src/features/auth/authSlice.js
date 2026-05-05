/**
 * SLICE D'AUTENTICACIÓ (Redux Toolkit)
 * 
 * Aquest fitxer gestiona l'estat de la sessió de l'usuari a tota l'aplicació.
 * S'encarrega de guardar el token de seguretat (JWT) i les dades del perfil.
 * També sincronitza aquestes dades amb el 'localStorage' del navegador perquè 
 * la sessió no es perdi en tancar la pestanya.
 */

import { createSlice } from "@reduxjs/toolkit";

/**
 * Funció auxiliar per desxifrar un token JWT.
 * El token és una cadena de text amb 3 parts separades per punts.
 * La part del mig (payload) conté la informació de l'usuari.
 */
function decodeJwt(token) {
  try {
    // La segona part del token (índex 1) conté les dades en format Base64
    const base64Payload = token.split(".")[1];
    
    // Descodifiquem la Base64 i ho convertim a un objecte JavaScript
    const decodedJson = atob(base64Payload);
    const payloadObject = JSON.parse(decodedJson);
    
    return payloadObject;
  } catch (error) {
    // Si el token està malament o corrupte, retornem null
    return null;
  }
}

// --- RECUPERACIÓ DE LA SESSIÓ AL COMENÇAR ---

// Intentem llegir si ja hi havia un token guardat al navegador d'una sessió anterior
let persistedToken = localStorage.getItem("token");
let persistedUser = null;

if (persistedToken) {
  // Verifiquem si el token que hem trobat encara és vàlid o si ha caducat
  const decodedToken = decodeJwt(persistedToken);
  
  // La data de caducitat (exp) ve en segons. La passem a milisegons per comparar amb ara.
  const isTokenExpired = decodedToken && decodedToken.exp && (decodedToken.exp * 1000 < Date.now());

  if (!decodedToken || isTokenExpired) {
    // Si el token ha caducat, netegem tota la memòria per seguretat
    console.warn("La sessió ha caducat. S'esborren les dades locals.");
    
    persistedToken = null;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } else {
    // Si el token és bo, mirem si també teníem les dades de l'usuari guardades
    try {
      const userString = localStorage.getItem("user");
      
      if (userString) {
        persistedUser = JSON.parse(userString);
      }
    } catch (parseError) {
      // Si el JSON de l'usuari està trencat, el netegem
      localStorage.removeItem("user");
    }
  }
}

// --- ESTAT INICIAL DEL SLICE ---

const initialState = {
  // El token per fer crides a l'API
  token: persistedToken || null,
  
  // Les dades de l'usuari (nom, rol, etc.)
  user: persistedUser,
  
  // Booleà per saber ràpidament si l'usuari ha fet login
  isAuthenticated: !!persistedToken,
  
  // Per mostrar un carregant mentre demanem dades al servidor
  isLoadingUser: false,
};

// --- DEFINICIÓ DEL SLICE ---

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    
    /**
     * Guarda totes les credencials de cop.
     */
    setCredentials(state, action) {
      const { token, user } = action.payload;
      
      state.token = token;
      state.user = user;
      state.isAuthenticated = true;
      
      // Ho persistim al navegador
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },

    /**
     * Guarda només el token (per exemple, quan tornem de Google).
     */
    setToken(state, action) {
      const newToken = action.payload;
      
      state.token = newToken;
      state.isAuthenticated = true;
      
      localStorage.setItem("token", newToken);
    },

    /**
     * Actualitza les dades del perfil de l'usuari.
     */
    setUser(state, action) {
      const userData = action.payload;
      
      state.user = userData;
      
      localStorage.setItem("user", JSON.stringify(userData));
    },

    /**
     * Tanca la sessió (Logout).
     * Esborra absolutament tot de l'estat i del navegador.
     */
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },

    /**
     * Activa o desactiva l'indicador de càrrega.
     */
    setLoadingUser(state, action) {
      const isCurrentlyLoading = action.payload;
      state.isLoadingUser = isCurrentlyLoading;
    },
  },
});

// Exportem les accions perquè els components puguin fer 'dispatch'
export const { 
  setCredentials, 
  setToken, 
  setUser, 
  logout, 
  setLoadingUser 
} = authSlice.actions;

// Exportem el reducer per configurar-lo a la store de Redux
export default authSlice.reducer;
