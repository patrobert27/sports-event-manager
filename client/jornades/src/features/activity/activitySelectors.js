// llista general de tots els esports disponibles de la jornada escolar
export const selectActivities = (state) => {
  const activities = state.activity.list;
  
  return activities;
};

// comprova si estem carregant les activitats de la base de dades
export const selectActivitiesLoading = (state) => {
  const loading = state.activity.isLoading;
  
  return loading;
};

// error de connexio a la seccio d'esports
export const selectActivitiesError = (state) => {
  const err = state.activity.error;
  
  return err;
};

// missatges d'exit verds del formulari d'esports
export const selectActivitiesSuccess = (state) => {
  const success = state.activity.success;
  
  return success;
};
