// agafa la llista completa de pistes o pavellons desats al store de Redux
export const selectFields = (state) => {
  const fields = state.field.fields;
  
  return fields;
};

// comprova si estem descarregant les dades de les instal·lacions
export const selectFieldsLoading = (state) => {
  const loading = state.field.isLoading;
  
  return loading;
};

// error associat a peticions de la feature de camps
export const selectFieldsError = (state) => {
  const err = state.field.error;
  
  return err;
};

// missatges temporals de que tot ha anat de luxe al formulari de pistes
export const selectFieldsSuccess = (state) => {
  const success = state.field.success;
  
  return success;
};
