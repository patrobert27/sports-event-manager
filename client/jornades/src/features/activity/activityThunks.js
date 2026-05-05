import activityService from "./activityService";
import { setIsLoading, setError, setSuccess, setActivities } from "./activitySlice";

export const loadActivities = (params = {}) => async (dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const data = await activityService.fetchActivities(params);
    dispatch(setActivities(data));
  } catch (error) {
    console.error("Error carregant activitats:", error);
    dispatch(setError(error.message || "Error al carregar activitats"));
  } finally {
    dispatch(setIsLoading(false));
  }
};

/** Thunk per crear una nova activitat */
export const addActivity = (data) => async (dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await activityService.createActivity(data);
    dispatch(setSuccess("L'activitat s'ha creat correctament."));
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

/** Thunk per editar una activitat */
export const editActivity = (id, data) => async (dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await activityService.updateActivity(id, data);
    dispatch(setSuccess("L'activitat s'ha actualitzat amb èxit."));
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

/** Thunk per eliminar una activitat */
export const removeActivity = (id) => async (dispatch) => {
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
