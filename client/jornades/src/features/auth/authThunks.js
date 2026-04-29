// Thunks d'autenticació
// Aquest fitxer conté funcions asíncrones (thunks) que gestionen la lògica de negoci relacionada amb l'autenticació.
// Els thunks permeten fer peticions a l'API i després actualitzar l'estat de Redux segons el resultat.

import { setUser } from "./authSlice";
import authService from "./authService";

// Obté el perfil de l'usuari i l'afegeix a l'estat de Redux
export const fetchUserProfile = () => async (dispatch) => {
  try {
    // demana la informacio del perfil (el token s'injecta automàticament a l'apiFetch)
    const data = await authService.fetchUserProfile();

    //guardem la informacio
    dispatch(setUser(data.user));
  } catch (err) {
    throw err;
  }
};
