/**
 * CONFIGURACIÓ DE L'API
 * 
 * Aquest fitxer centralitza totes les crides que fem al servidor (backend).
 * Proporciona una funció anomenada 'apiFetch' que s'encarrega de posar
 * automàticament el token de seguretat en cada petició.
 */

import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";

// Obtenim l'URL del servidor des de les variables d'entorn (.env)
// Si no n'hi ha cap, fem servir el localhost per defecte.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * apiFetch: La nostra funció personalitzada per fer 'fetch'
 * 
 * @param {string} endpoint - La ruta a la que volem cridar (ex: "/auth/profile")
 * @param {object} options - Opcions extres (method, body, headers, etc.)
 */
export const apiFetch = async (endpoint, options = {}) => {
  
  // 1. Obtenim el token de seguretat directament de l'estat global de Redux
  const currentState = store.getState();
  const sessionToken = currentState.auth.token;
  
  // 2. Configurem les capçaleres (headers)
  const requestHeaders = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Si tenim un token, l'afegim a la capçalera 'Authorization'
  if (sessionToken) {
    requestHeaders["Authorization"] = `Bearer ${sessionToken}`;
  }

  // 3. Fem la crida real al servidor
  const fullUrl = `${API_URL}${endpoint}`;
  
  const response = await fetch(
    fullUrl, 
    {
      ...options,
      headers: requestHeaders,
    }
  );

  // 4. Gestionem els errors de resposta (codis 400-500)
  if (!response.ok) {
    
    // Si el servidor ens diu 401 (No autoritzat), significa que el token ha caducat
    if (response.status === 401) {
      // Forçem el tancament de sessió per seguretat
      store.dispatch(
        logout()
      );
    }

    // Intentem llegir el missatge d'error que ens envia el backend
    const errorJson = await response.json().catch(() => {
      return null;
    });
    
    const errorMessage = errorJson?.message || response.statusText || "Error desconegut en la petició";
    
    throw new Error(errorMessage);
  }

  // 5. Gestionem respostes buides (codi 204 No Content)
  if (response.status === 204) {
    return null;
  }

  // 6. Llegim les dades en format JSON
  const responseData = await response.json();

  /**
   * El nostre backend sol respondre amb un objecte: { success: true, data: [...] }
   * Per fer-ho més fàcil als components, si trobem aquest format, retornem només
   * la part de 'data', que és el que realment ens interessa.
   */
  const hasStandardFormat = responseData && typeof responseData.success !== "undefined";

  if (hasStandardFormat) {
    return responseData.data;
  }

  // Si no segueix el format estàndard, retornem el JSON sencer
  return responseData;
};
