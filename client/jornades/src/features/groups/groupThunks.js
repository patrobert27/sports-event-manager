import groupService from './groupService';
import {
  setIsLoadingGroups,
  setError,
  setSuccess,
  setGroups,
  setGroupStageMatches,
  setSemifinalMatches,
  setFinalMatches,
  setThirdPlaceMatches,
  setStandings,
} from './groupSlice';
import { loadCompetitionById } from '../competition/competitionThunks';

// ─── Grups de Joc ────────────────────────────────────────────────────────────

// THUNK: Carrega la llista de grups de la competició
export const loadGroups = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );

    try {
      
      const data = await groupService.fetchGroups(competitionId);
      
      dispatch(
        setGroups(data)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// THUNK: Genera aleatòriament els equips participants en els diferents grups
export const generateGroups = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );
    
    dispatch(setError(null));

    try {
      
      const data = await groupService.generateGroups(competitionId);
      
      dispatch(
        setGroups(data.groups || [])
      );
      
      dispatch(
        setSuccess('Grups generats correctament!')
      );
      
      // actualitzem l'estat de la competició
      dispatch(
        loadCompetitionById(competitionId)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// ─── Calendari de partits ───────────────────────────────────────────────────

// THUNK: Carrega els partits de la competició i els separa segons la seva fase
export const loadMatches = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );

    try {
      
      const allMatches = await groupService.fetchMatches(competitionId, null);

      const gs = [];
      const sf = [];
      const fn = [];
      const tp = [];

      (allMatches || []).forEach((m) => {
        if (m.phase === 'GROUP_STAGE') {
          gs.push(m);
        } else if (m.phase === 'SEMIFINAL') {
          sf.push(m);
        } else if (m.phase === 'FINAL') {
          fn.push(m);
        } else if (m.phase === 'THIRD_PLACE') {
          tp.push(m);
        }
      });

      dispatch(setGroupStageMatches(gs));
      dispatch(setSemifinalMatches(sf));
      dispatch(setFinalMatches(fn));
      dispatch(setThirdPlaceMatches(tp));

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// THUNK: Genera el calendari cronològic de partits per a la lligueta de grups
export const generateMatches = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );
    
    dispatch(setError(null));

    try {
      
      await groupService.generateMatches(competitionId);
      
      dispatch(
        setSuccess('Partits generats correctament!')
      );
      
      // refresquem immediatament el llistat de partits dividit per fases
      await dispatch(
        loadMatches(competitionId)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// THUNK: Modifica el resultat d'un partit i refresca la graella i la classificació
export const updateMatchResult = (competitionId, matchId, payload) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );
    
    dispatch(setError(null));

    try {
      
      await groupService.updateMatchResult(competitionId, matchId, payload);
      
      dispatch(
        setSuccess('Resultat actualitzat!')
      );

      // refresquem tot en calent: partits, classificacions dels grups i detall de la jornada
      await dispatch(
        loadMatches(competitionId)
      );
      
      await dispatch(
        loadStandings(competitionId)
      );
      
      dispatch(
        loadCompetitionById(competitionId)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );
      
      throw err;

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// ─── Classificacions generals ──────────────────────────────────────────────

// THUNK: Carrega la taula provisional de punts de cada grup esportiu
export const loadStandings = (competitionId) => {
  return async (dispatch) => {
    try {
      
      const data = await groupService.fetchStandings(competitionId);
      
      dispatch(
        setStandings(data)
      );

    } catch {
      // deixem passar en silenci si hi hagués algun error per a no blocar la UI
    }
  };
};

// ─── Encreuaments finals i eliminatòries ───────────────────────────────────

// THUNK: Pren els guanyadors de grups i crea el quadre de semifinals del campionat
export const generateSemifinals = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );
    
    dispatch(setError(null));

    try {
      
      await groupService.generateSemifinals(competitionId);
      
      dispatch(
        setSuccess('Semifinals generades!')
      );
      
      await dispatch(
        loadMatches(competitionId)
      );
      
      dispatch(
        loadCompetitionById(competitionId)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// THUNK: Crea el partit de final i tercer lloc després de les semifinals
export const generateFinal = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );
    
    dispatch(setError(null));

    try {
      
      await groupService.generateFinal(competitionId);
      
      dispatch(
        setSuccess('Final generada!')
      );
      
      await dispatch(
        loadMatches(competitionId)
      );
      
      dispatch(
        loadCompetitionById(competitionId)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};

// THUNK: Carrega tot de cop al panell de la fase competitiva per evitar cascades de renders
export const loadGroupStageData = (competitionId) => {
  return async (dispatch) => {
    
    dispatch(
      setIsLoadingGroups(true)
    );

    try {
      
      const [groups, allMatches, standings] = await Promise.all([
        groupService.fetchGroups(competitionId),
        groupService.fetchMatches(competitionId, null),
        groupService.fetchStandings(competitionId).catch(() => {
          return [];
        }),
      ]);

      dispatch(
        setGroups(groups)
      );

      const gs = [];
      const sf = [];
      const fn = [];
      const tp = [];

      (allMatches || []).forEach((m) => {
        if (m.phase === 'GROUP_STAGE') {
          gs.push(m);
        } else if (m.phase === 'SEMIFINAL') {
          sf.push(m);
        } else if (m.phase === 'FINAL') {
          fn.push(m);
        } else if (m.phase === 'THIRD_PLACE') {
          tp.push(m);
        }
      });

      dispatch(setGroupStageMatches(gs));
      dispatch(setSemifinalMatches(sf));
      dispatch(setFinalMatches(fn));
      dispatch(setThirdPlaceMatches(tp));

      dispatch(
        setStandings(standings)
      );

    } catch (err) {
      
      dispatch(
        setError(err.message)
      );

    } finally {
      
      dispatch(
        setIsLoadingGroups(false)
      );
      
    }
  };
};
