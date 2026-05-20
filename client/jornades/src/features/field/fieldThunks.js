import fieldService from './fieldService';
import { 
  setFields, 
  setIsLoading, 
  setError, 
  setSuccess 
} from './fieldSlice';

// THUNK: Carrega la llista completa de pistes o pavellons del centre
export const loadFields = (params = {}) => {
  return async (dispatch) => {
    
    // activem l'estat de carrega per a la graella de pistes
    dispatch(
      setIsLoading(true)
    );
    
    dispatch(setError(null));

    try {
      
      const data = await fieldService.fetchFields(params);
      
      dispatch(
        setFields(data)
      );

    } catch (error) {
      
      console.error("Error carregant camps:", error);
      
      dispatch(
        setError(error.message || "Error al carregar els camps")
      );

    } finally {
      
      dispatch(
        setIsLoading(false)
      );
      
    }
  };
};

// THUNK: Crea un pavelló o camp de joc nou
export const addField = (data) => {
  return async (dispatch) => {
    try {
      
      await fieldService.createField(data);
      
      // refresquem el llistat immediatament perquè es pinti a la llista
      dispatch(
        loadFields()
      );
      
      dispatch(
        setSuccess("Camp creat correctament")
      );
      
      return true;

    } catch (error) {
      
      console.error("Error creant camp:", error);
      
      throw error;
      
    }
  };
};

// THUNK: Edita la disponibilitat o el nom d'un pavelló/camp existent
export const editField = (id, data) => {
  return async (dispatch) => {
    try {
      
      await fieldService.updateField(id, data);
      
      dispatch(
        loadFields()
      );
      
      dispatch(
        setSuccess("Camp actualitzat correctament")
      );
      
      return true;

    } catch (error) {
      
      console.error("Error editant camp:", error);
      
      throw error;
      
    }
  };
};

// THUNK: Elimina un pavelló o camp de joc de la base de dades
export const removeField = (id) => {
  return async (dispatch) => {
    dispatch(setError(null));
    dispatch(setSuccess(null));
    try {
      
      await fieldService.deleteField(id);
      
      dispatch(
        loadFields()
      );
      
      dispatch(
        setSuccess("Camp eliminat correctament")
      );
      
      return true;

    } catch (error) {
      
      console.error("Error eliminant camp:", error);
      dispatch(setError(error.message));
      
      throw error;
      
    }
  };
};
