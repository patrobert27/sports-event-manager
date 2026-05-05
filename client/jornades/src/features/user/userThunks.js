import userService from "./userService";
import {
  setIsLoading,
  setError,
  setUsers,
  setRoles,
} from "./userSlice";
import { setUser } from "../auth/authSlice";

/**
 * Carrega la llista d'usuaris amb paginació i cerca.
 */
export const loadUsers = (params = {}) => async (dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const data = await userService.fetchUsers(params);
    dispatch(setUsers(data));
  } catch (err) {
    dispatch(setError(err.message));
  } finally {
    dispatch(setIsLoading(false));
  }
};

/**
 * Actualitza la informació d'un usuari.
 * Si l'usuari editat és el mateix que ha iniciat la sessió, actualitza també el seu perfil global.
 */
export const updateUser = (id, payload) => async (dispatch, getState) => {
  dispatch(setIsLoading(true));
  try {
    const updatedUser = await userService.updateUser(id, payload);
    
    // 1. Refresquem la llista d'usuaris per reflectir el canvi a la taula
    // Manté la pàgina i els filtres actuals si calgués, però aquí fem un reload simple.
    await dispatch(loadUsers());

    // 2. Sincronització del perfil actual:
    // Si l'ID de l'usuari que acabem d'editar coincideix amb l'usuari loguejat,
    // actualitzem també l'estat d'autenticació per canviar el nom/rol a la sidebar/header.
    const currentUser = getState().auth.user;
    if (currentUser && currentUser.id === updatedUser.id) {
      dispatch(setUser(updatedUser));
    }

    return updatedUser;
  } catch (err) {
    dispatch(setError(err.message));
    throw err;
  } finally {
    dispatch(setIsLoading(false));
  }
};

/**
 * Carrega la llista de rols per als desplegables de la interfície.
 */
export const loadRoles = () => async (dispatch) => {
  try {
    const data = await userService.fetchRoles();
    dispatch(setRoles(Array.isArray(data) ? data : []));
  } catch {
    dispatch(setRoles([]));
  }
};
