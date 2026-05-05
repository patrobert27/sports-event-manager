/**
 * SERVEI D'AUTENTICACIÓ
 * 
 * Aquest fitxer s'encarrega exclusivament de parlar amb el servidor (backend).
 * No guarda dades de Redux, només fa les crides HTTP i retorna la resposta.
 */

import { 
  API_URL, 
  apiFetch 
} from "../../services/api";

/**
 * Obté el perfil de l'usuari autenticat.
 * Envia una petició GET a /auth/profile.
 */
const fetchUserProfile = async () => {
  // Fem servir apiFetch perquè ja afegeix automàticament el token Authorization
  const profileData = await apiFetch("/auth/profile");
  
  return profileData;
};

/**
 * Retorna la URL completa per anar a fer el login amb Google.
 */
const getGoogleLoginUrl = () => {
  const fullUrl = `${API_URL}/auth/google`;
  
  return fullUrl;
};

/**
 * Login de desenvolupament (DEV).
 * Permet entrar ràpidament amb un email sense Google.
 */
const devLogin = async (email) => {
  // Fem un fetch normal a l'endpoint de desenvolupament
  const response = await fetch(
    `${API_URL}/auth/dev`, 
    {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        email: email 
      }),
    }
  );

  // Si la resposta no és bona (codi 400, 500, etc.)
  if (!response.ok) {
    // Intentem llegir el missatge d'error del JSON
    const errorJson = await response.json().catch(() => {
      return null;
    });
    
    const errorMessage = errorJson?.message || 'El login de dev ha fallat al servidor';
    
    throw new Error(errorMessage);
  }

  // Si tot ha anat bé, extraiem el token
  const responseJson = await response.json();
  const sessionToken = responseJson.token;
  
  return sessionToken;
};

// Exportem totes les funcions agrupades en un objecte
const authService = {
  fetchUserProfile: fetchUserProfile,
  getGoogleLoginUrl: getGoogleLoginUrl,
  devLogin: devLogin,
};

export default authService;
