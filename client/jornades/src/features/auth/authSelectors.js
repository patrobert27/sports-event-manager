/**
 * SELECTORS D'AUTENTICACIÓ
 * 
 * Els selectors són funcions que ens permeten "triar" parts específiques
 * de l'estat global de Redux de manera fàcil i neta des dels components.
 */

/**
 * Selecciona tot l'objecte d'autenticació (inclou user, token, etc.)
 */
export const selectAuth = (globalState) => {
  return globalState.auth;
};

/**
 * Selecciona només les dades de l'usuari (nom, cognom, rol...)
 */
export const selectUser = (globalState) => {
  return globalState.auth.user;
};

/**
 * Selecciona si l'usuari ja ha fet login o no (booleà true/false)
 */
export const selectIsAuthenticated = (globalState) => {
  return globalState.auth.isAuthenticated;
};

/**
 * Selecciona el token JWT guardat
 */
export const selectToken = (globalState) => {
  return globalState.auth.token;
};

/**
 * Selecciona l'estat de càrrega de l'usuari
 * (Serveix per mostrar Spinner mentre fem el fetchUserProfile)
 */
export const selectIsLoadingUser = (globalState) => {
  return globalState.auth.isLoadingUser;
};
