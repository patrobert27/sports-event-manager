// selector base que agafa tot l'estat del slice d'usuaris
export const selectUserState = (state) => {
  const userSlice = state.user;
  
  return userSlice;
};

// agafem tota la graella de companys i professors registrats a l'escola
export const selectUserList = (state) => {
  const users = selectUserState(state).users || [];
  
  return users;
};

// agafem el control de pagines de la taula
export const selectUserPagination = (state) => {
  const pagination = selectUserState(state).pagination;
  
  return pagination;
};

// comprova si s'estan descarregant les dades dels companys
export const selectIsLoadingUsers = (state) => {
  const loading = selectUserState(state).isLoading;
  
  return loading;
};

// errors al panell d'administrador d'usuaris
export const selectUserError = (state) => {
  const err = selectUserState(state).error;
  
  return err;
};

// missatges de tot correcte del panell de control
export const selectUserSuccess = (state) => {
  const success = selectUserState(state).success;
  
  return success;
};

// rols que es poden triar per al select de companys (admin, alumne...)
export const selectUserRoles = (state) => {
  const roles = selectUserState(state).roles || [];
  
  return roles;
};
