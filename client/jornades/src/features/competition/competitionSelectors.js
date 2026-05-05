/**
 * SELECTORS DE COMPETICIONS
 * 
 * Els selectors ens ajuden a agafar parts de l'estat de les competicions
 * des de qualsevol component de React de forma neta.
 */

/**
 * Selector base: Agalla tot l'estat del slice 'competition'
 */
export const selectCompetitionState = (globalState) => {
  return globalState.competition;
};

/**
 * Selecciona la llista completa de totes les jornades
 */
export const selectCompetitions = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.competitions || [];
};

/**
 * Selecciona la jornada que l'usuari està veient actualment en detall
 */
export const selectCurrentCompetition = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.currentCompetition;
};

/**
 * Selecciona si s'estan carregant les dades de les competicions (Spinner)
 */
export const selectIsLoadingCompetitions = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.isLoadingCompetitions;
};

/**
 * Selecciona el missatge d'error de les competicions
 */
export const selectCompetitionError = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.error;
};

/**
 * Selecciona el missatge d'èxit de les competicions
 */
export const selectCompetitionSuccess = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.success;
};

/**
 * Selecciona la llista d'activitats (esports) disponibles
 */
export const selectCompetitionActivities = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.activities || [];
};

/**
 * Selecciona la llista de camps i instal·lacions disponibles
 */
export const selectCompetitionFields = (globalState) => {
  const state = selectCompetitionState(globalState);
  
  return state.fields || [];
};
