import competitionService from "./competitionService";
import {
  setLoading,
  setError,
  setList,
  addCompetition,
  updateCompetition as updateCompetitionAction,
  removeCompetition as removeCompetitionAction,
  setActivities,
  setFields,
} from "./competitionSlice";

// Thunks per gestionar de forma manual l'estat asíncron
// Aquestes funcions es comuniquen amb l'API i despatxen accions al Redux Store

export const loadCompetitions = () => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const data = await competitionService.fetchCompetitions();
    dispatch(setList(data)); // Actualitza la llista a Redux
  } catch (err) {
    dispatch(setError(err.message)); // Desa l'error en cas de fallida
  } finally {
    dispatch(setLoading(false));
  }
};

export const createCompetition = (payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const created = await competitionService.createCompetition(payload);
    dispatch(addCompetition(created));
    // Refresquem tota la llista per mantenir l'ordre correcte (segons el backend)
    await dispatch(loadCompetitions());
    return created;
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const updateCompetition = (id, payload) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const updated = await competitionService.updateCompetition(id, payload);
    dispatch(updateCompetitionAction(updated));
    // Igual que al crear, refresquem la llista de nou
    await dispatch(loadCompetitions());
    return updated;
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteCompetition = (id) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    await competitionService.deleteCompetition(id);
    dispatch(removeCompetitionAction(id)); // L'esborrem de l'estat local
    await dispatch(loadCompetitions()); // Refresquem
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const loadActivities = () => async (dispatch) => {
  try {
    const data = await competitionService.fetchActivities();
    dispatch(setActivities(Array.isArray(data) ? data : []));
  } catch {
    dispatch(setActivities([])); // Si falla, llista buida
  }
};

export const loadFields = () => async (dispatch) => {
  try {
    const data = await competitionService.fetchFields();
    dispatch(setFields(Array.isArray(data) ? data : []));
  } catch {
    dispatch(setFields([])); // Si falla, llista buida
  }
};

