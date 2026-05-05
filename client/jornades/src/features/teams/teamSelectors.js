import { createSelector } from '@reduxjs/toolkit';

const selectTeamsState = (state) => state.teams;

export const selectAllTeams = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.teams || []
);

export const selectCurrentTeam = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.currentTeam
);

export const selectIsLoadingTeams = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.isLoadingTeams
);

export const selectTeamsError = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.error
);

export const selectTeamsSuccess = createSelector(
  [selectTeamsState],
  (teamsState) => teamsState.success
);

/**
 * Selector memoitzat per filtrar equips per competició.
 * S'ha d'usar com: useSelector(state => selectTeamsByCompetition(state, competitionId))
 */
export const selectTeamsByCompetition = createSelector(
  [selectAllTeams, (state, competitionId) => competitionId],
  (teams, competitionId) => {
    if (!competitionId) return teams;
    const targetId = Number(competitionId);
    // Filtrem de forma més tolerant per evitar problemes de tipus o càrrega de relacions
    return teams.filter(t => {
      const compId = t.competition?.id || t.competition_id;
      return Number(compId) === targetId;
    });
  }
);

/**
 * Selector per comprovar si l'usuari actual ja està en algun equip (confirmat)
 * d'una competició concreta.
 */
export const selectUserInAnyTeam = createSelector(
  [
    (state, competitionId) => selectTeamsByCompetition(state, competitionId),
    (state, competitionId, userId) => userId
  ],
  (teams, userId) => {
    return teams.some(t => t.players?.some(p => p.user?.id === userId && p.confirmed));
  }
);
