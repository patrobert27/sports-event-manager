import { store } from "../app/store";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

/**
 * Encall subministrat per centralitzar les peticions HTTP
 * Injecta el token JWT automàticament des de l'estat de Redux.
 */
export const apiFetch = async (endpoint, options = {}) => {
  const token = store.getState().auth.token;
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || response.statusText;
    throw new Error(errorMessage || "Error en la petició");
  }

  // Si no hi ha cos a la resposta, retornem null
  if (response.status === 204) {
    return null;
  }

  return response.json();
};
