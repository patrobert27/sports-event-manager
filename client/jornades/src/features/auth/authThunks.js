import { 
  setUser, 
  setLoadingUser 
} from "./authSlice";
import authService from "./authService";

// aquest thunk demana les dades completes del perfil de l'usuari a partir del token JWT
export const fetchUserProfile = () => {
  return async (dispatch) => {
    
    // activem l'spinner a la pantalla inicial mentre s'espera la resposta
    dispatch(
      setLoadingUser(true)
    );

    try {
      
      const apiResponse = await authService.fetchUserProfile();

      // desem l'estudiant o profe al store de Redux
      dispatch(
        setUser(apiResponse.user)
      );

    } catch (error) {
      
      // si el token ha expirat o la petició falla, passem l'error cap al component
      throw error;

    } finally {
      
      // parem l'spinner tant si ha anat bé com si ha petat pel camí
      dispatch(
        setLoadingUser(false)
      );
      
    }
  };
};
