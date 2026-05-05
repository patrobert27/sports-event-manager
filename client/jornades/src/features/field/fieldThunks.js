import fieldService from './fieldService';
import { setFields, setIsLoading, setError } from './fieldSlice';

export const loadFields = (params = {}) => async (dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const data = await fieldService.fetchFields(params);
    dispatch(setFields(data));
  } catch (error) {
    console.error("Error carregant camps:", error);
    dispatch(setError(error.message || "Error al carregar els camps"));
  } finally {
    dispatch(setIsLoading(false));
  }
};

/** Thunk per crear un nou camp */
export const addField = (data) => async (dispatch) => {
  try {
    await fieldService.createField(data);
    dispatch(loadFields());
    return true;
  } catch (error) {
    console.error("Error creant camp:", error);
    throw error;
  }
};

/** Thunk per editar un camp */
export const editField = (id, data) => async (dispatch) => {
  try {
    await fieldService.updateField(id, data);
    dispatch(loadFields());
    return true;
  } catch (error) {
    console.error("Error editant camp:", error);
    throw error;
  }
};

/** Thunk per eliminar un camp */
export const removeField = (id) => async (dispatch) => {
  try {
    await fieldService.deleteField(id);
    dispatch(loadFields());
    return true;
  } catch (error) {
    console.error("Error eliminant camp:", error);
    throw error;
  }
};
