/**
 * THUNKS DE COMPETICIONS
 * 
 * En aquest fitxer definim les accions asíncrones per a les jornades.
 * Cada thunk s'encarrega d'un flux de dades:
 * 1. Activa l'estat de càrrega (Spinner).
 * 2. Crida al servidor (Service).
 * 3. Si va bé, guarda les dades a Redux.
 * 4. Si va malament, guarda l'error.
 * 5. Desactiva la càrrega.
 */

import competitionService from "./competitionService";
import {
  setIsLoadingCompetitions,
  setError,
  setSuccess,
  setCompetitions,
  setCompetition,
  setActivities,
  setFields,
} from "./competitionSlice";

/**
 * THUNK: Carrega la llista completa de competicions.
 * Es fa servir a la pàgina principal i per refrescar dades.
 */
export const loadCompetitions = (params = {}) => {
  return async (dispatch) => {
    // Iniciem el Spinner
    dispatch(
      setIsLoadingCompetitions(true)
    );

    try {
      // Demanem la llista al servidor
      const competitionsList = await competitionService.fetchCompetitions(params);
      
      // La guardem a Redux
      dispatch(
        setCompetitions(competitionsList)
      );

    } catch (error) {
      // Si falla, guardem el missatge d'error
      dispatch(
        setError(error.message)
      );

    } finally {
      // Parem el Spinner
      dispatch(
        setIsLoadingCompetitions(false)
      );
    }
  };
};

/**
 * THUNK: Carrega el detall d'una única competició.
 */
export const loadCompetitionById = (competitionId) => {
  return async (dispatch) => {
    dispatch(
      setIsLoadingCompetitions(true)
    );

    try {
      const competitionDetail = await competitionService.fetchCompetitionById(competitionId);
      
      dispatch(
        setCompetition(competitionDetail)
      );

    } catch (error) {
      dispatch(
        setError(error.message)
      );

    } finally {
      dispatch(
        setIsLoadingCompetitions(false)
      );
    }
  };
};

/**
 * THUNK: Crea una nova competició.
 * Després de crear-la, tornem a carregar la llista per tenir-la actualitzada.
 */
export const createCompetition = (payload) => {
  return async (dispatch) => {
    dispatch(
      setIsLoadingCompetitions(true)
    );
    
    // Netegem missatges previs
    dispatch(setError(null));
    dispatch(setSuccess(null));

    try {
      const createdCompetition = await competitionService.createCompetition(payload);
      
      dispatch(
        setSuccess("La jornada s'ha creat correctament.")
      );

      // Refresquem la llista de la pantalla principal
      await dispatch(
        loadCompetitions()
      );

      return createdCompetition;

    } catch (error) {
      dispatch(
        setError(error.message)
      );
      throw error;

    } finally {
      dispatch(
        setIsLoadingCompetitions(false)
      );
    }
  };
};

/**
 * THUNK: Actualitza les dades d'una competició.
 */
export const updateCompetition = (competitionId, payload) => {
  return async (dispatch) => {
    dispatch(
      setIsLoadingCompetitions(true)
    );
    
    dispatch(setError(null));
    dispatch(setSuccess(null));

    try {
      const updatedCompetition = await competitionService.updateCompetition(competitionId, payload);
      
      dispatch(
        setSuccess("La jornada s'ha actualitzat amb èxit.")
      );

      // Refresquem tant la llista com el detall de la pantalla on som
      await dispatch(
        loadCompetitions()
      );
      
      await dispatch(
        loadCompetitionById(competitionId)
      );

      return updatedCompetition;

    } catch (error) {
      dispatch(
        setError(error.message)
      );
      throw error;

    } finally {
      dispatch(
        setIsLoadingCompetitions(false)
      );
    }
  };
};

/**
 * THUNK: Elimina una competició.
 */
export const deleteCompetition = (competitionId) => {
  return async (dispatch) => {
    dispatch(
      setIsLoadingCompetitions(true)
    );
    
    dispatch(setError(null));
    dispatch(setSuccess(null));

    try {
      await competitionService.deleteCompetition(competitionId);
      
      dispatch(
        setSuccess("La jornada ha estat eliminada correctament.")
      );

      // Refresquem la llista perquè ja no aparegui l'eliminada
      await dispatch(
        loadCompetitions()
      );

    } catch (error) {
      dispatch(
        setError(error.message)
      );
      throw error;

    } finally {
      dispatch(
        setIsLoadingCompetitions(false)
      );
    }
  };
};

/**
 * THUNK: Carrega les activitats (esports) disponibles.
 */
export const loadActivities = () => {
  return async (dispatch) => {
    try {
      const activitiesData = await competitionService.fetchActivities();
      
      dispatch(
        setActivities(activitiesData)
      );

    } catch (error) {
      // Si falla, simplement deixem la llista buida
      dispatch(
        setActivities([])
      );
    }
  };
};

/**
 * THUNK: Carrega les instal·lacions (camps).
 */
export const loadFields = () => {
  return async (dispatch) => {
    try {
      const fieldsData = await competitionService.fetchFields();
      
      dispatch(
        setFields(fieldsData)
      );

    } catch (error) {
      dispatch(
        setFields([])
      );
    }
  };
};
