import teamService from "./teamService";

import {
  setIsLoadingTeams,
  setError,
  setSuccess,
  setTeams,
  setTeam,
} from "./teamSlice";

// demana la llista completa d'equips inscrits a una jornada
export const loadTeams = (params = {}) => {
  return async (dispatch) => {
    
    dispatch(setIsLoadingTeams(true));
    dispatch(setError(null));
    
    try {
      const data = await teamService.fetchTeams(params);
      
      // desem els equips al slice de Redux
      dispatch(setTeams(data));
      
    } catch (err) {
      dispatch(setError(err.message));
      
    } finally {
      dispatch(setIsLoadingTeams(false));
    }

  };
};

// demana la informacio d'un equip en concret per ensenyar-ne el detall (capità, membres, etc)
export const loadTeamById = (id) => {
  return async (dispatch) => {
    
    dispatch(setIsLoadingTeams(true));
    dispatch(setError(null));
    
    try {
      const data = await teamService.fetchTeamById(id);
      
      dispatch(setTeam(data));
      
    } catch (err) {
      dispatch(setError(err.message));
      
    } finally {
      dispatch(setIsLoadingTeams(false));
    }

  };
};

// crea un equip nou i refresca automàticament la llista
export const createTeam = (payload, competitionId) => {
  return async (dispatch) => {
    
    dispatch(setIsLoadingTeams(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      const responseData = await teamService.createTeam(payload);
      
      // recarreguem la llista d'equips per a que surti el nou equip a l'instant
      await dispatch(loadTeams({ 
        competition_id: competitionId 
      }));
      
      dispatch(setSuccess("Equip creat correctament!"));
      
      return responseData;
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
      
    } finally {
      dispatch(setIsLoadingTeams(false));
    }

  };
};

// envia una petició per entrar a formar part d'un equip creat per un company
export const joinTeam = (teamId, competitionId) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.joinTeam(teamId);
      
      // recarreguem tant la llista general d'equips com la vista del detall on estem
      await Promise.all([
        dispatch(loadTeams({ 
          competition_id: competitionId 
        })),
        dispatch(loadTeamById(teamId)),
      ]);
      
      dispatch(setSuccess("Sol·licitud d'unió enviada."));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};

// el capità o el tutor accepta a un alumne a la plantilla
export const acceptMember = (playerRecordId, competitionId, teamId) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.acceptMember(playerRecordId);
      
      const reloads = [];
      
      // si tenim els IDs, demanem dades fresques al servidor en paral·lel
      if (competitionId) {
        reloads.push(
          dispatch(loadTeams({ 
            competition_id: competitionId 
          }))
        );
      }
      
      if (teamId) {
        reloads.push(
          dispatch(loadTeamById(teamId))
        );
      }
      
      await Promise.all(reloads);
      dispatch(setSuccess("Membre acceptat!"));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};

// el capità treu a un membre o rebutja una sol·licitud d'unió
export const removeMember = (playerRecordId, competitionId, teamId, customSuccessMsg = null) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.removeMember(playerRecordId);
      
      const reloads = [];
      
      if (competitionId) {
        reloads.push(
          dispatch(loadTeams({ 
            competition_id: competitionId 
          }))
        );
      }
      
      if (teamId) {
        reloads.push(
          dispatch(loadTeamById(teamId))
        );
      }
      
      await Promise.all(reloads);
      
      const msg = customSuccessMsg || "Membre eliminat correctament.";
      dispatch(setSuccess(msg));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};

// demana la llista de profes per a poder triar tutor per a l'equip
export const loadTeachers = () => {
  return async () => {
    
    try {
      return await teamService.fetchTeachers();
      
    } catch (err) {
      // no fem dispatch d'error per a no bloquejar la pantalla si el fetch dels profes falla
      return [];
    }

  };
};

// cedeix el rol de capità a un altre company de l'equip
export const transferCaptaincy = (teamId, newCaptainId, competitionId) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.transferCaptaincy(teamId, newCaptainId);
      
      // recarreguem en paral·lel per a refrescar la UI i amagar els botons de capità al vell
      await Promise.all([
        dispatch(loadTeams({ 
          competition_id: competitionId 
        })),
        dispatch(loadTeamById(teamId)),
      ]);
      
      dispatch(setSuccess("Capitania transferida correctament."));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};

// elimina l'equip per complet (només visible per al capità, tutor o admin)
export const deleteTeam = (teamId, competitionId) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.deleteTeam(teamId);
      
      await dispatch(loadTeams({ 
        competition_id: competitionId 
      }));
      
      dispatch(setSuccess("Equip eliminat correctament."));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};

// edita informacio bàsica de l'equip (ex: canviar de tutor o de logo)
export const updateTeam = (teamId, payload, competitionId) => {
  return async (dispatch) => {
    
    dispatch(setIsLoadingTeams(true));
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      const responseData = await teamService.updateTeam(teamId, payload);
      
      // refresquem la informacio en paral·lel
      await Promise.all([
        dispatch(loadTeams({ 
          competition_id: competitionId 
        })),
        dispatch(loadTeamById(teamId)),
      ]);
      
      dispatch(setSuccess("Equip actualitzat correctament!"));
      
      return responseData;
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
      
    } finally {
      dispatch(setIsLoadingTeams(false));
    }

  };
};

// trasllada un jugador d'un equip a un altre de cop (exclusiu del panell d'admin)
export const moveMemberBetweenTeams = (playerRecordId, targetTeamId, competitionId, sourceTeamId = null) => {
  return async (dispatch) => {
    
    dispatch(setError(null));
    dispatch(setSuccess(null));
    
    try {
      await teamService.moveMember(playerRecordId, targetTeamId);
      
      const reloads = [
        dispatch(loadTeams({ 
          competition_id: competitionId 
        }))
      ];
      
      if (sourceTeamId) {
        reloads.push(
          dispatch(loadTeamById(sourceTeamId))
        );
      }
      
      await Promise.all(reloads);
      dispatch(setSuccess("Membre mogut correctament!"));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
    }

  };
};
