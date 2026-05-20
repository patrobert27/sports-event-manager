import { createSelector } from '@reduxjs/toolkit';

// --- SELECTORS DE GRUPS I ELIMINATÒRIES ---

// selecciona la llista completa de grups actius
export const selectGroups = (state) => {
  const list = state.group.groups || [];
  
  return list;
};

// selecciona els partits de la fase inicial de grups
export const selectGroupStageMatches = (state) => {
  const matches = state.group.groupStageMatches || [];
  
  return matches;
};

// selecciona els partits de semifinals generats
export const selectSemifinalMatches = (state) => {
  const matches = state.group.semifinalMatches || [];
  
  return matches;
};

// selecciona els partits de la gran final
export const selectFinalMatches = (state) => {
  const matches = state.group.finalMatches || [];
  
  return matches;
};

// selecciona els partits de consolacio del tercer i quart lloc
export const selectThirdPlaceMatches = (state) => {
  const matches = state.group.thirdPlaceMatches || [];
  
  return matches;
};

// agafem tots els partits de cop.
// conservem el createSelector per a mantenir la memoitzacio existent a l'original sense trencar res!
export const selectAllMatches = createSelector(
  [
    selectGroupStageMatches,
    selectSemifinalMatches,
    selectFinalMatches,
    selectThirdPlaceMatches
  ],
  (groupStage, semiFinal, final, thirdPlace) => {
    const all = [
      ...groupStage, 
      ...semiFinal, 
      ...final,
      ...thirdPlace
    ];
    
    return all;
  }
);

// selecciona les taules de classificació completes dels grups
export const selectStandings = (state) => {
  const standings = state.group.standings || [];
  
  return standings;
};

// indica si estem esperant la generacio de partits des del servidor
export const selectIsLoadingGroups = (state) => {
  const loading = state.group.isLoadingGroups;
  
  return loading;
};

// missatges d'error derivats de la seccio de grups
export const selectGroupError = (state) => {
  const err = state.group.error;
  
  return err;
};

// missatges d'exit verds del panell de grups
export const selectGroupSuccess = (state) => {
  const success = state.group.success;
  
  return success;
};
