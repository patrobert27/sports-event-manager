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

// THUNK: Carrega la llista completa de competicions (jornades) amb els filtres actius
export const loadCompetitions = (params = {}) => {
  return async (dispatch) => {
    
    // activem la rodeta de carrega global del llistat
    dispatch(
      setIsLoadingCompetitions(true)
    );

    try {
      
      const competitionsList = await competitionService.fetchCompetitions(params);
      
      dispatch(
        setCompetitions(competitionsList)
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

// THUNK: Carrega la fitxa detallada d'una competició esportiva concreta pel seu ID
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

// THUNK: Crea una jornada nova i actualitza de cop el llistat general
export const createCompetition = (payload) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingCompetitions(true)
    );
    
    // netegem missatges de control anteriors
    dispatch(setError(null));
    dispatch(setSuccess(null));

    try {
      
      const createdCompetition = await competitionService.createCompetition(payload);
      
      dispatch(
        setSuccess("La jornada s'ha creat correctament.")
      );

      // refresquem a l'acte la graella de la pantalla principal
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

// THUNK: Modifica les dades d'una jornada i recarrega detalls
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

      // refresquem la llista i també el detall actualitzat del component on som
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

// THUNK: Elimina de la base de dades una jornada
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

      // demanem la llista de nou perquè desaparegui immediatament de la graella
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

// THUNK: Demana els esports disponibles per omplir formularis del profe
export const loadActivities = () => {
  return async (dispatch) => {
    try {
      
      const activitiesData = await competitionService.fetchActivities();
      
      dispatch(
        setActivities(activitiesData)
      );

    } catch (error) {
      
      // si falla, simplement buidem la llista per no bloquejar la vista
      dispatch(
        setActivities([])
      );
      
    }
  };
};

// THUNK: Carrega les instal·lacions (pistes i pavellons de joc)
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
