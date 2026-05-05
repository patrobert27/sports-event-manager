export const selectUserState = (state) => state.user;

// Selectors per a la llista d'usuaris i paginació
export const selectUserList = (state) => selectUserState(state).users || [];
export const selectUserPagination = (state) => selectUserState(state).pagination;

// Selectors d'estat
export const selectIsLoadingUsers = (state) => selectUserState(state).isLoading;
export const selectUserError = (state) => selectUserState(state).error;

// Selectors de metadades
export const selectUserRoles = (state) => selectUserState(state).roles || [];
