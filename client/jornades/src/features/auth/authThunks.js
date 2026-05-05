/**
 * THUNKS D'AUTENTICACIÓ
 * 
 * Els 'Thunks' són funcions que ens permeten fer lògica asíncrona (com crides a l'API)
 * i després despatxar (dispatch) el resultat cap a l'estat global de Redux.
 */

import { 
  setUser, 
  setLoadingUser 
} from "./authSlice";
import authService from "./authService";

/**
 * THUNK: fetchUserProfile
 * 
 * Aquesta funció es crida per obtenir totes les dades del perfil de l'usuari
 * (nom, cognoms, email, rol, etc.) un cop ja tenim un token vàlid guardat.
 */
export const fetchUserProfile = () => {
  return async (dispatch) => {
    // 1. Iniciem l'estat de càrrega perquè la UI pugui mostrar un Spinner
    dispatch(
      setLoadingUser(true)
    );

    try {
      // 2. Fem la crida al servidor a través del servei d'autenticació
      // Nota: El token JWT s'inclou automàticament en aquesta crida gràcies al nostre servei base.
      const apiResponse = await authService.fetchUserProfile();

      // 3. Si la crida ha funcionat, guardem l'objecte 'user' que ens torna el servidor
      dispatch(
        setUser(apiResponse.user)
      );

    } catch (error) {
      // Si la crida falla (ex: token caducat), llançem l'error perquè 
      // el component que ha cridat el thunk el pugui gestionar.
      throw error;

    } finally {
      // 4. Finalitzem l'estat de càrrega, hagi anat bé o malament
      dispatch(
        setLoadingUser(false)
      );
    }
  };
};
