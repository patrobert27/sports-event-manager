import userService from "./userService";

import {
  setIsLoading,
  setError,
  setSuccess,
  setUsers,
  setRoles,
} from "./userSlice";

import { setUser } from "../auth/authSlice";

// demana la llista sencera d'alumnes i professors amb paginació i filtres de cerca
export const loadUsers = (params = {}) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    
    try {
      const data = await userService.fetchUsers(params);
      
      // desem els usuaris trobats i les pagines al slice
      dispatch(setUsers(data));
      
    } catch (err) {
      dispatch(setError(err.message));
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// guarda la informació actualitzada d'un usuari (ex: canvi de rol fet per l'admin)
export const updateUser = (id, payload) => {
  return async (dispatch, getState) => {
    
    dispatch(setIsLoading(true));
    
    try {
      const updatedUser = await userService.updateUser(id, payload);
      
      // 1. refresquem la llista sencera de la taula per veure el nou rol reflectit
      await dispatch(loadUsers());
      
      // 2. si el company que hem editat és el propi usuari loguejat actualment,
      // actualitzem les seves credencials per a canviar el nom/rol del header a l'acte
      const currentUser = getState().auth.user;
      
      if (currentUser && currentUser.id === updatedUser.id) {
        dispatch(setUser(updatedUser));
      }
      
      dispatch(setSuccess("Usuari actualitzat correctament"));
      
      return updatedUser;
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// esborra un company o professor de la base de dades definitivament
export const removeUser = (id) => {
  return async (dispatch) => {
    
    dispatch(setIsLoading(true));
    
    try {
      await userService.deleteUser(id);
      
      // refresquem a l'acte per treure'l de la graella d'usuaris
      await dispatch(loadUsers());
      dispatch(setSuccess("Usuari eliminat correctament"));
      
    } catch (err) {
      dispatch(setError(err.message));
      throw err;
      
    } finally {
      dispatch(setIsLoading(false));
    }

  };
};

// demana tots els rols configurats per a poder triar-ne un al select d'edicio d'admin
export const loadRoles = () => {
  return async (dispatch) => {
    
    try {
      const data = await userService.fetchRoles();
      
      dispatch(
        setRoles(
          Array.isArray(data) ? data : []
        )
      );
      
    } catch {
      // en cas d'error no bloquegem la pantalla, desem una llista buida
      dispatch(
        setRoles([])
      );
    }

  };
};
