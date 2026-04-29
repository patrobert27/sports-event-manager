export const selectCompetitionState = (state) => state.competition;
export const selectCompetitions = (state) => selectCompetitionState(state).list || [];
export const selectCompetitionLoading = (state) => selectCompetitionState(state).loading;
export const selectCompetitionError = (state) => selectCompetitionState(state).error;
export const selectCompetitionActivities = (state) => selectCompetitionState(state).activities || [];
export const selectCompetitionFields = (state) => selectCompetitionState(state).fields || [];
