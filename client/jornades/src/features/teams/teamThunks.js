import teamService from "./teamService";
import {
  setIsLoadingTeams,
  setError,
  setSuccess,
  setTeams,
  setTeam,
} from "./teamSlice";

/**
 * Carrega la llista completa d'equips (opcionalment filtrada).
 */
export const loadTeams = (params = {}) => async (dispatch) => {
  dispatch(setIsLoadingTeams(true));
  dispatch(setError(null));
  try {
    const data = await teamService.fetchTeams(params);
    dispatch(setTeams(data)); // apiFetch ja retorna el camp 'data' del JSON
  } catch (err) {
    dispatch(setError(err.message));
  } finally {
    dispatch(setIsLoadingTeams(false));
  }
};

/**
 * Carrega un equip per ID.
 */
export const loadTeamById = (id) => async (dispatch) => {
  dispatch(setIsLoadingTeams(true));
  dispatch(setError(null));
  try {
    const data = await teamService.fetchTeamById(id);
    dispatch(setTeam(data)); // apiFetch ja retorna el camp 'data' del JSON
  } catch (err) {
    dispatch(setError(err.message));
  } finally {
    dispatch(setIsLoadingTeams(false));
  }
};

/**
 * Crea un equip i refresca la llista.
 */
export const createTeam = (payload, competitionId) => async (dispatch) => {
  dispatch(setIsLoadingTeams(true));
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    const responseData = await teamService.createTeam(payload);
    await dispatch(loadTeams({ competition_id: competitionId }));
    dispatch(setSuccess("Equip creat correctament!"));
    return responseData;
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setIsLoadingTeams(false));
  }
};

/**
 * Sol·licita unió a un equip i refresca.
 */
export const joinTeam = (teamId, competitionId) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await teamService.joinTeam(teamId);
    await dispatch(loadTeams({ competition_id: competitionId }));
    dispatch(setSuccess("Sol·licitud d'unió enviada."));
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  }
};

/**
 * Accepta membre i refresca.
 */
export const acceptMember = (playerRecordId, competitionId, teamId) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await teamService.acceptMember(playerRecordId);
    if (competitionId) await dispatch(loadTeams({ competition_id: competitionId }));
    if (teamId) await dispatch(loadTeamById(teamId));
    dispatch(setSuccess("Membre acceptat!"));
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  }
};

/**
 * Retira o expulsa membre i refresca.
 */
export const removeMember = (playerRecordId, competitionId, teamId) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await teamService.removeMember(playerRecordId);
    if (competitionId) await dispatch(loadTeams({ competition_id: competitionId }));
    if (teamId) await dispatch(loadTeamById(teamId));
    dispatch(setSuccess("Membre eliminat o sol·licitud retirada."));
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  }
};

/**
 * Carrega els professors disponibles.
 */
export const loadTeachers = () => async (dispatch) => {
  try {
    return await teamService.fetchTeachers();
  } catch (err) {
    // No dispatching error here to avoid blocking UI if teachers fail
    return [];
  }
};

/**
 * Transfereix la capitania i refresca dades.
 */
export const transferCaptaincy = (teamId, newCaptainId, competitionId) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await teamService.transferCaptaincy(teamId, newCaptainId);
    await dispatch(loadTeams({ competition_id: competitionId }));
    await dispatch(loadTeamById(teamId)); // Refresca l'equip actual per veure el canvi de capità
    dispatch(setSuccess("Capitania transferida correctament."));
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  }
};

/**
 * Elimina equip i refresca.
 */
export const deleteTeam = (teamId, competitionId) => async (dispatch) => {
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    await teamService.deleteTeam(teamId);
    await dispatch(loadTeams({ competition_id: competitionId }));
    dispatch(setSuccess("Equip eliminat correctament."));
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  }
};

/**
 * Actualitza la informació d'un equip i refresca.
 */
export const updateTeam = (teamId, payload, competitionId) => async (dispatch) => {
  dispatch(setIsLoadingTeams(true));
  dispatch(setError(null));
  dispatch(setSuccess(null));
  try {
    const responseData = await teamService.updateTeam(teamId, payload);
    await dispatch(loadTeams({ competition_id: competitionId }));
    await dispatch(loadTeamById(teamId)); // Refresca l'equip per si estem a la pàgina de detalls
    dispatch(setSuccess("Equip actualitzat correctament!"));
    return responseData;
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setIsLoadingTeams(false));
  }
};
