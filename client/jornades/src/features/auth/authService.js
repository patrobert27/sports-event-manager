import { API_URL, apiFetch } from "../../services/api";

// aquest servei nomes fa de pont amb el backend per a temes d'inici de sessió
const fetchUserProfile = async () => {

  // Fem servir apiFetch perquè ja afegeix automàticament el token d'Authorization
  const profileData = await apiFetch("/auth/profile");

  return profileData;
};

// retorna la URL completa per a rebre l'autenticació de Google OAuth
const getGoogleLoginUrl = () => {
  const fullUrl = `${API_URL}/auth/google`;

  return fullUrl;
};

// login de desenvolupament (DEV). Permet entrar al moment triant un correu fictici
const devLogin = async (email) => {

  // demanem el token d'accés a l'endpoint de proves
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

  // si el correu de dev no és bo, disparem un error descriptiu
  if (!response.ok) {

    const errorJson = await response.json().catch(() => {
      return null;
    });

    const errorMessage = errorJson?.message || 'El login de dev ha fallat al servidor';

    throw new Error(errorMessage);
  }

  // si tot és correcte, extraiem el token JWT retornat pel backend
  const responseJson = await response.json();
  const sessionToken = responseJson.token;

  return sessionToken;
};

// exportem el grup de funcions del servei sense canviar cap nom
const authService = {
  fetchUserProfile,
  getGoogleLoginUrl,
  devLogin,
};

export default authService;
