// agafem tot l'estat del slice de competicions (jornades)
export const selectCompetitionState = (globalState) => {
  const compState = globalState.competition;
  
  return compState;
};

// selecciona la llista completa de totes les jornades actives
export const selectCompetitions = (globalState) => {
  const state = selectCompetitionState(globalState);
  const list = state.competitions || [];
  
  return list;
};

// jornada seleccionada que l'estudiant esta veient actualment
export const selectCurrentCompetition = (globalState) => {
  const state = selectCompetitionState(globalState);
  const current = state.currentCompetition;
  
  return current;
};

// boleà de carrega de competicions per a mostrar la rodeta de Spinner
export const selectIsLoadingCompetitions = (globalState) => {
  const state = selectCompetitionState(globalState);
  const loading = state.isLoadingCompetitions;
  
  return loading;
};

// missatges d'error de peticions a la seccio de jornades
export const selectCompetitionError = (globalState) => {
  const state = selectCompetitionState(globalState);
  const err = state.error;
  
  return err;
};

// missatges d'exit per als cartells
export const selectCompetitionSuccess = (globalState) => {
  const state = selectCompetitionState(globalState);
  const success = state.success;
  
  return success;
};

// llista completa dels esports i activitats de les jornades
export const selectCompetitionActivities = (globalState) => {
  const state = selectCompetitionState(globalState);
  const activities = state.activities || [];
  
  return activities;
};

// pavellons o pistes disponibles triades per a fer els partits
export const selectCompetitionFields = (globalState) => {
  const state = selectCompetitionState(globalState);
  const fields = state.fields || [];
  
  return fields;
};
