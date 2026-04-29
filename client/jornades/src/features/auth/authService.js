// Servei d'autenticació: gestiona les peticions a l'API relacionades amb l'usuari
// Aquest fitxer només s'encarrega de la comunicació amb el backend (no gestiona estat ni lògica de Redux)
import { API_URL, apiFetch } from "../../services/api";

// Obté el perfil de l'usuari autenticat fent una petició a l'API
const fetchUserProfile = async () => {
  const data = await apiFetch("/auth/profile");
  console.log(data);
  return data;
};

// Retorna la URL per iniciar sessió amb Google
const getGoogleLoginUrl = () => `${API_URL}/auth/google`;

// Exporta les funcions del servei d'autenticació
const authService = {
  fetchUserProfile,
  getGoogleLoginUrl,
};

export default authService;
