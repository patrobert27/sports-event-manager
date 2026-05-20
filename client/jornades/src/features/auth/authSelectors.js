// selecciona tot l'objecte d'autenticació (inclou user, token, etc.) per a controls generals
export const selectAuth = (globalState) => {
  const authState = globalState.auth;
  
  return authState;
};

// agafa només les dades completes del perfil de l'estudiant o profe loguejat
export const selectUser = (globalState) => {
  const user = globalState.auth.user;
  
  return user;
};

// comprova de forma ràpida si l'usuari té una sessió activa iniciada
export const selectIsAuthenticated = (globalState) => {
  const isAuth = globalState.auth.isAuthenticated;
  
  return isAuth;
};

// agafem el token JWT desat per a poder adjuntar-lo a capçaleres d'API
export const selectToken = (globalState) => {
  const token = globalState.auth.token;
  
  return token;
};

// indica si s'estan demanant les dades inicials del perfil al backend
export const selectIsLoadingUser = (globalState) => {
  const loading = globalState.auth.isLoadingUser;
  
  return loading;
};
