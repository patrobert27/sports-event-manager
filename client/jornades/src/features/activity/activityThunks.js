import activityService from "./activityService";
import { setIsLoading, setError, setSuccess, setActivities } from "./activitySlice";

// demana la llista d'activitats esportives per omplir els desplegables de filtres
export const loadActivities = (params = {}) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    
    try {
      const data = await activityService.fetchActivities(params);
      
      // guardem les activitats a Redux
      dispatch(setActivities(data));
      
    } catch (error) {
      console.error("Error carregant activitats:", error);
      dispatch(setError(error.message || "Error al carregar activitats"));
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// crea un nou esport o activitat (només visible per als administradors del centre)
export const addActivity = (data) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await activityService.createActivity(data);
      
      dispatch(setSuccess("L'activitat s'ha creat correctament."));
      
      // tornem a carregar la llista actualitzada per a que es vegi al moment
      dispatch(loadActivities());
      
      return true;
      
    } catch (error) {
      console.error("Error creant activitat:", error);
      dispatch(setError(error.message));
      
      throw error;
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// modifica el nom o el color de l'activitat esportiva seleccionada
export const editActivity = (id, data) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await activityService.updateActivity(id, data);
      
      dispatch(setSuccess("L'activitat s'ha actualitzat amb èxit."));
      
      // recarreguem la llista per veure el nou color o nom
      dispatch(loadActivities());
      
      return true;
      
    } catch (error) {
      console.error("Error editant activitat:", error);
      dispatch(setError(error.message));
      
      throw error;
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// elimina un esport completament del sistema escolar
export const removeActivity = (id) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await activityService.deleteActivity(id);
      
      dispatch(setSuccess("L'activitat ha estat eliminada."));
      dispatch(loadActivities());
      
      return true;
      
    } catch (error) {
      console.error("Error eliminant activitat:", error);
      dispatch(setError(error.message));
      
      throw error;
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};
